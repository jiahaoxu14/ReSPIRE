# Docker Setup for ReSPIRE

## 🚀 Quick Start

### Prerequisites
- Docker installed
- Docker Compose installed

### Build and Run
```bash
# Build and start the application
docker-compose up --build

# Access the application
# Open http://localhost:3000 in your browser
```

## 📋 Detailed Instructions

### 1. Build the Docker Image
```bash
# Build the production image
docker build -t respire:latest .

# Or use docker-compose
docker-compose build
```

### 2. Run the Application
```bash
# Using docker-compose (recommended)
docker-compose up -d

# Or using Docker directly
docker run -d -p 3000:80 --name respire-app respire:latest
```

### 3. Access the Application
- **Local access**: http://localhost:3000
- **Network access**: http://YOUR_IP:3000

### 4. Stop the Application
```bash
# Using docker-compose
docker-compose down

# Or using Docker directly
docker stop respire-app
docker rm respire-app
```

## 🔧 Development Mode

### Using Development Dockerfile
```bash
# Build development image
docker build -f Dockerfile.dev -t respire:dev .

# Run with hot reloading
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules respire:dev
```

### Using Docker Compose for Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build
```

## 📊 Container Management

### View Running Containers
```bash
docker ps
```

### View Container Logs
```bash
# Using docker-compose
docker-compose logs -f

# Using Docker directly
docker logs respire-app -f
```

### Access Container Shell
```bash
docker exec -it respire-app sh
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Use a different port
docker run -p 3001:80 respire:latest
```

#### 2. Build Fails
```bash
# Clean up and rebuild
docker system prune -f
docker-compose up --build
```

#### 3. Permission Issues
```bash
# Fix Docker permissions (Linux)
sudo chmod 666 /var/run/docker.sock

# On macOS/Windows, restart Docker Desktop
```

#### 4. Container Won't Start
```bash
# Check container logs
docker logs respire-app

# Check if nginx is running inside container
docker exec respire-app nginx -t
```

### Debug Commands
```bash
# Check container status
docker ps -a

# Check container resources
docker stats respire-app

# Check nginx configuration
docker exec respire-app nginx -t

# View nginx logs
docker exec respire-app tail -f /var/log/nginx/error.log
```

## 🔒 Security Considerations

### Production Deployment
1. **Use HTTPS**: Configure SSL certificates
2. **Environment Variables**: Don't hardcode sensitive data
3. **Firewall Rules**: Restrict access as needed
4. **Regular Updates**: Keep base images updated

### Security Headers
The nginx configuration includes:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

## 📈 Performance Optimization

### Multi-stage Build
- Reduces final image size
- Separates build and runtime dependencies

### Nginx Configuration
- Gzip compression enabled
- Static asset caching
- Optimized for React applications

### Image Optimization
```bash
# Check image size
docker images respire

# Optimize build context
# (Already configured in .dockerignore)
```

## 🌐 Network Configuration

### Local Network Sharing
```bash
# Get your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Share with others on same network
# http://YOUR_IP:3000
```

### Custom Port
```bash
# Edit docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead of 3000
```

## 📝 Environment Variables

### Available Variables
- `NODE_ENV`: Set to `production` or `development`
- `REACT_APP_API_URL`: API endpoint URL (if needed)

### Adding Custom Variables
```yaml
# In docker-compose.yml
environment:
  - NODE_ENV=production
  - REACT_APP_CUSTOM_VAR=value
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up --build -d
```

### Update Base Images
```bash
# Pull latest base images
docker pull node:18-alpine
docker pull nginx:alpine

# Rebuild application
docker-compose up --build
```

### Clean Up
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Build Documentation](https://create-react-app.dev/docs/production-build/)

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs -f`
3. Verify Docker is running: `docker info`
4. Check system resources: `docker system df`

---

**Note**: This application is now fully containerized and can run offline without requiring internet connection for asset loading. 