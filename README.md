# Blackjack

Vanilla TypeScript + Vite Blackjack app focused on solo play with offline support.

## Features
- Solo mode with setup modal (role, bankroll, bet, AI difficulty).
- Core engine/AI wired into a playable table UI.
- Theme persistence (`blackjack.theme`).
- Bankroll and starting cash persistence (`blackjack.bankroll`, `blackjack.startingCash`).
- PWA service worker for offline solo play after first load.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Vite:
   ```bash
   npm run dev
   ```
3. Open the URL printed by Vite (usually `http://localhost:5173` or `http://127.0.0.1:5173`).

Do **not** open `index.html` directly from the filesystem (`file://...`). This project uses TypeScript modules (`/src/main.ts`) that must be compiled/served by Vite.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
- `npm run test`

## Rules and engine
Rules live in `src/game/engine.ts` (`DEFAULT_RULES`). Update that object to change table behavior (blackjack payout, dealer soft 17 rule, split limits, surrender, etc.).

## Offline / PWA
`public/sw.js` caches app shell and static assets cache-first for local offline use after initial load.

## Deployment
Build for production before deploying:
```bash
npm run build
```

Deploy the generated `dist` folder.

### Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

## Tests
```bash
npm run typecheck
npm run test
npm run build
```
