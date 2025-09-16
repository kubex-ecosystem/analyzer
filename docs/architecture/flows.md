# Flows (Analyzer ⇄ Grompt ⇄ LookAtni ⇄ GoBE)

1. Ideação no Grompt → `.lkt.txt`
2. Analyzer processa e emite planos (EXEC/CHI/DORA)
3. LookAtni aplica diffs determinísticos → patch/PR
4. GoBE orquestra autenticação/tenancy e integra com o backend

Endpoints principais: `/v1/chat`, `/v1/advise`, `/v1/providers`, `/v1/state/*`.

