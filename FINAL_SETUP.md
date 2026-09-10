# Final setup

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A modern browser for the Vite frontend

## Install and build

```powershell
npm install
npm run build:all
```

## Start

```powershell
npm run start:api
npm run dev
```

Set `VITE_API_BASE_URL` if the API is not running on `http://localhost:8787`. The API exposes `GET /health`.

## Optional x402 configuration

The API only enables its payment-required response when `X402_ENABLED=true` and `X402_PAY_TO` are set. Configure the Algorand Testnet network, GoPlausible facilitator, asset, and amount using `.env`; no secret or wallet material belongs in this repository. The current MVP does not verify or settle payment proofs locally.
