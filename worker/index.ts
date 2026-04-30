import { Matchmaker } from './matchmaker';
import { GameRoom } from './gameroom';

export { Matchmaker, GameRoom };

export interface Env { MATCHMAKER: DurableObjectNamespace; GAME_ROOM: DurableObjectNamespace; ENVIRONMENT: string; ASSETS: Fetcher; }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/queue/status') {
      const id = env.MATCHMAKER.idFromName('global');
      return env.MATCHMAKER.get(id).fetch('https://matchmaker/status');
    }
    if (url.pathname === '/api/queue/join' && request.method === 'POST') {
      const payload = await request.json() as { mode: string; role: string };
      const id = env.MATCHMAKER.idFromName('global');
      return env.MATCHMAKER.get(id).fetch('https://matchmaker/join', { method: 'POST', body: JSON.stringify({ ...payload, id: crypto.randomUUID() }) });
    }
    const roomMatch = url.pathname.match(/^\/api\/room\/([^/]+)\/ws$/);
    if (roomMatch) {
      const id = env.GAME_ROOM.idFromName(roomMatch[1]);
      return env.GAME_ROOM.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};
