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
	@echo "Available commands:"
	@echo "  build-gw     - Build the gateway binary"
	@echo "  run-gw       - Run the gateway server"
	@echo "  test-gw      - Test the gateway"
	@echo "  clean        - Clean build artifacts"
	@echo "  build-frontend - Build the frontend"

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

# Docker build (future)
.PHONY: docker-build
docker-build:
	@$(call log,"Building Docker image...")
	@docker build -t analyzer-gw .
	@$(call log_success,"Docker image built")

.DEFAULT_GOAL := help
