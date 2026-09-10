# Sentinel Final Merge Plan

**Canonical source:** the current NEW worktree and `apps/web` UI.  
**Reference source:** extracted OLD Sentinel at the supplied session-state path.  
**Scope:** integrate compatible capabilities without creating a second application.

## Keep

- Keep `apps/web` as the only frontend, including its routes, SOS form, map,
  offline queue UI, deterministic agent view, x402 boundary, demo controls, and
  accessibility polish.
- Keep `services/api` as the canonical HTTP boundary and its in-memory MVP state.
- Keep `docs/COPILOT_INITIAL_AUDIT.md` and `docs/TWO_CODEBASE_AUDIT.md` as audit
  history.
- Keep truthful REAL/SIMULATED/DEMO/EXTERNAL DEPENDENCY labels and never claim
  payment settlement without verified facilitator evidence.

## Copy/adapt into canonical targets

| Target | OLD capability | Decision |
| --- | --- | --- |
| `services/ai` | FastAPI classification, auditable severity, similarity/duplicate/cluster/action output | Adapt to a bounded Python service exposing `POST /analyze`; preserve deterministic fallback and label external model dependencies. |
| `packages/shared` | OLD domain types | Adapt only stable incident, responder, analysis, and payment-contract types needed by NEW/API integration. |
| `packages/geospatial` | capability/availability/trust-aware ranking and coordinate helpers | Port reusable functions; make `services/api` consume the package instead of maintaining a second ranking algorithm. |
| `packages/offline` | outbox/inbox/forwarded messages, TTL, hop count, dedupe, retries, transport seam | Port as a transport-independent package and keep the existing browser localStorage adapter as the UI integration. |
| `packages/security` | evidence hashing, audit primitives, JWT/RBAC helpers | Port isolated primitives only; do not change the unauthenticated demo contract or claim production security. |
| `services/x402` | official x402 configuration boundary | Create a configuration-only adapter after package API verification; use Algorand Testnet/GoPlausible only when configured and never fake settlement. |
| `integration` | cross-service smoke/contract orchestration | Add scripts/docs that exercise API, optional AI, optional x402, and demo boundaries without duplicating UI. |

## API adaptation

- Preserve existing SOS, map, offline, demo, and deterministic-agent routes.
- Add AI integration behind an explicit `POST /analyze` contract with
  classification, severity, confidence, similarity/duplicate, cluster, and
  recommended action.
- Keep optional services configuration-gated and return explicit unavailable
  responses when dependencies are absent.
- Keep x402 requirements machine-readable and distinguish payment-required,
  verification-required, unavailable, and settled states.

## Do not copy

- Do not copy OLD `frontend/`, `web/`, `backend/`, duplicate `ai/`, root
  `geospatial/`, root `offline/`, generated dependencies, build output, caches,
  or a second server/UI.
- Do not blindly port OLD authentication into the current demo API.
- Do not add fabricated wallets, credentials, transactions, model results, or
  facilitator settlement claims.

## Execution order

1. Add shared contracts and reusable geospatial/offline/security primitives.
2. Add the optional AI service and API adapter.
3. Isolate x402 configuration and verify official package APIs/configuration.
4. Add integration smoke scripts and update setup/demo/release documentation.
5. Build, run available tests, run API/frontend/AI/x402 smoke checks, remove
   generated artifacts, inspect the diff, commit with the Copilot trailer, and
   push only the current branch if the remote is fast-forward safe.
