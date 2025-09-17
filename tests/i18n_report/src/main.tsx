package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	sitter "github.com/smacker/go-tree-sitter"
	"github.com/smacker/go-tree-sitter/typescript"
)

// ===== TIPOS DE DADOS =====

type I18nUsage struct {
	Key             string            `json:"key"`
	FilePath        string            `json:"filePath"`
	Line            int               `json:"line"`
	Column          int               `json:"column"`
	Component       string            `json:"component"`
	FunctionContext string            `json:"functionContext"`
	JSXContext      string            `json:"jsxContext"`
	Props           []string          `json:"props"`
	Imports         []string          `json:"imports"`
	NearbyCode      []string          `json:"nearbyCode"`
	CallType        string            `json:"callType"`
	Timestamp       time.Time         `json:"timestamp"`
	AIContext       *AIContextData    `json:"aiContext,omitempty"`
}

type AIContextData struct {
	ComponentPurpose  string   `json:"componentPurpose"`
	UIElementType     string   `json:"uiElementType"`
	UserInteraction   bool     `json:"userInteraction"`
	BusinessContext   string   `json:"businessContext"`
	SuggestedKeys     []string `json:"suggestedKeys"`
	QualityScore      int      `json:"qualityScore"`
}

type ProjectStats struct {
	TotalUsages       int                    `json:"totalUsages"`
	CoveragePercent   float64               `json:"coveragePercent"`
	QualityScore      float64               `json:"qualityScore"`
	UsagesByType      map[string]int        `json:"usagesByType"`
	UsagesByComponent map[string]int        `json:"usagesByComponent"`
	MissingKeys       []string              `json:"missingKeys"`
	HardcodedStrings  []HardcodedString     `json:"hardcodedStrings"`
	LastUpdate        time.Time             `json:"lastUpdate"`
}

type HardcodedString struct {
	Text     string `json:"text"`
	FilePath string `json:"filePath"`
	Line     int    `json:"line"`
	Context  string `json:"context"`
}

type ChangeEvent struct {
	Type      string      `json:"type"` // "added", "removed", "modified", "stats_updated"
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

// ===== WEBSOCKET MANAGER =====

type WebSocketManager struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.Mutex
}

func NewWebSocketManager() *WebSocketManager {
	return &WebSocketManager{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (wsm *WebSocketManager) Run() {
	for {
		select {
		case client := <-wsm.register:
			wsm.mutex.Lock()
			wsm.clients[client] = true
			wsm.mutex.Unlock()
			log.Println("Cliente WebSocket conectado")

		case client := <-wsm.unregister:
			wsm.mutex.Lock()
			if _, ok := wsm.clients[client]; ok {
				delete(wsm.clients, client)
				client.Close()
			}
			wsm.mutex.Unlock()
			log.Println("Cliente WebSocket desconectado")

		case message := <-wsm.broadcast:
			wsm.mutex.Lock()
			for client := range wsm.clients {
				if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
					delete(wsm.clients, client)
					client.Close()
				}
			}
			wsm.mutex.Unlock()
		}
	}
}

func (wsm *WebSocketManager) BroadcastChange(event ChangeEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Erro ao serializar evento: %v", err)
		return
	}
	
	select {
	case wsm.broadcast <- data:
	default:
		log.Println("Canal de broadcast cheio, pulando mensagem")
	}
}

// ===== MONITOR DE ARQUIVOS REAL-TIME =====

type RealTimeMonitor struct {
	parser        *I18nParser
	wsManager     *WebSocketManager
	aiProvider    AIProvider
	watcher       *fsnotify.Watcher
	projectPath   string
	currentStats  ProjectStats
	currentUsages []I18nUsage
	mutex         sync.RWMutex
}

func NewRealTimeMonitor(projectPath string, wsManager *WebSocketManager) (*RealTimeMonitor, error) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	parser := NewI18nParser()
	aiProvider := NewMultiAIProvider()

	monitor := &RealTimeMonitor{
		parser:      parser,
		wsManager:   wsManager,
		aiProvider:  aiProvider,
		watcher:     watcher,
		projectPath: projectPath,
	}

	// Adiciona diretórios para monitorar
	err = monitor.addWatchPaths()
	if err != nil {
		return nil, err
	}

	return monitor, nil
}

