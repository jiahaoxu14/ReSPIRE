#!/bin/bash

# ReSPIRE Sharing Script
# This script helps you quickly share the ReSPIRE application

echo "🚀 ReSPIRE Sharing Script"
echo "=========================="

# Function to get local IP address
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        hostname -I | awk '{print $1}'
    else
        # Windows or other
        echo "Please manually find your IP address using 'ipconfig' (Windows) or 'ifconfig' (Linux/macOS)"
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use."
        read -p "Do you want to use a different port? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter new port number: " new_port
            echo $new_port
        else
            exit 1
        fi
    else
        echo $port
    fi
}

# Main script
case "${1:-}" in
    "local")
        echo "🌐 Starting ReSPIRE for local network sharing..."
        check_docker
        
        port=$(check_port 3000)
        if [ $? -eq 1 ]; then
            exit 1
        fi
        
        echo "🔧 Building and starting container..."
        docker-compose up --build -d
        
        local_ip=$(get_local_ip)
        
        echo ""
        echo "✅ ReSPIRE is now running!"
        echo "📱 Share these URLs with others on your network:"
        echo "   Local: http://localhost:$port"
        echo "   Network: http://$local_ip:$port"
        echo ""
        echo "🛑 To stop the application, run: docker-compose down"
        ;;
        
    "export")
        echo "📦 Creating portable Docker image..."
        check_docker
        
        echo "🔧 Building image..."
        docker build -t respire:latest .
        
        echo "💾 Saving image to file..."
        docker save -o respire-image.tar respire:latest
        
        echo ""
        echo "✅ Image saved as 'respire-image.tar'"
        echo "📤 Share this file with others"
        echo "📖 Others can load it with: docker load -i respire-image.tar"
        ;;
        
    "import")
        if [ ! -f "respire-image.tar" ]; then
            echo "❌ respire-image.tar not found in current directory"
            exit 1
        fi
        
        echo "📥 Loading Docker image..."
        docker load -i respire-image.tar
        
        port=$(check_port 3000)
        if [ $? -eq 1 ]; then
            exit 1
        fi
        
        echo "🚀 Starting ReSPIRE..."
        docker run -d -p $port:80 --name respire-app respire:latest
        
        echo ""
        echo "✅ ReSPIRE is now running!"
        echo "🌐 Access at: http://localhost:$port"
        echo ""
        echo "🛑 To stop: docker stop respire-app && docker rm respire-app"
        ;;
        
    "cloud")
        echo "☁️  Cloud deployment options:"
        echo ""
        echo "1. AWS EC2:"
        echo "   - Launch EC2 instance"
        echo "   - Install Docker: sudo yum install -y docker"
        echo "   - Clone repo and run: docker-compose up -d"
        echo ""
        echo "2. Google Cloud Run:"
        echo "   - Use the provided Dockerfile"
        echo "   - Deploy with: gcloud run deploy"
        echo ""
        echo "3. Vercel/Netlify:"
        echo "   - Connect GitHub repo"
        echo "   - Deploy automatically"
        echo ""
        echo "📖 See SHARING.md for detailed instructions"
        ;;
        
    "help"|"")
        echo "Usage: ./share.sh [command]"
        echo ""
        echo "Commands:"
        echo "  local   - Start ReSPIRE for local network sharing"
        echo "  export  - Create portable Docker image file"
        echo "  import  - Load and run shared Docker image"
        echo "  cloud   - Show cloud deployment options"
        echo "  help    - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./share.sh local    # Share on local network"
        echo "  ./share.sh export   # Create shareable image"
        echo "  ./share.sh import   # Run shared image"
        ;;
        
    *)
        echo "❌ Unknown command: $1"
        echo "Run './share.sh help' for usage information"
        exit 1
        ;;
esac 