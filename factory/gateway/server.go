package gateway

import (
	"net/http"

	internal "github.com/kubex-ecosystem/analyzer/internal/gateway"
)

// ServerConfig re-exports the internal gateway server configuration.
type ServerConfig = internal.ServerConfig

// Server wraps the internal gateway server, exposing a stable public API.
type Server struct {
	inner *internal.Server
}

// NewServer constructs a new Analyzer gateway server using the provided configuration.
func NewServer(cfg *ServerConfig) (*Server, error) {
	srv, err := internal.NewServer(cfg)
	if err != nil {
		return nil, err
	}
	return &Server{inner: srv}, nil
}

// Handler returns the fully wired HTTP handler (mux + middleware) for reuse.
func (s *Server) Handler() (http.Handler, error) {
	return s.inner.Handler()
}

// Start delegates to the internal server's Start method.
func (s *Server) Start() error {
	return s.inner.Start()
}

