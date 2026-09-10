import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const x402Enabled = process.env.X402_ENABLED === "true";
const x402PayTo = process.env.X402_PAY_TO ?? "";
const x402Network = process.env.X402_NETWORK ?? "algorand-testnet";
const x402Asset = process.env.X402_ASSET ?? "USDC";
const x402Amount = process.env.X402_AMOUNT ?? "0.01";
const incidents: Incident[] = [];
const demoIncident: Incident = {
  id: "DEMO-SOS-001",
  type: "sos",
  status: "received",
  severity: "critical",
  description: "Demo coordinate SOS for end-to-end judge walkthrough.",
  location: { latitude: 40.7128, longitude: -74.006, accuracy: 12 },
  createdAt: "2026-09-10T12:00:00.000Z",
};

type Incident = {
  id: string;
  type: "sos";
  status: "received";
  severity: "critical" | "high" | "moderate";
  description: string;
  location: { latitude: number; longitude: number; accuracy?: number } | null;
  createdAt: string;
};

type Responder = {
  id: string;
  name: string;
  unit: string;
  latitude: number;
  longitude: number;
  status: "available";
};

const responders: Responder[] = [
  { id: "R-14", name: "Northstar Unit 14", unit: "Medical response", latitude: 40.7138, longitude: -74.0049, status: "available" },
  { id: "R-07", name: "Harbor Unit 07", unit: "Rapid response", latitude: 40.7192, longitude: -74.0124, status: "available" },
  { id: "R-22", name: "Pine Ridge Unit 22", unit: "Search and rescue", latitude: 40.7046, longitude: -74.0017, status: "available" },
];

function haversineMiles(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const earthRadiusMiles = 3958.8;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isSeverity(value: unknown): value is Incident["severity"] {
  return value === "critical" || value === "high" || value === "moderate";
}

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "sentinel-api" });
});

app.get("/api/status", (_request, response) => {
  response.json({
    status: "operational",
    service: "sentinel-api",
    checkedAt: new Date().toISOString(),
    network: {
      connectedNodes: 24,
      regions: 6,
      coveragePercent: 98.4,
    },
    capabilities: {
      sos: "placeholder",
      ai: "placeholder",
      geospatial: "placeholder",
      offline: "placeholder",
      x402: "placeholder",
    },
  });
});

app.get("/api/incidents", (_request, response) => {
  response.json({ incidents });
});

app.post("/api/analyze", (request, response) => {
  const description = typeof request.body?.description === "string" ? request.body.description.trim() : "";
  if (!description) {
    response.status(400).json({ error: "description is required" });
    return;
  }
  const text = description.toLowerCase();
  const critical = ["life", "trapped", "fire", "unconscious", "weapon"].some((term) => text.includes(term));
  const high = ["injury", "accident", "threat", "smoke"].some((term) => text.includes(term));
  const severity = critical ? "critical" : high ? "high" : "moderate";
  const duplicate = incidents.some((incident) => incident.description.toLowerCase() === text);
  response.json({
    classification: critical || high ? "emergency" : "incident",
    severity,
    confidence: critical ? 0.9 : high ? 0.78 : 0.65,
    similarity: duplicate ? 1 : 0,
    duplicate,
    cluster: { id: critical ? "critical-response" : "general-response", incidentCount: duplicate ? 2 : 1 },
    recommendedAction: critical ? "Escalate to operations immediately." : "Queue for operations review.",
    mode: "deterministic-local",
  });
});

