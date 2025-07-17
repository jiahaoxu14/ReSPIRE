#!/bin/bash

# Script to prepare Docker base images for offline deployment
echo "🐳 Preparing Docker images for offline deployment..."

# Create directory for images
mkdir -p offline-images

echo "📥 Downloading and saving Docker base images..."
echo "This requires internet connection and will take a few minutes..."

# Pull and save the base images
echo "1/2 Pulling node:18-alpine..."
docker pull node:18-alpine
docker save node:18-alpine -o offline-images/node-18-alpine.tar

echo "2/2 Pulling nginx:alpine..."
docker pull nginx:alpine  
docker save nginx:alpine -o offline-images/nginx-alpine.tar

echo "✅ Docker images saved successfully!"
echo "📁 Images saved in: offline-images/"
echo "📊 Image sizes:"
ls -lh offline-images/

echo ""
echo "🎯 Next steps:"
echo "1. Include the 'offline-images' folder in your deployment package"
echo "2. Your colleague will load these images before building" 