# SENTINEL two-codebase audit

**Scope:** Phase 1 only. This document compares the current repository (NEW) with
`sentinel-integration-final.zip` (OLD reference). No application source was changed
for this audit.

## Executive summary

The NEW project is the coherent, visually stronger React/Vite frontend and a small
Express MVP API. It already contains the judge-facing shell, SOS flow, deterministic
map matching, browser offline queue, agent decision endpoint, demo controls, and
configuration-gated x402-shaped responses.

The OLD project is technically broader. It contains a FastAPI AI service with
TF-IDF/logistic classification, auditable severity rules, similarity fallback,
duplicate detection, clustering, and recommended actions; a reusable TypeScript
geospatial package with capability-aware responder ranking; a TypeScript offline
outbox/inbox/forwarding package; a security package with JWT/RBAC, evidence
hashing, audit and payment helpers; and an Express integration backend with
authenticated incidents, offline sync, AI proxying, responder recommendations,
and optional official x402 middleware.

The OLD archive also contains duplicate/overlapping roots: `ai/` and
`services/ai/`, root `geospatial/` and `packages/geospatial/`, root `offline/` and
`packages/offline/`, and `frontend/` plus a separate `web/` tree. Generated
`node_modules`, `dist`, and pytest caches are present in the archive and must not be
ported. The OLD backend is a reference implementation, not a drop-in replacement
for the NEW API or UI.

## Comparison matrix

| FEATURE | NEW IMPLEMENTATION | OLD IMPLEMENTATION | WHICH IS BETTER | WHAT TO KEEP | WHAT TO COPY | INTEGRATION DIFFICULTY |
|---|---|---|---|---|---|---|
| Frontend | `apps/web`, React/Vite/TypeScript, responsive operations shell and routes | `frontend/index.html` and separate older UI assets; no equivalent to the NEW shell | NEW | NEW frontend, routing, styles, accessibility polish | None from OLD UI | Low |
| Dashboard | Static command dashboard with API status and demo/system controls | Older backend exposes data, but no comparable NEW-quality dashboard | NEW UX; OLD data breadth | NEW presentation and explicit demo labels | Compatible data contracts only | Medium |
| SOS | Browser geolocation, severity/description form, API submit, local queue fallback | Authenticated coordinate-required incident creation plus offline sync endpoint | Complementary; OLD transport/auth is stronger, NEW UX is better | NEW form and fallback; OLD validation/idempotency concepts | Adapt sync/auth contracts after API decision | Medium |
| Incident management | In-memory create/list behavior and demo seed/reset | Map-backed in-memory incidents, authenticated CRUD, assignment, sync keys | OLD capability breadth | NEW user flow; OLD normalized model and idempotency | Port only compatible server/domain logic | Medium |
| AI classification | Placeholder capability; no AI service | FastAPI `POST /classify`; TF-IDF + logistic regression | OLD | NEW route/visual surface; OLD deterministic classifier | Adapt behind canonical `/analyze` contract | Medium |
| Severity | UI/API severity intake; no analysis | Auditable keyword rules with confidence/signals | OLD | NEW intake and display; OLD rules | Port rules and response shape | Low |
| Similarity | Not implemented | Optional sentence-transformers with TF-IDF fallback and incident anchors | OLD | Explicit offline fallback and threshold | Port as AI service dependency, not frontend code | Medium |
| Duplicate detection | Not implemented | Weighted semantic, distance, and time comparison with missing-data handling | OLD | Conservative missing-data behavior | Port tests and algorithm behind `/analyze` | Medium |
| Clustering | Not implemented | Similarity + distance + time cluster membership and major-incident flag | OLD | Explainability | Port bounded function and types | Medium |
| Geospatial | API-local Haversine distance and fixed responders; no package | `packages/geospatial` validates coordinates, calculates distance, filters radius, scores capability/availability/trust | OLD | NEW map UI; OLD canonical package functions | Replace API-local duplicate algorithm with one adapted package | Medium |
| Responder matching | Nearest fixed responder only | Capability-aware, availability-aware, trust-weighted ranked matches | OLD | NEW map presentation | Port `findNearbyResponders`/`matchResponders` semantics | Medium |
| Offline | Browser localStorage queue, reconnect/manual sync | Typed outbox/inbox/forwarded queues, TTL, hop count, dedupe, retry, transport seam | OLD architecture; NEW demo simplicity | NEW UX; OLD message model and sync semantics | Adapt package under `packages/offline` and preserve browser adapter | High |
| Security | No standalone package; x402 status is configuration-gated | JWT/RBAC middleware, password helpers, validation, audit, payment helpers | OLD | NEW explicit limitation labels | Port only after API auth boundary is designed | High |
| Evidence integrity | Not implemented | SHA-256 evidence record creation and verification | OLD | None currently | Port evidence primitives into `packages/security` | Medium |
| x402 | Manual configuration-gated HTTP 503/402/501-shaped endpoint; no x402 package | Root package declares `@x402/core`, `@x402/avm`, `@x402/express`; backend conditionally configures facilitator middleware | OLD implementation, subject to runtime/config verification | NEW no-fake-settlement boundary | Adapt official middleware after dependency/API verification | High |
| Algorand | Network string only; no wallet or settlement | x402 middleware targets Algorand network identifier and GoPlausible URL when configured | OLD configuration coverage; neither proves settlement locally | Explicit unavailable state | Port only verified official configuration | High |
| GoPlausible | Display/configuration boundary only | `GOPLAUSIBLE_FACILITATOR_URL` used by `HTTPFacilitatorClient` in optional middleware | OLD | NEW truthful status UI | Adapt env contract and verification path | High |
| Agentic decision | Deterministic `/api/agent/decision` with standby/review/escalation | AI agent orchestration is deterministic and explicitly “never autonomous dispatch” | Complementary | NEW UI/API boundary and OLD transparency principle | Combine only after AI contract is stable | Medium |
| API design | Simple unauthenticated Express endpoints with typed frontend client; in-memory state | Broader authenticated Express routes, AI proxy, offline sync, assignment, optional x402 middleware | OLD breadth; NEW clarity for MVP | NEW canonical frontend contracts; OLD route semantics selectively | Rewrite adapters rather than copy server wholesale | High |
| Data model | SOS incident with nullable location, fixed status/severity, demo status types | Richer typed Incident/Responder/IncidentMessage models, timestamps, IDs, roles, origin device and idempotency | OLD | NEW compatibility and demo IDs; OLD explicit domain types | Create shared types and migration adapters | Medium |

