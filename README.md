# SilverScreen — MVP Collaborative Movie Booking

This repository contains a mobile-first MVP for collaborative movie booking.

- App: React Native (Expo) under `app/`
- Server: Fastify/Node with Prisma, BullMQ, Playwright under `server/`
- Infra: Docker Compose for Postgres + Redis under `infra/`

See `docs/implementation-plan/mvp-collaborative-movie-booking.md` for the current plan and status.

## Running locally

Server:
- cd server
- npm install
- npm run dev

App (Expo):
- cd app
- npm install
- npx expo start

API base URL is http://localhost:3001 by default

## Environment

Server (.env):
- PORT=3001
- LOG_LEVEL=info
- TARGET_CHAIN=CHAIN_X
- TARGET_CITY=NYC
- POSTGRES_URL=postgres://postgres:postgres@localhost:5432/silverscreen
- REDIS_URL=redis://localhost:6379
- SCRAPER_USER_AGENT=SilverScreenBot/0.1
- STRIPE_SECRET_KEY=sk_test_...
- STRIPE_WEBHOOK_SECRET=whsec_...
- DEMO_MODE=true  # short-circuit purchase flow in /confirm
- SCRAPE_SOURCE=fixtures|live  # default scrape source; can override with ?source=live

App (.env):
- EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
- EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_12345

## Demo Mode & Live Scraping
- Demo Mode: set DEMO_MODE=true; /confirm marks purchased without queue
- Live: append ?source=live to /shows and /shows/:id/seatmap or set SCRAPE_SOURCE=live

## CI
- GitHub Actions runs server tests in demo mode on PRs
 (adjust in app/src/api/client.ts).
