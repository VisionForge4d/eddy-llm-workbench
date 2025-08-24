#!/usr/bin/env bash
set -euo pipefail

# Make config dir; ignore errors on bind mounts
mkdir -p /home/llm/.config/llm-workbench || true
chmod 700 /home/llm/.config /home/llm/.config/llm-workbench >/dev/null 2>&1 || true
chown -R llm:llm /home/llm/.config >/dev/null 2>&1 || true

# Start Node server AS 'llm'
su -s /bin/sh -c "
  NODE_ENV=\${NODE_ENV:-production} \
  XDG_CONFIG_HOME=\${XDG_CONFIG_HOME:-/home/llm/.config} \
  LLMWB_BIND_HOST=\${LLMWB_BIND_HOST:-127.0.0.1} \
  LLMWB_PORT=\${LLMWB_PORT:-3000} \
  node /opt/llm/apps/server/dist/index.js \
    --host \${LLMWB_BIND_HOST:-127.0.0.1} \
    --port \${LLMWB_PORT:-3000} &
" llm

# Ensure nginx runtime dirs exist
mkdir -p /var/run/nginx /var/cache/nginx
chown -R www-data:www-data /var/run/nginx /var/cache/nginx

# Run nginx in foreground
exec nginx -g 'daemon off;'