## Duplicate and obsolete areas

| OLD path | Observed state | Audit disposition |
|---|---|---|
| `ai/` and `services/ai/` | Duplicate copies of the FastAPI AI service and tests/docs | Treat `services/ai/` as the intended canonical target; do not copy both |
| `geospatial/` and `packages/geospatial/` | Root demo/UI wrapper plus reusable package | Keep reusable logic from `packages/geospatial`; adapt any demo wrapper only if the NEW Map view needs it |
| `offline/` and `packages/offline/` | Root package plus package tree with overlapping exports and generated output | Inspect package metadata before porting; retain one canonical `packages/offline` implementation |
| `security/` and `packages/security/` | Root security implementation is under `security/`; package tree also contains security-related files in the archive listing | Keep one canonical `packages/security` target; do not merge blindly |
| `frontend/` and `web/` | Legacy/static frontend roots separate from NEW `apps/web` | Do not port; NEW `apps/web` is the UI source of truth |
| `backend/` | Broad reference API server | Reference only; do not replace NEW API wholesale |
| `node_modules/`, `dist/`, `.pytest_cache/` | Generated artifacts included in archive | Never port or track |

## Dependency and compatibility observations

NEW uses an npm workspace with React/Vite and Express. It has no Python service,
shared package workspace, x402 package, or test script. OLD uses a root Node
manifest with x402 2.25.0 packages and Express 5, separate package manifests for
offline/geospatial, and a Python FastAPI/scikit-learn service. The OLD AI code
also conditionally imports `sentence_transformers`, so its fallback path is
important for a dependency-light hackathon deployment.

The OLD backend uses JWT authentication and requires a 32-byte secret, while NEW
routes are intentionally unauthenticated MVP routes. Adding OLD auth directly
would change behavior and frontend contracts; it requires an explicit integration
decision. Likewise, OLD x402 middleware must be verified against the installed
package APIs and real facilitator configuration before replacing the current
truthful unavailable boundary.

## Missing or unknown evidence

- No running OLD services were started during this audit.
- No wallet, facilitator credentials, payment proof, or confirmed Algorand Testnet
  settlement is available from the archive alone.
- The archive includes generated dependencies and caches, so file presence is not
  proof that every listed package is reproducibly installable.
- The NEW repository has no standalone AI, x402, shared, offline, security,
  geospatial, or integration directories despite its API-level MVP behavior.

## Recommendation

Preserve `apps/web` and its route/UI contracts. In a later phase, port the OLD AI
service into `services/ai`, port one tested geospatial implementation into
`packages/geospatial`, adapt the OLD offline package behind the existing browser
queue, and port security primitives into `packages/security`. Treat the OLD
backend as a source of route/domain ideas, not a second application. Verify x402
official APIs and facilitator configuration independently before integrating.

**Exact next step after this audit:** create `docs/FINAL_MERGE_PLAN.md` describing
the selected canonical files, adapters, removals, and dependency order. No source
code should be changed before that plan is approved.
