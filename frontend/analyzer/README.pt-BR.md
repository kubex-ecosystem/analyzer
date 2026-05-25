# ![GemX Analyzer](/docs/assets/top_banner_md_a.png)

**Plataforma de melhoria contínua para código e produto — com ciclo fechado.**
Do .lkt.txt à aplicação de diffs e PRs **sem as mãos**: grompt ↔ lookatni ↔ analyzer ↔ GoBE/gdbase/logz.

> _“Seu SRE de qualidade que abre PRs seguros, mensura impacto (DORA/CHI/HIR) e se auto-ajusta por políticas — sem lock-in de vendor.”_

## ✨ Por que existe

Ferramentas de IA ajudam no editor, mas param antes do PR com governance. O **GemX Analyzer** fecha o loop:

1) **Grompt** gera o `.lkt.txt` (spec de melhorias)
2) **Analyzer** planeja (EXEC/CHI/DORA/Community)
3) **Lookatni** valida/aplica com **diff determinístico**
4) **GoBE** agenda/coordena a operação
5) **gdbase/logz** versionam e auditam
6) Feedback volta ao **grompt** ⇒ nova iteração

## 🧩 Módulos (visão rápida)

- **analyzer** (este repo): reasoning avançado, políticas, cadência, orquestração do ciclo
- **grompt**: hub/entrypoint de IA (chat simples + boot do .lkt.txt)
- **lookatni**: parser/aplicador determinístico (CLI + lib Go/TS + ext VSCode)
- **GoBE**: jobs/schedulers/locks (infra)
- **gdbase**: storage de artefatos/diffs
- **logz**: telemetria + auditoria
- **kortex**: trilho de eventos (pub/sub) _(opcional nesta v0)_

## 🛠️ Features (v0.1.0)

- BYOK multi-provider: **OpenAI · Gemini · Anthropic · Groq**
- SSE robusto (reconexão/backoff)
- Policies: **gates** (score mínimo, limite de issues), **cadência** (cooldown), **canário**
- Diff preview + **PR automático** (ou `.patch` pra aplicar manualmente)
- **/metrics** Prometheus + `/healthz`
- Config **dev/prod**: CORS, TLS, rate-limit, circuit-breaker, retry/backoff

## ⚡ Quickstart (90s)

```bash
# 1) Clone
git clone https://github.com/kubex-ecosystem/kubex-gemx-analyzer.git
cd kubex-gemx-analyzer

# 2) Copie configs de exemplo
cp config/examples/meta.dev.yml config/meta.yml
cp config/examples/providers.example.yml config/providers.yml
cp .env.example .env

# 3) Exporte suas keys (ou edite .env)
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...
export ANTHROPIC_API_KEY=...
export GROQ_API_KEY=...

# 4) Build & run
go build -o dist/gw ./cmd/gw
GEMX_ENV=development GEMX_META_CFG=config/meta.yml PROVIDERS_CFG=config/providers.yml ./dist/gw

# 5) Smoke test
curl -I http://localhost:8080/healthz
curl -s http://localhost:8080/v1/providers | jq
curl -s http://localhost:8080/metrics | head
