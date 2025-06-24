# Build stage
FROM node:18.18.0-alpine AS builder
WORKDIR /app

# Copy only package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source code and build
COPY . .
RUN npm run build

# Remove dev dependencies to keep only production modules
RUN npm prune --production

# Production stage
FROM node:18.18.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

# Avoid copying .env and tsconfig.json unless strictly needed at runtime

EXPOSE 3000

# Set proper permissions for the node user
RUN chown -R node:node /app

# Run as non-root user
USER node

# Install production dependencies at runtime
CMD npm install --production && npx next start
