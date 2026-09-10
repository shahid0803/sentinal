# SENTINEL

Connecting Help When Networks Fail.

## Current MVP

This repository contains the verified hackathon MVP:

- `apps/web/` — React, TypeScript, and Vite emergency operations UI.
- `services/api/` — Express API with SOS incidents, deterministic responder matching, offline/demo status, agent decisions, and configuration-gated x402 status.
- `docs/COPILOT_INITIAL_AUDIT.md` — initial repository audit.

The current checkout does not contain standalone AI, x402, shared-package, geospatial-package, offline-package, security-package, or integration directories. Those boundaries are represented as explicit placeholders or API behavior in the MVP and are documented in `RELEASE_CHECKLIST.md`.

## Run locally

```powershell
npm install
npm run build:all
npm run start:api
```

In another terminal:

```powershell
npm run dev
```

The API listens on `http://localhost:8787` by default. The frontend uses `VITE_API_BASE_URL` when provided and otherwise defaults to that URL. Copy `.env.example` to `.env` for local configuration; never commit `.env`.

## Demo boundaries

The demo seed/reset flow is deterministic and explicitly simulated. x402 returns configuration-gated HTTP 503/402 responses and does not claim payment verification or Algorand settlement without a configured facilitator and wallet/payment proof. Browser geolocation, API persistence, and offline queueing are MVP behaviors, not production guarantees.