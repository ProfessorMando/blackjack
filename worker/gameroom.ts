export class GameRoom {
  constructor(private readonly state: DurableObjectState) {}
  async fetch(): Promise<Response> { return new Response(JSON.stringify({ ok: true, room: this.state.id.toString() })); }
}
