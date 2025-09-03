# SilverScreen Deployment Guide

## Quick Start for Web Deployment

### Prerequisites
- GitHub repository: `jamespheffernan/SilverScreen`
- Netlify account
- Server deployed with API endpoints accessible

### Netlify Setup

1. **Connect Repository**
   ```
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Connect GitHub account
   - Select "jamespheffernan/SilverScreen"
   - Choose branch: "feat/web-netlify-stripe-js" (preview) or "main" (production)
   ```

2. **Build Configuration** (auto-detected from `netlify.toml`)
   ```
   Base directory: app
   Build command: npx expo export --platform web
   Publish directory: dist
   ```

3. **Environment Variables** (required)
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-server-url.com
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```

4. **Deploy and Test**
   - Netlify will auto-deploy on push
   - Note the Netlify URL (e.g., `https://amazing-app-123.netlify.app`)
   - Update server CORS with this URL

### Server CORS Update

Add your Netlify URL to the server's allowed origins:

```bash
# On your server host, set environment variable:
ALLOWED_ORIGINS=https://your-app.netlify.app,https://your-domain.com
```

### Testing Checklist

- [ ] Web app loads at Netlify URL
- [ ] Browse shows works (fixtures/demo mode)
- [ ] Seat selection works
- [ ] Checkout loads with Stripe Elements
- [ ] Test payment with `4242 4242 4242 4242`
- [ ] Confirmation screen shows order status

### Troubleshooting

**Build Fails:**
- Check Node.js version (18+ required)
- Verify `app/package.json` dependencies
- Check build logs for missing dependencies

**CORS Errors:**
- Verify `ALLOWED_ORIGINS` includes Netlify URL
- Check server logs for CORS configuration
- Ensure server is accessible from Netlify

**Stripe Errors:**
- Verify `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check publishable key format (`pk_test_...`)
- Ensure server has matching secret key

**API Errors:**
- Verify `EXPO_PUBLIC_API_BASE_URL` points to deployed server
- Check server health endpoint: `GET /health`
- Verify server CORS allows Netlify origin
