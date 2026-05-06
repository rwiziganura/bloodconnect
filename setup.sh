#!/bin/bash

# BloodConnect Quick Start Script
# This script sets up the development environment

echo "🩸 BloodConnect - Quick Start Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd server

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found in server directory"
    echo "Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env created. Please update with your credentials."
    else
        echo "Creating default .env..."
        cat > .env << EOF
PORT=5000
NODE_ENV=development
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_USER=EKBMzWXHKo28J9b.root
DB_PASSWORD=n8FlLrdof7QNiVMS
DB_NAME=sys
DB_PORT=4000
JWT_SECRET=dev_secret_key_change_in_production
EOF
        echo "✅ .env created with default values"
    fi
else
    echo "✅ .env file exists"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd client

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    cat > .env.local << EOF
VITE_API_URL=http://localhost:5000
EOF
    echo "✅ .env.local created"
else
    echo "✅ .env.local file exists"
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 To start development:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend: http://localhost:5000"
echo ""
echo "🧪 Test database connection:"
echo "  curl http://localhost:5000/api/db/ping"
echo ""
