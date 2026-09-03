# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24.13.0-alpine3.22@sha256:bb089be859f2741e5ede9d85f47dc7daca754015b50e9642a7a45c5252807d2c

FROM ${NODE_IMAGE} AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,id=npm-cache,target=/root/.npm,sharing=locked \
    npm ci --ignore-scripts --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


FROM ${NODE_IMAGE} AS production-dependencies
WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,id=npm-cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev --ignore-scripts --no-audit --no-fund


FROM ${NODE_IMAGE} AS runtime

LABEL org.opencontainers.image.title="infrastructure-interview-api" \
      org.opencontainers.image.description="Production-ready posts API" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production

WORKDIR /app

COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./package.json

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
