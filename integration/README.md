# Integration checks

The canonical integration surface is `services/api`. Optional AI, x402, and
package capabilities are configuration-gated; no integration check treats an
unavailable external service as passing.

Run `npm run build:all` for the API, frontend, and workspace package builds.
