# Blackjack (Vanilla TypeScript + Vite + Cloudflare Workers)

## Overview
This repository contains a Blackjack web app scaffold with implemented core game primitives:
- typed card/deck/shoe model
- deterministic dealer behavior helper
- baseline player decision AI with spot-checked strategy behaviors
- core round engine transitions (deal, actions, dealer play, settlement)
- Cloudflare Worker + Durable Object scaffold for online features

## Local setup
```bash
npm install
npm run dev
```

## Scripts
- `npm run dev` - Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run typecheck` - TypeScript check
- `npm run test` - Vitest
- `npm run worker:dev` - local worker
- `npm run worker:deploy` - deploy worker

## Rules configuration
Default rules are centralized in `src/game/engine.ts` as `DEFAULT_RULES`:
- 6 decks
- blackjack payout 3:2
- dealer hits soft 17
- min bet 10
- max split hands 4
- late surrender enabled

## Persistence keys
- `blackjack.theme`
- `blackjack.bankroll`
- `blackjack.startingCash`

## Cloudflare
### Pages
- Build command: `npm run build`
- Output directory: `dist`

### Worker
Configured in `wrangler.toml` with:
- `main = "worker/index.ts"`
- Durable Objects: `MATCHMAKER`, `GAME_ROOM`
- `ENVIRONMENT = "production"`

## Testing
```bash
npm run typecheck
npm run test
npm run build
```
