#!/bin/bash

# Enterprise Deployment Script for Analyzer Gateway
# Usage: ./deploy.sh [production|staging]

set -euo pipefail

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
ENVIRONMENT="${1:-production}"
PROJECT_NAME="analyzer-gw"
REGISTRY="ghcr.io/faelmori"  # Change to your registry
IMAGE_TAG="${REGISTRY}/${PROJECT_NAME}:${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
LATEST_TAG="${REGISTRY}/${PROJECT_NAME}:${ENVIRONMENT}-latest"

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        production|staging)
            log_info "Deploying to ${ENVIRONMENT} environment"
            ;;
        *)
            log_error "Invalid environment: ${ENVIRONMENT}. Use 'production' or 'staging'"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi

    # Check if required environment variables are set
    if [[ $ENVIRONMENT == "production" ]]; then
        required_vars=("GEMINI_API_KEY" "OPENAI_API_KEY" "ANTHROPIC_API_KEY" "GROQ_API_KEY")
        for var in "${required_vars[@]}"; do
            if [[ -z "${!var:-}" ]]; then
                log_warning "Environment variable $var is not set"
            fi
        done
    fi

    log_success "Prerequisites check completed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."

    # Build with version tag
    docker build \
        --tag "$IMAGE_TAG" \
        --tag "$LATEST_TAG" \
        --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --build-arg VERSION="$(git describe --tags --always --dirty)" \
        --build-arg COMMIT_SHA="$(git rev-parse HEAD)" \
        .

    log_success "Docker image built: $IMAGE_TAG"
}

# Push to registry (if configured)
push_image() {
    if command -v docker > /dev/null && [[ -n "${DOCKER_REGISTRY_TOKEN:-}" ]]; then
        log_info "Pushing image to registry..."

        echo "$DOCKER_REGISTRY_TOKEN" | docker login "$REGISTRY" --username "$DOCKER_REGISTRY_USER" --password-stdin

        docker push "$IMAGE_TAG"
        docker push "$LATEST_TAG"

        log_success "Image pushed to registry"
    else
        log_warning "Registry push skipped (no credentials configured)"
    fi
}

# Run health checks
health_check() {
    log_info "Running health checks..."

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost:8080/v1/status > /dev/null; then
            log_success "Health check passed"
            return 0
        fi

        log_info "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 2
        ((attempt++))
    done

    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Deploy using Docker Compose
deploy_compose() {
    log_info "Deploying using Docker Compose..."

    # Set environment-specific configurations
    export COMPOSE_PROJECT_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
    export IMAGE_TAG="$LATEST_TAG"

    # Use environment-specific compose file if it exists
    local compose_file="docker-compose.yml"
    if [[ -f "docker-compose.${ENVIRONMENT}.yml" ]]; then
        compose_file="docker-compose.${ENVIRONMENT}.yml"
    fi

    # Deploy
    docker-compose -f "$compose_file" up -d --remove-orphans

    log_success "Deployment completed"
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old images..."

    # Remove old images (keep last 3)
    docker images "${REGISTRY}/${PROJECT_NAME}" --format "table {{.Tag}}\t{{.ID}}" | \
        grep "${ENVIRONMENT}" | \
        tail -n +4 | \
        awk '{print $2}' | \
        xargs -r docker rmi

    log_success "Cleanup completed"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."

    # Get previous image
    local previous_image
    previous_image=$(docker images "${REGISTRY}/${PROJECT_NAME}" --format "table {{.Tag}}" | \
        grep "${ENVIRONMENT}" | \
        grep -v latest | \
        head -n 2 | \
        tail -n 1)

    if [[ -n "$previous_image" ]]; then
        export IMAGE_TAG="${REGISTRY}/${PROJECT_NAME}:${previous_image}"
        deploy_compose
        log_success "Rollback completed to $previous_image"
    else
        log_error "No previous version found for rollback"
        exit 1
    fi
}

# Trap function for cleanup on failure
trap_exit() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Deployment failed with exit code $exit_code"

        # Ask for rollback in interactive mode
        if [[ -t 0 ]]; then
            read -p "Do you want to rollback? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rollback
            fi
        fi
    fi
}

trap trap_exit EXIT

# Main deployment function
main() {
    log_info "Starting deployment of Analyzer Gateway"
    log_info "Environment: $ENVIRONMENT"
    log_info "Timestamp: $(date)"

    validate_environment
    check_prerequisites
    build_image
    push_image
    deploy_compose

    # Wait a bit for containers to start
    sleep 5

    health_check
    cleanup

    log_success "🚀 Deployment completed successfully!"
    log_info "Access the application at: http://localhost:8080"
    log_info "Health endpoint: http://localhost:8080/v1/status"
}

# Handle script arguments
case "${1:-}" in
    rollback)
        rollback
        ;;
    cleanup)
        cleanup
        ;;
    health)
        health_check
        ;;
    *)
        main
        ;;
esac
