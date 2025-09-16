# CLI – analyzer

A CLI expõe subcomandos para operar o gateway e o daemon.

## Instalação/Build

```bash
make build-dev linux amd64
./dist/analyzer_linux_amd64 version
```

## Comandos

- `analyzer gateway serve [--binding 0.0.0.0 --port 8080 --config config/config.example.yml --cors --debug]`
- `analyzer gateway status`
- `analyzer gateway advise` (prévia; mensagem informativa)
- `analyzer daemon [--gobe-url --gobe-api-key --auto-schedule --schedule-cron --notify-channels --health-interval]`
- `analyzer version`

## Exemplos

```bash
# Subir o gateway
analyzer gateway serve --config ./config/config.example.yml

# Verificar status
analyzer gateway status

# Daemon com GoBE
analyzer daemon --gobe-url=http://localhost:3000 --gobe-api-key=$GOBE_API_KEY
```

Para chat e providers, use os endpoints HTTP em reference/http.md.
