FROM node:20-alpine AS base

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Prune the workspace for the specific app
FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
# The context must be the root of the monorepo
COPY . .
RUN turbo prune @compliance-os/cnpj-service --docker

# 2. Install dependencies and build
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=@compliance-os/cnpj-service...

# 3. Final Production Runner
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api_user

# Copy the entire built monorepo workspace for reliable execution
COPY --from=installer /app .

USER api_user
EXPOSE 4001
ENV PORT=4001

# Start the specific workspace app
CMD ["pnpm", "--filter", "@compliance-os/cnpj-service", "start"]
