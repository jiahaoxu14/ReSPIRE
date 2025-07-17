# ReSPIRE - Offline Docker Deployment

This guide explains how to build and run the ReSPIRE application using Docker **without internet connection**.

## Prerequisites

Your colleague will need:
1. Docker Desktop installed on their machine
2. Docker Compose (usually included with Docker Desktop)

## Files Included

This deployment package includes:
- `Dockerfile` - Multi-stage build configuration
- `docker-compose.yml` - Simple deployment orchestration
- `nginx.conf` - Web server configuration
- `.dockerignore` - Build optimization
- All source code and dependencies

## Quick Start (Recommended)

### Option 1: Using Docker Compose (Easiest)

1. Open terminal/command prompt
2. Navigate to the project folder:
   ```bash
   cd /path/to/ReSPIRE
   ```
3. Build and run the application:
   ```bash
   docker-compose up --build
   ```
4. Open your web browser and go to: http://localhost:3000

To stop the application:
```bash
docker-compose down
```

### Option 2: Using Docker Commands

1. Build the image:
   ```bash
   docker build -t respire-app .
   ```

2. Run the container:
   ```bash
   docker run -d -p 3000:80 --name respire-container respire-app
   ```

3. Open your web browser and go to: http://localhost:3000

To stop and remove the container:
```bash
docker stop respire-container
docker rm respire-container
```

## Using the Application

1. **Initial Setup**: When you first open the application, click the `GENERATE` button and enter your OpenAI API key when prompted.

2. **Main Features**:
   - Access tasks through `File` button in the main toolbar
   - Upload your own documents via `File` → `Upload documents`
   - Save your work with `Save Draft`
   - Generate reports with the `Generate Report` button
   - View reports using the `show report` button

3. **Document Format**: If uploading custom documents, use this JSON format:
   ```json
   [
       {
           "label": "Document_1",
           "content": "Your document content here..."
       },
       {
           "label": "Document_2", 
           "content": "Another document content..."
       }
   ]
   ```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   - Change the port in `docker-compose.yml` from `"3000:80"` to `"3001:80"` (or any other available port)
   - Then access the app at http://localhost:3001

2. **Build fails**:
   - Ensure Docker has enough memory allocated (at least 4GB recommended)
   - Check Docker Desktop settings

3. **Application doesn't load**:
   - Wait a few seconds after starting the container
   - Check if the container is running: `docker ps`
   - Check logs: `docker-compose logs` or `docker logs respire-container`

### Useful Commands

- **View running containers**: `docker ps`
- **View all containers**: `docker ps -a`
- **View logs**: `docker-compose logs` or `docker logs respire-container`
- **Restart application**: `docker-compose restart`
- **Rebuild after code changes**: `docker-compose up --build`

## Technical Details

- **Application**: React-based single-page application
- **Web Server**: Nginx (lightweight and efficient)
- **Port**: Application runs on port 80 inside container, mapped to port 3000 on host
- **Build Process**: Multi-stage Docker build for optimized image size
- **Dependencies**: All npm packages are included in the build process

## Notes

- The application is completely self-contained after building
- No internet connection required to run (only for OpenAI API calls during usage)
- All static assets are properly cached for optimal performance
- The container will automatically restart unless manually stopped 