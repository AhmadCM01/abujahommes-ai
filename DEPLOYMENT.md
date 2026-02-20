# Deployment Guide for AbujaHommes AI

## 🚀 Deployment Options

### 1. Vercel (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Next.js framework
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Environment Variables
- `NEXT_PUBLIC_APP_URL`: Your production URL
- Any other API keys or secrets

### 2. Netlify

#### Prerequisites
- Netlify account
- Build command: `npm run build`
- Publish directory: `.next`

#### Deployment Steps
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

### 3. AWS Amplify

#### Prerequisites
- AWS account
- Amplify console access

#### Deployment Steps
1. Go to AWS Amplify console
2. Connect GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Base directory: `/`
   - Start command: `npm start`
4. Add environment variables
5. Deploy

### 4. Docker Deployment

#### Build Docker Image
```bash
# Build the image
docker build -t abujahommes-ai .

# Run the container
docker run -p 3000:3000 abujahommes-ai
```

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 5. Traditional Server (VPS/Dedicated)

#### Prerequisites
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy (optional)

#### Deployment Steps
1. Clone repository
```bash
git clone <repository-url>
cd abujahommes-ai
```

2. Install dependencies
```bash
npm install --production
```

3. Build the application
```bash
npm run build
```

4. Start with PM2
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "abujahommes-ai" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

5. Configure Nginx (optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# API Keys (if using external services)
API_KEY=your_api_key

# Database (if applicable)
DATABASE_URL=your_database_url
```

### Development Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
# Start development server
npm run dev
```

## 📊 Performance Optimization

### Build Optimization
- Next.js automatically optimizes bundles
- Images are optimized with next/image
- CSS is purged with Tailwind CSS

### Caching Strategy
- Static assets cached for 1 year
- API responses cached for 24 hours
- Pages cached based on ISR settings

### CDN Configuration
- Configure CDN for static assets
- Enable gzip compression
- Set up proper cache headers

## 🔍 Monitoring and Analytics

### Performance Monitoring
- Vercel Analytics (if using Vercel)
- Google Analytics
- Sentry for error tracking

### Lighthouse CI
- Automated performance testing
- Accessibility checks
- SEO optimization validation

### Health Checks
```bash
# Check if application is running
curl http://localhost:3000/api/health

# Check PM2 status
pm2 status
```

## 🔄 CI/CD Pipeline

### GitHub Actions
- Automatic testing on pull requests
- Build and deploy on merge to main
- Performance testing with Lighthouse CI

### Branch Strategy
- `main` - Production
- `develop` - Staging
- `feature/*` - Development branches

### Rollback Strategy
- Keep previous deployments
- Quick rollback procedures
- Database migration safety

## 🛡️ Security Considerations

### Environment Security
- Use secrets for sensitive data
- Rotate API keys regularly
- Enable HTTPS in production

### Application Security
- Input validation
- Rate limiting
- CORS configuration
- Security headers

### Monitoring
- Error tracking
- Performance monitoring
- Security scanning

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Optimized images for mobile

### Performance
- Lazy loading
- Code splitting
- Service worker for PWA

## 🚀 Post-Deployment Checklist

### Immediate Checks
- [ ] Application loads correctly
- [ ] All pages are accessible
- [ ] Forms are working
- [ ] API endpoints responding
- [ ] Database connections working

### Performance Checks
- [ ] Page load times under 3 seconds
- [ ] Lighthouse score above 80
- [ ] Core Web Vitals passing
- [ ] Mobile performance acceptable

### Security Checks
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] No exposed sensitive data
- [ ] Rate limiting active

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Analytics installed
- [ ] Uptime monitoring active
- [ ] Performance monitoring setup

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies installed
- Check for TypeScript errors
- Validate environment variables

#### Runtime Errors
- Check server logs
- Verify database connections
- Validate API configurations
- Check memory usage

#### Performance Issues
- Analyze bundle size
- Check image optimization
- Verify caching configuration
- Monitor database queries

### Getting Help
- Check documentation
- Review error logs
- Contact hosting support
- Consult community forums

---

**Note**: Always test deployments in a staging environment before deploying to production.
