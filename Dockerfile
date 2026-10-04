# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Enable corepack for pnpm
RUN corepack enable pnpm

# 1) Cache lockfile & manifests
COPY package.json pnpm-lock.yaml ./

# 2) Install dependencies (frozen lockfile)
RUN pnpm install --frozen-lockfile

# 3) Copy source
COPY . .

# 4) Build
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 app-user

# Copy standalone output
COPY --from=builder --chown=app-user:nodejs /app/.next/standalone ./
COPY --from=builder --chown=app-user:nodejs /app/.next/static ./ .next/static
COPY --from=builder --chown=app-user:nodejs /app/public ./public 2>/dev/null || true

USER app-user

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
