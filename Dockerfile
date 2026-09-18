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

# Dependencias del sistema + extensiones de Laravel (pgsql, redis, gd)
RUN apk add --no-cache \
        $PHPIZE_DEPS \
        nginx \
        supervisor \
        libpq \
        libpq-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql pgsql \
        mbstring zip intl gd pcntl bcmath exif \
    && pecl install redis \
    && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar el codigo fuente
COPY --from=frontend /app/public/build ./public/build
COPY . .

# Crear directorios de runtime (storage y bootstrap/cache estan excluidos en .dockerignore)
RUN mkdir -p storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
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
