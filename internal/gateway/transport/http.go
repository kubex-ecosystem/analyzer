// Package transport provides HTTP transport layer for the gateway.package transport
package transport

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/kubex-ecosystem/analyzer/internal/gateway/middleware"
	"github.com/kubex-ecosystem/analyzer/internal/gateway/registry"
	"github.com/kubex-ecosystem/analyzer/internal/providers"
)

// httpHandlers holds the HTTP route handlers
type httpHandlers struct {
	registry             *registry.Registry
	productionMiddleware *middleware.ProductionMiddleware
}

// WireHTTP sets up HTTP routes
func WireHTTP(mux *http.ServeMux, reg *registry.Registry, prodMiddleware *middleware.ProductionMiddleware) {
	h := &httpHandlers{
		registry:             reg,
		productionMiddleware: prodMiddleware,
	}

	mux.HandleFunc("/healthz", h.healthCheck)
	mux.HandleFunc("/v1/chat", h.chatSSE)
	mux.HandleFunc("/v1/providers", h.listProviders)
	mux.HandleFunc("/v1/status", h.productionStatus)
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
