package astx

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
	"github.com/kubex-ecosystem/analyzer/internal/services/watcher"
	websocket "github.com/kubex-ecosystem/analyzer/internal/services/wsockets"
	"github.com/kubex-ecosystem/analyzer/internal/types"
	_ "github.com/smacker/go-tree-sitter/javascript"

	// _ "github.com/smacker/go-tree-sitter/typescript"

	sitter "github.com/smacker/go-tree-sitter"
)

// ===== PARSER (do artefato anterior) =====
// ... (incluir todo o código do parser aqui)

type I18nParser struct {
	parser   *sitter.Parser
	language *sitter.Language
}

func NewI18nParser() *I18nParser {
	parser := sitter.NewParser()
	var lang sitter.Language

	sitter.NewQuery([]byte(`
(source_file
	(call_expression
		function: (identifier) @func_name
		arguments: (arguments) @args)
)`), &lang)

	// l := clearla
	// la
	// lang.(*sitter.Language)

	parser.SetLanguage(&lang)
	return &I18nParser{
		parser:   parser,
		language: &lang,
	}
}

func (p *I18nParser) ParseFile(filePath string) ([]types.I18nUsage, error) {
	sourceCode, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler arquivo %s: %w", filePath, err)
	}

	tree, err := p.parser.ParseCtx(context.Background(), nil, sourceCode)
	if err != nil {
		return nil, fmt.Errorf("erro ao fazer parse do AST: %w", err)
	}
	defer tree.Close()

	fileInfo := &FileContext{
		SourceCode: string(sourceCode),
		Lines:      strings.Split(string(sourceCode), "\n"),
		FilePath:   filePath,
	}

	var usages []types.I18nUsage
	p.walkAST(tree.RootNode(), fileInfo, &usages)

	return usages, nil
}

type FileContext struct {
	SourceCode string
	Lines      []string
	FilePath   string
}

func (p *I18nParser) walkAST(node *sitter.Node, fileCtx *FileContext, usages *[]types.I18nUsage) {
	nodeType := node.Type()

	if nodeType == "call_expression" {
		p.analyzeCallExpression(node, fileCtx, usages)
	}

	for i := 0; i < int(node.ChildCount()); i++ {
		child := node.Child(i)
		p.walkAST(child, fileCtx, usages)
	}
}

func (p *I18nParser) analyzeCallExpression(node *sitter.Node, fileCtx *FileContext, usages *[]types.I18nUsage) {
	callCode := node.Content([]byte(fileCtx.SourceCode))

	if !p.isI18nCall(string(callCode)) {
		return
	}

	usage := types.I18nUsage{
		FilePath: fileCtx.FilePath,
		Line:     int(node.StartPoint().Row) + 1,
		Column:   int(node.StartPoint().Column) + 1,
	}

	p.extractCallDetails(node, fileCtx, &usage)
	p.extractComponentContext(node, fileCtx, &usage)
	p.extractJSXContext(node, fileCtx, &usage)

	*usages = append(*usages, usage)
}

func (p *I18nParser) isI18nCall(callCode string) bool {
	i18nPatterns := []string{"t(", "useTranslation", "Trans", "Translation"}

	for _, pattern := range i18nPatterns {
		if strings.Contains(callCode, pattern) {
			return true
		}
	}
	return false
}

func (p *I18nParser) extractCallDetails(node *sitter.Node, fileCtx *FileContext, usage *types.I18nUsage) {
	callCode := string(node.Content([]byte(fileCtx.SourceCode)))

	if strings.Contains(callCode, "t(") {
		usage.CallType = "t()"
		usage.Key = p.extractKeyFromTCall(callCode)
	} else if strings.Contains(callCode, "useTranslation") {
		usage.CallType = "useTranslation"
		usage.Key = "hook_usage"
	}
}

func (p *I18nParser) extractKeyFromTCall(callCode string) string {
	start := strings.Index(callCode, "(")
	end := strings.LastIndex(callCode, ")")

	if start == -1 || end == -1 {
		return ""
	}

	args := callCode[start+1 : end]
	args = strings.Trim(args, " '\"")

	if commaIndex := strings.Index(args, ","); commaIndex != -1 {
		args = args[:commaIndex]
		args = strings.Trim(args, " '\"")
	}

	return args
}

