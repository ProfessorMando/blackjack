# Blackjack Web Application (Scaffold)

This repository contains an initial scaffold for a Blackjack web application using Vanilla TypeScript + Vite for the frontend and Cloudflare Workers + Durable Objects for online features.

## Status

Core Blackjack rule logic is intentionally not implemented yet.

- `src/game/engine.ts`: placeholder
- `src/game/ai.ts`: placeholder

Both are blocked pending a formal rules specification.

## Local Development

```bash
npm install
npm run dev
```

Type-check:

```bash
npm run typecheck
```

Build frontend:

```bash
npm run build
```

## Cloudflare Deployment

### Frontend (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`

### Worker (Cloudflare Workers)

Worker configuration is in `wrangler.toml`.

Deploy:

```bash
npm run worker:deploy
```

Run locally:

```bash
npm run worker:dev
```

## Environment Variables

Defined in `wrangler.toml`:

- `ENVIRONMENT=production`

Add additional worker variables/secrets via Wrangler or the Cloudflare dashboard.

## Persistence via localStorage

The scaffold currently persists:

- Theme preference (`blackjack.theme`)
- Bankroll value (`blackjack.bankroll`)
- Starting cash key reserved for next implementation step

## Service Worker / Offline

A minimal service worker is provided to enable app-shell caching and network-only handling for `/api/*` requests.

- Source scaffold: `src/sw.ts`
- Registered file: `public/sw.js`

## Project Structure

See the source tree under:

- `src/` frontend app and modules
- `worker/` Cloudflare Worker + Durable Objects

## Next Steps

1. Add full game rules specification.
2. Implement `engine.ts` and `ai.ts` from that spec.
3. Complete online queue/game room protocols.
4. Expand tests and Lighthouse optimization pass.
