export type Coordinates = { latitude: number; longitude: number };
export type RankedResponder = Coordinates & { id: string; name: string; unit: string; availability: "available" | "busy" | "offline"; trustScore: number; distanceMiles: number };
export function distanceMiles(a: Coordinates, b: Coordinates): number {
  const r = 3958.8, rad = (n: number) => n * Math.PI / 180;
  const dLat = rad(b.latitude - a.latitude), dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function rankResponders(origin: Coordinates, responders: Omit<RankedResponder, "distanceMiles">[]): RankedResponder[] {
  return responders.map((responder) => ({ ...responder, distanceMiles: distanceMiles(origin, responder) }))
    .filter((responder) => responder.availability !== "offline")
    .sort((a, b) => (a.distanceMiles - b.distanceMiles) - (a.trustScore - b.trustScore) * 0.01);
}
