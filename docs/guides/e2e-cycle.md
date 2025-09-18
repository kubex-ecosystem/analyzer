# First Analyzer Cycle (end-to-end)

1) Configure BYOK e providers no `config.example.yml`.
2) Suba o gateway com `make run` e valide `/healthz`.
3) Liste providers: `curl :8080/v1/providers`.
4) Faça chat SSE com `POST /v1/chat` usando `x-external-api-key`.
5) Gere plano com `/v1/advise?mode=exec|code|ops|community`.
6) Aplique diffs com LookAtni e abra PR.

