// Package gateway provides the gateway server functionality for the analyzer.
package gateway

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"sync"

	"github.com/kubex-ecosystem/analyzer/internal/gateway/middleware"
	"github.com/kubex-ecosystem/analyzer/internal/gateway/registry"
	"github.com/kubex-ecosystem/analyzer/internal/gateway/transport"
)

// ServerConfig holds configuration for the gateway server
type ServerConfig struct {
	Addr            string
	ProvidersConfig string
	Debug           bool
	EnableCORS      bool
}

// Server represents the gateway server
type Server struct {
	config     *ServerConfig
	registry   *registry.Registry
	middleware *middleware.ProductionMiddleware
	handler    http.Handler
	once       sync.Once
}

// NewServer creates a new gateway server instance
func NewServer(config *ServerConfig) (*Server, error) {
	// Load providers registry
	reg, err := registry.Load(config.ProvidersConfig)
	if err != nil {
		return nil, err
	}

	// Initialize production middleware
	prodConfig := middleware.DefaultProductionConfig()
	prodMiddleware := middleware.NewProductionMiddleware(prodConfig)

	// Register all providers with production middleware
	for _, providerName := range reg.ListProviders() {
		prodMiddleware.RegisterProvider(providerName)
	}

	return &Server{
		config:     config,
		registry:   reg,
		middleware: prodMiddleware,
	}, nil
}

// Start starts the gateway server
func (s *Server) Start() error {
	// Setup graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		log.Println("🛑 Shutting down gracefully...")
		s.middleware.Stop()
		os.Exit(0)
	}()

	handler, err := s.Handler()
	if err != nil {
		return err
	}

	log.Printf("🚀 analyzer-gw listening on %s with ENTERPRISE features!", s.config.Addr)
	return http.ListenAndServe(s.config.Addr, handler)
}

// Handler builds (once) and returns the configured HTTP handler for reuse.
func (s *Server) Handler() (http.Handler, error) {
	s.once.Do(func() {
		mux := http.NewServeMux()
		transport.WireHTTP(mux, s.registry, s.middleware)

		var handler http.Handler = mux
		if s.config.EnableCORS {
			handler = withCORS(handler)
		}

		s.handler = handler
	})

	return s.handler, nil
}

// withCORS adds CORS headers to responses
func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "content-type, authorization, x-external-api-key, x-tenant-id, x-user-id")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(204)
			return
		}
		h.ServeHTTP(w, r)
	})
}

// getEnv returns environment variable value or default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
