# Use official Node.js 18 LTS image as build stage
FROM node:18.18.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --progress=false

COPY . .
RUN npm run build

# --- Production image ---
FROM node:18.18.0-alpine AS runner
WORKDIR /app

# Only copy production node_modules and built output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/.env* ./
COPY --from=builder /app/tsconfig.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npx", "next", "start"]
