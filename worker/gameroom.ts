export class GameRoom {
  private peers = new Set<WebSocket>();
  constructor(private readonly state: DurableObjectState) {}
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected websocket', { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.peers.add(server);
    server.addEventListener('message', (event) => {
      for (const peer of this.peers) if (peer !== server) peer.send(event.data);
    });
    server.addEventListener('close', () => this.peers.delete(server));
    return new Response(null, { status: 101, webSocket: client });
  }
}
