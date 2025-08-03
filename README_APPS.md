# BGITU Map - Timeweb Apps

Интерактивная карта BGITU для деплоя в Timeweb Apps.

## 🚀 Быстрый деплой

### 1. Подготовка базы данных
Создайте PostgreSQL базу данных в Timeweb Cloud Database или используйте внешнюю.

### 2. Создание приложения в Timeweb Apps
1. Войдите в [Timeweb Cloud](https://timeweb.cloud)
2. Перейдите в раздел "Apps"
3. Нажмите "Создать приложение"
4. Выберите тип "Dockerfile"
5. Подключите ваш Git репозиторий

### 3. Настройка переменных окружения
```
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGHOST=your_db_host
PGDATABASE=your_db_name
PGPORT=5432
NODE_ENV=production
```

### 4. Запуск
- Порт: 8080 (автоматически)
- Нажмите "Создать приложение"

## 📁 Структура проекта

```
BGITU_map/
├── Dockerfile          # Основной файл для Timeweb Apps
├── nginx.conf         # Конфигурация nginx
├── client/            # Vue.js frontend
├── server/            # Node.js backend
└── README_APPS.md     # Этот файл
```

## 🔧 Технологии

- **Frontend**: Vue.js 3 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Web Server**: Nginx
- **Platform**: Timeweb Apps

## 📊 Мониторинг

- **Health Check**: `/health`
- **Логи**: доступны в панели Timeweb Cloud
- **Автоматическое масштабирование**: включено

## 🔒 Безопасность

- Переменные окружения для секретов
- HTTPS автоматически
- Non-root пользователь в контейнере

## 📞 Поддержка

- [Документация Timeweb Apps](https://timeweb.cloud/docs/apps)
- [Подробный гайд деплоя](TIMEWEB_APPS_DEPLOYMENT.md) 