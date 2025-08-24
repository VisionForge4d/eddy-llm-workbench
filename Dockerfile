# --- web build ---
FROM node:22-alpine AS webbuild
WORKDIR /build/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY apps/web .
RUN npm run build

# --- server build (runtime deps only) ---
FROM node:22-alpine AS serverbuild
WORKDIR /build/server
COPY apps/server/package.json apps/server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund   # installs express & friends
COPY apps/server .
RUN npm run build

# --- runtime (Node 22 + Nginx) ---
FROM node:22-alpine AS runtime
RUN apk add --no-cache nginx wget \
 && addgroup -S llm && adduser -S llm -G llm
ENV NODE_ENV=production

# Nginx config: master + site (your existing server file)
COPY proxy/nginx/nginx.master.min.conf /etc/nginx/nginx.conf
COPY proxy/nginx/nginx.conf            /etc/nginx/conf.d/default.conf

# Frontend
COPY --from=webbuild    /build/web/dist/         /usr/share/nginx/html/

# API (dist + node_modules)
COPY --from=serverbuild /build/server/dist/      /opt/llm/apps/server/dist/
COPY --from=serverbuild /build/server/node_modules/ /opt/llm/apps/server/node_modules/
COPY --from=serverbuild /build/server/package.json  /opt/llm/apps/server/package.json

# Permissions
RUN chown -R llm:llm /usr/share/nginx/html /opt/llm
USER llm

EXPOSE 80
# Sanity check at build time (runs as root is fine if you prefer; optional here)
# USER root
# RUN nginx -t && chown -R llm:llm /etc/nginx
# USER llm

# Start API then Nginx (master handles include of conf.d)
CMD ["/bin/sh","-lc","node /opt/llm/apps/server/dist/index.js & exec nginx -g 'daemon off;'"]
