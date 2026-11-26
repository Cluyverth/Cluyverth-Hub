# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM dependencies AS source
COPY astro.config.mjs tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY vault/posts/ ./vault/posts/

FROM source AS development
EXPOSE 4321
# Compose owns the dev server lifecycle; do not persist Astro's PID lock across restarts.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4321", "--ignore-lock"]

FROM source AS build
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS production
LABEL org.opencontainers.image.title="Cluyverth Hub"
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
