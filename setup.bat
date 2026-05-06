@echo off
REM BloodConnect Quick Start Script for Windows
REM This script sets up the development environment

echo.
echo 🩸 BloodConnect - Quick Start Setup
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd server

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found in server directory
    echo Creating .env with default values...
    (
        echo PORT=5000
        echo NODE_ENV=development
        echo DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
        echo DB_USER=EKBMzWXHKo28J9b.root
        echo DB_PASSWORD=n8FlLrdof7QNiVMS
        echo DB_NAME=sys
        echo DB_PORT=4000
        echo JWT_SECRET=dev_secret_key_change_in_production
    ) > .env
    echo ✅ .env created with default values
) else (
    echo ✅ .env file exists
)

cd ..

REM Frontend setup
echo.
echo 📦 Setting up Frontend...
cd client

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo VITE_API_URL=http://localhost:5000
    ) > .env.local
    echo ✅ .env.local created
) else (
    echo ✅ .env.local file exists
)

cd ..

echo.
echo ✅ Setup Complete!
echo.
echo 🚀 To start development:
echo.
echo Command Prompt 1 - Backend:
echo   cd server
echo   npm run dev
echo.
echo Command Prompt 2 - Frontend:
echo   cd client
echo   npm run dev
echo.
echo 📍 Frontend: http://localhost:5173
echo 📍 Backend: http://localhost:5000
echo.
echo 🧪 Test database connection:
echo   curl http://localhost:5000/api/db/ping
echo.
pause
