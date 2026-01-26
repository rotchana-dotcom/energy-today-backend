# Energy Today - Backend Deployment Guide

## Overview

The Energy Today backend can be deployed independently to any hosting provider without requiring frontend code changes. The frontend automatically detects and connects to the production backend via environment variables.

---

## Architecture

### Current Setup (Development)
- **Frontend**: Expo Metro bundler (port 8081)
- **Backend**: Express server (port 3000)
- **Database**: MySQL (managed by Manus platform)
- **Connection**: Frontend auto-detects backend on same sandbox

### Production Setup (After Deployment)
- **Frontend**: Expo app (iOS/Android via Expo Go or standalone build)
- **Backend**: Deployed to cloud provider (Heroku, Railway, Render, etc.)
- **Database**: Production MySQL (managed or self-hosted)
- **Connection**: Frontend connects via `EXPO_PUBLIC_API_BASE_URL` environment variable

---

## Backend Deployment Options

### Option 1: Railway (Recommended)
**Pros:** Easy setup, automatic deployments, built-in MySQL, affordable  
**Cons:** Limited free tier

**Steps:**
1. Create Railway account: https://railway.app
2. Create new project → Deploy from GitHub
3. Add MySQL database service
4. Set environment variables (see below)
5. Deploy backend code
6. Copy backend URL (e.g., `https://energy-today.up.railway.app`)

**Cost:** ~$5-20/month depending on usage

---

### Option 2: Heroku
**Pros:** Mature platform, good documentation, easy scaling  
**Cons:** No free tier, more expensive

**Steps:**
1. Create Heroku account: https://heroku.com
2. Install Heroku CLI
3. Create new app: `heroku create energy-today-api`
4. Add ClearDB MySQL addon: `heroku addons:create cleardb:ignite`
5. Set environment variables (see below)
6. Deploy: `git push heroku main`
7. Copy backend URL (e.g., `https://energy-today-api.herokuapp.com`)

**Cost:** ~$16-50/month (Eco dyno + database)

---

### Option 3: Render
**Pros:** Free tier available, simple setup, good performance  
**Cons:** Free tier has cold starts

**Steps:**
1. Create Render account: https://render.com
2. Create new Web Service → Connect GitHub
3. Add MySQL database (or use external)
4. Set environment variables (see below)
5. Deploy backend code
6. Copy backend URL (e.g., `https://energy-today.onrender.com`)

**Cost:** Free tier available, paid plans start at $7/month

---

### Option 4: DigitalOcean App Platform
**Pros:** Full control, good pricing, reliable  
**Cons:** More complex setup

**Steps:**
1. Create DigitalOcean account: https://digitalocean.com
2. Create new App → Connect GitHub
3. Add managed MySQL database
4. Set environment variables (see below)
5. Deploy backend code
6. Copy backend URL (e.g., `https://energy-today-api.ondigitalocean.app`)

**Cost:** ~$12-25/month (app + database)

---

## Environment Variables

### Backend Environment Variables (Production)

Set these on your hosting provider:

```bash
# Database Configuration
DATABASE_HOST=your-mysql-host.com
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=energy_today

# OAuth Configuration (from Manus platform)
EXPO_PUBLIC_OAUTH_PORTAL_URL=https://portal.manus.im
EXPO_PUBLIC_OAUTH_SERVER_URL=https://api.manus.im
EXPO_PUBLIC_APP_ID=your_app_id
EXPO_PUBLIC_OWNER_OPEN_ID=your_owner_open_id
EXPO_PUBLIC_OWNER_NAME=your_owner_name

# RevenueCat Configuration
REVENUECAT_API_KEY=goog_iOwMmlBttgbYUaklCFhazVSVUsP

# Node Environment
NODE_ENV=production
PORT=3000

# CORS Configuration (allow your app to connect)
ALLOWED_ORIGINS=https://kea.today,exp://,exps://

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_here_at_least_32_characters
```

### Frontend Environment Variables (EAS Build)

Set these in EAS Secrets or `.env`:

