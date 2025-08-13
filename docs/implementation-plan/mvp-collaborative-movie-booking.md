# Implementation Plan — MVP Collaborative Movie Booking

- Branch Name: `mvp-collaborative-movie-booking`
- Related: `initial briefing for silverscreen app.rtf`

## Background and Motivation
Ship a mobile-first MVP that lets a host browse a single chain in one city, view live seat availability, select seats for a group, pay with a single card (Stripe test mode), and receive a confirmation payload. Scope excludes split-pay, multi-chain, loyalty, chat, and calendar sync.

## Constraints & Guardrails
- Scraping only, low volume, respect robots.txt; exponential backoff; caching; cease on block.
- Stripe test mode, SAQ-A; no card data on our servers.
- UK SCA supported; single-buyer; no money transmission.
- 1-week build with AI assist.

## Definition of Done (Acceptance Criteria)
- >= 5 successful end-to-end bookings by internal/beta users (browse → seat map → pay → confirmation).
- >= 90% successful seat-map loads for supported shows.
- <= 2 min median time from show selection to purchase confirmation.
- Crash-free sessions >= 99% (Crashlytics). 

## Key Challenges and Analysis
- Scraper brittleness and vendor changes: selector abstraction, fixtures, retry/backoff.
- Seat map normalization and merged pricing; stable seat codes; validation for duplicates/bounds.
- Payment sequencing and races: idempotency; refund-on-failure for MVP.
- UK SCA and wallets later; use Stripe automatic payment methods in test mode.
- Queueing with retries/backoff and circuit breaker patterns for purchase worker.
- Demo mode via fixtures to enable deterministic demos and E2E tests offline.
- Observability across app/API/worker; correlate request/job IDs; basic alert thresholds.

## High-level Task Breakdown
1) Create feature branch
- Steps: create branch `mvp-collaborative-movie-booking` from `main`; open draft PR early.
- Success: branch exists; CI runs; draft PR open with checklist.

2) Repo scaffold (docs + monorepo layout)
- Steps: add `app/` (Expo RN) and `server/` (Fastify/Prisma/BullMQ/Playwright) skeletons; `infra/` docker-compose for Postgres+Redis; root README.
- Success: both apps build locally; docker-compose boots services.

3) API: `GET /shows` using mocked data
- Steps: implement route returning `Show[]` from in-repo fixture; cache layer stub; types.
- Success: returns paged list for `TARGET_CITY`; unit test from fixture.

4) App: Browse screen wired to `/shows`
- Steps: RN screen with movie list and showtimes; simple styling; error/loading states.
- Success: can select a showtime to navigate to Seat Map.

5) Scraper: shows (Playwright) + cache
- Steps: implement `scrapeShows(city,date)` with retry/backoff and selector helper; persist to DB; cache <=15 min.
- Success: integration test writes normalized `Show[]` to DB; `/shows` serves cached data.

6) API: `GET /shows/:id/seatmap` with fixture
- Steps: route returning `SeatMap` from fixture; SWR policy; validator for duplicates/bounds.
- Success: RN Seat Map renders with correct rows/cols and disabled sold seats.

7) App: Seat Map + selection state
- Steps: `SeatGrid` component; selection toggling; price summary; proceed CTA.
- Success: selection preserved; amount computed client-side for display only.

8) Payments: `/checkout` (server) + RN Stripe integration (test mode)
- Steps: compute totals from DB; create PaymentIntent; return client secret; RN uses CardField + confirmPayment.
- Success: test card 4242 flow succeeds; order state=paid.

9) Confirmation enqueue: `/confirm` and BullMQ worker scaffold
- Steps: POST `/confirm` enqueues `purchase:execute`; worker loads order; no-op success path for now.
- Success: order transitions to `purchased` in mock path; RN Confirmation screen shows placeholder.

10) Purchase automation (happy path)
- Steps: Playwright `performPurchase` against target site (demo-mode fixture first); parse confirmation id; update order.
- Success: order has `confirmation.externalOrderId`; refund-on-failure path covered by tests.

11) Webhooks, robustness, and E2E
- Steps: Stripe webhook handler for PI succeeded/failed; end-to-end tests using fixtures; telemetry; basic alerts.
- Success: green test suite; demo mode togglable; observability in place.

Note: Execute one step at a time in Executor mode; do not proceed until success criteria met and documented.

## Data Model (TypeScript snapshot)
- `Money`, `SeatStatus`, `Venue`, `Show`, `Seat`, `SeatMap`, `Order` as defined in the brief.

## API Surface (MVP-1)
- `GET /shows?city=...&date=...` → `Show[]` (cached <=15m)
- `GET /shows/:id/seatmap` → `SeatMap` (fresh <=60s; SWR)
- `POST /checkout` → `{ clientSecret, orderId, amount, currency }`
- `POST /confirm` → `{ status: 'queued' }`
- `POST /webhooks/stripe`

## Environment & Secrets
- `POSTGRES_URL`, `REDIS_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TARGET_CHAIN`, `TARGET_CITY`, `SCRAPER_USER_AGENT`.

## Project Status Board
- [x] 1) Create feature branch and draft PR (branch created; PR pending remote)
- [ ] 2) Scaffold repo structure (`app/`, `server/`, `infra/`, docs)
- [ ] 3) API `/shows` with fixture
- [ ] 4) RN Browse screen
- [ ] 5) Scraper shows + cache
- [ ] 6) API seatmap with fixture
- [ ] 7) RN Seat Map + selection
- [ ] 8) Payments checkout (server + RN)
- [ ] 9) Confirm enqueue + worker scaffold
- [ ] 10) Purchase automation (happy path)
- [ ] 11) Webhooks, E2E, telemetry

## Current Status / Progress Tracking
- Local git repo initialized; feature branch `mvp-collaborative-movie-booking` created.
- Draft PR: pending remote setup. Once remote is configured, open as draft via GitHub CLI.
- Next (Executor): Task 2 - scaffold repo (`app/`, `server/`, `infra/`, docs) and commit.

## Executor's Feedback or Assistance Requests
- Provide GitHub remote URL (or run `gh repo create` flow) to push branch and open PR.
- Confirm target chain and city for fixtures.

## Lessons Learned
- TBA

## Risks & Mitigations
- Vendor block → rate limit <=0.2 RPS; backoff; halt on 403/robots.
- Seat drift → revalidate availability just before purchase.
- Payment/purchase race → idempotency and refund-on-failure in MVP.

## Week-1 Outline (aligns with brief)
- Day 1: scaffold + `/shows` fixture + RN skeleton + Prisma schema
- Day 2: scrape shows + normalize + cache + RN Browse wiring
- Day 3: seat map capture + normalization + `SeatGrid`
- Day 4: Stripe checkout + webhooks + order model
- Day 5: purchase worker + retries/backoff + confirmation
- Day 6: E2E fixtures; error UX; Crashlytics; load test seatmap
- Day 7: polish; docs; run supervised demo bookings
