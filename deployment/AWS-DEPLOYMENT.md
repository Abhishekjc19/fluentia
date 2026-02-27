# Fluentia AWS Deployment Guide

This guide will help you deploy the Fluentia Mock Interview Platform to AWS using Docker containers.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Docker installed locally
- Domain name (optional, for custom domain)

## Architecture

- **Frontend**: React app served via Nginx on AWS ECS/Fargate
- **Backend**: Node.js API on AWS ECS/Fargate
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: AWS S3 for video recordings
- **Container Registry**: AWS ECR
- **Load Balancer**: AWS Application Load Balancer
- **CDN**: AWS CloudFront (optional)

## Deployment Steps

### 1. Setup AWS Resources

#### Create ECR Repositories

```bash
# Create backend repository
aws ecr create-repository --repository-name fluentia-backend --region us-east-1

# Create frontend repository
aws ecr create-repository --repository-name fluentia-frontend --region us-east-1
```

#### Create S3 Bucket for Recordings

```bash
aws s3 mb s3://fluentia-recordings --region us-east-1

# Configure CORS
aws s3api put-bucket-cors --bucket fluentia-recordings --cors-configuration file://s3-cors.json
```

**s3-cors.json:**

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t fluentia-backend .
docker tag fluentia-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fluentia-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fluentia-backend:latest

# Build and push frontend
cd ../frontend
docker build -t fluentia-frontend .
docker tag fluentia-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fluentia-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fluentia-frontend:latest
```

### 3. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name fluentia-cluster --region us-east-1
```

### 4. Create Task Definitions

Create `backend-task-definition.json`:

```json
{
  "family": "fluentia-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fluentia-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "SUPABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:fluentia/supabase-url"
        },
        {
          "name": "SUPABASE_ANON_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:fluentia/supabase-key"
        },
        {
          "name": "GEMINI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:fluentia/gemini-key"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:fluentia/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fluentia-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definitions:

```bash
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

### 5. Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name fluentia-alb \
  --subnets subnet-XXXXX subnet-YYYYY \
  --security-groups sg-XXXXX \
  --scheme internet-facing

# Create target groups
aws elbv2 create-target-group \
  --name fluentia-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-XXXXX \
  --target-type ip

aws elbv2 create-target-group \
  --name fluentia-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-XXXXX \
  --target-type ip

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### 6. Create ECS Services

```bash
# Backend service
aws ecs create-service \
  --cluster fluentia-cluster \
  --service-name backend-service \
  --task-definition fluentia-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX,subnet-YYYYY],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3000

# Frontend service
aws ecs create-service \
  --cluster fluentia-cluster \
  --service-name frontend-service \
  --task-definition fluentia-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX,subnet-YYYYY],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=frontend,containerPort=80
```

### 7. Setup CloudFront (Optional)

For better performance and CDN capabilities:

```bash
aws cloudfront create-distribution --origin-domain-name your-alb-dns-name.amazonaws.com
```

### 8. Environment Variables in AWS Secrets Manager

Store sensitive credentials:

```bash
aws secretsmanager create-secret --name fluentia/supabase-url --secret-string "YOUR_SUPABASE_URL"
aws secretsmanager create-secret --name fluentia/supabase-key --secret-string "YOUR_SUPABASE_KEY"
aws secretsmanager create-secret --name fluentia/gemini-key --secret-string "YOUR_GEMINI_KEY"
aws secretsmanager create-secret --name fluentia/jwt-secret --secret-string "YOUR_JWT_SECRET"
```

## Monitoring

### CloudWatch Logs

View logs:

```bash
aws logs tail /ecs/fluentia-backend --follow
aws logs tail /ecs/fluentia-frontend --follow
```

### CloudWatch Metrics

Monitor:

- CPU utilization
- Memory utilization
- Request count
- Error rate

## Scaling

### Auto Scaling Configuration

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/fluentia-cluster/backend-service \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/fluentia-cluster/backend-service \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## CI/CD with GitHub Actions

See `.github/workflows/deploy.yml` for automated deployment pipeline.

## Cost Estimation

**Monthly costs (estimated):**

- ECS Fargate: $50-150 (depending on usage)
- ALB: $16-25
- S3: $5-20 (depending on storage)
- CloudFront: $0-50 (optional)
- Supabase: Free tier or $25+

**Total: ~$75-250/month**

## Security Best Practices

1. Use AWS Secrets Manager for sensitive data
2. Enable VPC Flow Logs
3. Use Security Groups to restrict access
4. Enable AWS WAF on ALB
5. Regular security audits with AWS Security Hub
6. Enable CloudTrail for audit logging

## Backup Strategy

1. Supabase handles database backups automatically
2. S3 versioning for video recordings
3. Regular ECS task definition backups

## Troubleshooting

### Check Service Status

```bash
aws ecs describe-services --cluster fluentia-cluster --services backend-service frontend-service
```

### View Task Logs

```bash
aws logs tail /ecs/fluentia-backend --follow
```

### Debug Container Issues

```bash
aws ecs describe-tasks --cluster fluentia-cluster --tasks TASK_ARN
```

## Support

For issues or questions, please refer to the main README.md or create an issue on GitHub.
