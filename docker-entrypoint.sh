#!/bin/sh
set -e

VITE_API_URL="${VITE_API_URL:-}"
VITE_AUTH_UI_URL="${VITE_AUTH_UI_URL:-}"

sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" /usr/share/nginx/html/env-config.js
sed -i "s|__VITE_AUTH_UI_URL__|${VITE_AUTH_UI_URL}|g" /usr/share/nginx/html/env-config.js

exec "$@"
