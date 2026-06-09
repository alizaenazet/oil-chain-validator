# AGENTS.md

Oil-chain validator: Hardhat 3 smart-contract project + Express backend + React frontend.

## Monorepo layout

| Directory | Purpose | Package manager |
|-----------|---------|-----------------|
| `/` (root) | Hardhat 3 (Solidity, Ignition, tests) | **pnpm** (`pnpm-lock.yaml`) |
| `backend/` | Express API (SQLite + Redis + Viem) | **npm** (`package-lock.json`) |
| `frontend/` | React 19 + Vite | npm/pnpm (no lockfile present) |
| `bruno/` | Bruno API test collection | — |

- Root is **ESM** (`"type": "module"`). Backend is **CommonJS** (`require`).
- `pnpm-workspace.yaml` is broken/placeholder (`allowBuilds: esbuild: set this to true or false`). Do not rely on it for workspace commands.

## Local development startup order

1. `docker compose up -d` — spins up Redis only (SQLite is file-based).
2. Install deps:
   - Root: `pnpm install`
   - Backend: `cd backend && npm install`
3. Compile contracts: `npx hardhat compile`
4. Start local Hardhat node: `npx hardhat node` (keep running).
5. Deploy contract locally:
   ```bash
   npx hardhat ignition deploy ./ignition/modules/OilValidator.ts --network localhost
   ```
6. Start backend: `cd backend && node index.js` (listens on `PORT`, default 3000).
7. Start frontend: `cd frontend && npm run dev` (default Vite port 5173).

## Environment & secrets

- **Root `.env`** / `example.env`: only `DATABASE_URL` and `REDIS_PORT`.
- **Backend `backend/.env`** holds all real secrets (`JWT_SECRET`, `ADMIN_PRIVATE_KEY`, `CONTRACT_ADDRESS`, etc.). **This file is present in the repo and contains plaintext secrets.**
- Backend `example.env` exists for reference.

## Hardhat / smart contract notes

- Hardhat 3 with `@nomicfoundation/hardhat-toolbox-viem`.
- Tests use `network.create()` + viem assertions (`viem.assertions.revertWith`, `emitWithArgs`). Tests are in `test/OilValidator.ts` (node:test style).
- Ignition deployment module: `ignition/modules/OilValidator.ts`.
- Sepolia network config requires env vars `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` (set via `configVariable`).

## Backend architecture

- Express server entry: `backend/index.js`.
- Auto-syncs SQLite tables on startup (`db.sequelize.sync({ alter: true })`). DB file lives at `backend/data/oilchain.db`.
- Redis client connects to `redis://${REDIS_HOST}:${REDIS_PORT}` (defaults to `127.0.0.1:6379`).
- Viem clients in `backend/config/viemClient.js` use the `hardhat` chain preset and expect `RPC_URL` pointing to the Hardhat node.
- **No automated tests** — backend `package.json` test script just exits with error.

## Known frontend ↔ backend mismatches

- **API baseURL mismatch**: Frontend axios instance (`frontend/src/services/api.js`) uses `baseURL: "http://localhost:3000/api/v1"`, but backend routes are mounted at the root (`/auth`, `/admin`, `/variants`, `/products`, `/validate`, `/stats`). There is **no `/api/v1` prefix** on the backend.
- **Admin login password mismatch**: Backend `authRoutes.js` hardcodes the password as `adminoilchain`. The backend `.env` sets `ADMIN_PASSWORD=admin123`, but that env var is **not read** by the login handler.

## Lint / build commands

- Frontend lint: `cd frontend && npm run lint` (ESLint with react-hooks + react-refresh).
- Frontend build: `cd frontend && npm run build`.
- Hardhat compile: `npx hardhat compile`.

## Other conventions

- Git ignores `/artifacts`, `/cache`, `/ignition/deployments`, `*.db`, `.env` (root level), but backend `.env` is currently tracked/visible.
- Bruno collection in `bruno/Oil-Chain-app/` documents the API endpoints.
