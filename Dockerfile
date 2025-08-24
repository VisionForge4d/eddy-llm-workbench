# --- web build ---
FROM node:22-alpine AS webbuild
WORKDIR /build/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY apps/web .
RUN npm run build

# --- server deps (dev) ---
FROM node:22-alpine AS serverdeps
WORKDIR /build/server
COPY apps/server/package.json apps/server/package-lock.json ./
RUN npm ci --no-audit --no-fund

# --- server build (uses dev deps) ---
FROM serverdeps AS serverbuild
WORKDIR /build/server
COPY apps/server .
RUN npm run build   # produces /build/server/dist

# --- server prod deps (runtime shrink) ---
FROM node:22-alpine AS serverprod
WORKDIR /build/server
COPY apps/server/package.json apps/server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# --- runtime (Node 22 + nginx) ---
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN apk add --no-cache nginx wget \
 && addgroup -S llm && adduser -S llm -G llm

# master wraps http{} and includes conf.d
COPY proxy/nginx/nginx.master.min.conf /etc/nginx/nginx.conf
# your server/site (listen 8080; upstream 127.0.0.1:5000)
COPY proxy/nginx/nginx.conf            /etc/nginx/conf.d/default.conf

# static frontend
COPY --from=webbuild    /build/web/dist/                    /usr/share/nginx/html/

# API build + prod node_modules
COPY --from=serverbuild /build/server/dist/                 /opt/llm/apps/server/dist/
COPY --from=serverprod  /build/server/node_modules/         /opt/llm/apps/server/node_modules/
COPY --from=serverprod  /build/server/package.json          /opt/llm/apps/server/package.json

# fail fast if nginx conf breaks
RUN nginx -t

USER llm
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/nginx-healthz >/dev/null || exit 1

# start API then nginx (site listens on 8080)
CMD ["/bin/sh","-lc","node /opt/llm/apps/server/dist/index.js & exec nginx -g 'daemon off;'"]
