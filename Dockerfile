# syntax=docker/dockerfile:1

# --- Build TypeScript ---
FROM node:20-bookworm-slim AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Production runtime ---
FROM node:20-bookworm-slim AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Data paths must match compiled modules (paths relative to files under dist/).
COPY --from=builder /usr/src/app/bank-data ./dist/bank-data
COPY --from=builder /usr/src/app/state-data ./dist/state-data
COPY --from=builder /usr/src/app/data ./dist/data
COPY --from=builder /usr/src/app/services/speakerSlots/speaker-slots-seed-data.json ./dist/services/speakerSlots/

# User-upload / static dirs (excluded from build context in .dockerignore — create empty; mount volumes in compose if needed).
RUN mkdir -p dist/observerId dist/profileImage dist/electionsData

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 5050
ENV PORT=5050

CMD ["node", "dist/server.js"]
