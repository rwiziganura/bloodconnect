#!/bin/bash

# BloodConnect - Quick Deployment Script
# This script helps you deploy both frontend and backend

echo "🩸 BloodConnect Deployment Script"
echo "=================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Menu
echo "What would you like to do?"
echo "1. Test locally (both frontend and backend)"
echo "2. Deploy backend to Render"
echo "3. Deploy frontend to Vercel"
echo "4. Deploy both"
echo "5. Test production endpoints"
echo "6. View environment variables"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🧪 Testing locally..."
        echo ""
        echo "Starting backend on http://localhost:5000..."
        cd server && npm install && npm start &
        BACKEND_PID=$!
        
        echo "Waiting for backend to start..."
        sleep 5
        
        echo "Starting frontend on http://localhost:5173..."
        cd ../client && npm install && npm run dev &
        FRONTEND_PID=$!
        
        echo ""
        echo "✅ Both servers are running!"
        echo "Backend: http://localhost:5000"
        echo "Frontend: http://localhost:5173"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        # Wait for user to stop
        wait $BACKEND_PID $FRONTEND_PID
        ;;
        
    2)
        echo ""
        echo "🚀 Deploying backend to Render..."
        echo ""
        echo "Make sure you have:"
        echo "1. Connected your GitHub repo to Render"
        echo "2. Set all environment variables on Render"
        echo ""
        read -p "Ready to push? (y/n): " ready
        
        if [ "$ready" = "y" ]; then
            git add .
            git commit -m "Deploy backend to Render"
            git push origin main
            echo ""
            echo "✅ Pushed to GitHub. Render will auto-deploy."
            echo "Check status: https://dashboard.render.com"
        fi
        ;;
        
    3)
        echo ""
        echo "🚀 Deploying frontend to Vercel..."
        echo ""
        
        if ! command_exists vercel; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        cd client
        echo "Building frontend..."
        npm run build
        
        echo "Deploying to Vercel..."
        vercel --prod
        
        echo ""
        echo "✅ Frontend deployed!"
        ;;
        
    4)
        echo ""
        echo "🚀 Deploying both frontend and backend..."
        echo ""
        
        # Backend
        echo "1️⃣ Deploying backend..."
        git add .
        git commit -m "Deploy to production"
        git push origin main
        echo "✅ Backend pushed to GitHub (Render will auto-deploy)"
        
        # Frontend
        echo ""
        echo "2️⃣ Deploying frontend..."
        cd client
        npm run build
        vercel --prod
        
        echo ""
        echo "✅ Both deployed!"
        echo "Backend: https://bloodconnect-zptd.onrender.com"
        echo "Frontend: https://bloodconnect.vercel.app"
        ;;
        
    5)
        echo ""
        echo "🧪 Testing production endpoints..."
        echo ""
        
        echo "1. Testing backend health..."
        curl -s https://bloodconnect-zptd.onrender.com/api/health | json_pp
        echo ""
        
        echo "2. Testing database connection..."
        curl -s https://bloodconnect-zptd.onrender.com/api/db/ping | json_pp
        echo ""
        
        echo "3. Testing frontend..."
        curl -I https://bloodconnect.vercel.app
        echo ""
        
        echo "✅ Tests complete!"
        ;;
        
    6)
        echo ""
        echo "📝 Environment Variables"
        echo "========================"
        echo ""
        echo "BACKEND (Render):"
        echo "-----------------"
        echo "NODE_ENV=production"
        echo "PORT=10000"
        echo "DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com"
        echo "DB_PORT=4000"
        echo "DB_USER=EKBMzWXHKo28J9b.root"
        echo "DB_PASSWORD=7gclHJOSmiDKWKLa"
        echo "DB_NAME=bloodconnect"
        echo "JWT_SECRET=bloodconnect_super_secret_jwt_key_2024_do_not_share"
        echo "JWT_EXPIRES_IN=7d"
        echo "FRONTEND_URL=https://bloodconnect.vercel.app"
        echo ""
        echo "FRONTEND (Vercel):"
        echo "------------------"
        echo "VITE_API_URL=https://bloodconnect-zptd.onrender.com/api"
        echo ""
        ;;
        
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Done! 🎉"
