import { Matchmaker } from './matchmaker';
import { GameRoom } from './gameroom';

export { Matchmaker, GameRoom };

export interface Env {
  MATCHMAKER: DurableObjectNamespace;
  GAME_ROOM: DurableObjectNamespace;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/queue/status') return new Response(JSON.stringify({ playersInQueue: 0 }));
    return new Response('Blackjack worker online');
  }
};
