# SilverScreen Deployment Guide

## Current Deployments

### Frontend (Netlify)
- **URL**: Your Netlify URL (e.g., https://your-app.netlify.app)
- **Auto-deploy**: Triggered on push to `main` branch
- **Build command**: `npx expo export --platform web`
- **Environment**: Production API URL is set in `netlify.toml`

### Backend API (Render)
- **URL**: https://silverscreen-1.onrender.com
- **Auto-deploy**: Triggered on push to `main` branch
- **Service type**: Web Service
- **Build command**: `npm ci && npx playwright install chromium && npm run build`
- **Start command**: `npm start`

## Environment Variables

### Frontend (Netlify)
Set in `netlify.toml`:
```toml
EXPO_PUBLIC_API_BASE_URL = "https://silverscreen-1.onrender.com"
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_..." # Optional, for Stripe
```

### Backend (Render)
Set in Render dashboard:
```bash
# Optional - if not set, uses in-memory storage and synchronous processing
POSTGRES_URL=postgresql://...
REDIS_URL=redis://...

# Stripe (optional for test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server configuration
PORT=3001  # Render sets this automatically
LOG_LEVEL=info

# Scraping configuration
TARGET_CITY=NYC
SCRAPE_SOURCE=fixtures  # Use 'live' for real scraping
```

## Local Development

### Frontend
```bash
cd app
npm install
npm start  # Starts Expo development server
# Press 'w' for web
```

### Backend
```bash
cd server
npm install
npm run build
npm start  # Starts on port 3001
```

### Environment Files
- Copy `app/env.example` to `app/.env.local` for frontend
- Copy `server/env.example` to `server/.env` for backend

## Testing the Deployment

### API Health Check
```bash
curl https://silverscreen-1.onrender.com/metrics
```

### Get Shows
```bash
curl "https://silverscreen-1.onrender.com/shows?city=NYC&date=2025-08-14"
```

### Frontend
Visit your Netlify URL and verify:
1. Shows load on the browse screen
2. Can select seats on the seat map
3. Checkout flow works (test mode)

## Troubleshooting

### CORS Issues
- The API allows all origins by default for MVP
- To restrict, set `ALLOWED_ORIGINS` env var on Render

### Redis Connection Errors
- Redis is optional - the app works without it
- Purchase jobs run synchronously without Redis
- To use Redis, set `REDIS_URL` on Render

### Module Not Found Errors
- Ensure all imports have `.js` extensions
- TypeScript compiles to ES modules which require extensions

### Stripe API Version Errors
- Current version: `2025-07-30.basil`
- Update in `server/src/api/checkout.ts` if needed

## Deployment Checklist

- [ ] Push code to `main` branch
- [ ] Wait for Render build to complete (~3-5 minutes)
- [ ] Verify API at https://silverscreen-1.onrender.com/metrics
- [ ] Wait for Netlify build to complete (~2-3 minutes)
- [ ] Test frontend functionality
- [ ] Check logs for any errors