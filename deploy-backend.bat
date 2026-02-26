@echo off
REM Fluentia Backend Deployment Script for Google Cloud Run (Windows)
REM Run this script after installing Google Cloud CLI and logging in

echo 🚀 Deploying Fluentia Backend to Google Cloud Run...
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Google Cloud CLI not found. Please install it first:
    echo https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Set project
set /p PROJECT_ID="Enter your Google Cloud Project ID: "
gcloud config set project %PROJECT_ID%

REM Enable required APIs
echo.
echo 📦 Enabling required APIs...
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

REM Deploy backend
echo.
echo 🔨 Building and deploying backend...
cd "%~dp0backend"

gcloud run deploy fluentia-backend --source . --platform managed --region us-central1 --allow-unauthenticated --port 3000 --memory 1Gi --timeout 300 --min-instances 0 --max-instances 10

REM Get the deployed URL
for /f "tokens=*" %%i in ('gcloud run services describe fluentia-backend --region us-central1 --format "value(status.url)"') do set BACKEND_URL=%%i

echo.
echo ✅ Backend deployed successfully!
echo 🌐 Backend URL: %BACKEND_URL%
echo.
echo ⚠️  IMPORTANT: Now add environment variables:
echo.
echo Create a file called backend-env.txt with your values:
echo NODE_ENV=production
echo PORT=3000
echo DATABASE_URL=your_supabase_url
echo JWT_SECRET=your_secret
echo GEMINI_API_KEY=your_key
echo SUPABASE_URL=your_url
echo SUPABASE_SERVICE_KEY=your_key
echo AWS_ACCESS_KEY_ID=your_key
echo AWS_SECRET_ACCESS_KEY=your_secret
echo AWS_REGION=us-east-1
echo S3_BUCKET_NAME=your_bucket
echo CORS_ORIGIN=*
echo.
echo Then run: gcloud run services update fluentia-backend --region us-central1 --env-vars-file backend-env.txt
echo.
echo Save this backend URL: %BACKEND_URL%
echo.
pause
