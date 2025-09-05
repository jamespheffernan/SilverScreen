## SilverScreen Scratchpad

### References
- Implementation detail: `docs/implementation-plan/mvp-collaborative-movie-booking.md`
- Implementation detail: `docs/implementation-plan/fix-checkoutweb-duplicate-imports.md`
- Source brief: `initial briefing for silverscreen app.rtf`

### Background and Motivation (from brief)
- Ship a working mobile MVP enabling a host to browse shows, view live seat availability, select seats for a group, pay with a single card (test mode), and receive a confirmation payload.
- Target: one cinema chain in one city (US/UK), mobile-first.

### Constraints & Guardrails
- Data access: scrape only, low volume, respect robots.txt, backoff, cache, cease on block.
- Payments: Stripe test mode, SAQ-A, no card data on our servers.
- Compliance: UK SCA support, single-buyer only, no money transmission.
- Time: 1-week build with AI assist.

### Success Criteria (MVP-1 Definition of Done)
- >= 5 successful end-to-end bookings in internal/beta.
- >= 90% successful seat-map loads for supported shows.
- <= 2 min median time from show selection to confirmation.
- Crash-free sessions >= 99% in beta cohort.

### Current Understanding & Assumptions
- Single provider and city (placeholder `CHAIN_X` in `TARGET_CITY`).
- React Native (Expo) app: Browse → SeatMap → Checkout → Confirmation.
- Fastify/Node API; Playwright scraper; BullMQ/Redis queue; Postgres/Prisma DB.
- Telemetry: Sentry/Crashlytics (app), pino + OpenTelemetry (API).
- Demo mode will use fixtures to showcase flows without live scraping.

### Open Questions for Product/Legal
- Which exact chain and city to target first (public site URL)?
- Are there brand/UX requirements for the app’s initial theme and logo?
- Should demo mode be the default for early demos? Toggle location?
- Hosting targets for API and DB during MVP (local vs. cloud)?
- Any copy/legal text required at checkout (refund policy, terms)?

### Risks (build-time) to track
- Scraper brittleness (selectors drift) → helper abstraction + fixtures.
- Seat drift → revalidate availability immediately before purchase.
- Payment/purchase race → refund PI on automation failure in MVP.
- Vendor block → cap RPS, aggressive backoff, cache seat maps (<=60s).

### Links to Implementation Docs
- See `docs/implementation-plan/mvp-collaborative-movie-booking.md` for detailed plan, tasks, and status board.

### Lessons Learned
- [YYYY-MM-DD] …

### Running Notes
- Keep chain-specific logic isolated under `server/src/scrapers/chainX/*` for swapability.
- Instrument everything to inform fee introduction and split-pay in MVP-2.
- Maintain fixture sets for deterministic tests and demo mode.
