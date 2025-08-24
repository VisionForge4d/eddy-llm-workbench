# --- build web ---
FROM node:22-alpine AS webbuild
WORKDIR /app/apps/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY apps/web ./
RUN npm run build

# --- build server ---
FROM node:22-alpine AS serverbuild
WORKDIR /app/apps/server
COPY apps/server/package.json apps/server/package-lock.json ./
RUN npm ci
COPY apps/server ./
RUN npm run build

# --- runtime ---
FROM nginx:1.27-alpine
RUN apk add --no-cache nodejs-current bash wget
# users
RUN addgroup -S llm && adduser -S llm -G llm

# nginx config (listens on 80, proxies to 127.0.0.1:5000)
COPY proxy/nginx/nginx.conf /etc/nginx/nginx.conf

# static web
COPY --from=webbuild /app/apps/web/dist/ /usr/share/nginx/html/
# api bundle
COPY --from=serverbuild /app/apps/server/dist/ /opt/llm/apps/server/dist/

# entrypoint
COPY packaging/docker/web/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1/nginx-healthz >/dev/null 2>&1 || exit 1

EXPOSE 80
CMD ["/entrypoint.sh"]