func (rtm *RealTimeMonitor) addWatchPaths() error {
	return filepath.Walk(rtm.projectPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Ignora node_modules e .git
		if strings.Contains(path, "node_modules") || strings.Contains(path, ".git") {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		// Adiciona diretórios que contêm arquivos interessantes
		if info.IsDir() {
			return rtm.watcher.Add(path)
		}

		return nil
	})
}

func (rtm *RealTimeMonitor) Start() {
	log.Println("🚀 Iniciando monitoramento em tempo real...")
	
	// Análise inicial
	go rtm.performFullAnalysis()
	
	// Loop principal do watcher
	go func() {
		for {
			select {
			case event, ok := <-rtm.watcher.Events:
				if !ok {
					return
				}
				rtm.handleFileEvent(event)

			case err, ok := <-rtm.watcher.Errors:
				if !ok {
					return
				}
				log.Printf("Erro no watcher: %v", err)
			}
		}
	}()
}

func (rtm *RealTimeMonitor) handleFileEvent(event fsnotify.Event) {
	// Só processa arquivos TS/JS/TSX/JSX
	ext := strings.ToLower(filepath.Ext(event.Name))
	if !isSourceFile(ext) {
		return
	}

	log.Printf("📁 Arquivo modificado: %s (%s)", event.Name, event.Op.String())

	// Pequeno delay para evitar múltiplos eventos do mesmo arquivo
	time.Sleep(100 * time.Millisecond)

	// Re-analisa o arquivo
	go rtm.analyzeFile(event.Name, event.Op)
}

func (rtm *RealTimeMonitor) analyzeFile(filePath string, op fsnotify.Op) {
	// Se arquivo foi removido
	if op&fsnotify.Remove == fsnotify.Remove {
		rtm.handleFileRemoved(filePath)
		return
	}

	// Analisa o arquivo
	usages, err := rtm.parser.ParseFile(filePath)
	if err != nil {
		log.Printf("Erro ao analisar %s: %v", filePath, err)
		return
	}

	// Enriquece com IA
	for i := range usages {
		rtm.enrichWithAI(&usages[i])
	}

	// Atualiza estado
	rtm.updateUsagesForFile(filePath, usages)
	
	// Calcula novas estatísticas
	rtm.calculateStats()
	
	// Broadcast das mudanças
	rtm.broadcastChanges(filePath, usages, "modified")
}

func (rtm *RealTimeMonitor) handleFileRemoved(filePath string) {
	rtm.mutex.Lock()
	defer rtm.mutex.Unlock()

	// Remove usages do arquivo
	var filteredUsages []I18nUsage
	for _, usage := range rtm.currentUsages {
		if usage.FilePath != filePath {
			filteredUsages = append(filteredUsages, usage)
		}
	}
	
	rtm.currentUsages = filteredUsages
	rtm.calculateStats()
	
	event := ChangeEvent{
		Type:      "file_removed",
		Data:      filePath,
		Timestamp: time.Now(),
	}
	rtm.wsManager.BroadcastChange(event)
}

func (rtm *RealTimeMonitor) updateUsagesForFile(filePath string, newUsages []I18nUsage) {
	rtm.mutex.Lock()
	defer rtm.mutex.Unlock()

	// Remove usages antigas do arquivo
	var filteredUsages []I18nUsage
	for _, usage := range rtm.currentUsages {
		if usage.FilePath != filePath {
			filteredUsages = append(filteredUsages, usage)
		}
	}

	// Adiciona novas usages
	filteredUsages = append(filteredUsages, newUsages...)
	rtm.currentUsages = filteredUsages
}

func (rtm *RealTimeMonitor) calculateStats() {
	rtm.mutex.Lock()
	defer rtm.mutex.Unlock()

	stats := ProjectStats{
		TotalUsages:       len(rtm.currentUsages),
		UsagesByType:      make(map[string]int),
		UsagesByComponent: make(map[string]int),
		LastUpdate:        time.Now(),
	}

	// Conta por tipo
	for _, usage := range rtm.currentUsages {
		stats.UsagesByType[usage.CallType]++
		if usage.Component != "" {
			stats.UsagesByComponent[usage.Component]++
		}
	}

	// Calcula métricas de qualidade
	stats.QualityScore = rtm.calculateQualityScore()
	stats.CoveragePercent = rtm.calculateCoverage()
	
	rtm.currentStats = stats
}

func (rtm *RealTimeMonitor) calculateQualityScore() float64 {
	if len(rtm.currentUsages) == 0 {
		return 0
	}

	totalScore := 0
	for _, usage := range rtm.currentUsages {
		if usage.AIContext != nil {
			totalScore += usage.AIContext.QualityScore
		}
	}

	return float64(totalScore) / float64(len(rtm.currentUsages))
}

