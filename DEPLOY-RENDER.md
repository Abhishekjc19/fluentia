# Render Deployment Guide for Fluentia Backend

## Step 1: Prepare Backend for Deployment

### Create render.yaml (for automatic deploy)

Already exists in root directory ✓

### Set Build Commands

- Build Command: `cd backend && npm install && npm run build`
- Start Command: `cd backend && npm start`

## Step 2: Deploy to Render

### Option A: Via Render Dashboard (Easiest)

1. Go to [https://render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: `Abhishekjc19/fluentia`
5. Configure:
   - **Name**: `fluentia-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Option B: Via render.yaml (Automated)

1. Push your code to GitHub
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect repository: `Abhishekjc19/fluentia`
5. Render will auto-detect render.yaml and deploy both services

## Step 3: Set Environment Variables

In Render Dashboard → Your Service → Environment:

```bash
NODE_ENV=production
PORT=5000 (Render auto-sets this)

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL (IMPORTANT for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app

# AWS (if using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
```

## Step 4: Update CORS in server.ts

Make sure backend/src/server.ts has:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://fluentia.vercel.app', // Your Vercel URL
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

## Step 5: Deploy!

1. Push to GitHub:

   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. Render will auto-deploy (takes 5-10 minutes)

3. Your backend URL: `https://fluentia-backend.onrender.com`

## Step 6: Test Deployment

```bash
curl https://fluentia-backend.onrender.com/api/warmup
```

Should return: `{"status":"ok","message":"Server is ready"}`

## Troubleshooting

### Issue: Build fails

- Check Render logs
- Verify package.json has correct scripts
- Ensure all dependencies are in package.json

### Issue: Server crashes

- Check Render logs for errors
- Verify environment variables are set
- Check Supabase connection

### Issue: CORS errors

- Update FRONTEND_URL in env variables
- Update CORS config in server.ts
- Redeploy

## Free Tier Limits

- ✅ 750 hours/month free
- ✅ Auto-sleeps after 15 minutes of inactivity
- ⚠️ Cold starts take 30-50 seconds
- ✅ Unlimited bandwidth

## Next: Deploy Frontend to Vercel

See DEPLOY-VERCEL.md
