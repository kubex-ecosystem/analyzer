
# Arquitetura

* `internal/providers/*` — adapters finos por vendor
* `internal/registry` — carrega `config.example.yml`, resolve provider
* `internal/transport` — HTTP/SSE, state sync, auth passthrough
* `cmd/gw` — main do gateway
* `cmd/gemx` — CLI

***Fluxo SSE***

```plaintext
POST /v1/chat ──► Provider.Chat(ctx, req) ──► stream
                                  ▲
                            BYOK só aqui
```

***State Sync (LWW+ETag)***

* `PUT/POST /v1/state/export` com `If-Match`/`etag`
* `GET /v1/state/import` traz versão + payload

— simples, testável, portável.
