# x402 Algorand Testnet service

This package uses the official x402 TypeScript packages and Express middleware:

- `@x402/core`
- `@x402/avm`
- `@x402/express`

The API protects `POST /api/x402/incident-intelligence` with the AVM `exact` scheme. Without `payment-signature`/`x-payment`, the middleware returns HTTP 402 and payment requirements. With a signed payment, it sends the payment to the configured GoPlausible facilitator for verification and settlement; the protected handler is only released after verification, and the response includes the facilitator's real settlement metadata.

Required environment:

```text
X402_NETWORK=algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe
X402_PAY_TO=<Algorand Testnet recipient address>
X402_FACILITATOR_URL=<GoPlausible facilitator URL>
X402_PRICE=0.01
X402_ASSET=10458941
```

`10458941` is the official Algorand Testnet USDC ASA used by the current AVM package. `X402_NETWORK` is restricted to Algorand Testnet; the app refuses mainnet configuration. No private key is required by the server: the client wallet signs the payment, while GoPlausible verifies and settles it.

`ALGOD_SERVER` is not used by the x402 server middleware because the facilitator owns verification and settlement. Keep it available for a wallet/client or optional on-chain explorer checks.
