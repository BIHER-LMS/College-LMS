# ============================================================
# College LMS Backend — Production Dockerfile
# ============================================================
# Multi-stage build for minimal image size.
# Secrets are injected via environment variables at runtime.
# ============================================================

# ── Stage 1: Build ────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: Production ──────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled code
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

# Environment variables are injected at runtime — NOT baked in.
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Run database migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
