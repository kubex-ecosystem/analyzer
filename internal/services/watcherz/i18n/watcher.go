package wi18nast

// Package wi18nast implements internationalization (i18n) support.

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"

	sitter "github.com/smacker/go-tree-sitter"
	"github.com/smacker/go-tree-sitter/typescript/typescript"
)

type OnAnalyze func(file string, usages []Usage)

type Watcher struct {
	projectPath string
	parser      *Parser
	cb          OnAnalyze

	watcher *fsnotify.Watcher
	mu      sync.Mutex
	pending map[string]time.Time // debounce por arquivo
	stopCh  chan struct{}
}

func NewWatcher(projectPath string, cb OnAnalyze) (*Watcher, error) {
	w, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}
	p := NewParser()

	wt := &Watcher{
		projectPath: projectPath,
		parser:      p,
		cb:          cb,
		watcher:     w,
		pending:     make(map[string]time.Time),
		stopCh:      make(chan struct{}),
	}

	// adiciona diretórios recursivamente
	if err := filepath.Walk(projectPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			if skipDir(path) {
				return filepath.SkipDir
			}
			return w.Add(path)
		}
		return nil
	}); err != nil {
		_ = w.Close()
		return nil, err
	}

	return wt, nil

}

func (wt *Watcher) Start() {
	go wt.loop()
	go wt.debouncer()
}

func (wt *Watcher) Stop() {
	close(wt.stopCh)
	_ = wt.watcher.Close()
}

func (wt *Watcher) loop() {
	for {
		select {
		case ev, ok := <-wt.watcher.Events:
			if !ok {
				return
			}
			if !isSourceFile(filepath.Ext(ev.Name)) {
				continue
			}
			if ev.Op&(fsnotify.Write|fsnotify.Create|fsnotify.Rename) != 0 {
				wt.mu.Lock()
				wt.pending[ev.Name] = time.Now()
				wt.mu.Unlock()
			}
			if ev.Op&fsnotify.Remove != 0 {
				wt.cb(ev.Name, nil) // arquivo removido → sem usages
			}
		case err, ok := <-wt.watcher.Errors:
			if !ok {
				return
			}
			log.Printf("[watcher] erro: %v", err)
		case <-wt.stopCh:
			return
		}
	}
}

func (wt *Watcher) debouncer() {
	t := time.NewTicker(150 * time.Millisecond)
	defer t.Stop()
	for {
		select {
		case <-t.C:
			now := time.Now()
			var batch []string
			wt.mu.Lock()
			for f, ts := range wt.pending {
				if now.Sub(ts) > 120*time.Millisecond {
					batch = append(batch, f)
					delete(wt.pending, f)
				}
			}
			wt.mu.Unlock()

			for _, f := range batch {
				usages, err := wt.parser.ParseFile(f)
				if err != nil {
					log.Printf("[parser] %s: %v", f, err)
					continue
				}
				wt.cb(f, usages)
			}
		case <-wt.stopCh:
			return
		}
	}

}

// ---------- Parser (tree-sitter) ----------

type Parser struct {
	parser   *sitter.Parser
	language *sitter.Language
}

func NewParser() *Parser {
	p := sitter.NewParser()
	lang := typescript.GetLanguage()
	p.SetLanguage(lang)
	return &Parser{parser: p, language: lang}
}

func (p *Parser) ParseFile(filePath string) ([]Usage, error) {
	b, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", filePath, err)
	}

	tree, err := p.parser.ParseCtx(context.Background(), nil, b)
	if err != nil {
		return nil, fmt.Errorf("parse AST: %w", err)
	}
	defer tree.Close()

	src := string(b)
	lines := strings.Split(src, "n")

	var usages []Usage
	p.walk(tree.RootNode(), src, lines, filePath, &usages)
	return usages, nil

}

func (p *Parser) walk(n *sitter.Node, src string, lines []string, file string, out *[]Usage) {
	if n == nil {
		return
	}
	if n.Type() == "call_expression" {
		if u, ok := p.fromCall(n, src, lines, file); ok {
			*out = append(*out, u)
		}
	}
	for i := 0; i < int(n.ChildCount()); i++ {
		p.walk(n.Child(i), src, lines, file, out)
	}
}

func (p *Parser) fromCall(node *sitter.Node, src string, lines []string, file string) (Usage, bool) {
	code := node.Content([]byte(src))
	if !isI18nCall(code) {
		return Usage{}, false
	}

	u := Usage{
		FilePath: file,
		Line:     int(node.StartPoint().Row) + 1,
		Column:   int(node.StartPoint().Column) + 1,
		At:       time.Now(),
	}

	// tipo + key
	switch {
	case strings.Contains(code, "t("):
		u.CallType = "t()"
		u.Key = extractKeyFromT(code)
	case strings.Contains(code, "useTranslation"):
		u.CallType = "useTranslation"
		u.Key = "hook_usage"
	default:
		u.CallType = "Trans"
	}

	u.Component = findComponentName(node, src, file)
	u.JSXCtx = findJSXContext(node, src)
	u.Nearby = snippet(lines, u.Line, 2)
	return u, true

}

// ---------- helpers ----------

func isI18nCall(code string) bool {
	for _, s := range []string{"t(", "useTranslation", "Trans", "Translation"} {
		if strings.Contains(code, s) {
			return true
		}
	}
	return false
}

func extractKeyFromT(code string) string {
	start := strings.Index(code, "(")
	end := strings.LastIndex(code, ")")
	if start < 0 || end < 0 || end <= start+1 {
		return ""
	}
	args := strings.TrimSpace(code[start+1 : end])
	// pega só o 1º argumento
	if c := strings.Index(args, ","); c >= 0 {
		args = args[:c]
	}
	return strings.Trim(args, ` "'`)
}

func findComponentName(n *sitter.Node, src, file string) string {
	cur := n.Parent()
	for cur != nil {
		typ := cur.Type()
		if typ == "function_declaration" || typ == "arrow_function" {
			if id := findChildByType(cur, "identifier"); id != nil {
				return string(id.Content([]byte(src)))
			}
			break
		}
		cur = cur.Parent()
	}
	base := filepath.Base(file)
	return strings.TrimSuffix(base, filepath.Ext(base))
}

func findJSXContext(n *sitter.Node, src string) string {
	cur := n.Parent()
	for cur != nil {
		typ := cur.Type()
		if typ == "jsx_element" || typ == "jsx_self_closing_element" {
			raw := string(cur.Content([]byte(src)))
			if i := strings.Index(raw, ">"); i != -1 {
				raw = raw[:i+1]
			}
			if len(raw) > 100 {
				raw = raw[:100] + "..."
			}
			return raw
		}
		cur = cur.Parent()
	}
	return ""
}

func findChildByType(n *sitter.Node, t string) *sitter.Node {
	for i := 0; i < int(n.ChildCount()); i++ {
		ch := n.Child(i)
		if ch.Type() == t {
			return ch
		}
		if f := findChildByType(ch, t); f != nil {
			return f
		}
	}
	return nil
}

func snippet(lines []string, center, radius int) []string {
	var out []string
	start := max(1, center-radius)
	end := min(len(lines), center+radius)
	for i := start; i <= end; i++ {
		out = append(out, fmt.Sprintf("%4d  %s", i, lines[i-1]))
	}
	return out
}

func isSourceFile(ext string) bool {
	switch strings.ToLower(ext) {
	case ".ts", ".tsx", ".js", ".jsx":
		return true
	}
	return false
}

func skipDir(path string) bool {
	return strings.Contains(path, "node_modules") || strings.Contains(path, string(filepath.Separator)+".git")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
