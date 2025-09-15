// Package advise implements the advice generation for Repository Intelligence.
package advise

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/kubex-ecosystem/analyzer/internal/gateway/registry"
	providers "github.com/kubex-ecosystem/analyzer/internal/types"
)

type Handler struct{ reg *registry.Registry }

func New(reg *registry.Registry) *Handler { return &Handler{reg: reg} }

type adviseReq struct {
	Provider    string         `json:"provider"`
	Model       string         `json:"model"`
	Scorecard   map[string]any `json:"scorecard"`
	Hotspots    []string       `json:"hotspots"`
	Temperature float32        `json:"temperature"`
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mode := Mode(r.URL.Query().Get("mode"))
	if mode == "" {
		http.Error(w, "mode required: exec|code|ops|community", http.StatusBadRequest)
		return
	}

	var in adviseReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	p := h.reg.Resolve(in.Provider)
	if p == nil {
		http.Error(w, "bad provider", http.StatusBadRequest)
		return
	}

	sys := systemPrompt(mode)
	user := userPrompt(in.Scorecard, in.Hotspots)

	headers := map[string]string{
		"x-external-api-key": r.Header.Get("x-external-api-key"),
		"x-tenant-id":        r.Header.Get("x-tenant-id"),
		"x-user-id":          r.Header.Get("x-user-id"),
	}

	ch, err := p.Chat(r.Context(), providers.ChatRequest{
		Provider: in.Provider,
		Model:    in.Model,
		Temp:     in.Temperature,
		Stream:   true,
		Messages: []providers.Message{
			{Role: "system", Content: sys},
			{Role: "user", Content: user},
		},
		Meta:    map[string]any{},
		Headers: headers,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	flusher, _ := w.(http.Flusher)

	enc := func(v any) []byte { b, _ := json.Marshal(v); return b }
	start := time.Now()
	for c := range ch {
		if c.Content != "" {
			w.Write([]byte("data: "))
			w.Write(enc(map[string]any{"content": c.Content}))
			w.Write([]byte("nn"))
			flusher.Flush()
		}
		if c.Done {
			w.Write([]byte("data: "))
			w.Write(enc(map[string]any{"done": true, "usage": c.Usage, "mode": mode}))
			w.Write([]byte("nn"))
			flusher.Flush()
		}
	}
	_ = start

}
