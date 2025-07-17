#!/bin/bash

# Script to load Docker base images for offline deployment
echo "🐳 Loading Docker images for offline deployment..."

# Check if offline-images directory exists
if [ ! -d "offline-images" ]; then
    echo "❌ Error: offline-images directory not found!"
    echo "Make sure you're in the correct directory and the offline-images folder exists."
    exit 1
fi

# Load the Docker images
echo "📤 Loading Docker base images..."

if [ -f "offline-images/node-18-alpine.tar" ]; then
    echo "1/2 Loading node:18-alpine..."
    docker load -i offline-images/node-18-alpine.tar
else
    echo "❌ Warning: node-18-alpine.tar not found!"
fi

if [ -f "offline-images/nginx-alpine.tar" ]; then
    echo "2/2 Loading nginx:alpine..."
    docker load -i offline-images/nginx-alpine.tar
else
    echo "❌ Warning: nginx-alpine.tar not found!"
fi

echo ""
echo "✅ Docker images loaded successfully!"
echo "🎯 You can now run: docker-compose up --build"

# Verify images are loaded
echo ""
echo "📋 Verifying loaded images:"
docker images | grep -E "(node|nginx)" | grep alpine 