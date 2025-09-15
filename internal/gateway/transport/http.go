// Package transport sets up HTTP routes and handlers for the Analyzer Gateway,
// including merged Repository Intelligence endpoints.
package transport

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/kubex-ecosystem/analyzer/internal/gateway/middleware"
	"github.com/kubex-ecosystem/analyzer/internal/gateway/registry"
	"github.com/kubex-ecosystem/analyzer/internal/handlers/lookatni"
	"github.com/kubex-ecosystem/analyzer/internal/scorecard"
	providers "github.com/kubex-ecosystem/analyzer/internal/types"
	"github.com/kubex-ecosystem/analyzer/internal/web"
)

// httpHandlers holds the HTTP route handlers
type httpHandlers struct {
	registry             *registry.Registry
	productionMiddleware *middleware.ProductionMiddleware
	engine               *scorecard.Engine // Repository Intelligence engine
	lookAtniHandler      *lookatni.Handler // LookAtni integration
}

// WireHTTP sets up HTTP routes
func WireHTTP(mux *http.ServeMux, reg *registry.Registry, prodMiddleware *middleware.ProductionMiddleware) {
	// Initialize LookAtni handler
	workDir := "./lookatni_workspace" // TODO: Make configurable
	lookAtniHandler := lookatni.NewHandler(workDir)

	h := &httpHandlers{
		registry:             reg,
		productionMiddleware: prodMiddleware,
		engine:               nil, // TODO: Initialize scorecard engine with real clients
		lookAtniHandler:      lookAtniHandler,
	}

	// Web Interface - Frontend embarcado! 🚀
	webHandler, err := web.NewHandler()
	if err != nil {
		log.Printf("⚠️  Failed to initialize web interface: %v", err)
	} else {
		// Register web interface on /app/* and root
		mux.Handle("/app/", http.StripPrefix("/app", webHandler))
		// Root path serves the frontend (but with lower priority than API endpoints)
		mux.Handle("/", webHandler)
		log.Println("✅ Web interface enabled at /app/ and /")
	}

	// API endpoints (higher priority routes)
	mux.HandleFunc("/healthz", h.healthCheck)
	mux.HandleFunc("/v1/chat", h.chatSSE)
	mux.HandleFunc("/v1/providers", h.listProviders)
	mux.HandleFunc("/v1/status", h.productionStatus)

	// Repository Intelligence endpoints - MERGE POINT! 🚀
	mux.HandleFunc("/api/v1/scorecard", h.handleRepositoryScorecard)
	mux.HandleFunc("/api/v1/scorecard/advice", h.handleScorecardAdvice)
	mux.HandleFunc("/api/v1/metrics/ai", h.handleAIMetrics)
	mux.HandleFunc("/api/v1/health", h.handleRepositoryHealth)

	// LookAtni Integration endpoints - CODE NAVIGATION! 🔍
	mux.HandleFunc("/api/v1/lookatni/extract", h.lookAtniHandler.HandleExtractProject)
	mux.HandleFunc("/api/v1/lookatni/archive", h.lookAtniHandler.HandleCreateArchive)
	mux.HandleFunc("/api/v1/lookatni/download/", h.lookAtniHandler.HandleDownloadArchive)
	mux.HandleFunc("/api/v1/lookatni/projects", h.lookAtniHandler.HandleListExtractedProjects)
	mux.HandleFunc("/api/v1/lookatni/projects/", h.lookAtniHandler.HandleProjectFragments)

	log.Println("✅ LookAtni integration enabled - Code extraction and navigation ready!")
}

// healthCheck provides a simple health endpoint
func (h *httpHandlers) healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "analyzer-gw",
	})
}

