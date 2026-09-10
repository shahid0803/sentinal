# Integration

The web app calls the API at `VITE_API_URL` (default `http://localhost:3001`). The API owns incident CRUD and forwards `/api/ai/analyze` to `AI_SERVICE_URL` when configured. The future x402 adapter must be mounted at `/api/x402/incident-intelligence` and persist verified settlement metadata in `payments`.
