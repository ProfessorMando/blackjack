export class Matchmaker {
  constructor(private readonly state: DurableObjectState) {}
  async fetch(): Promise<Response> { return new Response(JSON.stringify({ ok: true, queue: 0 })); }
}
