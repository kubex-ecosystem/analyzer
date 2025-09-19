# Release/Build

## Binary

```bash
make build-dev linux amd64
ls dist/analyzer_linux_amd64
# opcional: upx --lzma --best dist/analyzer_linux_amd64 || true
```

## Docker (scratch)

```dockerfile
FROM golang:1.22 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w -buildid=" -o /out/analyzer ./cmd/main.go

FROM scratch
COPY --from=builder /out/analyzer /analyzer
EXPOSE 8080
ENTRYPOINT ["/analyzer", "gateway", "serve"]
```

## Artefatos

- CLI: `dist/analyzer_<os>_<arch>`
- Imagem: ENTRYPOINT roda `analyzer gateway serve`
