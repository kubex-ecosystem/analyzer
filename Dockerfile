# Multi-stage Dockerfile for Analyzer Gateway
# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production --no-fund --no-audit

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build:static

# Stage 2: Build Go backend
FROM golang:1.25-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the gateway binary
RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w -X main.version=$(git describe --tags --always --dirty)" \
    -o analyzer-gw \
    ./cmd/gw

# Stage 3: Final runtime image
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 analyzer && \
    adduser -D -u 1001 -G analyzer analyzer

# Create app directory
WORKDIR /app

# Copy binary from builder
COPY --from=backend-builder /app/analyzer-gw .

# Copy frontend assets from builder
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy configuration files
COPY config/ ./config/

# Set ownership
RUN chown -R analyzer:analyzer /app

# Switch to non-root user
USER analyzer

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/v1/status || exit 1

# Set entrypoint
ENTRYPOINT ["./analyzer-gw"]
