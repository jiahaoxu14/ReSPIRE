# Docker Setup for ReSPIRE

This document provides instructions for running ReSPIRE using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Production Build

1. **Build and run the production version:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Development Build

1. **Build and run the development version:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

3. **Stop the application:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Manual Docker Commands

### Production

```bash
# Build the production image
docker build -t respire:latest .

# Run the container
docker run -p 3000:80 respire:latest

# Run in detached mode
docker run -d -p 3000:80 --name respire-app respire:latest
```

### Development

```bash
# Build the development image
docker build -f Dockerfile.dev -t respire:dev .

# Run the development container
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules respire:dev
```

## Docker Images

### Production Image (`Dockerfile`)
- Multi-stage build for optimized production deployment
- Uses nginx to serve the built React application
- Includes security headers and caching optimizations
- Smaller final image size

### Development Image (`Dockerfile.dev`)
- Single-stage build for development
- Includes all dependencies for development
- Supports hot reloading with volume mounting
- Larger image size but better for development

## Configuration

### Environment Variables

The application can be configured using environment variables:

- `NODE_ENV`: Set to `production` or `development`
- `REACT_APP_API_URL`: API endpoint URL (if needed)

### Port Configuration

- **Production**: Maps container port 80 to host port 3000
- **Development**: Maps container port 3000 to host port 3000

### Volumes

- **Production**: Optional log volume mounting for debugging
- **Development**: Source code volume mounting for hot reloading

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Use a different port
   docker run -p 3001:80 respire:latest
   ```

2. **Build fails:**
   ```bash
   # Clean up and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

3. **Permission issues:**
   ```bash
   # Create logs directory with proper permissions
   mkdir -p logs
   chmod 755 logs
   ```

### Logs

```bash
# View container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f respire

# View logs for development
docker-compose -f docker-compose.dev.yml logs -f
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi respire:latest respire:dev

# Clean up all unused Docker resources
docker system prune -a
```

## Security Notes

- The production build includes security headers
- The application runs as a non-root user in the container
- Static assets are served with appropriate caching headers
- HTTPS should be configured for production deployments

## Performance Optimization

- Production build uses multi-stage Docker build
- Static assets are compressed with gzip
- Long-term caching is enabled for static assets
- Nginx is configured for optimal performance 