export type Coordinates = { latitude: number; longitude: number };
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type AIAnalysis = { classification: string; severity: IncidentSeverity; confidence: number; similarity: number; duplicate: boolean; cluster: { id: string; incidentCount: number }; recommendedAction: string };
