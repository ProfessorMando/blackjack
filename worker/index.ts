import { Matchmaker } from './matchmaker';
import { GameRoom } from './gameroom';

export { Matchmaker, GameRoom };

export interface Env {
  MATCHMAKER: DurableObjectNamespace;
  GAME_ROOM: DurableObjectNamespace;
  ENVIRONMENT: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/queue/status') {
      return new Response(JSON.stringify({ playersInQueue: 0 }), {
        headers: { 'content-type': 'application/json; charset=utf-8' }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
