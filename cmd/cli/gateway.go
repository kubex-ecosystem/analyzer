package cli

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/kubex-ecosystem/analyzer/internal/gateway/middleware"
	"github.com/kubex-ecosystem/analyzer/internal/gateway/registry"
	"github.com/kubex-ecosystem/analyzer/internal/gateway/transport"
	"github.com/kubex-ecosystem/analyzer/internal/providers"
	"github.com/spf13/cobra"
)

func GatewayCmds() *cobra.Command {
	rootCmd := &cobra.Command{
		Use:   "gateway",
		Short: "Start the analyzer gateway server",
		Run: func(cmd *cobra.Command, args []string) {
			startGateway()
		},
	}
	return rootCmd
}

func startGateway() {
	cfgPath := getEnv("PROVIDERS_CFG", "config/providers.yml")
	reg, err := registry.Load(cfgPath)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize production middleware with default config
	prodConfig := middleware.DefaultProductionConfig()
	prodMiddleware := middleware.NewProductionMiddleware(prodConfig)

	// Register all providers with production middleware
	for _, providerName := range reg.ListProviders() {
		prodMiddleware.RegisterProvider(providerName)
	}

	// Setup graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		log.Println("Shutting down gracefully...")
		prodMiddleware.Stop()
		os.Exit(0)
	}()

	mux := http.NewServeMux()
	transport.WireHTTP(mux, reg, prodMiddleware) // /v1/chat, /healthz, /v1/status etc.

	addr := getEnv("ADDR", ":8080")
	log.Println("🚀 analyzer-gw listening on", addr, "with ENTERPRISE features!")
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

func cmdAdvise(cfg providers.Config, args []string) {
	fs := flag.NewFlagSet("advise", flag.ExitOnError)
	var mode, provider, model, scorecardPath, hotspotsPath, byok, sys string
	var temp float64
	fs.StringVar(&mode, "mode", "exec", "exec|code|ops|community")
	fs.StringVar(&provider, "provider", "oai", "oai|gemini|claude|groq")
	fs.StringVar(&model, "model", "", "model name")
	fs.StringVar(&scorecardPath, "f", "", "scorecard.json path (required)")
	fs.StringVar(&hotspotsPath, "hotspots", "", "hotspots.json path (optional)")
	fs.StringVar(&byok, "byok", "", "BYOK")
	fs.Float64Var(&temp, "temp", 0.1, "temperature")
	fs.StringVar(&sys, "sys", "", "override system (optional)")
	_ = fs.Parse(args)
	if scorecardPath == "" || model == "" {
		fmt.Println("uso: gemx advise --mode exec --provider oai --model gpt-4o-mini -f scorecard.json [--hotspots hotspots.json] [--byok KEY]")
		return
	}
	var scorecard map[string]any
	if err := readJSON(scorecardPath, &scorecard); err != nil {
		fmt.Println("erro:", err)
		return
	}
	var hotspots []string
	if hotspotsPath != "" {
		_ = readJSON(hotspotsPath, &hotspots)
	}
	body := map[string]any{
		"provider": provider, "model": model,
		"scorecard": scorecard, "hotspots": hotspots,
		"temperature": temp,
	}
	b, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", strings.TrimRight(cfg.Server.Addr, "/")+"/v1/advise?mode="+mode, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	if k := firstNonEmpty(byok, cfg.Defaults.Byok); k != "" {
		req.Header.Set("x-external-api-key", k)
	}
	if cfg.Defaults.TenantID != "" {
		req.Header.Set("X-Tenant-Id", cfg.Defaults.TenantID)
	}
	if cfg.Defaults.UserID != "" {
		req.Header.Set("X-User-Id", cfg.Defaults.UserID)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("erro:", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		io.Copy(io.Discard, resp.Body)
		fmt.Println("HTTP", resp.StatusCode)
		return
	}

	dec := newSSEDecoder(resp.Body)
	var out bytes.Buffer
	for dec.Next() {
		var obj map[string]any
		if json.Unmarshal(dec.Data(), &obj) == nil {
			if s, ok := obj["content"].(string); ok {
				out.WriteString(s)
			}
		}
	}
	// tenta pretty-print JSON
	var pretty bytes.Buffer
	if json.Indent(&pretty, out.Bytes(), "", "  ") == nil {
		fmt.Println(pretty.String())
	} else {
		fmt.Println(out.String())
	}

}

func readJSON(path string, v any) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, v)
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if v != "" {
			return v
		}
	}
	return ""
}

type sseDecoder struct {
	r   io.Reader
	buf []byte
	err error
}

func newSSEDecoder(r io.Reader) *sseDecoder {
	return &sseDecoder{r: r, buf: make([]byte, 0, 4096)}
}

func (d *sseDecoder) Next() bool {
	if d.err != nil {
		return false
	}
	// Read from the underlying io.Reader until we find a complete SSE event
	for {
		n, err := d.r.Read(d.buf[len(d.buf):cap(d.buf)])
		d.buf = d.buf[:len(d.buf)+n]
		if err != nil {
			d.err = err
			return false
		}
		// Check for the end of the event
		if bytes.HasSuffix(d.buf, []byte("\n\n")) {
			return true
		}
	}
}

func (d *sseDecoder) Data() []byte {
	// Extract the data field from the SSE event
	lines := bytes.Split(d.buf, []byte("\n"))
	for _, line := range lines {
		if bytes.HasPrefix(line, []byte("data: ")) {
			return bytes.TrimPrefix(line, []byte("data: "))
		}
	}
	return nil
}

func (d *sseDecoder) Err() error {
	return d.err
}
