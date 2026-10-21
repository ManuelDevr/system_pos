# -----------------------------------------------------------------------------
# Ferreteria_Pos - Imagen de la app Laravel + React (Inertia)
# Build de 2 etapas: compila assets con Node y arma la app con PHP-FPM + Nginx.
# -----------------------------------------------------------------------------

# --- Etapa 1: Build de assets (npm) ---
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_APP_NAME="Ferreteria POS"
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build

# --- Etapa 2: Aplicacion PHP-FPM ---
FROM php:8.2-fpm-alpine AS app
WORKDIR /var/www/html

# Paquetes de runtime del sistema (nginx + supervisor). Las extensiones PHP y
# sus dependencias de compilacion las resuelve install-php-extensions, que
# ademas usa binarios precompilados cuando existen, reintenta descargas y
# limpia los paquetes de build al terminar.
RUN apk add --no-cache nginx supervisor

# Extensiones de Laravel (pgsql, redis, gd, intl, ...). Usar el instalador
# oficial en lugar de `pecl install` evita depender de pecl.php.net (causa del
# fallo 504 Gateway Timeout del build anterior).
COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions \
        pdo_pgsql pgsql \
        mbstring zip intl gd pcntl bcmath exif redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Limite de memoria. Por defecto PHP CLI/FPM usa 128M, insuficiente para
# `php artisan route:cache` en este proyecto (falla con "Allowed memory size
# of 134217728 bytes exhausted" en RouteCacheCommand).
RUN printf 'memory_limit=512M\n' > /usr/local/etc/php/conf.d/zz-memory-limit.ini

# Copiar el codigo fuente
COPY --from=frontend /app/public/build ./public/build
COPY . .

# Crear directorios de runtime (storage y bootstrap/cache estan excluidos en .dockerignore)
RUN mkdir -p storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        storage/app/public \
        storage/app/private \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Instalar dependencias de PHP (sin scripts de produccion aun)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Nginx + supervisor
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
