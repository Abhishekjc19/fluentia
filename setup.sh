#!/bin/bash

# Fluentia Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Fluentia Mock Interview Platform - Setup Script"
echo "=================================================="
echo ""

# Check Node.js installation
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION found"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo ""

# Create .env files if they don't exist
echo "📝 Checking environment files..."

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your actual values"
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env from example..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please edit frontend/.env with your actual values"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure backend/.env with your Supabase and Gemini API credentials"
echo "2. Configure frontend/.env if needed"
echo "3. Setup your Supabase database using backend/supabase/schema.sql"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For detailed instructions, see SETUP.md"
echo ""
echo "Have fun building! 🎉"
