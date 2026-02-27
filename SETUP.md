# Quick Setup Guide

Follow these steps to get Fluentia running on your local machine.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- A Supabase account (free tier works)
- Google Gemini API key (free tier available)

## Step 1: Clone and Install

```bash
# Clone the repository (if from git)
git clone <your-repo-url>
cd Fluentia

# Install all dependencies
npm run install:all
```

## Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be created
3. Go to Settings > API to find your:
   - Project URL
   - Anon/Public Key
   - Service Role Key
4. Go to SQL Editor and run the schema from `backend/supabase/schema.sql`

## Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

## Step 4: Configure Environment Variables

### Backend Configuration

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

JWT_SECRET=your_random_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

# AWS Configuration (optional for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=fluentia-recordings

CORS_ORIGIN=http://localhost:5173
```

### Frontend Configuration

Create `frontend/.env`:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Fluentia Mock Interview
```

## Step 5: Run the Application

From the project root:

```bash
# Start both frontend and backend
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Step 7: Test the Application

1. Sign up for a new account
2. Log in with your credentials
3. Start a mock interview (Tech or HR)
4. Answer questions
5. View your results and feedback

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5173
npx kill-port 5173
```

### Camera/Microphone Not Working

- Ensure your browser has permission to access camera/microphone
- Use HTTPS in production (required by browsers)
- Check browser console for errors

### Supabase Connection Issues

- Verify your Supabase URL and keys are correct
- Check if your IP is allowed in Supabase settings
- Ensure the database schema is properly created

### Gemini API Issues

- Verify your API key is active
- Check API quota and rate limits
- Ensure you have a billing account set up if required

## Next Steps

1. Customize the interview questions logic
2. Add more interview types
3. Implement additional features
4. Deploy to production (see deployment/AWS-DEPLOYMENT.md)

## Support

For issues, check:

- Backend logs in terminal
- Browser console (F12)
- Network tab for API errors
- Supabase dashboard for database issues
