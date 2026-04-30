# Blackjack

Vanilla TypeScript + Vite Blackjack app with solo play, offline support, and a Cloudflare Worker/Durable Object online scaffold.

## Features
- Solo mode with setup modal (role, bankroll, bet, AI difficulty).
- Core engine/AI wired into a playable table UI.
- Theme persistence (`blackjack.theme`).
- Bankroll and starting cash persistence (`blackjack.bankroll`, `blackjack.startingCash`).
- PWA service worker for offline solo play after first load.
- Online lobby scaffold with queue status/join endpoints and room WebSocket relay.

## Local development
```bash
npm install
npm run dev
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
- `npm run test`
- `npm run worker:dev`
- `npm run worker:deploy`

## Rules and engine
Rules live in `src/game/engine.ts` (`DEFAULT_RULES`). Update that object to change table behavior (blackjack payout, dealer soft 17 rule, split limits, surrender, etc.).

## Online architecture
- Worker router: `worker/index.ts`
- Matchmaking queue DO: `worker/matchmaker.ts`
- Room relay DO: `worker/gameroom.ts`
- Frontend lobby/socket protocol: `src/online/*`

## Offline / PWA
`public/sw.js` caches app shell and static assets cache-first and uses network-only behavior for `/api/*`.

## Deployment
### Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

### Worker
```bash
npm run worker:deploy
```

`wrangler.toml` defines Durable Object bindings (`MATCHMAKER`, `GAME_ROOM`) and migration state.

## Tests
```bash
npm run typecheck
npm run test
npm run build
```
