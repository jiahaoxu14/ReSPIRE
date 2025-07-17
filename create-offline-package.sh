#!/bin/bash

# ReSPIRE Offline Package Creator
# This script creates a package that can be sent to colleagues for offline deployment

echo "Creating ReSPIRE offline deployment package..."

# Create deployment directory
DEPLOY_DIR="respire-offline-deployment"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy essential files
echo "Copying source code and configuration files..."
cp -r src $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp package*.json $DEPLOY_DIR/
cp Dockerfile $DEPLOY_DIR/
cp docker-compose.yml $DEPLOY_DIR/
cp nginx.conf $DEPLOY_DIR/
cp .dockerignore $DEPLOY_DIR/
cp DOCKER_DEPLOYMENT.md $DEPLOY_DIR/
cp load-offline-images.sh $DEPLOY_DIR/
chmod +x $DEPLOY_DIR/load-offline-images.sh

# Copy additional files if they exist
[ -f .env.example ] && cp .env.example $DEPLOY_DIR/
[ -f README.md ] && cp README.md $DEPLOY_DIR/

# Copy offline Docker images if they exist
if [ -d "offline-images" ]; then
    echo "Including offline Docker images..."
    cp -r offline-images $DEPLOY_DIR/
else
    echo "⚠️  Warning: offline-images directory not found!"
    echo "   Run './prepare-offline-images.sh' first to include Docker base images"
    echo "   for truly offline deployment."
fi

echo "Creating deployment package archive..."
tar -czf respire-offline-deployment.tar.gz $DEPLOY_DIR

echo ""
echo "✅ Offline deployment package created successfully!"
echo ""
echo "📦 Package: respire-offline-deployment.tar.gz"
echo "📂 Directory: $DEPLOY_DIR/"
echo ""
echo "Send the .tar.gz file to your colleague with these instructions:"
echo "1. Extract: tar -xzf respire-offline-deployment.tar.gz"
echo "2. Navigate: cd respire-offline-deployment"
echo "3. Build and run: docker-compose up --build"
echo "4. Open browser: http://localhost:3000"
echo ""
echo "For detailed instructions, see DOCKER_DEPLOYMENT.md in the package." 