app.get("/api/map", (_request, response) => {
  const incident = incidents[0] ?? null;
  if (!incident?.location) {
    response.json({ incident, responders, nearestResponder: null, reason: "No incident coordinates are available." });
    return;
  }
  const ranked = responders
    .map((responder) => ({ responder, distanceMiles: haversineMiles(incident.location!, responder) }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
  response.json({
    incident,
    responders,
    nearestResponder: { ...ranked[0].responder, distanceMiles: Number(ranked[0].distanceMiles.toFixed(2)) },
    reason: null,
  });
});

app.get("/api/agent/decision", (_request, response) => {
  const latest = incidents[0] ?? null;
  const criticalCount = incidents.filter((incident) => incident.severity === "critical").length;
  const decision = latest?.severity === "critical"
    ? "escalate-to-operations"
    : latest
      ? "queue-for-review"
      : "standby";
  response.json({
    mode: "deterministic-mvp",
    decision,
    rationale: latest
      ? `${criticalCount} critical incident${criticalCount === 1 ? "" : "s"} recorded; latest signal is ${latest.severity}.`
      : "No incidents are currently recorded.",
    confidence: latest ? "high" : "medium",
    advancedIntelligenceRequired: false,
    incidentId: latest?.id ?? null,
  });
});

app.get("/api/agent/advanced-intelligence", (request, response) => {
  if (!x402Enabled || !x402PayTo) {
    response.status(503).json({
      status: "unavailable",
      reason: "x402 is not configured with a facilitator/pay-to address.",
      simulated: false,
    });
    return;
  }
  if (!request.header("X-PAYMENT")) {
    response.status(402).json({
      error: "payment_required",
      accepts: [{
        scheme: "exact",
        network: x402Network,
        asset: x402Asset,
        amount: x402Amount,
        payTo: x402PayTo,
        facilitator: "GoPlausible",
      }],
      note: "No settlement has occurred. Submit facilitator-verified X-PAYMENT proof.",
    });
    return;
  }
  response.status(501).json({
    status: "verification_required",
    reason: "Payment proof received, but facilitator verification is not configured.",
    settled: false,
  });
});

app.post("/api/demo/reset", (_request, response) => {
  incidents.length = 0;
  response.json({ mode: "deterministic-demo", status: "reset", incidentCount: 0 });
});

app.post("/api/demo/seed", (_request, response) => {
  incidents.length = 0;
  incidents.push({ ...demoIncident });
  response.status(201).json({ mode: "deterministic-demo", status: "seeded", incident: demoIncident });
});

app.get("/api/demo/status", (_request, response) => {
  const incident = incidents[0] ?? null;
  const nearestResponder = incident?.location
    ? responders.map((responder) => ({ responder, distanceMiles: haversineMiles(incident.location!, responder) })).sort((a, b) => a.distanceMiles - b.distanceMiles)[0]
    : null;
  const critical = incidents.filter((item) => item.severity === "critical").length;
  response.json({
    mode: "deterministic-demo",
    simulated: true,
    incident: incident ? { id: incident.id, hasCoordinates: Boolean(incident.location) } : null,
    map: { nearestResponder: nearestResponder ? { id: nearestResponder.responder.id, distanceMiles: Number(nearestResponder.distanceMiles.toFixed(2)) } : null },
    agent: { decision: incident?.severity === "critical" ? "escalate-to-operations" : incident ? "queue-for-review" : "standby", criticalCount: critical },
    x402: { configured: x402Enabled && Boolean(x402PayTo), settlementClaimed: false },
  });
});

app.post("/api/incidents", (request, response) => {
  const { severity, description, location } = request.body as Partial<Incident>;
  if (!isSeverity(severity) || typeof description !== "string" || !description.trim()) {
    response.status(400).json({ error: "severity and description are required" });
    return;
  }
  if (location !== null && location !== undefined) {
    if (typeof location !== "object" || typeof location.latitude !== "number" || typeof location.longitude !== "number") {
      response.status(400).json({ error: "location must contain numeric latitude and longitude, or be null" });
      return;
    }
  }
  const incident: Incident = {
    id: `SOS-${Date.now().toString(36).toUpperCase()}`,
    type: "sos",
    status: "received",
    severity,
    description: description.trim(),
    location: location ?? null,
    createdAt: new Date().toISOString(),
  };
  incidents.unshift(incident);
  response.status(201).json({ incident });
});

app.listen(port, () => {
  console.log(`Sentinel API listening on http://localhost:${port}`);
});
