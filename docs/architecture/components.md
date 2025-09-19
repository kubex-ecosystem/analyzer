# Components

- Transport: HTTP/SSE, state sync (LWW + ETag)
- Registry: carrega config e resolve provider
- Providers: adapters finos por vendor
- CLI: `cmd/main.go` (binário `analyzer`)
- Gateway: subcomando `analyzer gateway serve`
