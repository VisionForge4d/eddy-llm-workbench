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

# --- server build ---
FROM serverdeps AS serverbuild
WORKDIR /build/server
COPY apps/server .
RUN npm run build

# --- server prod deps ---
FROM node:22-alpine AS serverprod
WORKDIR /build/server
COPY apps/server/package.json apps/server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# --- runtime ---
FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=5000
RUN apk add --no-cache nginx wget tini \
 && addgroup -S llm && adduser -S llm -G llm
STOPSIGNAL SIGTERM
LABEL org.opencontainers.image.title="eddy-llm-workbench" \
      org.opencontainers.image.description="Self-hosted web + API workbench for switching between LLM providers." \
      org.opencontainers.image.source="https://github.com/visionforge4d/eddy-llm-workbench" \
      org.opencontainers.image.licenses="Apache-2.0"

# Unprivileged master + site (master has no 'user' and no 'pid'; temps -> /tmp; logs -> stdout/stderr)
COPY proxy/nginx/nginx.master.unpriv.nopid.conf /etc/nginx/nginx.conf
COPY proxy/nginx/nginx.conf                    /etc/nginx/conf.d/default.conf

# Static frontend
COPY --from=webbuild    /build/web/dist/            /usr/share/nginx/html/
# API build + prod node_modules
COPY --from=serverbuild /build/server/dist/         /opt/llm/apps/server/dist/
COPY --from=serverprod  /build/server/node_modules/ /opt/llm/apps/server/node_modules/
COPY --from=serverprod  /build/server/package.json  /opt/llm/apps/server/package.json

# Sanity check before nginx -t (ensures master has events{} and includes sites)
RUN grep -q '^[[:space:]]*events[[:space:]]*{' /etc/nginx/nginx.conf \
 && grep -q 'include /etc/nginx/conf.d/\*\.conf' /etc/nginx/nginx.conf

# Fail fast if nginx config broken
RUN nginx -t

# Non-root runtime; container listens on 8080
USER llm
EXPOSE 8080

# Healthcheck hits Nginx
HEALTHCHECK --interval=30s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/nginx-healthz >/dev/null || exit 1

# Proper init; start API, wait until healthy, then exec Nginx (no PID file writes)
ENTRYPOINT ["/sbin/tini","--"]
CMD ["/bin/sh","-lc","\
  node /opt/llm/apps/server/dist/index.js & \
  for i in $(seq 1 100); do wget -qO- http://127.0.0.1:${PORT}/health >/dev/null 2>&1 && break; sleep 0.2; done; \
  exec nginx -g 'pid /dev/null; error_log /dev/stderr notice; daemon off;' \
"]