func (rtm *RealTimeMonitor) calculateCoverage() float64 {
	// Aqui implementaríamos lógica para calcular cobertura
	// Por exemplo: strings i18n / (strings i18n + hardcoded strings)
	return 85.5 // Mock por enquanto
}

func (rtm *RealTimeMonitor) broadcastChanges(filePath string, usages []I18nUsage, changeType string) {
	// Envia usages atualizadas
	usageEvent := ChangeEvent{
		Type:      "usages_updated",
		Data:      usages,
		Timestamp: time.Now(),
	}
	rtm.wsManager.BroadcastChange(usageEvent)

	// Envia stats atualizadas
	statsEvent := ChangeEvent{
		Type:      "stats_updated", 
		Data:      rtm.currentStats,
		Timestamp: time.Now(),
	}
	rtm.wsManager.BroadcastChange(statsEvent)
}

func (rtm *RealTimeMonitor) performFullAnalysis() {
	log.Println("🔍 Realizando análise completa inicial...")
	
	usages, err := rtm.parser.ParseDirectory(rtm.projectPath)
	if err != nil {
		log.Printf("Erro na análise inicial: %v", err)
		return
	}

	// Enriquece com IA (em paralelo para velocidade)
	rtm.enrichUsagesWithAI(usages)
	
	rtm.mutex.Lock()
	rtm.currentUsages = usages
	rtm.mutex.Unlock()
	
	rtm.calculateStats()
	
	// Broadcast inicial
	event := ChangeEvent{
		Type:      "initial_analysis_complete",
		Data:      map[string]interface{}{
			"usages": usages,
			"stats":  rtm.currentStats,
		},
		Timestamp: time.Now(),
	}
	rtm.wsManager.BroadcastChange(event)
	
	log.Printf("✅ Análise inicial completa: %d usages encontradas", len(usages))
}

// ===== AI INTEGRATION =====

type AIProvider interface {
	AnalyzeI18nUsage(usage I18nUsage) (*AIContextData, error)
	GenerateTranslationSuggestions(key string, context I18nUsage) ([]string, error)
	DetectHardcodedStrings(filePath string, sourceCode string) ([]HardcodedString, error)
}

type MultiAIProvider struct {
	providers map[string]AIProvider
	current   string
}

func NewMultiAIProvider() *MultiAIProvider {
	return &MultiAIProvider{
		providers: make(map[string]AIProvider),
		current:   "claude", // default
	}
}

func (m *MultiAIProvider) AnalyzeI18nUsage(usage I18nUsage) (*AIContextData, error) {
	// Por enquanto, dados mocados para demonstração
	return &AIContextData{
		ComponentPurpose:  inferComponentPurpose(usage),
		UIElementType:     inferUIElementType(usage),
		UserInteraction:   containsInteractionKeywords(usage),
		BusinessContext:   inferBusinessContext(usage),
		SuggestedKeys:     generateSuggestedKeys(usage),
		QualityScore:      calculateUsageQuality(usage),
	}, nil
}

func (m *MultiAIProvider) GenerateTranslationSuggestions(key string, context I18nUsage) ([]string, error) {
	// Mock de sugestões
	return []string{
		fmt.Sprintf("Sugestão 1 para %s", key),
		fmt.Sprintf("Sugestão 2 para %s", key),
	}, nil
}

func (m *MultiAIProvider) DetectHardcodedStrings(filePath string, sourceCode string) ([]HardcodedString, error) {
	// Implementação simplificada - na real seria bem mais sofisticada
	var hardcoded []HardcodedString
	
	lines := strings.Split(sourceCode, "\n")
	for i, line := range lines {
		// Procura strings que parecem ser texto de UI
		if strings.Contains(line, `"`) && !strings.Contains(line, "import") {
			// Extrai strings entre aspas
			parts := strings.Split(line, `"`)
			for j := 1; j < len(parts); j += 2 {
				text := parts[j]
				if isLikelyUIText(text) {
					hardcoded = append(hardcoded, HardcodedString{
						Text:     text,
						FilePath: filePath,
						Line:     i + 1,
						Context:  strings.TrimSpace(line),
					})
				}
			}
		}
	}
	
	return hardcoded, nil
}

// ===== FUNÇÕES AUXILIARES DE AI =====

