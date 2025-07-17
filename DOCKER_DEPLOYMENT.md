# 🚀 ReSPIRE Application - Easy Setup Guide

This guide will help you run the ReSPIRE application on your computer **without needing internet access**.

## ✅ What You Need First

Before starting, make sure you have:

1. **Docker Desktop** installed on your computer
   - **Windows/Mac**: Download from https://www.docker.com/products/docker-desktop
   - **After installation**: Make sure Docker Desktop is running (you'll see a whale icon in your taskbar/menu bar)

2. **The deployment package** (`respire-offline-deployment.tar.gz`) that was sent to you

## 📦 Step 1: Extract the Package

1. **Create a folder** on your desktop or anywhere convenient (e.g., `ReSPIRE-App`)
2. **Copy** the `respire-offline-deployment.tar.gz` file into that folder
3. **Extract the file**:
   - **Windows**: Right-click → "Extract All"
   - **Mac**: Double-click the file
   - **Command line**: `tar -xzf respire-offline-deployment.tar.gz`

After extraction, you should see a folder called `respire-offline-deployment` with files inside.

## 🔧 Step 2: Load Docker Images (REQUIRED FOR OFFLINE USE)

**⚠️ CRITICAL: You MUST do this step first or the build will fail!**

1. **Open Terminal/Command Prompt**:
   - **Windows**: Press `Win + R`, type `cmd`, press Enter
   - **Mac**: Press `Cmd + Space`, type `terminal`, press Enter

2. **Navigate to the extracted folder**:
   ```bash
   cd path/to/your/respire-offline-deployment
   ```
   *Replace `path/to/your` with the actual path where you extracted the files*

3. **Load the Docker base images** (THIS IS MANDATORY):
   ```bash
   ./load-offline-images.sh
   ```
   
   **You should see:**
   ```
   🐳 Loading Docker images for offline deployment...
   1/2 Loading node:18-alpine...
   Loaded image: node:18-alpine
   2/2 Loading nginx:alpine...
   Loaded image: nginx:alpine
   ✅ Docker images loaded successfully!
   ```

   **If this step fails:**
   - Make sure Docker Desktop is running (whale icon visible)
   - On Windows: Try `bash load-offline-images.sh` instead
   - The `offline-images` folder must be present

## 🎯 Step 3: Build and Run the Application (EASIEST METHOD)

1. **Navigate to the extracted folder**:
   ```bash
   cd path/to/your/respire-offline-deployment
   ```
   *Replace `path/to/your` with the actual path where you extracted the files*

2. **Build and start the application** (this is the magic command):
   ```bash
   docker-compose up --build
   ```

## ⏰ What to Expect During Build

- **First time**: The build will take **5-10 minutes** (installing and building everything)
- **Look for these success indicators**:
  ```
  ✅ Successfully built
  ✅ Successfully tagged
  ✅ Creating respire-app
  ✅ respire-app exited with code 0
  ```

## 🌐 Step 4: Access the Application

1. **Wait for the build to complete** (when text stops scrolling and you see "respire-app" running)
2. **Open your web browser**
3. **Go to**: http://localhost:3000
4. **You should see the ReSPIRE application load!**

## 🛑 How to Stop the Application

When you're done using the application:

1. **In the terminal where it's running**: Press `Ctrl + C` (Windows/Mac)
2. **Or run this command in a new terminal**:
   ```bash
   docker-compose down
   ```

## 🔧 If Something Goes Wrong

### Problem: "failed to resolve source metadata" or "no such host" error
**This is the most common issue!**

**Error looks like:**
```
failed to solve: node:18-alpine: failed to resolve source metadata...
dial tcp: lookup registry-1.docker.io: no such host
```

**Solution:**
1. **You skipped Step 2!** Go back and run `./load-offline-images.sh` first
2. **Verify images are loaded:** Run `docker images | grep alpine`
3. **You should see both `node` and `nginx` images listed**
4. **Then try building again:** `docker-compose up --build`

### Problem: Build fails or takes too long
**Solutions**:
1. **Make sure Docker Desktop is running** (check for whale icon)
2. **Give Docker more memory**:
   - Open Docker Desktop → Settings → Resources → Memory
   - Set to at least 4GB
3. **Try again**: `docker-compose up --build`

### Problem: Application doesn't load in browser
**Solutions**:
1. **Wait 30 seconds** after the build completes
2. **Check if it's running**: `docker ps` (should show "respire-app")
3. **Check for errors**: `docker-compose logs`

## 🎮 Using the ReSPIRE Application

Once the application opens in your browser:

1. **First time setup**: 
   - Click the `GENERATE` button
   - Enter your OpenAI API key when prompted

2. **Main features**:
   - **File menu**: Access different tasks and upload documents
   - **Save Draft**: Save your work
   - **Generate Report**: Create AI-powered reports
   - **Show Report**: View generated reports

3. **Uploading documents**: Use this JSON format:
   ```json
   [
       {
           "label": "Document_1", 
           "content": "Your text content here..."
       }
   ]
   ```

## 🔄 Restarting the Application Later

To use the application again after closing it:

1. **Navigate to the folder**: `cd path/to/respire-offline-deployment`
2. **Start it up**: `docker-compose up`
   - *Note: No `--build` needed after the first time*
3. **Open browser**: http://localhost:3000