#!/bin/bash

# Скрипт для исправления зависимостей
set -e

echo "🔧 Исправление зависимостей..."

# Удаляем lock-файлы
echo "🗑️ Удаляем старые lock-файлы..."
rm -f client/package-lock.json server/package-lock.json

# Обновляем зависимости клиента
echo "📦 Обновляем зависимости клиента..."
cd client
npm install
cd ..

# Обновляем зависимости сервера
echo "📦 Обновляем зависимости сервера..."
cd server
npm install
cd ..

echo "✅ Зависимости исправлены!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Запушьте изменения в Git:"
echo "   git add ."
echo "   git commit -m 'Fix dependencies - move vite to dependencies'"
echo "   git push"
echo ""
echo "2. Пересоберите приложение в Timeweb Apps" 