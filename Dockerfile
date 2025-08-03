# Multi-stage build for Timeweb Apps
FROM node:18-alpine AS base

# Install dependencies for node-gyp
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --prefix ./client && \
    npm ci --prefix ./server

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build frontend
RUN npm run build --prefix ./client

# Production stage
FROM node:18-alpine

# Install nginx and curl for health checks
RUN apk add --no-cache nginx curl

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appuser -g appuser appuser

# Set working directory
WORKDIR /app

# Copy built frontend from build stage
COPY --from=base /app/client/dist /usr/share/nginx/html

# Copy backend files
COPY --from=base /app/server /app/server
COPY --from=base /app/server/node_modules /app/server/node_modules

# Clean up dev dependencies in production
RUN cd /app/server && npm prune --production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create necessary directories and set permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx /var/cache/nginx /etc/nginx/conf.d && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (Timeweb Apps requirement)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start both nginx and node server
CMD ["sh", "-c", "nginx && cd /app/server && node app.js"] 