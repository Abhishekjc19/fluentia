@echo off
REM Fluentia Setup Script for Windows
REM This script helps set up the development environment

echo.
echo 🚀 Fluentia Mock Interview Platform - Setup Script
echo ==================================================
echo.

REM Check Node.js installation
echo 📦 Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found
echo.

REM Check npm installation
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed.
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo.

REM Create .env files if they don't exist
echo 📝 Checking environment files...

if not exist "backend\.env" (
    echo Creating backend\.env from example...
    copy backend\.env.example backend\.env
    echo ⚠️  Please edit backend\.env with your actual values
)

if not exist "frontend\.env" (
    echo Creating frontend\.env from example...
    copy frontend\.env.example frontend\.env
    echo ⚠️  Please edit frontend\.env with your actual values
)

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next Steps:
echo 1. Configure backend\.env with your Supabase and Gemini API credentials
echo 2. Configure frontend\.env if needed
echo 3. Setup your Supabase database using backend\supabase\schema.sql
echo 4. Run 'npm run dev' to start the development server
echo.
echo 📚 For detailed instructions, see SETUP.md
echo.
echo Have fun building! 🎉
echo.

pause
