# SENTINEL

Connecting Help When Networks Fail.

## Current MVP

This repository contains the verified hackathon MVP:

- `apps/web/` — React, TypeScript, and Vite emergency operations UI.
- `services/api/` — Express API with SOS incidents, deterministic responder matching, offline/demo status, agent decisions, deterministic analysis, and configuration-gated x402 status.
- `services/ai/` — optional Python/FastAPI deterministic `/analyze` contract; external model dependencies are not installed by default.
- `packages/shared/`, `packages/geospatial/`, `packages/offline/`, `packages/security/` — canonical reusable TypeScript primitives.
- `integration/` — integration boundary documentation and smoke guidance.
- `docs/` — audit, merge plan, release report, test report, and limitations.

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

The API exposes `GET /health`, `GET /api/incidents`, and `GET /api/responders` for basic verification. It also exposes the existing SOS, map, offline/demo, agent, analysis, and configuration-gated x402 boundaries.

## Demo boundaries

The demo seed/reset flow is deterministic and explicitly simulated. x402 returns configuration-gated HTTP 503/402 responses and does not claim payment verification or Algorand settlement without a configured facilitator and wallet/payment proof. Browser geolocation, API persistence, and offline queueing are MVP behaviors, not production guarantees.