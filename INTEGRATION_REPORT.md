# Integration report

## Verified

- React/Vite frontend builds from `apps/web`.
- Express API builds from `services/api`.
- SOS creation and in-memory incident listing.
- Browser geolocation payloads, with explicit no-coordinate fallback.
- Deterministic Haversine responder matching through `/api/map`.
- Browser localStorage SOS queue and reconnect/manual sync behavior.
- Deterministic agent decision endpoint.
- Deterministic demo reset, seed, and status endpoints.
- Configuration-gated x402-shaped HTTP 503/402 behavior with no false settlement claim.

## Not present or not independently verifiable

- No standalone `services/ai`, `services/x402`, `packages/*`, or `integration/` directories exist in this checkout.
- No AI provider/model endpoint or AI test suite is available.
- No configured GoPlausible facilitator, wallet, payment proof, or Algorand Testnet settlement was available locally.
- No automated test runner or test files are configured.
