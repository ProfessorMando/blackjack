type QueueEntry = { id: string; mode: string; role: string };

export class Matchmaker {
  private queue: QueueEntry[] = [];
  constructor(private readonly state: DurableObjectState) {}
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/status')) {
      const pvp = this.queue.filter((q) => q.mode === 'pvp-computer-dealer').length;
      return Response.json({ pvpComputerDealer: pvp, playerVsHumanDealer: { player: this.queue.filter((q) => q.mode === 'player-vs-human-dealer' && q.role === 'player').length, dealer: this.queue.filter((q) => q.mode === 'player-vs-human-dealer' && q.role === 'dealer').length } });
    }
    if (url.pathname.endsWith('/join') && request.method === 'POST') {
      const body = await request.json() as { mode: string; role: string; id: string };
      const peer = this.queue.find((q) => q.id !== body.id && q.mode === body.mode && (body.mode === 'pvp-computer-dealer' || q.role !== body.role));
      if (peer) {
        this.queue = this.queue.filter((q) => q.id !== peer.id);
        return Response.json({ matched: true, roomId: `${peer.id}-${body.id}` });
      }
      this.queue.push({ id: body.id, mode: body.mode, role: body.role });
      return Response.json({ matched: false, ticket: body.id });
    }
    return new Response('Not found', { status: 404 });
  }
}
