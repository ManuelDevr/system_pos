#!/bin/sh
set -e

# Si se recibe un comando (p. ej. el servicio pos-worker con queue:work),
# ejecutarlo directamente en lugar de arrancar el servidor web.
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

# Migraciones y creacion de cache en el arranque (entorno de produccion).
php artisan migrate --force || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Arrancar supervisor (php-fpm + nginx)
exec /usr/bin/supervisord -c /etc/supervisord.conf
