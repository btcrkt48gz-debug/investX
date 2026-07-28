# InvestX

InvestX is a full-stack investment platform where users can invest in stocks, crypto, commodities, and real estate — with Firebase-backed auth, real-time portfolio tracking, admin dashboard, and gift card redemption.

## Run & Operate

- `pnpm --filter @workspace/investment-app run dev` — frontend dev server (port 23659)
- `pnpm --filter @workspace/api-server run dev` — build & start API server (port 8080)
- `pnpm --filter @workspace/investment-app run build` — production frontend build → `artifacts/investment-app/dist/public`
- `pnpm --filter @workspace/api-server run build` — bundle API → `artifacts/api-server/dist/index.mjs`
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4 + Framer Motion + Wouter (routing)
- **Backend**: Express 5 + Pino logging + file-based JSON store (`data/`)
- **Auth**: Firebase Auth (email/password) + Firebase Firestore for user data
- **Realtime DB**: Firebase Realtime Database
- **Admin auth**: `ADMIN_SECRET` env var (auto-generates if unset)
- **JWT auth**: `JWT_SECRET` env var (auto-generates if unset, sessions reset on restart)
- pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `artifacts/investment-app/` — React/Vite frontend, all pages, components, Firebase lib
- `artifacts/api-server/` — Express API: auth, users, gift cards, crypto prices (CoinGecko), admin
- `artifacts/api-server/data/` — JSON file-based persistence (investx-users.json, investx-giftcards.json)
- `artifacts/investment-app/src/lib/firebase-config.ts` — Firebase project config
- `render.yaml` — Render deployment blueprint (frontend static site + backend web service)

## Deploy to Render

All Replit-specific dependencies have been removed. The project builds with standard pnpm.

**Frontend (Static Site):**
- Build: `pnpm install --frozen-lockfile=false && pnpm --filter @workspace/investment-app run build`
- Publish directory: `artifacts/investment-app/dist/public`
- Rewrites: `/* → /index.html`

**Backend (Web Service):**
- Build: `pnpm install --frozen-lockfile=false && pnpm --filter @workspace/api-server run build`
- Start: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- Env vars: `JWT_SECRET` (min 32 chars), `ADMIN_SECRET` (min 8 chars)

See `render.yaml` for the full blueprint — connect your GitHub repo on Render and it auto-reads this file.

## Architecture decisions

- **File-based data store** — user and gift card records are kept in `data/*.json` on the API server. No PostgreSQL needed for the API; Firebase Firestore handles all user-facing data.
- **Dual auth** — Firebase handles frontend auth (email/password) and provides real-time sync; the Express API has its own JWT-based auth for server-side routes (gift cards, admin, transfers).
- **Replit plugins removed** — `@replit/vite-plugin-*` dependencies and hard-coded PORT/BASE_PATH requirements removed; defaults to port 3000 and base `/` for standard deployments.
- **`catalog:` entries resolved** — all `pnpm catalog:` shorthand replaced with explicit version pins so `pnpm install` works outside a Replit workspace.

## User preferences

_Populate as you build._

## Gotchas

- `JWT_SECRET` and `ADMIN_SECRET` auto-generate per-process if not set — set them in environment secrets to persist sessions across restarts.
- The API server writes `data/investx-users.json` and `data/investx-giftcards.json` to disk relative to `process.cwd()`. On Render, use a persistent disk or migrate to a database for production durability.
- Firebase config is hardcoded in `src/lib/firebase-config.ts`. For production, consider moving it to environment variables.
