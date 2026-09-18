#!/bin/sh
set -e

# Normalizar permisos del volumen de storage (los primeros deploys lo dejaron con root).
mkdir -p storage/app/public storage/app/private
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
php artisan storage:link >/dev/null 2>&1 || true

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
