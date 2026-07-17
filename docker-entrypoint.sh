#!/bin/sh

ENV_FILE="/app/dist/env-config.js"

if [ -f "$ENV_FILE" ]; then
  sed -i "s|__VITE_API_URL__|${VITE_API_URL:-}|g" "$ENV_FILE"
  sed -i "s|__VITE_AUTH_UI_URL__|${VITE_AUTH_UI_URL:-}|g" "$ENV_FILE"
fi

exec node dist-server/server/index.js
