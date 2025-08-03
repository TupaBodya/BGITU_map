# Timeweb Deployment Guide

This guide provides step-by-step instructions for deploying the BGITU Map application to Timeweb hosting.

## 🚀 Prerequisites

1. **Timeweb VPS or Dedicated Server** with:
   - Ubuntu 20.04+ or CentOS 7+
   - At least 2GB RAM
   - At least 20GB disk space
   - Root access via SSH

2. **Domain name** (optional but recommended)

## 📋 Step 1: Server Setup

### Connect to your Timeweb server:
```bash
ssh root@your-server-ip
```

### Update system packages:
```bash
apt update && apt upgrade -y
```

### Install Docker and Docker Compose:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add user to docker group
usermod -aG docker $USER
```

### Install additional tools:
```bash
apt install -y git curl wget htop
```

## 📋 Step 2: Application Deployment

### Clone the repository:
```bash
cd /root
git clone <your-repository-url>
cd BGITU_map
```

### Set environment variables:
```bash
# Create environment file
cp env.example .env

# Edit environment variables (use nano or vim)
nano .env
```

### Make deployment script executable:
```bash
chmod +x deploy.sh
```

### Run deployment:
```bash
./deploy.sh
```

## 📋 Step 3: Domain Configuration (Optional)

### If you have a domain name:

1. **Point your domain to your server IP** in your domain registrar's DNS settings
2. **Update nginx.conf** to use your domain:
   ```bash
   nano nginx.conf
   ```
   Change `server_name localhost;` to `server_name your-domain.com www.your-domain.com;`

3. **Restart the application**:
   ```bash
   docker-compose -f docker-compose.prod.yaml restart
   ```

## 📋 Step 4: SSL Certificate (Recommended)

### Install Certbot:
```bash
apt install -y certbot python3-certbot-nginx
```

### Get SSL certificate:
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Auto-renewal:
```bash
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📋 Step 5: Firewall Configuration

### Configure UFW firewall:
```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

## 🔧 Management Commands

### View application status:
```bash
docker-compose -f docker-compose.prod.yaml ps
```

### View logs:
```bash
# All services
docker-compose -f docker-compose.prod.yaml logs -f

# Specific service
docker-compose -f docker-compose.prod.yaml logs -f client
docker-compose -f docker-compose.prod.yaml logs -f server
docker-compose -f docker-compose.prod.yaml logs -f db
```

### Restart services:
```bash
docker-compose -f docker-compose.prod.yaml restart
```

### Update application:
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yaml up -d --build
```

### Stop application:
```bash
docker-compose -f docker-compose.prod.yaml down
```

### Backup database:
```bash
docker-compose -f docker-compose.prod.yaml exec db pg_dump -U postgres map1 > backup.sql
```

## 🔒 Security Recommendations

1. **Change default passwords** in `.env` file
2. **Use strong passwords** for database
3. **Enable firewall** (UFW)
4. **Keep system updated** regularly
5. **Monitor logs** for suspicious activity
6. **Set up automated backups**

## 📊 Monitoring

### System monitoring:
```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# Monitor system resources
htop
```

### Application monitoring:
```bash
# Check container resource usage
docker stats

# Monitor disk usage
df -h

# Monitor memory usage
free -h
```

## 🐛 Troubleshooting

### Common Issues:

1. **Port 80 already in use:**
   ```bash
   # Check what's using port 80
   netstat -tulpn | grep :80
   
   # Stop conflicting service
   systemctl stop apache2  # or nginx
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose -f docker-compose.prod.yaml logs db
   
   # Restart database
   docker-compose -f docker-compose.prod.yaml restart db
   ```

3. **Memory issues:**
   ```bash
   # Check memory usage
   free -h
   
   # Restart containers
   docker-compose -f docker-compose.prod.yaml restart
   ```

### Performance Optimization:

1. **Enable swap** if needed:
   ```bash
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

2. **Optimize Docker:**
   ```bash
   # Clean up unused Docker resources
   docker system prune -a
   
   # Limit container memory usage in docker-compose.prod.yaml
   ```

## 📞 Support

For Timeweb-specific issues:
1. Check Timeweb knowledge base
2. Contact Timeweb support
3. Check server resources in Timeweb control panel

For application issues:
1. Check logs: `docker-compose -f docker-compose.prod.yaml logs -f`
2. Verify environment variables
3. Check database connectivity
4. Monitor system resources 