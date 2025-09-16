# ![GemX Analyzer](/docs/assets/top_banner_md_a.png)

[![Version](https://img.shields.io/badge/Version-1.0.7-purple.svg)](https://github.com/kubex-ecosystem/analyzer/releases/latest)
[![Kubex Go Dist CI](https://github.com/kubex-ecosystem/analyzer/actions/workflows/kubex_go_release.yml/badge.svg)](https://github.com/kubex-ecosystem/analyzer/actions/workflows/kubex_go_release.yml)
[![Go Version](https://img.shields.io/badge/Go-1.25+-blue.svg)](https://golang.org)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org)
[![NextJS](https://img.shields.io/badge/NextJS-15+-blue.svg)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-34d058.svg)](docs/CONTRIBUTING.md)
[![License](https://img.shields.io/badge/License-MIT-34d058.svg)](LICENSE)

---

[🇧🇷 Read in Portuguese](./README.pt-BR.md)

**A continuous improvement platform for code and product — with a closed loop.**
From `.lkt.txt` to applying diffs and PRs **hands-free**: grompt ↔ lookatni ↔ analyzer ↔ GoBE/gdbase/logz.

> _“Your quality SRE that opens safe PRs, measures impact (DORA/CHI/HIR), and self-adjusts based on policies — with no vendor lock-in.”_

## ✨ Why it exists

AI tools help in the editor, but they stop before the PR, lacking governance. **GemX Analyzer** closes the loop:

1) **Grompt** generates the `.lkt.txt` (improvement spec)
2) **Analyzer** plans (EXEC/CHI/DORA/Community)
3) **Lookatni** validates/applies with a **deterministic diff**
4) **GoBE** schedules/coordinates the operation
5) **gdbase/logz** handle versioning and auditing
6) Feedback returns to **grompt** ⇒ new iteration

## 🧩 Modules (quick overview)

- **analyzer** (this repo): advanced reasoning, policies, cadence, cycle orchestration
- **grompt**: AI hub/entrypoint (simple chat + `.lkt.txt` boot)
- **lookatni**: deterministic parser/applier (CLI + Go/TS lib + VSCode ext)
- **GoBE**: jobs/schedulers/locks (infra)
- **gdbase**: artifact/diff storage
- **logz**: telemetry + auditing
- **kortex**: event trail (pub/sub) _(optional in v0)_

## 🛠️ Features (v0.1.0)

- BYOK multi-provider: **OpenAI · Gemini · Anthropic · Groq**
- Robust SSE (reconnection/backoff)
- Policies: **gates** (minimum score, issue limit), **cadence** (cooldown), **canary**
- Diff preview + **automatic PR** (or `.patch` to apply manually)
- **/metrics** Prometheus + `/healthz`
- **dev/prod** config: CORS, TLS, rate-limit, circuit-breaker, retry/backoff

## ⚡ Quickstart (90s)

```bash
# 1) Clone
git clone https://github.com/kubex-ecosystem/kubex-gemx-analyzer.git
cd kubex-gemx-analyzer

# 2) Copy example configs
cp config/examples/meta.dev.yml config/meta.yml
cp config/examples/providers.example.yml config/providers.yml
cp .env.example .env

# 3) Export your keys (or edit .env)
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

```
