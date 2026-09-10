export type SystemStatus = {
  status: "operational" | "degraded";
  service: string;
  checkedAt: string;
  network: {
    connectedNodes: number;
    regions: number;
    coveragePercent: number;
  };
  capabilities: {
    sos: "placeholder";
    ai: "placeholder";
    geospatial: "placeholder";
    offline: "placeholder";
    x402: "placeholder";
  };
};

export type SosIncident = {
  id: string;
  type: "sos";
  status: "received";
  severity: "critical" | "high" | "moderate";
  description: string;
  location: { latitude: number; longitude: number; accuracy?: number } | null;
  createdAt: string;
};

export type MapData = {
  incident: SosIncident | null;
  responders: Array<{ id: string; name: string; unit: string; latitude: number; longitude: number; status: "available" }>;
  nearestResponder: (MapData["responders"][number] & { distanceMiles: number }) | null;
  reason: string | null;
};

export type AgentDecision = {
  mode: "deterministic-mvp";
  decision: "escalate-to-operations" | "queue-for-review" | "standby";
  rationale: string;
  confidence: "high" | "medium";
  advancedIntelligenceRequired: boolean;
  incidentId: string | null;
};

export type PaymentRequirement = {
  scheme: "exact";
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  facilitator: "GoPlausible";
};

export type DemoStatus = {
  mode: "deterministic-demo";
  simulated: true;
  incident: { id: string; hasCoordinates: boolean } | null;
  map: { nearestResponder: { id: string; distanceMiles: number } | null };
  agent: { decision: AgentDecision["decision"]; criticalCount: number };
  x402: { configured: boolean; settlementClaimed: false };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";
export type SosSubmission = Pick<SosIncident, "severity" | "description" | "location">;

export async function fetchSystemStatus(signal?: AbortSignal): Promise<SystemStatus> {
  const response = await fetch(`${apiBaseUrl}/api/status`, { signal });
  if (!response.ok) {
    throw new Error(`System status request failed with ${response.status}`);
  }
  return response.json() as Promise<SystemStatus>;
}

export async function createSosIncident(input: SosSubmission): Promise<SosIncident> {
  const response = await fetch(`${apiBaseUrl}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `SOS request failed with ${response.status}`);
  }

  const result = await response.json() as { incident: SosIncident };
  return result.incident;
}

export async function fetchMapData(signal?: AbortSignal): Promise<MapData> {
  const response = await fetch(`${apiBaseUrl}/api/map`, { signal });
  if (!response.ok) throw new Error(`Map request failed with ${response.status}`);
  return response.json() as Promise<MapData>;
}

export async function fetchAgentDecision(signal?: AbortSignal): Promise<AgentDecision> {
  const response = await fetch(`${apiBaseUrl}/api/agent/decision`, { signal });
  if (!response.ok) throw new Error(`Agent decision request failed with ${response.status}`);
  return response.json() as Promise<AgentDecision>;
}

export async function requestAdvancedIntelligence(signal?: AbortSignal): Promise<"payment-required" | "unavailable" | "verification-required"> {
  const response = await fetch(`${apiBaseUrl}/api/agent/advanced-intelligence`, { signal });
  if (response.status === 402) return "payment-required";
  if (response.status === 503) return "unavailable";
  if (response.status === 501) return "verification-required";
  if (!response.ok) throw new Error(`Advanced intelligence request failed with ${response.status}`);
  return "verification-required";
}

export async function resetDemo(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/demo/reset`, { method: "POST" });
  if (!response.ok) throw new Error(`Demo reset failed with ${response.status}`);
}

export async function seedDemo(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/demo/seed`, { method: "POST" });
  if (!response.ok) throw new Error(`Demo seed failed with ${response.status}`);
}

export async function fetchDemoStatus(): Promise<DemoStatus> {
  const response = await fetch(`${apiBaseUrl}/api/demo/status`);
  if (!response.ok) throw new Error(`Demo status failed with ${response.status}`);
  return response.json() as Promise<DemoStatus>;
}
