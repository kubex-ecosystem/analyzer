# Data & Persistence

Planejado: sincronização de estado via LWW + ETag.

- Export: `POST /v1/state/export` com `If-Match`/`etag`
- Import: `GET /v1/state/import` retorna `version` + `etag` + `payload`

Status atual: endpoints de state ainda não foram implementados nesta base.
