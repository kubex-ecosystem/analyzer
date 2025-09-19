# GemX Analyzer

Feche o loop de melhoria contínua — do `.lkt.txt` ao PR
Grompt (ideação) → Analyzer (planos EXEC/CHI/DORA) → LookAtni (diff determinístico) → GoBE (orquestra) → Feedback.

<div class="grid cards" markdown>
- :rocket: **Quickstart (90s)**
  Suba o gateway, teste SSE e gere seu primeiro ciclo.
  [:material-flash: Começar](getting-started/quick-start.md)

- :gear: **Config & Providers**
  BYOK multi-provider (OpenAI, Gemini, Anthropic, Groq) com políticas e auditoria.
  [:material-cog: Providers](providers/byok.md)

- :git: **Do plano ao PR**
  LookAtni valida e aplica diffs de forma determinística; PR automático ou `.patch`.
  [:material-source-pull: Fluxos](architecture/flows.md)
</div>

## Por que
Ferramentas de IA ajudam no editor, mas param antes do PR com governança.
O GemX Analyzer fecha o ciclo com políticas, resiliência, auditoria e observabilidade.

## O que você ganha
- PRs seguros com gates/cadência/canário
- Métricas (DORA/CHI/HIR) e SSE confiável
- Sem lock-in: BYOK + adapters por vendor
- Prod-ready: CORS/TLS/Rate/Circuit/Retry + `/metrics` e `/healthz`

MIT • Kubex Ecosystem • Feito em Go + React + TypeScript • https://github.com/kubex-ecosystem/analyzer
