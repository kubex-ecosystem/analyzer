# Architecture Overview

O GemX Analyzer é um gateway + orquestrador com adapters por provider e transporte SSE sólido.

```mermaid
  %%{init: {'securityLevel': 'loose'}}%%
  flowchart LR
    U[User] --> UI[CLI / SDK / UI]
    UI -- HTTP/SSE --> A

    subgraph A["Analyzer"]
      T[Transport]
      R[Registry]
      P[Providers]
      S[State Sync]
      T --> R --> P
      P --> S
    end

    subgraph CP["cloud_providers"]
      OAI[openai]
      AZO[azure_openai]
      ANT[anthropic]
      GGP[google_palm]
      BED[aws_bedrock]
    end

    P --> OAI
    P --> AZO
    P --> ANT
    P --> GGP
    P --> BED

    click OAI "https://openai.com/api/" "OpenAI adapter docs" _self
    click ANT "https://www.anthropic.com/index/overview" "Anthropic adapter docs" _self
    click GGP "https://cloud.google.com/vertex-ai/docs/generative-ai/gemini" "Gemini adapter docs" _self
    click AZO "https://learn.microsoft.com/en-us/azure/cognitive-services/openai/overview" "Azure OpenAI (via OpenAI compat)" _self
    click BED "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is.html" "Groq/compat notes" _self
```

## Pastas

- `internal/providers/*` — adapters finos por vendor
- `internal/registry` — carrega `config.example.yml`, resolve provider
- `internal/transport` — HTTP/SSE, state sync, auth passthrough
- `cmd/main.go` — CLI (subcomando `gateway`)

## Fluxo SSE

```puml
POST /v1/chat ──► Provider.Chat(ctx, req) ──► stream
                                  ▲
                            BYOK só aqui
```

## State Sync (LWW + ETag)

- `PUT/POST /v1/state/export` com `If-Match`/`etag`
- `GET /v1/state/import` retorna versão + payload

Simples, testável, portável — ideal para multi-tenant com BYOK e quotas.
