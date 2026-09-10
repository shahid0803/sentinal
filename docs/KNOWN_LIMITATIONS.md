# Known Limitations

- State is in memory in the API and is lost on restart.
- Browser offline queue is localStorage-based and is not a BLE or mesh transport.
- AI is deterministic rule-based MVP logic; no external model or trained model is
  installed or claimed.
- Geospatial matching uses deterministic local responder data.
- Security package primitives do not constitute production authentication,
  authorization, JWT, or evidence governance.
- x402 is configuration-gated. Without a real GoPlausible facilitator, pay-to
  address, wallet, and signed proof, no payment is verified or settled.
- Algorand Testnet live settlement is not verified locally.
- No automated test runner exists in the repository; validation is build and
  focused smoke testing.
