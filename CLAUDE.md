# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GemX Analyzer is a continuous improvement platform for code and product with a closed loop. It provides AI-powered analysis, policy enforcement, and automated PR generation for software development teams. The project consists of:

- **Backend**: Go-based analyzer service with multi-provider AI support (OpenAI, Gemini, Anthropic, Groq)
- **Frontend**: React/TypeScript web interface with real-time SSE communication
- **CLI**: Command-line interface for local operations and management

## Build & Development Commands

### Primary Commands (use Makefile)

- `make build` - Build production binary with UPX compression
- `make build-dev` - Build development binary without compression
- `make test` - Run Go tests
- `make clean` - Clean build artifacts
- `make install` - Interactive install (download or build locally)
- `make validate` - Run validation checks
- `make help` - Show all available commands

### Frontend Development

- `cd frontend && npm run dev` - Start development server
- `cd frontend && npm run build` - Build production frontend
- `cd frontend && npm i --no-fund --no-audit --loglevel=error --legacy-peer-deps` - Install dependencies

### Documentation

- `make build-docs` - Build documentation using mkdocs
- `make serve-docs` - Serve docs at <http://localhost:8081>
- `make pub-docs` - Publish docs to GitHub Pages (Only with user permission)

### Running the Service

After building, run with environment configs:

```bash
GEMX_ENV=development GEMX_META_CFG=config/meta.yml PROVIDERS_CFG=config/providers.yml ./dist/analyzer
```

## Architecture Overview

### Core Components

- **Gateway** (`internal/gateway/`): HTTP/SSE server with middleware, rate limiting, circuit breakers
- **Providers** (`internal/providers/`): AI provider integrations (OpenAI, Gemini, Anthropic, Groq)
- **Services** (`internal/services/`): Business logic for GitHub integration, scheduling, notifications
- **Metrics** (`internal/metrics/`): DORA, CHI, and AI metrics collection with GraphQL
- **Analyzer** (`internal/analyzer/`): Core analysis engine with embedded web GUI
- **Module** (`internal/module/`): Application lifecycle, logging, version management

### Key Patterns

- **Command Pattern**: CLI commands wrappers in `cmd/cli/` with cobra framework
- **Registry Pattern**: Provider registration and health checking
- **Middleware Chain**: Rate limiting, circuit breakers, health checks
- **SSE Transport**: Real-time communication with coalescing for performance
- **Config-driven**: YAML configuration for providers, metadata, and environments

### Data Flow

1. Requests enter via Gateway HTTP/SSE endpoints
2. Middleware applies rate limiting, circuit breaking, auth
3. Providers execute AI operations with health monitoring
4. Results flow through SSE coalescer for real-time updates
5. GitHub service handles webhook processing and PR operations
6. Metrics collection tracks DORA, CHI, and usage statistics

## Important Conventions

### Go Standards (from .github/copilot-instructions.md)

- Use Go Modules, keep go.mod minimal
- Structure: `cmd/`, `internal/`, `api/`, `support/`, `tests/`
- Main CLI in `cmd/main.go`, library in root
- Package comments: `// Package <name> ...` format
- Table-driven tests with `testing` package
- Tests are in a dedicated `tests/` directory, so internal packages that need access for testing can will be imported with some alias to avoid errors or collisions with the main package or the test package itself.
- Accept interfaces, return concrete structs
- Always use `context.Context` for cancellation/timeouts
- Exported items MUST have godoc comments
- Logging with package `internal/module/logger`, always use the alias `gl` for it. Use the logger with wrapper `gl.Log(logtype string, msg ...string), so objects need to fmt.Sprintf the message before passing it to the logger.
- Error handling with `errors` package, wrap with `%w`

### Frontend Standards

- React functional components with hooks
- TypeScript with strict types
- Tailwind CSS for styling
- Framer Motion for animations
- i18n support with `react-i18next` if needed
- Real-time updates via SSE with coalescing
- Components in `src/components/`, pages in `src/pages/`
- Use `src/services/` for API calls and business logic
- Use `src/hooks/` for custom React hooks
- Use `src/utils/` for utility functions
- Use `src/config/` for configuration constants
- Use `src/styles/` for global styles and Tailwind config
- Use `src/i18n/` for internationalization files when needed.
- Use `src/assets/` for static assets like images, icons, etc.
- Use `src/types/` for TypeScript type definitions.
- Use `src/App.tsx` as the main application entry point.
- Always put `title` attribute in html tags that need it, so screen readers can read it properly and avoid lint warnings/errors.
- Use `eslint` or `prettier` for code formatting
- Use Vite for build tooling
- Always use the last stable versions of dependencies, avoid using alpha/beta versions unless absolutely necessary.
- Use absolute imports from `src/` to avoid relative path hell. Use `@/` as the base path for imports.
- Use `npm` as the package manager, avoid using `yarn` or `pnpm` unless absolutely necessary.
- Avoid using inline styles, prefer Tailwind CSS classes for styling.

### Frontend Patterns

- React functional components with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Real-time updates via SSE
- i18n support (en/pt-BR locales)

### Configuration

- Environment-specific configs in `config/` directory
- Provider configurations in `config/providers.yml`
- Meta configuration in `config/meta.yml`
- Environment variables via `.env` files at project root

## Key Files & Entry Points

- `cmd/main.go` - Main application entry point
- `internal/module/module.go` - Core module registration and CLI setup
- `internal/gateway/server.go` - HTTP server with SSE support
- `internal/analyzer/gui.go` - Embedded web interface
- `internal/services/github/service.go` - GitHub integration
- `Makefile` - Build system with cross-platform support
- `support/main.sh` - Build script with platform detection

## Testing

- Run tests: `make test`
- Tests use standard `testing` package
- Table-driven test patterns preferred
- Mock dependencies via interfaces
- Coverage focus on business logic and error paths

## Docker Support

- `Dockerfile` - Production container
- `Dockerfile.dev` - Development container
- `docker-compose.yml` - Multi-service development
- `docker-compose.ollama.yml` - Ollama integration
