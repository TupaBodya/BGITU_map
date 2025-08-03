#!/bin/bash

# Health check script for BGITU Map application
set -e

echo "🏥 Performing health checks..."

# Check if containers are running
echo "📦 Checking container status..."
if docker-compose -f docker-compose.prod.yaml ps | grep -q "Up"; then
    echo "✅ All containers are running"
else
    echo "❌ Some containers are not running"
    docker-compose -f docker-compose.prod.yaml ps
    exit 1
fi

# Check client health
echo "🌐 Checking client health..."
if curl -f -s http://localhost/health > /dev/null; then
    echo "✅ Client is healthy"
else
    echo "❌ Client health check failed"
    exit 1
fi

# Check server health
echo "🔧 Checking server health..."
if curl -f -s http://localhost:3001/health > /dev/null; then
    echo "✅ Server is healthy"
else
    echo "❌ Server health check failed"
    exit 1
fi

# Check database connection
echo "🗄️ Checking database connection..."
if docker-compose -f docker-compose.prod.yaml exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check disk space
echo "💾 Checking disk space..."
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    echo "✅ Disk space is adequate ($DISK_USAGE% used)"
else
    echo "⚠️ Disk space is running low ($DISK_USAGE% used)"
fi

# Check memory usage
echo "🧠 Checking memory usage..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ "$MEMORY_USAGE" -lt 90 ]; then
    echo "✅ Memory usage is normal ($MEMORY_USAGE% used)"
else
    echo "⚠️ Memory usage is high ($MEMORY_USAGE% used)"
fi

echo "🎉 All health checks completed successfully!" 