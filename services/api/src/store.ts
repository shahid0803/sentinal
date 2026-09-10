import type { Incident, IncidentInput, Responder } from "./types.js";

const incidents: Incident[] = [];
const responders: Responder[] = [
  { id: "resp-001", name: "Response Team Alpha", status: "available", specialties: ["medical", "rescue"] },
  { id: "resp-002", name: "Response Team Bravo", status: "busy", specialties: ["fire", "evacuation"] }
];

export function createIncident(input: IncidentInput): Incident {
  const now = new Date().toISOString();
  const incident: Incident = {
    id: `inc-${Date.now()}`,
    type: input.incidentType,
    description: input.description,
    severity: "high",
    latitude: input.latitude,
    longitude: input.longitude,
    status: "reported",
    createdAt: input.timestamp || now,
    updatedAt: now,
    createdBy: input.reporterId
  };
  incidents.unshift(incident);
  return incident;
}
export const listIncidents = () => incidents;
export const findIncident = (id: string) => incidents.find((incident) => incident.id === id);
export function updateIncidentStatus(id: string, status: Incident["status"]) {
  const incident = findIncident(id);
  if (incident) { incident.status = status; incident.updatedAt = new Date().toISOString(); }
  return incident;
}
export const listResponders = () => responders;
export const findResponder = (id: string) => responders.find((responder) => responder.id === id);
