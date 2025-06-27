#!/bin/bash

# AI-Enhanced Task Manager - Codex Environment Setup Script
# This script installs all dependencies and prepares the development environment

echo "🚀 Setting up AI-Enhanced Task Manager for Codex..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install Backend Dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Build backend TypeScript
echo "🔨 Building backend TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build backend"
    exit 1
fi
echo "✅ Backend built successfully"

cd ..

# Install Frontend Dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

cd ..

# Create environment files if they don't exist
echo "⚙️ Setting up environment configuration..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > backend/.env << EOF
# Backend Environment Configuration
NODE_ENV=development
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/task_manager
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env already exists"
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend .env file..."
    cat > frontend/.env << EOF
# Frontend Environment Configuration
VITE_API_URL=http://localhost:8000
EOF
    echo "✅ Frontend .env created"
else
    echo "✅ Frontend .env already exists"
fi

# Verify installation
echo "🔍 Verifying installation..."

# Check backend
cd backend
if [ -d "node_modules" ] && [ -d "dist" ]; then
    echo "✅ Backend: node_modules and dist directory present"
else
    echo "❌ Backend: Missing required directories"
    exit 1
fi
cd ..

# Check frontend
cd frontend
if [ -d "node_modules" ]; then
    echo "✅ Frontend: node_modules directory present"
else
    echo "❌ Frontend: Missing node_modules directory"
    exit 1
fi
cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Project Information:"
echo "   Repository: https://github.com/GITMEB1/ai-enhanced-task-manager"
echo "   Backend: Node.js + Express + TypeScript"
echo "   Frontend: React + TypeScript + Tailwind CSS"
echo "   Database: PostgreSQL (optional in development mode)"
echo ""
echo "🚀 To start the application:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🔑 Test Login:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "📚 Key Files for Codex:"
echo "   Backend API: backend/src/routes/"
echo "   Frontend Components: frontend/src/components/"
echo "   Database Models: backend/src/models/"
echo "   State Management: frontend/src/stores/"
echo ""
echo "✅ Environment ready for Codex development!" 