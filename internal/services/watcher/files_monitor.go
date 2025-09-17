package watcher

import (
	"encoding/json"
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
	"github.com/kubex-ecosystem/analyzer/internal/gateway/registry"
	"github.com/kubex-ecosystem/analyzer/internal/types"

	"github.com/kubex-ecosystem/analyzer/internal/services/astx"
	wsocket "github.com/kubex-ecosystem/analyzer/internal/services/wsockets"
)

// ===== MONITOR DE ARQUIVOS REAL-TIME =====

type RealTimeMonitor struct {
	parser        *types.Scorecard
	wsManager     *wsocket.WebSocketManager
	aiProvider    *registry.Registry
	watcher       *fsnotify.Watcher
	projectPath   string
	currentStats  types.ProjectStats
	currentUsages []types.I18nUsage
	mutex         sync.RWMutex
}

func NewRealTimeMonitor(projectPath string, wsManager *wsocket.WebSocketManager) (*RealTimeMonitor, error) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	parser := types.Scorecard{}
	// aiProvider := registry.Load(projectPath)

	monitor := &RealTimeMonitor{
		parser:    parser,
		wsManager: wsManager,
		// aiProvider:  aiProvider,
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
	if !astx.IsSourceFile(ext) {
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
		rtm.EnrichWithAI(&usages[i])
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
	var filteredUsages []types.I18nUsage
	for _, usage := range rtm.currentUsages {
		if usage.FilePath != filePath {
			filteredUsages = append(filteredUsages, usage)
		}
	}

	rtm.currentUsages = filteredUsages
	rtm.calculateStats()

	event := types.ChangeEvent{
		Type:      "file_removed",
		Data:      filePath,
		Timestamp: time.Now(),
	}
	rtm.wsManager.BroadcastChange(event)
}

func (rtm *RealTimeMonitor) updateUsagesForFile(filePath string, newUsages []types.I18nUsage) {
	rtm.mutex.Lock()
	defer rtm.mutex.Unlock()

	// Remove usages antigas do arquivo
	var filteredUsages []types.I18nUsage
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

	stats := types.ProjectStats{
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

func (rtm *RealTimeMonitor) broadcastChanges(filePath string, usages []types.I18nUsage, changeType string) {
	// Envia usages atualizadas
	usageEvent := types.ChangeEvent{
		Type:      "usages_updated",
		Data:      usages,
		Timestamp: time.Now(),
	}
	rtm.wsManager.BroadcastChange(usageEvent)

	// Envia stats atualizadas
	statsEvent := types.ChangeEvent{
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
	rtm.EnrichUsagesWithAI(usages)

	rtm.mutex.Lock()
	rtm.currentUsages = usages
	rtm.mutex.Unlock()

	rtm.calculateStats()

	// Broadcast inicial
	event := types.ChangeEvent{
		Type: "initial_analysis_complete",
		Data: map[string]interface{}{
			"usages": usages,
			"stats":  rtm.currentStats,
		},
		Timestamp: time.Now(),
	}
	rtm.wsManager.BroadcastChange(event)

	log.Printf("✅ Análise inicial completa: %d usages encontradas", len(usages))
}

func (rtm *RealTimeMonitor) EnrichUsagesWithAI(usages []types.I18nUsage) {
	// Canal para controlar concorrência
	sem := make(chan struct{}, 5) // máximo 5 goroutines simultâneas
	var wg sync.WaitGroup

	for i := range usages {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			sem <- struct{}{}        // acquire
			defer func() { <-sem }() // release

			rtm.EnrichWithAI(&usages[idx])
		}(i)
	}

	wg.Wait()
}

func (rtm *RealTimeMonitor) EnrichWithAI(usage *types.I18nUsage) {
	// Mock de enriquecimento com IA
	usage.AIContext = &types.AIContextData{
		AIContext: &types.AIContext{
			Suggestions:  []string{"Sugestão 1", "Sugestão 2"},
			QualityScore: 8, // de 0 a 10
		},
	}
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

	rtm.wsManager.BroadcastChange(types.ChangeEvent{
		Type:      "client_connected",
		Data:      "Novo cliente conectado",
		Timestamp: time.Now(),
	})

	// rtm.sendInitialState(conn)

	// Envia estado atual para o novo cliente
	rtm.sendInitialState(rtm.wsManager)

	// Keep alive
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			rtm.wsManager.BroadcastChange(types.ChangeEvent{
				Type:      "client_disconnected",
				Data:      "Cliente desconectado",
				Timestamp: time.Now(),
			})
			conn.Close()
			break
		}
	}
}

func (rtm *RealTimeMonitor) sendInitialState(conn *wsocket.WebSocketManager) {
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
	conn.BroadcastChange(types.ChangeEvent{
		Type:      "initial_state",
		Data:      data,
		Timestamp: time.Now(),
	})
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
