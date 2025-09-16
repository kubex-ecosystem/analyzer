
# Release

## Binary

```bash
make build
make build-cli
upx --lzma --best dist/analyzer-gw dist/gemx || true
```

## Docker (scratch)

```dockerfile
FROM golang:1.22 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w -buildid=" -o /out/analyzer-gw ./cmd/gw

FROM scratch
COPY --from=builder /out/analyzer-gw /analyzer-gw
EXPOSE 8080
ENTRYPOINT ["/analyzer-gw"]
```

## Goreleaser

* artefatos: `dist/analyzer-gw`, `dist/gemx`
* checksums + release notes (CHANGELOG)