func (p *I18nParser) extractComponentContext(node *sitter.Node, fileCtx *FileContext, usage *types.I18nUsage) {
	current := node.Parent()

	for current != nil {
		nodeType := current.Type()

		if nodeType == "function_declaration" || nodeType == "arrow_function" {
			if nameNode := p.findChildByType(current, "identifier"); nameNode != nil {
				usage.Component = string(nameNode.Content([]byte(fileCtx.SourceCode)))
			}
			break
		}

		current = current.Parent()
	}

	if usage.Component == "" {
		baseName := filepath.Base(fileCtx.FilePath)
		usage.Component = strings.TrimSuffix(baseName, filepath.Ext(baseName))
	}
}

func (p *I18nParser) extractJSXContext(node *sitter.Node, fileCtx *FileContext, usage *types.I18nUsage) {
	current := node.Parent()

	for current != nil {
		if current.Type() == "jsx_element" || current.Type() == "jsx_self_closing_element" {
			jsxCode := string(current.Content([]byte(fileCtx.SourceCode)))

			if openTag := strings.Index(jsxCode, ">"); openTag != -1 {
				usage.JSXContext = jsxCode[:openTag+1]
			} else {
				usage.JSXContext = jsxCode
			}

			if len(usage.JSXContext) > 100 {
				usage.JSXContext = usage.JSXContext[:100] + "..."
			}
			break
		}
		current = current.Parent()
	}
}

func (p *I18nParser) findChildByType(node *sitter.Node, nodeType string) *sitter.Node {
	for i := 0; i < int(node.ChildCount()); i++ {
		child := node.Child(i)
		if child.Type() == nodeType {
			return child
		}
		if found := p.findChildByType(child, nodeType); found != nil {
			return found
		}
	}
	return nil
}

func (p *I18nParser) ParseDirectory(dirPath string) ([]types.I18nUsage, error) {
	var allUsages []types.I18nUsage

	err := filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		ext := strings.ToLower(filepath.Ext(path))
		if IsSourceFile(ext) && !strings.Contains(path, "node_modules") {
			usages, err := p.ParseFile(path)
			if err != nil {
				log.Printf("Erro ao processar %s: %v", path, err)
				return nil
			}
			allUsages = append(allUsages, usages...)
		}

		return nil
	})

	return allUsages, err
}

// ===== FUNÇÕES AUXILIARES =====

func IsSourceFile(ext string) bool {
	sourceExts := []string{".ts", ".js", ".tsx", ".jsx"}
	for _, validExt := range sourceExts {
		if ext == validExt {
			return true
		}
	}
	return false
}

// ===== MAIN APPLICATION =====

func AstXCmd() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: go run main.go <project_path> [port]")
	}

	projectPath := os.Args[1]
	port := "8080"
	if len(os.Args) > 2 {
		port = os.Args[2]
	}

	// Verifica se o diretório existe
	if _, err := os.Stat(projectPath); os.IsNotExist(err) {
		log.Fatalf("Diretório não existe: %s", projectPath)
	}

	fmt.Printf(`
🚀 ===== i18n REAL-TIME MONITOR =====
📁 Projeto: %s
🌐 Server: http://localhost:%s
📊 Dashboard: http://localhost:%s/dashboard
🔌 WebSocket: ws://localhost:%s/ws
=====================================

`, projectPath, port, port, port)

	// Inicializa WebSocket Manager
	wsManager := websocket.NewWebSocketManager()
	go wsManager.Run()

	// Inicializa Monitor
	monitor, err := watcher.NewRealTimeMonitor(projectPath, wsManager)
	if err != nil {
		log.Fatalf("Erro ao inicializar monitor: %v", err)
	}

	// Inicia monitoramento
	monitor.Start()

	// // Setup HTTP routes
	// router := monitor

	// Middleware de CORS
	// corsRouter := enableCORS(monitor)

	// Inicia servidor
	log.Printf("🌐 Servidor iniciado na porta %s", port)
	log.Printf("📊 Dashboard disponível em: http://localhost:%s", port)
	log.Printf("🔌 WebSocket endpoint: ws://localhost:%s/ws", port)

	if err := http.ListenAndServe(":"+port, enableCORS(mux.NewRouter())); err != nil {
		log.Fatalf("Erro ao iniciar servidor: %v", err)
	}
}

func enableCORS(router *mux.Router) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		router.ServeHTTP(w, r)
	})
}
