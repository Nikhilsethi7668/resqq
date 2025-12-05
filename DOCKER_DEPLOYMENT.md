# ResQQ Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

### 1. Setup Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

**Required variables:**
- `JWT_SECRET` - Change to a secure random string
- `RESEND_API_KEY` - Your Resend API key for emails

**Optional variables:**
- AWS credentials (if using S3 for file uploads)

### 2. Build and Start Services
```bash
# Build all images and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access the Application
- **User Frontend**: http://localhost:7001
- **Admin Frontend**: http://localhost:7002
- **Backend API**: http://localhost:7003
- **ML Service**: http://localhost:7004

---

## Service Ports

| Service | Internal Port | External Port |
|---------|--------------|---------------|
| User Frontend | 80 | 7001 |
| Admin Frontend | 80 | 7002 |
| Backend API | 7003 | 7003 |
| ML Service | 7004 | 7004 |
| MongoDB | 27017 | (internal only) |

---

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Rebuild Specific Service
```bash
docker-compose up -d --build backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Restart Service
```bash
docker-compose restart backend
```

### Access Container Shell
```bash
docker-compose exec backend sh
docker-compose exec ml-service bash
```

---

## Data Persistence

### Volumes
- `mongodb_data` - MongoDB database files
- `ml_data` - ML service data
- `./backend/uploads` - Uploaded files

### Backup MongoDB
```bash
docker-compose exec mongodb mongodump --out /data/backup
docker cp resqq-mongodb:/data/backup ./mongodb-backup
```

### Restore MongoDB
```bash
docker cp ./mongodb-backup resqq-mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

---

## Production Deployment

### 1. Update Environment Variables
```bash
# Generate secure JWT secret
openssl rand -base64 32

# Update .env with production values
```

### 2. Configure Reverse Proxy (Nginx/Caddy)
Point your domains to the respective ports:
- `app.yourdomain.com` → `localhost:7001`
- `admin.yourdomain.com` → `localhost:7002`
- `api.yourdomain.com` → `localhost:7003`

### 3. Enable HTTPS
Use Let's Encrypt with Certbot or Caddy for automatic SSL.

### 4. Update CORS Origins
Edit `docker-compose.yml`:
```yaml
environment:
  - ADMIN_ORIGIN=https://admin.yourdomain.com
  - USER_ORIGIN=https://app.yourdomain.com
```

---

## Troubleshooting

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Check if ports are already in use
lsof -i :7001
lsof -i :7002
lsof -i :7003
```

### MongoDB Connection Issues
```bash
# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
docker-compose restart mongodb
```

### Frontend Build Errors
```bash
# Rebuild with no cache
docker-compose build --no-cache user-frontend
docker-compose build --no-cache admin-frontend
```

### ML Service Issues
```bash
# Check ML service logs
docker-compose logs ml-service

# Test ML service
curl http://localhost:7004/health
```

---

## Monitoring

### Resource Usage
```bash
docker stats
```

### Container Health
```bash
docker-compose ps
```

---

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Clean up old images
docker image prune -a
```

---

## Security Checklist

- [ ] Change default `JWT_SECRET` in `.env`
- [ ] Use strong passwords for admin accounts
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Regular backups of MongoDB
- [ ] Keep Docker images updated
- [ ] Review and update CORS origins
- [ ] Secure API keys in `.env`

---

## Support

For issues or questions, check:
- Application logs: `docker-compose logs`
- Container status: `docker-compose ps`
- Resource usage: `docker stats`