func inferComponentPurpose(usage I18nUsage) string {
	component := strings.ToLower(usage.Component)
	
	switch {
	case strings.Contains(component, "modal"):
		return "Modal/Dialog Component"
	case strings.Contains(component, "form"):
		return "Form Component"
	case strings.Contains(component, "button"):
		return "Interactive Button"
	case strings.Contains(component, "header"):
		return "Page Header"
	case strings.Contains(component, "nav"):
		return "Navigation Component"
	default:
		return "General Component"
	}
}

func inferUIElementType(usage I18nUsage) string {
	jsx := strings.ToLower(usage.JSXContext)
	
	switch {
	case strings.Contains(jsx, "<h1") || strings.Contains(jsx, "<h2"):
		return "Heading"
	case strings.Contains(jsx, "<button"):
		return "Button"
	case strings.Contains(jsx, "<label"):
		return "Form Label"
	case strings.Contains(jsx, "<p"):
		return "Paragraph"
	case strings.Contains(jsx, "<span"):
		return "Inline Text"
	default:
		return "Text Content"
	}
}

func containsInteractionKeywords(usage I18nUsage) bool {
	code := strings.Join(usage.NearbyCode, " ") + " " + usage.JSXContext
	keywords := []string{"onClick", "onSubmit", "onChange", "button", "form", "input"}
	
	for _, keyword := range keywords {
		if strings.Contains(code, keyword) {
			return true
		}
	}
	return false
}

func inferBusinessContext(usage I18nUsage) string {
	key := strings.ToLower(usage.Key)
	
	switch {
	case strings.Contains(key, "user") || strings.Contains(key, "profile"):
		return "User Management"
	case strings.Contains(key, "auth") || strings.Contains(key, "login"):
		return "Authentication"
	case strings.Contains(key, "payment") || strings.Contains(key, "billing"):
		return "Payment/Billing"
	case strings.Contains(key, "product") || strings.Contains(key, "item"):
		return "Product Catalog"
	default:
		return "General Application"
	}
}

func generateSuggestedKeys(usage I18nUsage) []string {
	base := usage.Component
	element := inferUIElementType(usage)
	
	return []string{
		fmt.Sprintf("%s.%s", strings.ToLower(base), strings.ToLower(element)),
		fmt.Sprintf("common.%s", strings.ToLower(element)),
		fmt.Sprintf("%s.text", strings.ToLower(base)),
	}
}

func calculateUsageQuality(usage I18nUsage) int {
	score := 50 // base
	
	// Bonus por ter contexto JSX
	if usage.JSXContext != "" {
		score += 15
	}
	
	// Bonus por key bem estruturada
	if strings.Contains(usage.Key, ".") {
		score += 10
	}
	
	// Bonus por estar em componente nomeado
	if usage.Component != "" && usage.Component != filepath.Base(usage.FilePath) {
		score += 10
	}
	
	// Bonus por ter código próximo contextual
	if len(usage.NearbyCode) > 0 {
		score += 10
	}
	
	// Penalty por key muito genérica
	genericKeys := []string{"text", "title", "label", "button"}
	for _, generic := range genericKeys {
		if usage.Key == generic {
			score -= 20
			break
		}
	}
	
	// Garante que fica entre 0-100
	if score > 100 {
		score = 100
	}
	if score < 0 {
		score = 0
	}
	
	return score
}

func isLikelyUIText(text string) bool {
	// Ignora strings muito curtas ou que parecem ser código
	if len(text) < 3 || strings.Contains(text, "://") || strings.Contains(text, ".") && len(strings.Split(text, ".")) > 2 {
		return false
	}
	
	// Strings que parecem texto de UI
	uiIndicators := []string{" ", "Click", "Submit", "Cancel", "Save", "Delete", "Edit", "Add", "Remove"}
	for _, indicator := range uiIndicators {
		if strings.Contains(text, indicator) {
			return true
		}
	}
	
	return false
}

func (rtm *RealTimeMonitor) enrichUsagesWithAI(usages []I18nUsage) {
	// Canal para controlar concorrência
	sem := make(chan struct{}, 5) // máximo 5 goroutines simultâneas
	var wg sync.WaitGroup
	
	for i := range usages {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			sem <- struct{}{} // acquire
			defer func() { <-sem }() // release
			
			rtm.enrichWithAI(&usages[idx])
		}(i)
	}
	
	wg.Wait()
}