```bash
# Production Backend URL
EXPO_PUBLIC_API_BASE_URL=https://your-backend.herokuapp.com

# OAuth Configuration (same as backend)
EXPO_PUBLIC_OAUTH_PORTAL_URL=https://portal.manus.im
EXPO_PUBLIC_OAUTH_SERVER_URL=https://api.manus.im
EXPO_PUBLIC_APP_ID=your_app_id
EXPO_PUBLIC_OWNER_OPEN_ID=your_owner_open_id
EXPO_PUBLIC_OWNER_NAME=your_owner_name
```

---

## Deployment Steps

### 1. Prepare Backend Code

The backend is already production-ready in the `server/` directory. No code changes needed!

**Backend Structure:**
```
server/
├── _core/
│   ├── index.ts          # Main server entry point
│   ├── db.ts             # Database connection
│   └── trpc.ts           # tRPC configuration
├── routers.ts            # API routes
├── *-router.ts           # Feature routers
└── README.md             # Backend documentation
```

### 2. Set Up Database

**Option A: Use Hosting Provider's Database**
- Railway, Heroku, Render all offer managed MySQL
- Automatically sets `DATABASE_URL` environment variable
- No manual configuration needed

**Option B: External Database (PlanetScale, AWS RDS, etc.)**
- Create MySQL database
- Get connection details (host, port, user, password, database name)
- Set environment variables manually

### 3. Deploy Backend

**Using Railway (Example):**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Link to GitHub repo (or deploy directly)
railway link

# 5. Set environment variables
railway variables set DATABASE_HOST=your-host
railway variables set DATABASE_USER=your-user
# ... (set all variables from above)

# 6. Deploy
railway up

# 7. Get backend URL
railway domain
```

**Using Heroku (Example):**
```bash
# 1. Install Heroku CLI
brew install heroku/brew/heroku  # macOS
# or download from heroku.com

# 2. Login
heroku login

# 3. Create app
heroku create energy-today-api

# 4. Add MySQL addon
heroku addons:create cleardb:ignite

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set REVENUECAT_API_KEY=goog_iOwMmlBttgbYUaklCFhazVSVUsP
# ... (set all variables from above)

# 6. Deploy
git push heroku main

# 7. Get backend URL
heroku info
```

### 4. Run Database Migrations

After deploying backend, run migrations to create tables:

```bash
# Railway
railway run pnpm db:push

# Heroku
heroku run pnpm db:push

# Or connect to database and run SQL manually
```

### 5. Configure Frontend

**Option A: Set in EAS Secrets (Recommended)**
```bash
# Set production backend URL
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://your-backend.herokuapp.com --type string

# Verify
eas secret:list
```

**Option B: Set in `.env` file**
```bash
# Create .env file in project root
echo "EXPO_PUBLIC_API_BASE_URL=https://your-backend.herokuapp.com" > .env
```

### 6. Build and Test

```bash
# Build new version with production backend
eas build --platform android --profile production

# Test the app
# - Download AAB from EAS
# - Upload to Google Play Internal Testing
# - Install and verify backend connectivity
```

---

## Verification Checklist

After deployment, verify everything works:

### Backend Health Check
- [ ] Backend URL is accessible: `https://your-backend.com`
- [ ] Health endpoint works: `https://your-backend.com/health`
- [ ] Database connection successful
- [ ] Environment variables set correctly

### Frontend Connectivity
- [ ] App connects to production backend (check console logs)
- [ ] User can log in (OAuth flow works)
- [ ] Energy calculations work
- [ ] Subscription status loads correctly
- [ ] Pro features unlock after purchase

### API Endpoints
- [ ] tRPC endpoints respond: `https://your-backend.com/api/trpc`
- [ ] OAuth callback works: `https://your-backend.com/api/oauth/callback`
- [ ] RevenueCat webhook works: `https://your-backend.com/api/revenuecat/webhook`

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution 1: Check environment variable**
```bash
# Verify EXPO_PUBLIC_API_BASE_URL is set
eas secret:list

# Or check in app console logs:
# [API] Using configured backend: https://...
```

