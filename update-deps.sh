#!/bin/bash

# Скрипт для обновления зависимостей
set -e

echo "🔄 Обновление зависимостей..."

# Обновляем зависимости клиента
echo "📦 Обновляем зависимости клиента..."
cd client
rm -f package-lock.json
npm install
cd ..

# Обновляем зависимости сервера
echo "📦 Обновляем зависимости сервера..."
cd server
rm -f package-lock.json
npm install
cd ..

echo "✅ Зависимости обновлены!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Проверьте, что все работает локально:"
echo "   cd client && npm run dev"
echo "   cd server && node app.js"
echo ""
echo "2. Запушьте изменения в Git:"
echo "   git add ."
echo "   git commit -m 'Update dependencies'"
echo "   git push"
echo ""
echo "3. Пересоберите приложение в Timeweb Apps" 