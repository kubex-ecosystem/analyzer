package main

import (
	"log"
	"net/http"
	"os"

	"github.com/kubex-ecosystem/gemx/analyzer/internal/gateway/registry"
	"github.com/kubex-ecosystem/gemx/analyzer/internal/gateway/transport"
)

func main() {
	cfgPath := getEnv("PROVIDERS_CFG", "config/providers.yml")
	reg, err := registry.Load(cfgPath)
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	transport.WireHTTP(mux, reg) // /v1/chat, /healthz, etc.

	addr := getEnv("ADDR", ":8080")
	log.Println("analyzer-gw listening on", addr)
	log.Fatal(http.ListenAndServe(addr, withCORS(mux)))
}

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

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
