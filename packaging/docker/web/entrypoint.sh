#!/usr/bin/env bash
set -euo pipefail

mkdir -p /home/llm/.config/llm-workbench || true
chmod 700 /home/llm/.config /home/llm/.config/llm-workbench >/dev/null 2>&1 || true
chown -R llm:llm /home/llm/.config >/dev/null 2>&1 || true

# Standardize on 5000 by default
: "${LLMWB_BIND_HOST:=127.0.0.1}"
: "${LLMWB_PORT:=5000}"

su -s /bin/sh -c "
  NODE_ENV=\${NODE_ENV:-production} \
  XDG_CONFIG_HOME=\${XDG_CONFIG_HOME:-/home/llm/.config} \
  LLMWB_BIND_HOST=$LLMWB_BIND_HOST \
  LLMWB_PORT=$LLMWB_PORT \
  node /opt/llm/apps/server/dist/index.js \
    --host $LLMWB_BIND_HOST \
    --port $LLMWB_PORT &
" llm

# Alpine uses 'nginx' user; Debian uses 'www-data'
chown -R nginx:nginx /var/run/nginx /var/cache/nginx 2>/dev/null || chown -R www-data:www-data /var/run/nginx /var/cache/nginx 2>/dev/null || true

exec nginx -g 'daemon off;'
