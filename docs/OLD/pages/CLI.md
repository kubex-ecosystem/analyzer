
# CLI – `gemx`

## Instalação

```bash
make build-cli
./dist/gemx --server http://localhost:8080 providers
```

## Comandos

* `providers` – lista providers
* `session set --tenant T --user U` – define sessão (headers padrão)
* `chat --provider oai --model gpt-4o-mini -m "..." [--sys "..."] [--byok KEY] [--schema schema.json]`
* `state export <file.json>` / `state import`

## Exemplos

```bash
gemx session set --tenant org-42 --user rafa
gemx chat --provider oai --model gpt-4o-mini -m "resuma em 1 frase" --byok $OPENAI_API_KEY
gemx chat --provider gemini --model gemini-2.5-flash -m "hello" --byok $GEMINI_API_KEY
```

Troubles? veja **docs/TROUBLESHOOTING.md**.
