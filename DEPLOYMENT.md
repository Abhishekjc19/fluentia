# Google Cloud Run Deployment Guide

## Prerequisites

1. **Install Google Cloud CLI**
   - Download: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
   - Run the installer
   - Restart your terminal after installation

2. **Create Google Cloud Project**
   - Go to: https://console.cloud.google.com
   - Click "Select a project" → "New Project"
   - Name: `fluentia-app`
   - Note your Project ID

3. **Enable Billing**
   - Required even for free tier
   - Go to: https://console.cloud.google.com/billing
   - Add a billing account (you won't be charged within free tier limits)

## Deployment Steps

### Step 1: Login to Google Cloud

```bash
gcloud auth login
```

This will open a browser - login with your Google account.

### Step 2: Deploy Backend

**Double-click:** `deploy-backend.bat`

Or run manually:
```bash
cd c:/Fluentia
./deploy-backend.bat
```

When prompted:
- Enter your Google Cloud Project ID
- Wait for deployment (5-10 minutes)
- **SAVE THE BACKEND URL** shown at the end

### Step 3: Add Backend Environment Variables

Create a file `backend-env.txt` in the Fluentia folder with your actual values:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your-super-secret-jwt-key-change-this
GEMINI_API_KEY=your_google_gemini_api_key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name
CORS_ORIGIN=*
```

Then run:
```bash
gcloud run services update fluentia-backend --region us-central1 --env-vars-file backend-env.txt
```

### Step 4: Deploy Frontend

**Double-click:** `deploy-frontend.bat`

When prompted:
- Enter your Google Cloud Project ID
- Enter the Backend URL from Step 2
- Wait for deployment (3-5 minutes)

### Step 5: Update Backend CORS

After frontend deploys, update backend to allow frontend URL:

```bash
gcloud run services update fluentia-backend --region us-central1 --update-env-vars="CORS_ORIGIN=YOUR_FRONTEND_URL"
```

Replace `YOUR_FRONTEND_URL` with the URL from Step 4.

## Your Deployed URLs

After deployment:
- **Frontend:** https://fluentia-frontend-xxxxx.run.app
- **Backend:** https://fluentia-backend-xxxxx.run.app

## Free Tier Limits

Google Cloud Run free tier includes:
- ✅ 2 million requests per month
- ✅ 360,000 GB-seconds of memory
- ✅ 180,000 vCPU-seconds of compute time
- ✅ 1 GB network egress per month

Perfect for demos and testing!

## Troubleshooting

**If deployment fails:**
1. Check if billing is enabled
2. Verify all APIs are enabled
3. Make sure you're in the correct project: `gcloud config get-value project`

**If app doesn't work:**
1. Check environment variables: `gcloud run services describe fluentia-backend --region us-central1`
2. View logs: https://console.cloud.google.com/run
3. Verify CORS settings in backend

## Re-deploying After Changes

Just push to GitHub and run the scripts again:
```bash
git add .
git commit -m "Update"
git push

# Then run deployment scripts again
./deploy-backend.bat
./deploy-frontend.bat
```

## Need Help?

Check logs in Google Cloud Console:
https://console.cloud.google.com/run
