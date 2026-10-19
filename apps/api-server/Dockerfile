# syntax=docker/dockerfile:1.4

# -------------------------------------------------------------
# 1. Base Node & PNPM Environment
# -------------------------------------------------------------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:/app/node_modules/.bin:$PATH"
ENV CI=true
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# -------------------------------------------------------------
# 2. Prune Monorepo Stage (isolates api-server + its workspace deps)
# -------------------------------------------------------------
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @kalya/api-server --docker

# -------------------------------------------------------------
# 3. Dependencies Stage
# -------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Native build toolchain for better-sqlite3 (and any fallback builds)
RUN apk add --no-cache python3 make g++ sqlite-dev libc6-compat

# Use the Node headers already shipped in the image so node-gyp does not
# download them from unofficial-builds.nodejs.org (fails on flaky networks)
ENV npm_config_nodedir=/usr/local

# Be tolerant of slow/flaky registry connections
ENV npm_config_fetch_retries=5
ENV npm_config_fetch_retry_mintimeout=20000
ENV npm_config_fetch_timeout=180000

# Pruned manifests + lockfile first (best layer caching)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install all deps (tsx runs the TS source at runtime, so no dist/ is needed)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Pruned source files (workspace packages are consumed as TS source)
COPY --from=pruner /app/out/full/ .

# Fail the build early if fastify did not get linked into the api-server
RUN test -d apps/api-server/node_modules/fastify \
    && test -x apps/api-server/node_modules/.bin/tsx

# -------------------------------------------------------------
# 4. Production Runner Stage
# -------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV KALYA_SERVER_HOST="0.0.0.0"
ENV PORT=3600

# Default Super-Admin configuration (can be configured via container environment)
ENV KALYA_SUPER_ADMIN_FIRST_NAME="Admin" \
    KALYA_SUPER_ADMIN_MIDDLE_NAME="" \
    KALYA_SUPER_ADMIN_LAST_NAME="User" \
    KALYA_SUPER_ADMIN_USERNAME="admin" \
    KALYA_SUPER_ADMIN_EMAIL="admin@example.com" \
    KALYA_SUPER_ADMIN_PASSWORD=""

# Runtime SQLite library and CLI tool
RUN apk add --no-cache sqlite sqlite-libs libc6-compat

# Application + installed node_modules (pnpm symlinks are preserved)
COPY --from=builder /app /app

# Persistent storage directories with explicit permissions
RUN mkdir -p /app/data /app/uploads /app/logs \
    && chown -R node:node /app/data /app/uploads /app/logs \
    && chmod -R 775 /app/data /app/uploads /app/logs

EXPOSE 3600

# Starts `tsx src/index.ts` (migrations & super-admin seed run automatically on server boot)
CMD ["pnpm", "--filter", "@kalya/api-server", "start"]