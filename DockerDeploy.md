## Docker Deployment Guideline

### 1. Build the Docker Image

```sh
docker build -t respire-app .
```

### 2. Run the Docker Container

```sh
docker run -d -p 80:80 respire-app
```

- The app will be available at http://localhost (or the device's IP address).
- Make sure Docker is installed on the new device before running these commands.