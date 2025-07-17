# ReSPIRE Application - Offline Deployment Guide

This document provides comprehensive instructions for deploying and running the ReSPIRE application using Docker in an offline environment.

## Prerequisites

Before proceeding with the deployment, ensure the following requirements are met:

1. **Docker Desktop Installation**
   - Download Docker Desktop from: https://www.docker.com/products/docker-desktop
   - Verify Docker Desktop is running (Docker icon visible in system tray/menu bar)
   - Ensure Docker has at least 4GB of memory allocated

2. **Deployment Package**
   - Obtain the `respire-offline-deployment.tar.gz` file
   - Verify the package size is approximately 69MB

## Deployment Process

### Step 1: Package Extraction

1. Create a dedicated directory for the deployment (recommended: `ReSPIRE-Deployment`)
2. Place the `respire-offline-deployment.tar.gz` file in this directory
3. Extract the archive using one of the following methods:
   - **Windows**: Right-click → "Extract All"
   - **macOS**: Double-click the archive file
   - **Command line**: `tar -xzf respire-offline-deployment.tar.gz`

Upon successful extraction, a directory named `respire-offline-deployment` will be created containing all necessary deployment files.

### Step 2: Docker Image Loading (Critical for Offline Operation)

**IMPORTANT**: This step is mandatory for offline deployment. Failure to complete this step will result in build errors.

1. **Open Terminal/Command Prompt**
   - **Windows**: Press `Win + R`, type `cmd`, press Enter
   - **macOS**: Press `Cmd + Space`, type "Terminal", press Enter

2. **Navigate to the deployment directory**
   ```bash
   cd path/to/respire-offline-deployment
   ```
   *Note: Replace `path/to` with the actual path to your extracted directory*

3. **Execute the image loading script**
   ```bash
   ./load-offline-images.sh
   ```

   **Expected Output:**
   ```
   Loading Docker images for offline deployment...
   1/2 Loading node:18-alpine...
   Loaded image: node:18-alpine
   2/2 Loading nginx:alpine...
   Loaded image: nginx:alpine
   Docker images loaded successfully!
   ```

   **Troubleshooting Image Loading:**
   - Ensure Docker Desktop is running
   - On Windows systems, try: `bash load-offline-images.sh`
   - Verify the `offline-images` directory exists and contains the required tar files

### Step 3: Application Build and Execution

1. **Ensure you are in the deployment directory**
   ```bash
   cd path/to/respire-offline-deployment
   ```

2. **Build and start the application**
   ```bash
   docker-compose up --build
   ```

### Step 4: Build Process Expectations

- **Duration**: Initial build typically takes 5-10 minutes
- **Expected Success Indicators**:
  ```
  Successfully built
  Successfully tagged
  Creating respire-app
  Container startup messages
  ```

### Step 5: Application Access

1. Wait for the build process to complete (console output stabilizes)
2. Open a web browser
3. Navigate to: `http://localhost:3000`
4. The ReSPIRE application interface should load

## Application Management

### Stopping the Application

To stop the running application:

1. **Using keyboard interrupt**: Press `Ctrl + C` in the terminal where the application is running
2. **Using Docker Compose**: Execute `docker-compose down` in a new terminal session

### Restarting the Application

For subsequent application starts:

1. Navigate to the deployment directory: `cd path/to/respire-offline-deployment`
2. Start the application: `docker-compose up`
   - Note: The `--build` flag is not required after the initial build

## Troubleshooting

### Common Error: Source Metadata Resolution Failure

**Error Symptoms:**
```
failed to solve: node:18-alpine: failed to resolve source metadata
dial tcp: lookup registry-1.docker.io: no such host
```

**Root Cause:** Docker images were not loaded prior to building

**Resolution:**
1. Execute the image loading script: `./load-offline-images.sh`
2. Verify images are available: `docker images | grep alpine`
3. Confirm both `node` and `nginx` images are listed
4. Retry the build process: `docker-compose up --build`

### Build Performance Issues

**Symptoms:** Extended build time or build failures

**Resolution:**
1. Verify Docker Desktop is running
2. Increase Docker memory allocation:
   - Open Docker Desktop → Settings → Resources → Memory
   - Allocate minimum 4GB RAM
3. Retry build process

### Application Loading Issues

**Symptoms:** Browser cannot access application at localhost:3000

**Resolution:**
1. Wait 30 seconds after build completion for full startup
2. Verify container status: `docker ps`
3. Check application logs: `docker-compose logs`
4. Ensure port 3000 is not in use by other applications

### Port Conflict Resolution

If port 3000 is unavailable:

1. Edit `docker-compose.yml`
2. Change port mapping from `"3000:80"` to `"3001:80"` (or another available port)
3. Access application at `http://localhost:3001`

## Application Usage

### Initial Configuration

Upon first access:
1. Click the "GENERATE" button
2. Enter your OpenAI API key when prompted

### Core Functionality

- **File Operations**: Access tasks and document upload via File menu
- **Data Persistence**: Use "Save Draft" to preserve work
- **Report Generation**: Create AI-powered reports using "Generate Report"
- **Report Viewing**: Access generated reports via "Show Report"

### Document Upload Format

For custom document uploads, use the following JSON structure:
```json
[
    {
        "label": "Document_1",
        "content": "Document content text..."
    },
    {
        "label": "Document_2", 
        "content": "Additional document content..."
    }
]
```

## Technical Specifications

- **Application Type**: React-based single-page application
- **Web Server**: Nginx (Alpine Linux)
- **Build System**: Multi-stage Docker build
- **Runtime Environment**: Node.js 18 (Alpine Linux)
- **Default Port**: 3000 (mapped from container port 80)
- **Resource Requirements**: Minimum 4GB RAM, 2GB disk space