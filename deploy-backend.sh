#!/bin/bash

# Fluentia Backend Deployment Script for Google Cloud Run
# Run this script after installing Google Cloud CLI and logging in

echo "🚀 Deploying Fluentia Backend to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project (replace with your project ID)
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📦 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Deploy backend
echo "🔨 Building and deploying backend..."
cd "$(dirname "$0")/backend"

gcloud run deploy fluentia-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 10

# Get the deployed URL
BACKEND_URL=$(gcloud run services describe fluentia-backend --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 Backend URL: $BACKEND_URL"
echo ""
echo "⚠️  IMPORTANT: Now add environment variables:"
echo ""
echo "Run this command (replace with your actual values):"
echo ""
echo "gcloud run services update fluentia-backend --region us-central1 \\"
echo "  --update-env-vars=\"NODE_ENV=production,PORT=3000,DATABASE_URL=YOUR_SUPABASE_URL,JWT_SECRET=YOUR_SECRET,GEMINI_API_KEY=YOUR_KEY,SUPABASE_URL=YOUR_URL,SUPABASE_SERVICE_KEY=YOUR_KEY,AWS_ACCESS_KEY_ID=YOUR_KEY,AWS_SECRET_ACCESS_KEY=YOUR_SECRET,AWS_REGION=us-east-1,S3_BUCKET_NAME=YOUR_BUCKET,CORS_ORIGIN=*\""
echo ""
echo "Save this backend URL for frontend deployment: $BACKEND_URL"
