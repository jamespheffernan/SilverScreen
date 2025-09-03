# Implementation Plan — Live Web (Netlify) with stripe-js

- Branch Name: `feat/web-netlify-stripe-js`
- Depends on: `mvp-collaborative-movie-booking` (merged)

## Background and Motivation
We have a functional MVP (mobile-first) with a server API. To make a web-accessible demo quickly, we will deploy the Expo Web build to Netlify and integrate stripe-js (react-stripe-js) for card entry on web (RN’s Stripe SDK doesn’t support web). The server will continue to create PaymentIntents and confirm on client (web) using stripe-js Elements, then `/confirm` to proceed purchase automation (demo-mode or queue).

## Goals
- Public Netlify site serving the Expo web build
- Web checkout flow using stripe-js Card Element (Stripe test mode)
- Server CORS configured for the Netlify domain
- Environment variables properly configured in Netlify for API base URL and Stripe publishable key

## Constraints & Guardrails
- PCI SAQ-A: card data handled only by Stripe Elements; no card data stored or proxied by our server
- Keep DEMO_MODE available for staged demos
- Rate limit scraping; default to fixtures in production until approved

## Success Criteria (Acceptance)
- Web: Successful end-to-end test with Stripe test card (4242…) from Browse → Seat Map → Checkout (stripe-js) → Confirmation
- Netlify: Green deploy on main; site accessible over HTTPS under our chosen domain
- CORS: API accepts requests from Netlify domain; errors include x-request-id for debugging
- Observability: /metrics reachable (protected by obscurity for now); logs visible on host

## High-level Task Breakdown
1) Create branch and scaffold
- Steps: create `feat/web-netlify-stripe-js` from main; open draft PR.
- Success: Branch + draft PR.

2) Add stripe-js web checkout path
- Steps: introduce `@stripe/stripe-js` and `@stripe/react-stripe-js` in `app` for web-only path; gate with `Platform.OS === 'web'` or code-split a `CheckoutWeb` component; call `loadStripe(EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY)`, wrap in `<Elements>`, use `<CardElement>` and `stripe.confirmCardPayment(clientSecret)`.
- Success: Web-only path triggers stripe-js, native path stays on RN SDK.

3) Configure Expo Web build for Netlify
- Steps: add `netlify.toml` with build command `npx expo export --platform web` and publish dir `dist`; ensure `EXPO_PUBLIC_*` env read at build; add a 404 redirect to index.html.
- Success: Local `npx expo export -p web` produces `dist/` with working app.

4) CORS and env
- Steps: set allowed origins (temporarily `origin: true` is permissive; optionally restrict to Netlify domain later); document Netlify env `EXPO_PUBLIC_API_BASE_URL` and Stripe publishable key; keep server env in host.
- Success: API calls succeed from Netlify origin.

5) Netlify deploy setup
- Steps: connect GitHub repo; set build command and publish directory; add environment variables; create preview & production contexts; optionally add GitHub Action for deploy.
- Success: Deploy previews on PRs; production on main.

6) End-to-end validation (staging to prod)
- Steps: Verify end-to-end on Netlify preview with `DEMO_MODE=true` first; then with Stripe test mode end-to-end; confirm order transitions; verify polling on confirmation.
- Success: Document test run and checklist.

## Project Status Board
- [ ] 1) Branch + draft PR
- [ ] 2) stripe-js web checkout path
- [ ] 3) Expo Web build config + netlify.toml
- [ ] 4) CORS restrictions & Netlify env
- [ ] 5) Netlify deploy (preview + prod)
- [ ] 6) E2E validation (demo-mode and Stripe test mode)

## Environment & Secrets
- Netlify (app):
  - `EXPO_PUBLIC_API_BASE_URL=https://api.example.com` (or server host)
  - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…`
- Server (host):
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `POSTGRES_URL`, `REDIS_URL`, `DEMO_MODE`, `SCRAPE_SOURCE`, `TARGET_CHAIN`, `TARGET_CITY`, `SCRAPER_USER_AGENT`

## Risks & Mitigations
- Stripe-js misconfig: ensure publishable key present in Netlify; log confirm errors to surface message
- CORS blocks: keep permissive during early staging; restrict later
- Expo Web routing: use 200 rewrite in Netlify to serve SPA
- Playwright on host: disabled in prod by default (fixtures) until approved; enable via `source=live` or environment

## Testing Plan
- Unit: Web-specific checkout utility to format errors
- Integration: In-browser test of stripe-js flow on preview
- E2E: Re-run server E2E locally; manual E2E on preview with Stripe test card; verify `x-request-id` for failures

## Rollout
- Preview: Deploy draft PR; sanity check
- Production: Merge to main; Netlify production deploy; run a supervised test booking (test mode)