// listProviders returns available providers
func (h *httpHandlers) listProviders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	providers := h.registry.ListProviders()
	config := h.registry.GetConfig()

	response := map[string]interface{}{
		"providers": providers,
		"config":    config.Providers,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// chatSSE handles chat completion with Server-Sent Events
func (h *httpHandlers) chatSSE(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req providers.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Provider == "" {
		http.Error(w, "Provider is required", http.StatusBadRequest)
		return
	}

	provider := h.registry.Resolve(req.Provider)
	if provider == nil {
		http.Error(w, fmt.Sprintf("Provider '%s' not found", req.Provider), http.StatusBadRequest)
		return
	}

	// Check if provider is available
	if err := provider.Available(); err != nil {
		http.Error(w, fmt.Sprintf("Provider unavailable: %v", err), http.StatusServiceUnavailable)
		return
	}

	// Handle BYOK (Bring Your Own Key)
	if externalKey := r.Header.Get("x-external-api-key"); externalKey != "" {
		// TODO: Implement secure BYOK handling
		// For now, we'll pass it through meta
		if req.Meta == nil {
			req.Meta = make(map[string]interface{})
		}
		req.Meta["external_api_key"] = externalKey
	}

	// Set default temperature if not provided
	if req.Temp == 0 {
		req.Temp = 0.7
	}

	// Force streaming for SSE
	req.Stream = true

	// Start chat completion
	ch, err := provider.Chat(r.Context(), req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Chat request failed: %v", err), http.StatusInternalServerError)
		return
	}

	// Set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	// Stream the response
	for chunk := range ch {
		if chunk.Error != "" {
			// Send error event
			data, _ := json.Marshal(map[string]interface{}{
				"error": chunk.Error,
				"done":  true,
			})
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
			return
		}

		if chunk.Content != "" {
			// Send content chunk
			data, _ := json.Marshal(map[string]interface{}{
				"content": chunk.Content,
				"done":    false,
			})
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		}

		if chunk.Done {
			// Send final chunk with usage info
			data, _ := json.Marshal(map[string]interface{}{
				"done":  true,
				"usage": chunk.Usage,
			})
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()

			// Log usage for monitoring
			if chunk.Usage != nil {
				log.Printf("Usage: provider=%s model=%s tokens=%d latency=%dms cost=$%.6f",
					chunk.Usage.Provider, chunk.Usage.Model, chunk.Usage.Tokens,
					chunk.Usage.Ms, chunk.Usage.CostUSD)
			}
			break
		}
	}
}

// productionStatus returns comprehensive status including middleware metrics
func (h *httpHandlers) productionStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	status := map[string]interface{}{
		"service":   "analyzer-gw",
		"status":    "healthy",
		"providers": h.registry.ListProviders(),
	}

	// Add production middleware status if available
	if h.productionMiddleware != nil {
		status["production_features"] = h.productionMiddleware.GetStatus()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

// Repository Intelligence Handlers - MERGED! 🚀

// handleRepositoryScorecard handles GET /api/v1/scorecard
func (h *httpHandlers) handleRepositoryScorecard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// TODO: Implement with real scorecard engine
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Schema-Version", "scorecard@1.0.0")
	w.Header().Set("X-Server-Version", "analyzer-v1.0.0")

	// Placeholder response
	placeholder := map[string]interface{}{
		"status":  "not_implemented",
		"message": "Repository Intelligence API under development",
		"endpoints": []string{
			"/api/v1/scorecard",
			"/api/v1/scorecard/advice",
			"/api/v1/metrics/ai",
		},
	}
	json.NewEncoder(w).Encode(placeholder)
}

// handleScorecardAdvice handles POST /api/v1/scorecard/advice
func (h *httpHandlers) handleScorecardAdvice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// TODO: Implement advice generation using existing advise system
	w.Header().Set("Content-Type", "application/json")
	placeholder := map[string]interface{}{
		"status":  "not_implemented",
		"message": "Will integrate with existing /v1/advise system",
	}
	json.NewEncoder(w).Encode(placeholder)
}

// handleAIMetrics handles GET /api/v1/metrics/ai
func (h *httpHandlers) handleAIMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// TODO: Implement AI metrics calculation
	w.Header().Set("Content-Type", "application/json")
	placeholder := map[string]interface{}{
		"status":  "not_implemented",
		"message": "AI Metrics (HIR/AAC/TPH) calculation under development",
	}
	json.NewEncoder(w).Encode(placeholder)
}

// handleRepositoryHealth handles GET /api/v1/health
func (h *httpHandlers) handleRepositoryHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	health := map[string]interface{}{
		"status":  "healthy",
		"service": "repository-intelligence",
		"components": map[string]string{
			"scorecard_engine": "not_initialized",
			"dora_calculator":  "not_initialized",
			"chi_calculator":   "not_initialized",
			"ai_metrics":       "not_initialized",
		},
		"version": "analyzer-v1.0.0",
	}
	json.NewEncoder(w).Encode(health)
}
