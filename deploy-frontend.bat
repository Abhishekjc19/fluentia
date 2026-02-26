@echo off
REM Fluentia Frontend Deployment Script for Google Cloud Run (Windows)
REM Run this script AFTER backend is deployed

echo 🚀 Deploying Fluentia Frontend to Google Cloud Run...
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Google Cloud CLI not found. Please install it first:
    echo https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Get project ID
set /p PROJECT_ID="Enter your Google Cloud Project ID: "
gcloud config set project %PROJECT_ID%

REM Get backend URL
set /p BACKEND_URL="Enter your Backend URL (from previous deployment): "

REM Deploy frontend
echo.
echo 🔨 Building and deploying frontend...
cd "%~dp0frontend"

gcloud run deploy fluentia-frontend --source . --platform managed --region us-central1 --allow-unauthenticated --port 80 --memory 512Mi --min-instances 0 --max-instances 5 --set-env-vars="VITE_API_URL=%BACKEND_URL%"

REM Get the deployed URL
for /f "tokens=*" %%i in ('gcloud run services describe fluentia-frontend --region us-central1 --format "value(status.url)"') do set FRONTEND_URL=%%i

echo.
echo ✅ Frontend deployed successfully!
echo 🌐 Frontend URL: %FRONTEND_URL%
echo.
echo ⚠️  IMPORTANT: Update backend CORS to allow frontend URL:
echo.
echo gcloud run services update fluentia-backend --region us-central1 --update-env-vars="CORS_ORIGIN=%FRONTEND_URL%"
echo.
echo 🎉 Deployment complete! Access your app at: %FRONTEND_URL%
echo.
pause
