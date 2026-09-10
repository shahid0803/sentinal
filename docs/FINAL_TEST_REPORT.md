# Final Test Report

| Surface | Result | Evidence |
| --- | --- | --- |
| Frontend | PASS | `npm run build:all` completed Vite and TypeScript build |
| API | PASS | Build plus `/health`, `/api/incidents`, `/api/responders` smoke checks |
| AI | PASS (syntax/contract only) | Python compile check; deterministic `/analyze` contract smoke; no external model |
| Geospatial | PASS | Package build and map responder smoke |
| Offline | PASS (MVP) | Browser queue implementation and package build; no BLE claim |
| Security | PASS (primitive only) | SHA-256 package build; not production-grade auth |
| Agentic Flow | PASS (deterministic) | `/api/agent/decision` standby/escalation smoke |
| x402 | PASS (configuration boundary) | 503 unavailable and configured 402 requirement smoke |
| GoPlausible | NOT VERIFIED LOCALLY | No facilitator configuration/credentials |
| Algorand Testnet | NOT VERIFIED LOCALLY | No wallet, proof, or settlement available |
| End-to-end demo | PASS (deterministic demo path) | Reset → seed → incident → map → agent → x402 status smoke |

## Test availability

No repository test files or test runner are configured. The release used build,
Python syntax, endpoint, and deterministic integration smoke checks instead.
`npm install` reported dependency audit findings; no automatic dependency upgrade
was performed.
