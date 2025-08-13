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

API base URL is http://localhost:3001 by default (adjust in app/src/api/client.ts).
