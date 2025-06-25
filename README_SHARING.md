### To Use the Shared Image

```bash
# Load the image
docker load -i respire-image.tar

# Run the container
docker run -d -p 3000:80 --name respire-app respire:latest

# Access at http://localhost:3000
```