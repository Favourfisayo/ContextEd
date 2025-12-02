# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.19.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
RUN npm install -g pnpm@10.23.0
RUN npm install -g turbo

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 openssl

# Copy application code
COPY . .

# Prune the workspace for the server app
RUN turbo prune --scope=server --docker

# Install dependencies and build
# We use the pruned output to install only what is needed
FROM base as installer

# Install system deps for Prisma/builds if needed
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl build-essential python3

WORKDIR /app

# Copy pruned package.json and lockfile
COPY --from=build /app/out/json/ .
COPY --from=build /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
# We ignore scripts here because the source code (and schema) isn't copied yet
RUN pnpm install --frozen-lockfile --prod=false --ignore-scripts

# Copy source code
COPY --from=build /app/out/full/ .
# Explicitly copy the schema file to ensure it exists
COPY packages/db/prisma/schema/schema.prisma /app/packages/db/prisma/schema/schema.prisma
# Copy root tsconfig files which might be missing from pruned output
COPY --from=build /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=build /app/tsconfig.json ./tsconfig.json

# Generate Prisma Client (needed for the build)
# We assume packages/db is where the schema is
# We set a dummy DATABASE_URL because prisma generate needs it to validate the schema,
# but it doesn't actually connect to the DB during generation.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm turbo run postinstall

# Build the project
RUN pnpm turbo run build --filter=server...

# Final stage for app image
FROM base

# Install openssl for Prisma
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application
COPY --from=installer /app/apps/server/dist ./apps/server/dist
COPY --from=installer /app/apps/server/package.json ./apps/server/package.json

# Copy node_modules (pruned production deps would be better, but copying from installer is safer for monorepos)
# Note: This copies devDeps too unless we prune again. For simplicity in monorepo, we copy all.
# To optimize: run `pnpm prune --prod` in installer stage before copying.
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=installer /app/packages ./packages

# Start the server by default, this can be overwritten at runtime
CMD [ "node", "apps/server/dist/index.js" ]