func (rtm *RealTimeMonitor) enrichWithAI(usage *I18nUsage) {
	aiContext, err := rtm.aiProvider.AnalyzeI18nUsage(*usage)
	if err != nil {
		log.Printf("Erro ao enriquecer com IA: %v", err)
		return
	}
	
	usage.AIContext = aiContext
	usage.Timestamp = time.Now()
}

// ===== HTTP HANDLERS =====

func (rtm *RealTimeMonitor) setupHTTPHandlers() *mux.Router {
	router := mux.NewRouter()
	
	// WebSocket endpoint
	router.HandleFunc("/ws", rtm.handleWebSocket)
	
	// API REST
	router.HandleFunc("/api/stats", rtm.handleGetStats).Methods("GET")
	router.HandleFunc("/api/usages", rtm.handleGetUsages).Methods("GET")
	router.HandleFunc("/api/analyze/{filepath:.*}", rtm.handleAnalyzeFile).Methods("POST")
	
	// Serve frontend estático (quando implementarmos)
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./dist/")))
	
	return router
}

func (rtm *RealTimeMonitor) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Em produção, implementar verificação adequada
		},
	}
	
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Erro ao fazer upgrade WebSocket: %v", err)
		return
	}
	
	rtm.wsManager.register <- conn
	
	// Envia estado atual para o novo cliente
	rtm.sendInitialState(conn)
	
	// Keep alive
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			rtm.wsManager.unregister <- conn
			break
		}
	}
}

func (rtm *RealTimeMonitor) sendInitialState(conn *websocket.Conn) {
	rtm.mutex.RLock()
	stats := rtm.currentStats
	usages := rtm.currentUsages
	rtm.mutex.RUnlock()
	
	initialData := map[string]interface{}{
		"type": "initial_state",
		"data": map[string]interface{}{
			"stats":  stats,
			"usages": usages,
		},
		"timestamp": time.Now(),
	}
	
	data, _ := json.Marshal(initialData)
	conn.WriteMessage(websocket.TextMessage, data)
}

func (rtm *RealTimeMonitor) handleGetStats(w http.ResponseWriter, r *http.Request) {
	rtm.mutex.RLock()
	stats := rtm.currentStats
	rtm.mutex.RUnlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (rtm *RealTimeMonitor) handleGetUsages(w http.ResponseWriter, r *http.Request) {
	rtm.mutex.RLock()
	usages := rtm.currentUsages
	rtm.mutex.RUnlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(usages)
}

func (rtm *RealTimeMonitor) handleAnalyzeFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	filePath := vars["filepath"]
	
	fullPath := filepath.Join(rtm.projectPath, filePath)
	
	go rtm.analyzeFile(fullPath, fsnotify.Write)
	
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Análise iniciada",
		"file":    filePath,
	})
}

// ===== PARSER (do artefato anterior) =====
// ... (incluir todo o código do parser aqui)

type I18nParser struct {
	parser   *sitter.Parser
	language *sitter.Language
}

func NewI18nParser() *I18nParser {
	parser := sitter.NewParser()
	lang := typescript.GetLanguage()
	parser.SetLanguage(lang)

	return &I18nParser{
		parser:   parser,
		language: lang,
	}
}

func (p *I18nParser) ParseFile(filePath string) ([]I18nUsage, error) {
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

	var usages []I18nUsage
	p.walkAST(tree.RootNode(), fileInfo, &usages)

	return usages, nil
}

type FileContext struct {
	SourceCode string
	Lines      []string
	FilePath   string
}

func (p *I18nParser) walkAST(node *sitter.Node, fileCtx *FileContext, usages *[]I18nUsage) {
	nodeType := node.Type()
	
	if nodeType == "call_expression" {
		p.analyzeCallExpression(node, fileCtx, usages)
	}

	for i := 0; i < int(node.ChildCount()); i++ {
		child := node.Child(i)
		p.walkAST(child, fileCtx, usages)
	}
}

func (p *I18nParser) analyzeCallExpression(node *sitter.Node, fileCtx *FileContext, usages *[]I18nUsage) {
	callCode := node.Content([]byte(fileCtx.SourceCode))
	
	if !p.isI18nCall(string(callCode)) {
		return
	}

	usage := I18nUsage{
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

func (p *I18nParser) extractCallDetails(node *sitter.Node, fileCtx *FileContext, usage *I18nUsage) {
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

func (p *I18nParser) extractComponentContext(node *sitter.Node, fileCtx *FileContext, usage *I18nUsage) {
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
