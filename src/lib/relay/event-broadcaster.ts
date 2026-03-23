import type { AgentEvent } from '@/types/session';

class EventBroadcaster {
  private controllers: Set<ReadableStreamDefaultController> = new Set();

  addClient(controller: ReadableStreamDefaultController): void {
    this.controllers.add(controller);
  }

  removeClient(controller: ReadableStreamDefaultController): void {
    this.controllers.delete(controller);
  }

  broadcast(event: AgentEvent): void {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    const encoded = new TextEncoder().encode(data);

    const dead: ReadableStreamDefaultController[] = [];
    for (const controller of this.controllers) {
      try {
        controller.enqueue(encoded);
      } catch {
        // Stream already closed
        dead.push(controller);
      }
    }
    for (const c of dead) {
      this.controllers.delete(c);
    }
  }

  get clientCount(): number {
    return this.controllers.size;
  }
}

// Singleton
const globalForBroadcaster = globalThis as typeof globalThis & {
  __eventBroadcaster?: EventBroadcaster;
};

if (!globalForBroadcaster.__eventBroadcaster) {
  globalForBroadcaster.__eventBroadcaster = new EventBroadcaster();
}

export const eventBroadcaster: EventBroadcaster = globalForBroadcaster.__eventBroadcaster;
