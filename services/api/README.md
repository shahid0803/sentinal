# Sentinel API

Run `npm install` at the repository root, then `npm run build --workspace @sentinel/api` and `npm start --workspace @sentinel/api`. `GET /health` is the health check. The current store is in-memory for the prototype; `schema.sql` is the PostgreSQL-compatible contract for the shared database.

Set `X402_PAY_TO` and `X402_FACILITATOR_URL` to enable the real Algorand Testnet payment middleware. A request without a signed payment receives HTTP 402. A valid client payment is verified and settled by the facilitator before the endpoint responds.
