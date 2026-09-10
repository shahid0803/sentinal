# Sentinel Member 1 Handoff

## Structure
`apps/web` contains the React/Vite shell. `services/api` contains the Express API, typed in-memory prototype store, and PostgreSQL-compatible `schema.sql`. `services/x402` is the isolated payment integration boundary. `integration` documents cross-service contracts.

## Run
From the repository root: `npm install`, then `npm run build`. Run the API with a TypeScript runner or compile it with `tsc`; run the web app with `npm run dev --workspace @sentinel/web`.

## Environment
`PORT` (default 3001), `VITE_API_URL`, `AI_SERVICE_URL`. x402 variables are `X402_NETWORK=algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe`, `X402_PAY_TO`, `X402_FACILITATOR_URL`, `X402_PRICE=0.01`, `X402_ASSET=10458941`, and optional `ALGOD_SERVER`. Never commit credentials or `.env`; use `services/x402/.env.example`.

## APIs
`GET /health`; incident CRUD at `/api/incidents`; responder reads at `/api/responders`; AI forwarding at `/api/ai/analyze`; reserved x402 endpoint at `/api/x402/incident-intelligence`.

## x402 status
The endpoint is now protected by the official `@x402/express` middleware, `@x402/core` facilitator client, and `@x402/avm` `ExactAvmScheme`. It accepts only Algorand Testnet (`algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe`) and Testnet USDC ASA `10458941`. Configure `X402_PAY_TO` and `X402_FACILITATOR_URL` (GoPlausible) to enable it. Without those variables, the endpoint returns `503`; with no payment header when enabled, it returns a real `402`; with a valid signed payment, GoPlausible verifies/settles and the middleware exposes the real `PAYMENT-RESPONSE` transaction ID. Never fabricate a transaction ID.

## Limitations and integration requirements
The API store is in memory, timestamps and IDs are prototype values, authentication is out of scope, and offline persistence is not yet implemented. Other members should preserve the TypeScript incident payload (`incidentType`, `description`, `latitude`, `longitude`, `timestamp`, `reporterId`) and the database table names.
