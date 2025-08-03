#!/bin/bash

# Deployment script for Timeweb
set -e

echo "🚀 Starting deployment to Timeweb..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set environment variables (you can override these)
export POSTGRES_USER=${POSTGRES_USER:-postgres}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-7632}
export POSTGRES_DB=${POSTGRES_DB:-map1}
export POSTGRES_HOST=${POSTGRES_HOST:-db}
export POSTGRES_PORT=${POSTGRES_PORT:-5432}

echo "📋 Environment variables:"
echo "  POSTGRES_USER: $POSTGRES_USER"
echo "  POSTGRES_DB: $POSTGRES_DB"
echo "  POSTGRES_HOST: $POSTGRES_HOST"
echo "  POSTGRES_PORT: $POSTGRES_PORT"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yaml down

# Remove old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yaml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yaml ps

# Health check
echo "🏥 Performing health checks..."
if curl -f http://localhost/health; then
    echo "✅ Client health check passed"
else
    echo "❌ Client health check failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📱 Your application is now running at: http://localhost"
echo "🔧 To view logs: docker-compose -f docker-compose.prod.yaml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yaml down" 