import { createHash } from "node:crypto";
export function hashEvidence(value: string): string { return createHash("sha256").update(value).digest("hex"); }
export type AuditEvent = { action: string; actor: string; occurredAt: string; metadata?: Record<string, string> };
