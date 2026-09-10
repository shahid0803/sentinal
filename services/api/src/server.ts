import express from "express";
import cors from "cors";
import { createIncident, findIncident, findResponder, listIncidents, listResponders, updateIncidentStatus } from "./store.js";
import type { IncidentInput, IncidentStatus } from "./types.js";
import { createX402Middleware, readX402Config, x402DemoLogger } from "@sentinel/x402";

export const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ status: "ok", service: "sentinel-api" }));
const x402Config = readX402Config();
if (x402Config) {
  app.use(x402DemoLogger());
  app.use(createX402Middleware(x402Config));
  console.info("[x402] payment middleware enabled for Algorand Testnet");
} else {
  console.warn("[x402] disabled: set X402_PAY_TO and X402_FACILITATOR_URL to enable");
}
app.post("/api/incidents", (req, res) => {
  const body = req.body as Partial<IncidentInput>;
  if (!body.incidentType || !body.description || !body.reporterId || typeof body.latitude !== "number" || typeof body.longitude !== "number") {
    return res.status(400).json({ error: "incidentType, description, coordinates, and reporterId are required" });
  }
  return res.status(201).json(createIncident(body as IncidentInput));
});
app.get("/api/incidents", (_req, res) => res.json(listIncidents()));
app.get("/api/incidents/:id", (req, res) => {
  const incident = findIncident(req.params.id);
  return incident ? res.json(incident) : res.status(404).json({ error: "Incident not found" });
});
app.patch("/api/incidents/:id/status", (req, res) => {
  const status = req.body?.status as IncidentStatus;
  if (!["reported", "triaged", "assigned", "resolved"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const incident = updateIncidentStatus(req.params.id, status);
  return incident ? res.json(incident) : res.status(404).json({ error: "Incident not found" });
});
app.get("/api/responders", (_req, res) => res.json(listResponders()));
app.get("/api/responders/:id", (req, res) => {
  const responder = findResponder(req.params.id);
  return responder ? res.json(responder) : res.status(404).json({ error: "Responder not found" });
});
app.post("/api/ai/analyze", async (req, res) => {
  const url = process.env.AI_SERVICE_URL;
  if (!url) return res.status(503).json({ error: "AI service is not configured", integration: "Set AI_SERVICE_URL" });
  const response = await fetch(`${url.replace(/\/$/, "")}/analyze`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req.body) });
  return res.status(response.status).send(await response.text());
});
app.post("/api/x402/incident-intelligence", async (req, res) => {
  if (!x402Config) return res.status(503).json({ error: "x402 is not configured", integration: "Set X402_PAY_TO and X402_FACILITATOR_URL" });
  const aiUrl = process.env.AI_SERVICE_URL;
  if (aiUrl) {
    const response = await fetch(`${aiUrl.replace(/\/$/, "")}/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body)
    });
    return res.status(response.status).send(await response.text());
  }
  return res.json({
    status: "payment_verified",
    message: "Payment was verified and settled. Configure AI_SERVICE_URL for advanced incident analysis.",
    incident: req.body
  });
});

if (process.env.NODE_ENV !== "test") app.listen(Number(process.env.PORT || 3001), () => console.log("Sentinel API listening on port", process.env.PORT || 3001));
