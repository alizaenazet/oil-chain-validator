FROM node:22-bookworm-slim AS toolchain
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate
WORKDIR /app

# ---- dependency layer WITH devDependencies (hardhat, vite, nodemon, etc.) ----
FROM toolchain AS base
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY blockchain/package.json blockchain/package.json
RUN pnpm install --frozen-lockfile
RUN for pkg in sqlite3 better-sqlite3 bcrypt; do \
  dir=$(find /app/node_modules/.pnpm -maxdepth 1 -type d -name "${pkg}@*" | head -n1); \
  echo "Rebuilding ${pkg} from source: ${dir}"; \
  (cd "${dir}/node_modules/${pkg}" && npx node-gyp rebuild); \
  done
COPY . .
# ---- dev: used by every service in docker-compose.dev.yml, and by ----

# ---- contracts-deploy in BOTH compose files (see explanation)      ----
FROM base AS dev

# ---- dependency layer WITHOUT devDependencies, for prod runtimes ----
FROM toolchain AS prod-deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY blockchain/package.json blockchain/package.json
RUN pnpm install --frozen-lockfile --prod
COPY . .

FROM prod-deps AS backend-prod
WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "index.js"]

FROM base AS frontend-build
RUN pnpm --filter frontend build

FROM nginx:1.27-alpine AS frontend-prod
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
