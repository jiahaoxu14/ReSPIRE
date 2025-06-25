#!/bin/bash

# ReSPIRE Docker Build Script
# This script automates the Docker build and run process

set -e  # Exit on any error

echo "🚀 ReSPIRE Docker Build Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use."
        read -p "Do you want to use a different port? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter new port number: " new_port
            echo $new_port
        else
            print_error "Build cancelled. Please free up port $port or choose a different port."
            exit 1
        fi
    else
        echo $port
    fi
}

# Function to clean up old containers
cleanup_old_containers() {
    print_status "Cleaning up old containers..."
    
    # Stop and remove old containers
    if docker ps -a --format "table {{.Names}}" | grep -q "respire-app"; then
        docker stop respire-app 2>/dev/null || true
        docker rm respire-app 2>/dev/null || true
        print_success "Old containers cleaned up"
    fi
    
    # Remove old images if requested
    if [[ "$1" == "--clean-images" ]]; then
        print_status "Removing old images..."
        docker rmi respire:latest 2>/dev/null || true
        print_success "Old images cleaned up"
    fi
}

# Function to build the application
build_app() {
    print_status "Building ReSPIRE application..."
    
    # Build the Docker image
    docker build -t respire:latest .
    
    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Function to run the application
run_app() {
    local port=$1
    
    print_status "Starting ReSPIRE application on port $port..."
    
    # Run the container
    docker run -d -p $port:80 --name respire-app respire:latest
    
    if [ $? -eq 0 ]; then
        print_success "Application started successfully"
        echo ""
        echo "🌐 Access your application:"
        echo "   Local: http://localhost:$port"
        echo ""
        echo "🛑 To stop the application:"
        echo "   docker stop respire-app && docker rm respire-app"
        echo ""
        echo "📊 To view logs:"
        echo "   docker logs respire-app -f"
    else
        print_error "Failed to start application"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: ./build.sh [options]"
    echo ""
    echo "Options:"
    echo "  --clean-images    Remove old images before building"
    echo "  --port PORT       Specify custom port (default: 3000)"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./build.sh                    # Build and run on port 3000"
    echo "  ./build.sh --port 8080        # Build and run on port 8080"
    echo "  ./build.sh --clean-images     # Clean images and rebuild"
    echo ""
}

# Parse command line arguments
PORT=3000
CLEAN_IMAGES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean-images)
            CLEAN_IMAGES=true
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "Starting build process..."
    echo ""
    
    # Check prerequisites
    check_docker
    
    # Check port availability
    PORT=$(check_port $PORT)
    if [ $? -eq 1 ]; then
        exit 1
    fi
    
    # Clean up old containers
    if [ "$CLEAN_IMAGES" = true ]; then
        cleanup_old_containers --clean-images
    else
        cleanup_old_containers
    fi
    
    # Build the application
    build_app
    
    # Run the application
    run_app $PORT
    
    print_success "ReSPIRE is now running and ready to use!"
}

# Run main function
main "$@" 