# Deployment Directory

This directory contains deployment configurations and guides for the Fluentia Mock Interview Platform.

## Contents

- **AWS-DEPLOYMENT.md** - Complete guide for deploying to AWS ECS
- **terraform/** - Infrastructure as Code (coming soon)
- **kubernetes/** - Kubernetes manifests (alternative deployment)

## Quick Start

### Using Docker Compose (Development/Local)

```bash
# From project root
docker-compose up --build
```

### AWS ECS Deployment

See [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md) for detailed instructions.

### Alternative Deployment Options

#### Heroku

```bash
# Backend
cd backend
heroku create fluentia-backend
git push heroku main

# Frontend
cd frontend
heroku create fluentia-frontend
git push heroku main
```

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

#### Vercel (Frontend) + Railway (Backend)

- Frontend: Deploy to Vercel
- Backend: Deploy to Railway
- Database: Supabase

## Environment Variables

Ensure all required environment variables are set in your deployment platform:

### Backend

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`

### Frontend

- `VITE_API_URL`

## Monitoring

Set up monitoring with:

- AWS CloudWatch
- Datadog
- New Relic
- Sentry for error tracking

## Scaling Considerations

- Use CDN for static assets
- Enable auto-scaling for ECS services
- Implement caching (Redis/ElastiCache)
- Database connection pooling
- Rate limiting
