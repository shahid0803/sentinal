export type QueueMessage<T> = { id: string; payload: T; createdAt: number; attempts: number; ttlMs: number; hopCount: number };
export class OfflineOutbox<T> {
  private messages = new Map<string, QueueMessage<T>>();
  enqueue(id: string, payload: T, ttlMs = 86_400_000) { this.messages.set(id, { id, payload, createdAt: Date.now(), attempts: 0, ttlMs, hopCount: 0 }); }
  pending() { return [...this.messages.values()].filter((m) => Date.now() - m.createdAt < m.ttlMs); }
  async flush(send: (message: QueueMessage<T>) => Promise<void>) { for (const message of this.pending()) { try { message.attempts += 1; await send(message); this.messages.delete(message.id); } catch { /* retain for retry */ } } return this.pending().length; }
  size() { return this.pending().length; }
}
