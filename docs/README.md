# GemX Analyzer – Gateway & SDK

**BYOK-first, Gateway opcional, SSE, Tools, Structured Output, Métrica/Usage — e front leve.**

* **Para devs**: plug & play, adapters `openai|gemini|anthropic|groq` (e +).
* **Para super usuários**: CLI amigável, modo direto (BYOK) ou via gateway (auditoria/quotas).
* **Para enterprise**: multi-tenant, headers auditáveis, rate-limit (simples de ligar).

## TL;DR (3 comandos)

```bash
# 1) Configure providers (local)
export OPENAI_API_KEY=sk-... GEMINI_API_KEY=... ANTHROPIC_API_KEY=...

# 2) Suba o gateway
make run

# 3) Teste streaming (OpenAI via gateway com BYOK)
curl -N -X POST http://localhost:8080/v1/chat \
 -H 'Content-Type: application/json' -H "x-external-api-key: $OPENAI_API_KEY" \
 -d '{"provider":"oai","model":"gpt-4o-mini","messages":[{"role":"user","content":"diz oi"}],"stream":true}'
```

## Features

* Chat **streaming** (SSE) para **OpenAI**, **Gemini**, **Anthropic**, **Groq**
* **Function calling** / Tools
* **Structured output** (JSON Schema)
* **Usage** em tempo real (OpenAI `stream_options.include_usage`)
* **State sync** (LWW+ETag) para perfis portáteis
* **CLI** `gemx` p/ providers, sessão, chat, state

> Quer ir a fundo? Veja **docs/QUICKSTART.md** e **docs/CLI.md**.

---

## Arquitetura (visão rápida)

```plaintext
 Front (BYOK direto)  ──► Provider (SDK leve)
         │
         └──► Gateway (SSE, tools, usage, quotas) ──► Providers
                 │
                 └──► GoBE (auth, persistência, estado) [passthrough]
```

## Endpoints principais

* `POST /v1/chat` (SSE)
* `GET  /v1/providers`
* `POST /v1/state/export` / `GET /v1/state/import`
* `POST /v1/auth/login` (passthrough)

---

## Integração rápida no Front

* **Direct (Gemini)**: teu TS atual (leve)
* **Gateway**: `createGatewayChatSession({ provider:'oai|gemini|claude', model:'...' })`
* Ambos expõem `sendMessageStream({ message })` — UI não muda.

---

## Próximos passos sugeridos

* Adicionar **rate-limit** por `tenant:user` no `/v1/chat`
* Badge de **latência/usage** na UI
* `goreleaser` + `Dockerfile.scratch` (ver **docs/RELEASE.md**)

—
Bora pra frente 🚀
