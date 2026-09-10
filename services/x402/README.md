# x402 boundary

The active x402 boundary is intentionally implemented in
`services/api/src/server.ts` so the existing Agent UI contract remains stable.
It uses explicit configuration (`X402_ENABLED`, `X402_PAY_TO`, network, asset,
and amount) and returns truthful unavailable, HTTP 402 payment-required, or
verification-required states. No transaction or settlement is fabricated.

Live GoPlausible and Algorand Testnet settlement are not verified locally.
