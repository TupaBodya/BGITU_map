# BGITU Map Application

A Vue.js-based interactive map application with Node.js backend and PostgreSQL database.

## 🏗️ Architecture

- **Frontend**: Vue.js 3 with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Web Server**: Nginx
- **Containerization**: Docker & Docker Compose

## 🚀 Deployment to Timeweb

### Prerequisites

1. Docker and Docker Compose installed on your Timeweb server
2. SSH access to your Timeweb server
3. Domain name configured (optional)

### Quick Deployment

1. **Clone the repository to your Timeweb server:**
   ```bash
   git clone <your-repository-url>
   cd BGITU_map
   ```

2. **Set environment variables (optional):**
   ```bash
   export POSTGRES_PASSWORD=your_secure_password
   export POSTGRES_USER=your_db_user
   export POSTGRES_DB=your_db_name
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Manual Deployment

1. **Build and start the services:**
   ```bash
   docker-compose -f docker-compose.prod.yaml up -d --build
   ```

2. **Check service status:**
   ```bash
   docker-compose -f docker-compose.prod.yaml ps
   ```

3. **View logs:**
   ```bash
   docker-compose -f docker-compose.prod.yaml logs -f
   ```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | Database username |
| `POSTGRES_PASSWORD` | `7632` | Database password |
| `POSTGRES_DB` | `map1` | Database name |
| `POSTGRES_HOST` | `db` | Database host |
| `POSTGRES_PORT` | `5432` | Database port |

## 🔧 Development

### Local Development

1. **Install dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Start development servers:**
   ```bash
   # Terminal 1 - Frontend
   cd client && npm run dev
   
   # Terminal 2 - Backend
   cd server && node app.js
   ```

### Docker Development

```bash
docker-compose up -d
```

## 📁 Project Structure

```
BGITU_map/
├── client/                 # Vue.js frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── app.js
│   └── package.json
├── docker-compose.yaml     # Development compose
├── docker-compose.prod.yaml # Production compose
├── Dockerfile.client       # Frontend Dockerfile
├── Dockerfile.server       # Backend Dockerfile
├── nginx.conf             # Nginx configuration
├── deploy.sh              # Deployment script
└── README.md
```

## 🔒 Security Features

- Non-root user execution in containers
- Security headers in Nginx configuration
- Environment variable configuration
- Health checks for all services
- Gzip compression for better performance

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Ensure ports 80, 3001, and 5432 are available
   - Check for existing services using these ports

2. **Database connection issues:**
   - Verify PostgreSQL container is running
   - Check environment variables
   - Ensure database credentials are correct

3. **Build failures:**
   - Clear Docker cache: `docker system prune -a`
   - Check for syntax errors in Dockerfiles
   - Verify all required files are present

### Useful Commands

```bash
# View all logs
docker-compose -f docker-compose.prod.yaml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yaml logs -f client

# Restart services
docker-compose -f docker-compose.prod.yaml restart

# Stop all services
docker-compose -f docker-compose.prod.yaml down

# Remove all containers and volumes
docker-compose -f docker-compose.prod.yaml down -v
```

## 📞 Support

For deployment issues or questions, please check:
1. Docker and Docker Compose versions
2. Server resources (CPU, RAM, disk space)
3. Network connectivity and firewall settings
4. Timeweb-specific requirements

## 📄 License

This project is licensed under the ISC License. 