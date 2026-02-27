# Vercel Deployment Guide for Fluentia Frontend

## Step 1: Update Frontend Environment Variables

Update `frontend/.env.production`:

```bash
VITE_API_URL=https://fluentia-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Fastest)

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy frontend:

```bash
cd frontend
vercel
```

4. Follow prompts:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `fluentia`
   - Directory? `./` (already in frontend folder)
   - Override settings? `N`

5. Production deploy:

```bash
vercel --prod
```

### Option B: Vercel Dashboard (Easiest)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New..." → "Project"
4. Import repository: `Abhishekjc19/fluentia`
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

6. **Environment Variables** (IMPORTANT):

   ```
   VITE_API_URL=https://fluentia-backend.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

7. Click **Deploy**

## Step 3: Update Backend CORS

After frontend deploy, update backend environment variables on Render:

1. Go to Render Dashboard → fluentia-backend
2. Environment → Add:
   ```
   FRONTEND_URL=https://fluentia.vercel.app
   ```
3. Service will auto-redeploy

## Step 4: Configure Google OAuth

Update Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add to **Authorized JavaScript origins**:
   ```
   https://fluentia.vercel.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://fluentia.vercel.app
   https://fluentia.vercel.app/dashboard
   ```
6. Save

## Step 5: Test Deployment

1. Visit: `https://fluentia.vercel.app`
2. Try signup/login
3. Test interview features
4. Check browser console for errors

## Vercel Configuration (vercel.json)

Your frontend already has vercel.json:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://fluentia-backend.onrender.com/api/:path*"
    },
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ]
}
```

This handles:

- API proxy to backend
- Client-side routing (React Router)

## Troubleshooting

### Issue: API calls fail

- Check VITE_API_URL is correct
- Verify backend is running: `curl https://fluentia-backend.onrender.com/api/warmup`
- Check browser Network tab for CORS errors

### Issue: Environment variables not working

- Vercel requires `VITE_` prefix for Vite apps
- Redeploy after adding env vars
- Clear cache: Deployments → ⋯ → Redeploy

### Issue: Google OAuth not working

- Verify JavaScript origins in Google Console
- Check VITE_GOOGLE_CLIENT_ID matches
- Clear browser cache and test

### Issue: Routes return 404

- Check vercel.json rewrites
- Verify output directory is `dist`

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain: `fluentia.yourdomain.com`
3. Add DNS records (Vercel provides instructions)
4. Update all OAuth and CORS URLs

## Free Tier Features

- ✅ Unlimited static hosting
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploy on git push
- ✅ Preview deployments for PRs

## Production Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on both
- [ ] CORS configured with frontend URL
- [ ] Google OAuth origins updated
- [ ] Test signup/login
- [ ] Test all features
- [ ] Monitor Render logs for errors

Your app will be live at:

- **Frontend**: https://fluentia.vercel.app
- **Backend**: https://fluentia-backend.onrender.com

🎉 **Deployment Complete!**
