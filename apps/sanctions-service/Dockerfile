FROM node:20-alpine AS builder

# Enable corepack
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN rm -rf node_modules && pnpm install --frozen-lockfile

COPY . .

# Build typescript definition via tsup
RUN pnpm build

FROM node:20-alpine AS runner

RUN corepack enable

WORKDIR /app

# Production only dependencies
COPY package.json pnpm-lock.yaml* ./
RUN rm -rf node_modules && pnpm install --prod --ignore-scripts

# Copy output build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./src/db/migrations

ENV NODE_ENV=production
ENV PORT=4002

EXPOSE 4002

CMD ["node", "dist/server.js"]
