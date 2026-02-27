# Fluentia - Project Information

## Project Overview

**Fluentia** is an AI-powered mock interview platform designed to help students and job seekers practice and improve their interview skills. The platform provides realistic interview experiences with AI-generated questions, real-time evaluation, and detailed feedback.

## Technology Decisions

### Why React + TypeScript?

- **Type Safety**: Catch errors at compile time
- **Better DX**: Excellent IDE support and autocomplete
- **Maintainability**: Easier to refactor and scale
- **Community**: Large ecosystem and community support

### Why Supabase?

- **Quick Setup**: Managed PostgreSQL with built-in auth
- **Cost-Effective**: Generous free tier for development
- **Real-time**: Built-in real-time subscriptions
- **Security**: Row Level Security (RLS) out of the box

### Why Gemini AI?

- **Quality**: State-of-the-art language model
- **Free Tier**: Generous free quota for development
- **Versatility**: Can generate questions and evaluate answers
- **Easy Integration**: Simple API with good documentation

### Why AWS S3?

- **Scalability**: Handle any amount of video storage
- **Reliability**: 99.99% uptime SLA
- **Performance**: Fast uploads and downloads
- **Cost-Effective**: Pay only for what you use

### Why Docker?

- **Consistency**: Same environment across dev and production
- **Isolation**: Dependencies are containerized
- **Scalability**: Easy to scale with orchestration tools
- **Portability**: Deploy anywhere that supports Docker

## Architecture Decisions

### Frontend Architecture

- **Component-Based**: Modular, reusable components
- **State Management**: Zustand for simplicity and performance
- **Client-Side Routing**: React Router for SPA experience
- **API Layer**: Centralized API client with interceptors

### Backend Architecture

- **RESTful API**: Simple, well-understood, HTTP-based
- **Middleware Pattern**: Modular request processing
- **JWT Auth**: Stateless authentication
- **Error Handling**: Centralized error handling middleware

### Database Design

- **Normalized Schema**: Reduce data redundancy
- **Foreign Keys**: Maintain referential integrity
- **Indexes**: Optimize query performance
- **RLS Policies**: Row-level security for multi-tenancy

## Security Considerations

1. **Authentication**
   - Password hashing with bcrypt
   - JWT tokens with expiration
   - Secure token storage

2. **Authorization**
   - Protected API routes
   - Resource ownership verification
   - Role-based access control (future)

3. **Data Protection**
   - HTTPS in production
   - Environment variables for secrets
   - Input validation and sanitization
   - SQL injection prevention

4. **File Uploads**
   - File type validation
   - Size limits
   - Secure storage in S3
   - Presigned URLs for access

## Performance Optimizations

1. **Frontend**
   - Code splitting with Vite
   - Lazy loading of routes
   - Optimized bundle size
   - Image optimization

2. **Backend**
   - Database connection pooling
   - Query optimization
   - Caching strategies (future)
   - Rate limiting

3. **Infrastructure**
   - CDN for static assets
   - Container orchestration
   - Auto-scaling based on load
   - Load balancing

## Scalability Plan

### Phase 1: Current (Up to 1,000 users)

- Single backend instance
- Supabase free/pro tier
- Basic AWS S3 storage

### Phase 2: Growth (1,000 - 10,000 users)

- Multiple backend instances with load balancer
- Database read replicas
- CDN for static content
- Redis caching layer

### Phase 3: Scale (10,000+ users)

- Microservices architecture
- Message queue for async processing
- Dedicated database cluster
- Advanced caching strategies
- Multi-region deployment

## Cost Analysis

### Development Setup

- **Supabase**: Free tier
- **Gemini API**: Free tier (60 requests/minute)
- **Total**: $0/month

### Small Production (< 1,000 users)

- **AWS ECS**: ~$50/month
- **Supabase Pro**: $25/month
- **S3 Storage**: ~$10/month
- **Total**: ~$85/month

### Medium Production (1,000 - 10,000 users)

- **AWS ECS**: ~$150/month
- **Supabase Pro**: $25/month
- **S3 Storage**: ~$50/month
- **CloudFront**: ~$30/month
- **Total**: ~$255/month

## Future Enhancements

### Short Term (1-3 months)

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Profile picture upload
- [ ] Interview scheduling
- [ ] Export results as PDF

### Medium Term (3-6 months)

- [ ] Voice-to-text integration
- [ ] Video playback with timestamps
- [ ] Question bank management
- [ ] Admin dashboard
- [ ] Analytics and insights

### Long Term (6-12 months)

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Company-specific prep
- [ ] Peer-to-peer interviews
- [ ] Subscription plans
- [ ] White-label solution

## Known Limitations

1. **Browser Compatibility**
   - WebRTC required for camera/audio
   - Modern browsers only (Chrome, Firefox, Edge, Safari)

2. **Storage**
   - Video files can be large
   - Current limit: 100MB per recording

3. **AI Evaluation**
   - Subject to AI model limitations
   - May require human review for edge cases

4. **Real-time Features**
   - Currently polling-based
   - WebSocket implementation planned

## Monitoring & Maintenance

### What to Monitor

- Application uptime
- API response times
- Error rates
- Database performance
- Storage usage
- AI API quota usage

### Maintenance Tasks

- Regular dependency updates
- Security patches
- Database backups
- Log rotation
- Performance optimization

## Troubleshooting Common Issues

### Camera Not Working

- Check browser permissions
- Ensure HTTPS in production
- Verify WebRTC support

### AI API Errors

- Check API key validity
- Verify quota limits
- Review rate limits

### Database Connection Issues

- Verify Supabase credentials
- Check connection pool settings
- Review RLS policies

### Deployment Issues

- Verify environment variables
- Check Docker logs
- Review AWS CloudWatch logs

## Resources

### Documentation

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [AWS ECS Docs](https://docs.aws.amazon.com/ecs/)

### Community

- GitHub Issues: For bug reports and features
- GitHub Discussions: For questions and ideas
- Email: support@fluentia.in

## Credits

### Core Team

- Development Team
- UI/UX Design
- DevOps Engineering

### Technologies

- React Team
- Supabase Team
- Google AI Team
- AWS Team
- Open Source Community

---

**Last Updated**: February 26, 2026
**Version**: 1.0.0
