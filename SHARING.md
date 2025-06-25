# Sharing ReSPIRE Application

This guide covers different ways to share your ReSPIRE application with others, from simple local sharing to cloud deployment.

## Table of Contents
1. [Local Network Sharing](#local-network-sharing)
2. [Docker Image Sharing](#docker-image-sharing)
3. [Cloud Deployment](#cloud-deployment)
4. [Static Site Hosting](#static-site-hosting)
5. [GitHub Pages](#github-pages)
6. [Vercel/Netlify Deployment](#vercelnetlify-deployment)
7. [Docker Registry](#docker-registry)
8. [Requirements for Users](#requirements-for-users)

## Local Network Sharing

### Option 1: Docker Compose (Recommended)

**For the person sharing:**
```bash
# Build and run the container
docker-compose up --build

# Find your local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
# or on Windows: ipconfig
```

**For others on the same network:**
- Open browser and go to: `http://YOUR_LOCAL_IP:3000`
- Example: `http://192.168.1.100:3000`

### Option 2: Direct Docker

**For the person sharing:**
```bash
# Build the image
docker build -t respire:latest .

# Run with host network (allows external access)
docker run -d -p 0.0.0.0:3000:80 --name respire-app respire:latest
```

**For others:**
- Access via: `http://YOUR_LOCAL_IP:3000`

## Docker Image Sharing

### Create a Portable Docker Image

```bash
# Build the image
docker build -t respire:latest .

# Save the image to a file
docker save -o respire-image.tar respire:latest

# Share the respire-image.tar file with others
```

### For Others to Use the Shared Image

```bash
# Load the image
docker load -i respire-image.tar

# Run the container
docker run -d -p 3000:80 --name respire-app respire:latest

# Access at http://localhost:3000
```

## Cloud Deployment

### Option 1: AWS EC2

1. **Launch an EC2 instance**
2. **Install Docker:**
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```

3. **Deploy the application:**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd ReSPIRE
   
   # Build and run
   docker-compose up -d --build
   ```

4. **Configure Security Group:**
   - Open port 3000 (or your chosen port)
   - Open port 22 for SSH

5. **Access via:** `http://YOUR_EC2_PUBLIC_IP:3000`

### Option 2: Google Cloud Run

1. **Create a Dockerfile for Cloud Run:**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --legacy-peer-deps
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 8080
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Deploy to Cloud Run:**
   ```bash
   # Build and push
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/respire
   
   # Deploy
   gcloud run deploy respire --image gcr.io/YOUR_PROJECT_ID/respire --platform managed --allow-unauthenticated --port 8080
   ```

### Option 3: Azure Container Instances

```bash
# Build and push to Azure Container Registry
az acr build --registry YOUR_REGISTRY --image respire:latest .

# Deploy to Container Instances
az container create \
  --resource-group YOUR_RESOURCE_GROUP \
  --name respire-container \
  --image YOUR_REGISTRY.azurecr.io/respire:latest \
  --ports 80 \
  --dns-name-label respire-app
```

## Static Site Hosting

Since ReSPIRE is a React application, you can host it as a static site:

### Build for Static Hosting

```bash
# Build the application
npm run build

# The build folder contains static files ready for hosting
```

### Upload to Any Static Host

- **AWS S3 + CloudFront**
- **Google Cloud Storage**
- **Azure Blob Storage**
- **Any web server (Apache, Nginx)**

## GitHub Pages

1. **Add GitHub Pages configuration to package.json:**
   ```json
   {
     "homepage": "https://YOUR_USERNAME.github.io/ReSPIRE",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages in repository settings**

## Vercel/Netlify Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a React app
3. Deploy with one click

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy

## Docker Registry

### Push to Docker Hub

```bash
# Tag your image
docker tag respire:latest YOUR_USERNAME/respire:latest

# Push to Docker Hub
docker push YOUR_USERNAME/respire:latest
```

### For Others to Use

```bash
# Pull and run
docker pull YOUR_USERNAME/respire:latest
docker run -d -p 3000:80 YOUR_USERNAME/respire:latest
```

## Requirements for Users

### For Docker Users
- Docker installed
- Port 3000 available
- Basic Docker knowledge

### For Non-Docker Users
- Web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for cloud deployment)
- No technical knowledge required

### For Local Network Users
- Same network connection
- Web browser
- No additional software required

## Security Considerations

### For Production Deployment
1. **Use HTTPS** - Configure SSL certificates
2. **Environment Variables** - Don't hardcode API keys
3. **Firewall Rules** - Restrict access as needed
4. **Regular Updates** - Keep dependencies updated
5. **Monitoring** - Set up logging and monitoring

### For Local Sharing
1. **Network Security** - Ensure your local network is secure
2. **API Keys** - Users need their own OpenAI API keys
3. **Data Privacy** - Be aware of what data is shared

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:80"  # Use port 3001 instead
   ```

2. **Permission denied:**
   ```bash
   # Fix Docker permissions
   sudo chmod 666 /var/run/docker.sock
   ```

3. **Build fails:**
   ```bash
   # Clean and rebuild
   docker system prune -f
   docker-compose up --build
   ```

### Getting Help

- Check container logs: `docker-compose logs -f`
- Check if container is running: `docker ps`
- Verify network connectivity: `ping YOUR_IP`

## Quick Start Commands

### For Immediate Sharing
```bash
# Build and run
docker-compose up --build

# Share your IP address with others
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### For Cloud Deployment
```bash
# Build and push to registry
docker build -t YOUR_REGISTRY/respire:latest .
docker push YOUR_REGISTRY/respire:latest

# Deploy to cloud platform
# (Follow platform-specific instructions)
```

This comprehensive guide should help you share ReSPIRE with others regardless of their technical background or your deployment preferences! 