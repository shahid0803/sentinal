export type IncidentStatus = "reported" | "triaged" | "assigned" | "resolved";

export interface Incident {
  id: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface IncidentInput {
  incidentType: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  reporterId: string;
}

export interface Responder { id: string; name: string; status: "available" | "busy"; specialties: string[]; }
