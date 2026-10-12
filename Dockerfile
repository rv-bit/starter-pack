# syntax=docker/dockerfile:1.7

# ---------- Dependencies ----------
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

# ---------- Build ----------
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p /app/data

RUN --mount=type=secret,id=build_env \
	set -a; . /run/secrets/build_env; set +a; bun run build

# ---------- Database migrations ----------
FROM oven/bun:1-alpine AS migrator

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/scripts ./scripts

COPY --from=builder \
  /app/configs/database/drizzle-sqlite.config.ts \
  ./configs/database/drizzle-sqlite.config.ts

COPY --from=builder \
  /app/src/lib/database/schema \
  ./src/lib/database/schema

COPY --from=builder /app/drizzle ./drizzle
# ---------- Runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 app-user

COPY --from=builder --chown=app-user:nodejs /app/.next/standalone ./
COPY --from=builder --chown=app-user:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=app-user:nodejs /app/public ./public

USER app-user
EXPOSE 3000
CMD ["node", "server.js"]
