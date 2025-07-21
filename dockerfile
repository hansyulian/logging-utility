# --- Stage 1: Builder ---
FROM node:24-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy full monorepo
COPY . .

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Build common first
RUN pnpm --filter "common" run build

# Then build backend (which may depend on common)
RUN pnpm --filter "backend" run build

WORKDIR /app/apps/backend
EXPOSE 9952

CMD ["pnpm", "start"]
