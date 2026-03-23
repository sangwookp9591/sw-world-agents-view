import { eventBroadcaster } from '@/lib/relay/event-broadcaster';

export const dynamic = 'force-dynamic';

export async function GET() {
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      eventBroadcaster.addClient(c);

      // Send initial heartbeat so the client knows it's connected
      const heartbeat = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`;
      c.enqueue(new TextEncoder().encode(heartbeat));
    },
    cancel() {
      if (controller) {
        eventBroadcaster.removeClient(controller);
        controller = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
