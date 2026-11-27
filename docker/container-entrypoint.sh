#!/bin/sh
set -eu

if [ "${RUN_DATABASE_SETUP:-false}" = "true" ]; then
    attempt=1

    until php artisan migrate --force; do
        if [ "$attempt" -ge 10 ]; then
            echo "Database migrations failed after 10 attempts." >&2
            exit 1
        fi

        attempt=$((attempt + 1))
        sleep 3
    done

    php artisan db:seed --force
fi

# Caches are built here, not in the image, because the environment
# variables that config depends on only exist when the container starts.
php artisan config:cache
php artisan view:cache

exec "$@"
