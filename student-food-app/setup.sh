#!/bin/bash

echo "🍽️  Student Food Ordering WebApp Setup"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads/id-cards
mkdir -p backend/uploads/menu-items
mkdir -p database/init

# Set permissions
chmod +x setup.sh

echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "👤 Demo Admin Login:"
echo "   Email: admin@studentfood.com"
echo "   Password: admin123"
echo ""
echo "📚 Check the logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
echo ""
echo "Happy coding! 🚀"