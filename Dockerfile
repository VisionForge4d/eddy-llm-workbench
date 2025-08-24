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
# Dev deps needed for tsc
RUN npm ci --no-audit --no-fund

# --- server build (uses dev deps) ---
FROM serverdeps AS serverbuild
WORKDIR /build/server
COPY apps/server .
RUN npm run build   # must produce /build/server/dist

# --- server prod deps only (runtime shrink) ---
FROM node:22-alpine AS serverprod
WORKDIR /build/server
COPY apps/server/package.json apps/server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# --- runtime (Node 22 + nginx) ---
FROM node:22-alpine AS runtime
RUN apk add --no-cache nginx wget

# nginx master (wraps http{} and includes conf.d)
COPY proxy/nginx/nginx.master.min.conf /etc/nginx/nginx.conf
# your server/site file with map/upstream/listen 80
COPY proxy/nginx/nginx.conf            /etc/nginx/conf.d/default.conf

# static frontend
COPY --from=webbuild    /build/web/dist/                    /usr/share/nginx/html/

# API: built JS + prod node_modules
COPY --from=serverbuild /build/server/dist/                 /opt/llm/apps/server/dist/
COPY --from=serverprod  /build/server/node_modules/         /opt/llm/apps/server/node_modules/
COPY --from=serverprod  /build/server/package.json          /opt/llm/apps/server/package.json

# sanity: fail build if nginx conf is bad
RUN nginx -t

EXPOSE 80
# start API then nginx
CMD ["/bin/sh","-lc","node /opt/llm/apps/server/dist/index.js & exec nginx -g 'daemon off;'"]
