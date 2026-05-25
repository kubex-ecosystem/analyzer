
# Analytics & Advice (P1–P4 + HIR/AAC/TPH)

* **P1 — Executive North & South** → `mode: "exec"` (foco, quick wins, riscos)
* **P2 — Code Health (CHI-first)** → `mode: "code"` (drivers + plano incremental)
* **P3 — DORA & Ops** → `mode: "ops"` (fluxo/fiabilidade + playbook)
* **P4 — Comunidade & Bus Factor** → `mode: "community"` (onboarding/visibilidade)
* **AI metrics (HIR/AAC/TPH)** → endpoint em breve (`/v1/metrics/ai`) com `ai_metrics.v1.json` (ver doc).&#x20;

## Request (HTTP)

`POST /v1/advise?mode=exec|code|ops|community`

```json
{
  "provider": "oai|gemini|claude|groq",
  "model": "gpt-4o-mini",
  "scorecard": { /* scorecard.json (v1) */ },
  "hotspots": ["path/a.go","pkg/x/y/*"],  // opcional
  "temperature": 0.1
}
```

**Resposta:** stream SSE com `{"content":"..."} ... {"done":true}` contendo **JSON** conforme o modo (o LLM deve emitir JSON válido).

> Os esquemas/saídas seguem o spec original (sumário/chi/kpis no P1; drivers/refactors no P2; DORA & playbooks no P3; bus factor + onboarding no P4).&#x20;

---
