#!/bin/bash

# Скрипт для экспорта базы данных BGITU Map
set -e

echo "🗄️ Экспорт базы данных BGITU Map..."

# Проверяем, запущен ли Docker Compose
if docker-compose -f docker-compose.yaml ps | grep -q "db.*Up"; then
    echo "✅ База данных запущена в Docker"
    
    # Экспортируем базу данных
    echo "📤 Экспортируем базу данных..."
    docker-compose -f docker-compose.yaml exec -T db pg_dump -U postgres map1 > map1_backup.sql
    
    echo "✅ База данных экспортирована в файл map1_backup.sql"
    echo "📊 Размер файла: $(du -h map1_backup.sql | cut -f1)"
    
else
    echo "❌ База данных не запущена. Запустите:"
    echo "   docker-compose -f docker-compose.yaml up -d db"
    exit 1
fi

echo ""
echo "📋 Следующие шаги для деплоя в Timeweb Apps:"
echo "1. Создайте кластер PostgreSQL в Timeweb Cloud Database"
echo "2. Импортируйте данные:"
echo "   psql -h your-cluster-host -U your-user -d your-db < map1_backup.sql"
echo "3. Настройте переменные окружения в Timeweb Apps:"
echo "   PGUSER=your_user"
echo "   PGPASSWORD=your_password"
echo "   PGHOST=your-cluster-host"
echo "   PGDATABASE=your_db"
echo "   PGPORT=5432"
echo "   NODE_ENV=production" 