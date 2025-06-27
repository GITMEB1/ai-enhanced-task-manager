# AI-Enhanced Task Manager - Codex Environment Setup Script (PowerShell)
# This script installs all dependencies and prepares the development environment

Write-Host "🚀 Setting up AI-Enhanced Task Manager for Codex..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install Backend Dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Build backend TypeScript
Write-Host "🔨 Building backend TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend built successfully" -ForegroundColor Green

Set-Location ..

# Install Frontend Dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

# Create environment files if they don't exist
Write-Host "⚙️ Setting up environment configuration..." -ForegroundColor Yellow

# Backend environment
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    @"
# Backend Environment Configuration
NODE_ENV=development
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/task_manager
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Backend .env created" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env already exists" -ForegroundColor Green
}

# Frontend environment
if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    @"
# Frontend Environment Configuration
VITE_API_URL=http://localhost:8000
"@ | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env already exists" -ForegroundColor Green
}

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow

# Check backend
Set-Location backend
if ((Test-Path "node_modules") -and (Test-Path "dist")) {
    Write-Host "✅ Backend: node_modules and dist directory present" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: Missing required directories" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Check frontend
Set-Location frontend
if (Test-Path "node_modules") {
    Write-Host "✅ Frontend: node_modules directory present" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: Missing node_modules directory" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Project Information:" -ForegroundColor Cyan
Write-Host "   Repository: https://github.com/GITMEB1/ai-enhanced-task-manager" -ForegroundColor White
Write-Host "   Backend: Node.js + Express + TypeScript" -ForegroundColor White
Write-Host "   Frontend: React + TypeScript + Tailwind CSS" -ForegroundColor White
Write-Host "   Database: PostgreSQL (optional in development mode)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Cyan
Write-Host "   Terminal 1: cd backend; npm run dev" -ForegroundColor White
Write-Host "   Terminal 2: cd frontend; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Test Login:" -ForegroundColor Cyan
Write-Host "   Email: test@example.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "📚 Key Files for Codex:" -ForegroundColor Cyan
Write-Host "   Backend API: backend/src/routes/" -ForegroundColor White
Write-Host "   Frontend Components: frontend/src/components/" -ForegroundColor White
Write-Host "   Database Models: backend/src/models/" -ForegroundColor White
Write-Host "   State Management: frontend/src/stores/" -ForegroundColor White
Write-Host ""
Write-Host "✅ Environment ready for Codex development!" -ForegroundColor Green 