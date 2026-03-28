FROM node:20-alpine AS base
WORKDIR /app

# Install OpenSSL — required by Prisma on Alpine
RUN apk add --no-cache openssl

# --- Backend dependencies ---
COPY package.json package-lock.json* ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# --- Frontend build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- Backend build ---
FROM base AS backend-builder
COPY . .
RUN npm run build

# --- Final runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package.json ./package.json
COPY --from=backend-builder /app/prisma ./prisma

# Copy frontend build output next to backend
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Ensure Prisma engine files are readable by appuser
RUN chown -R appuser:nodejs /app/node_modules/.prisma

USER appuser

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