**Solution 2: Check CORS settings**
```typescript
// In server/_core/index.ts, ensure CORS allows your app
app.use(cors({
  origin: ['https://kea.today', 'exp://', 'exps://'],
  credentials: true,
}));
```

### Issue: Database connection fails

**Solution: Check database credentials**
```bash
# Test database connection
mysql -h your-host -u your-user -p your-database

# Or check environment variables
railway variables list  # Railway
heroku config          # Heroku
```

### Issue: OAuth login doesn't work

**Solution: Verify OAuth configuration**
```bash
# Ensure these match between frontend and backend:
# - EXPO_PUBLIC_OAUTH_PORTAL_URL
# - EXPO_PUBLIC_OAUTH_SERVER_URL
# - EXPO_PUBLIC_APP_ID
```

### Issue: RevenueCat webhook fails

**Solution: Update webhook URL in RevenueCat dashboard**
1. Go to RevenueCat dashboard
2. Settings → Integrations → Webhooks
3. Update URL to: `https://your-backend.com/api/revenuecat/webhook`
4. Test webhook delivery

---

## Monitoring & Maintenance

### Recommended Monitoring Tools
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging
- **Datadog**: Infrastructure monitoring
- **UptimeRobot**: Uptime monitoring (free tier available)

### Regular Maintenance Tasks
- [ ] Monitor error rates (Sentry)
- [ ] Check database performance
- [ ] Review API response times
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Review server logs for issues

---

## Scaling Considerations

### When to Scale

**Scale backend when:**
- Response times > 500ms consistently
- CPU usage > 80% regularly
- Memory usage > 90%
- Database connections maxed out
- Error rate > 1%

### Scaling Options

**Vertical Scaling (Easier):**
- Upgrade to larger dyno/instance
- Increase database resources
- Add more RAM/CPU

**Horizontal Scaling (Better long-term):**
- Add more backend instances
- Use load balancer
- Implement caching (Redis)
- Use CDN for static assets

---

## Cost Estimates

### Small Scale (0-1,000 users)
- Backend: $5-15/month (Railway/Render)
- Database: Included or $5/month
- **Total: ~$10-20/month**

### Medium Scale (1,000-10,000 users)
- Backend: $20-50/month (multiple instances)
- Database: $15-30/month (larger instance)
- Monitoring: $10/month (Sentry)
- **Total: ~$45-90/month**

### Large Scale (10,000+ users)
- Backend: $100-300/month (auto-scaling)
- Database: $50-150/month (managed cluster)
- Monitoring: $30/month
- CDN: $20/month
- **Total: ~$200-500/month**

---

## Security Best Practices

### Before Production
- [ ] Use HTTPS only (no HTTP)
- [ ] Set strong `SESSION_SECRET` (32+ characters)
- [ ] Enable rate limiting on API endpoints
- [ ] Validate all user inputs
- [ ] Use parameterized queries (already done with Drizzle)
- [ ] Keep dependencies updated
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

### Environment Variables Security
- [ ] Never commit `.env` files to Git
- [ ] Use EAS Secrets for sensitive values
- [ ] Rotate secrets regularly (every 90 days)
- [ ] Use different secrets for dev/staging/production

---

## Next Steps

1. **Choose hosting provider** (Railway recommended for ease of use)
2. **Set up database** (managed MySQL from hosting provider)
3. **Deploy backend** (follow steps above)
4. **Configure frontend** (set `EXPO_PUBLIC_API_BASE_URL`)
5. **Build new version** (with production backend)
6. **Test thoroughly** (verify all features work)
7. **Monitor and maintain** (set up monitoring tools)

---

## Support

If you encounter issues during deployment:

1. Check backend logs on hosting provider
2. Verify all environment variables are set correctly
3. Test database connection separately
4. Check CORS configuration
5. Review this guide's troubleshooting section

For additional help, contact support@kea.today with:
- Hosting provider name
- Error messages from logs
- Steps you've already tried
