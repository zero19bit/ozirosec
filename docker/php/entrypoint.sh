#!/usr/bin/env sh
set -eu

mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache

if [ "${APP_ENV:-}" = "production" ] && [ "${HACKPATH_CACHE_BOOTSTRAP:-true}" = "true" ]; then
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
fi

exec "$@"
