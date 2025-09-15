# Description: Makefile for Analyzer Gateway
# Author: Rafael Mori
# Copyright (c) 2025 Rafael Mori
# License: MIT License

# Define directories and binary names
ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
GATEWAY_BINARY := $(ROOT_DIR)dist/analyzer-gw
DIST_DIR := $(ROOT_DIR)dist

# Define color codes
COLOR_GREEN := \033[32m
COLOR_YELLOW := \033[33m
COLOR_RED := \033[31m
COLOR_BLUE := \033[34m
COLOR_RESET := \033[0m

# Logging Functions
log = @printf "%b%s%b %s\n" "$(COLOR_BLUE)" "[LOG]" "$(COLOR_RESET)" "$(1)"
log_success = @printf "%b%s%b %s\n" "$(COLOR_GREEN)" "[SUCCESS]" "$(COLOR_RESET)" "$(1)"
log_warning = @printf "%b%s%b %s\n" "$(COLOR_YELLOW)" "[WARNING]" "$(COLOR_RESET)" "$(1)"

# Default target
.PHONY: help
help:
	@echo "=== Analyzer Gateway Makefile ==="
	@echo ""
	@echo "Build Commands:"
	@echo "  build-gw       - Build the gateway binary"
	@echo "  build-frontend - Build the frontend"
	@echo "  build-all      - Build all components"
	@echo ""
	@echo "Development Commands:"
	@echo "  run-gw         - Run the gateway server"
	@echo "  dev            - Run development environment"
	@echo "  dev-frontend   - Run frontend in development mode"
	@echo "  test-gw        - Test the gateway"
	@echo "  test           - Run Go tests"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-build     - Build production Docker image"
	@echo "  docker-build-dev - Build development Docker image"
	@echo "  docker-run       - Run Docker container"
	@echo "  docker-stop      - Stop Docker container"
	@echo "  docker-logs      - View Docker container logs"
	@echo "  docker-shell     - Access Docker container shell"
	@echo ""
	@echo "Docker Compose Commands:"
	@echo "  compose-up          - Start services"
	@echo "  compose-up-dev      - Start development environment"
	@echo "  compose-up-monitoring - Start with monitoring stack"
	@echo "  compose-up-cache    - Start with Redis cache"
	@echo "  compose-up-full     - Start full stack"
	@echo "  compose-down        - Stop all services"
	@echo "  compose-logs        - View service logs"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  deploy-prod    - Deploy to production"
	@echo "  deploy-staging - Deploy to staging"
	@echo "  health-check   - Check application health"
	@echo ""
	@echo "Utility Commands:"
	@echo "  clean          - Clean build artifacts"
	@echo "  tidy           - Tidy Go modules"
	@echo "  install-frontend - Install frontend dependencies"

# Create dist directory if it doesn't exist
$(DIST_DIR):
	@mkdir -p $(DIST_DIR)

# Build the gateway binary
.PHONY: build-gw
build-gw: $(DIST_DIR)
	@$(call log,"Building gateway binary...")
	@CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o $(GATEWAY_BINARY) ./cmd/gw
	@$(call log_success,"Gateway binary built: $(GATEWAY_BINARY)")

# Run the gateway server
.PHONY: run-gw
run-gw:
	@$(call log,"Starting gateway server...")
	@go run ./cmd/gw

# Test the gateway
.PHONY: test-gw
test-gw:
	@$(call log,"Testing gateway...")
	@chmod +x ./test_gateway.sh
	@./test_gateway.sh

# Clean build artifacts
.PHONY: clean
clean:
	@$(call log,"Cleaning build artifacts...")
	@rm -rf $(ROOT_DIR)frontend/dist
	@rm -rf $(ROOT_DIR)frontend/node_modules
	@rm -rf $(DIST_DIR)
	@$(call log_success,"Clean completed")

# Build frontend
.PHONY: build-frontend
build-frontend:
	@$(call log,"Building frontend...")
	@cd frontend && npm run build:static
	@$(call log_success,"Frontend built")

# Install frontend dependencies
.PHONY: install-frontend
install-frontend:
	@$(call log,"Installing frontend dependencies...")
	@cd frontend && npm i --no-fund --no-audit --loglevel=error
	@$(call log_success,"Frontend dependencies installed")

# Run frontend in development mode
.PHONY: dev-frontend
dev-frontend:
	@$(call log,"Starting frontend in development mode...")
	@cd frontend && npm run dev

# Run both gateway and frontend in development
.PHONY: dev
dev:
	@$(call log,"Starting development environment...")
	@echo "Starting gateway in background..."
	@go run ./cmd/gw &
	@sleep 2
	@echo "Starting frontend..."
	@cd frontend || exit 1
	@npm run dev &
	@echo "Development environment running. Press Ctrl+C to stop."
	@wait || exit 1

# Go module management
.PHONY: tidy
tidy:
	@$(call log,"Tidying Go modules...")
	@go mod tidy
	@$(call log_success,"Go modules tidied")

# Run Go tests
.PHONY: test
test:
	@$(call log,"Running Go tests...")
	@go test --bench -v ./...
	@$(call log_success,"Tests completed")

# All-in-one build
.PHONY: build-all
build-all: build-gw build-frontend
	@$(call log_success,"All components built")

# Docker Commands
.PHONY: docker-build
docker-build:
	@$(call log,"Building Docker image...")
	@docker build -t analyzer-gw:latest .
	@$(call log_success,"Docker image built: analyzer-gw:latest")

.PHONY: docker-build-dev
docker-build-dev:
	@$(call log,"Building development Docker image...")
	@docker build -f Dockerfile.dev -t analyzer-gw:dev .
	@$(call log_success,"Development Docker image built: analyzer-gw:dev")

.PHONY: docker-run
docker-run:
	@$(call log,"Running Docker container...")
	@docker run -d --name analyzer-gw -p 8080:8080 \
		-e GEMINI_API_KEY="${GEMINI_API_KEY}" \
		-e OPENAI_API_KEY="${OPENAI_API_KEY}" \
		-e ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}" \
		-e GROQ_API_KEY="${GROQ_API_KEY}" \
		analyzer-gw:latest
	@$(call log_success,"Docker container started")

.PHONY: docker-stop
docker-stop:
	@$(call log,"Stopping Docker container...")
	@docker stop analyzer-gw 2>/dev/null || true
	@docker rm analyzer-gw 2>/dev/null || true
	@$(call log_success,"Docker container stopped")

.PHONY: docker-logs
docker-logs:
	@docker logs -f analyzer-gw

.PHONY: docker-shell
docker-shell:
	@docker exec -it analyzer-gw /bin/sh

# Docker Compose Commands
.PHONY: compose-up
compose-up:
	@$(call log,"Starting services with Docker Compose...")
	@docker compose up -d
	@$(call log_success,"Services started")

.PHONY: compose-up-dev
compose-up-dev:
	@$(call log,"Starting development environment with Docker Compose...")
	@docker compose -f docker-compose.dev.yml up -d
	@$(call log_success,"Development environment started")

.PHONY: compose-down
compose-down:
	@$(call log,"Stopping Docker Compose services...")
	@docker compose down
	@$(call log_success,"Services stopped")

.PHONY: compose-logs
compose-logs:
	@docker compose logs -f

# Monitoring stack (optional profiles)
.PHONY: compose-up-monitoring
compose-up-monitoring:
	@$(call log,"Starting services with monitoring stack...")
	@docker compose --profile monitoring up -d
	@$(call log_success,"Services with monitoring started")

.PHONY: compose-up-cache
compose-up-cache:
	@$(call log,"Starting services with Redis cache...")
	@docker compose --profile cache up -d
	@$(call log_success,"Services with cache started")

.PHONY: compose-up-full
compose-up-full:
	@$(call log,"Starting full stack (app + monitoring + cache)...")
	@docker compose --profile monitoring --profile cache up -d
	@$(call log_success,"Full stack started")

# Deployment Commands
.PHONY: deploy-prod
deploy-prod: docker-build
	@$(call log,"Deploying to production...")
	@./scripts/deploy.sh production
	@$(call log_success,"Production deployment completed")

.PHONY: deploy-staging
deploy-staging: docker-build
	@$(call log,"Deploying to staging...")
	@./scripts/deploy.sh staging
	@$(call log_success,"Staging deployment completed")

# Health check
.PHONY: health-check
health-check:
	@$(call log,"Checking application health...")
	@curl -f http://localhost:8080/v1/status || ($(call log_warning,"Health check failed") && exit 1)
	@$(call log_success,"Application is healthy")

.DEFAULT_GOAL := help
