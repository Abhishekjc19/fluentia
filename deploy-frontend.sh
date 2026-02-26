#!/bin/bash

# Fluentia Frontend Deployment Script for Google Cloud Run
# Run this script AFTER backend is deployed

echo "🚀 Deploying Fluentia Frontend to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID

# Get backend URL
read -p "Enter your Backend URL (from previous deployment): " BACKEND_URL

# Deploy frontend
echo "🔨 Building and deploying frontend..."
cd "$(dirname "$0")/frontend"

gcloud run deploy fluentia-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars="VITE_API_URL=$BACKEND_URL"

# Get the deployed URL
FRONTEND_URL=$(gcloud run services describe fluentia-frontend --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ Frontend deployed successfully!"
echo "🌐 Frontend URL: $FRONTEND_URL"
echo ""
echo "⚠️  IMPORTANT: Update backend CORS to allow frontend URL:"
echo ""
echo "gcloud run services update fluentia-backend --region us-central1 \\"
echo "  --update-env-vars=\"CORS_ORIGIN=$FRONTEND_URL\""
echo ""
echo "🎉 Deployment complete! Access your app at: $FRONTEND_URL"
