FROM docker.io/dunglas/frankenphp:1.13.4-php8.4-bookworm AS prod

RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install extensions
RUN install-php-extensions pdo pdo_pgsql mbstring pcntl bcmath zip redis

# Get Composer
COPY --from=docker.io/composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Dependencies
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts -q

# Codebase
COPY backend/ /app

# Ensure standard Laravel directory structure exists for bootstrapping
RUN mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs

# Bake Octane worker dependencies into public/
RUN php artisan octane:install --server=frankenphp

# Optimize autoloader and establish folder baseline permissions
RUN composer dump-autoload -o \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY ./docker/app/Caddyfile /etc/frankenphp/Caddyfile

FROM prod AS dev

# Dev dependencies (phpunit, pint, ...); devspace doesn't sync vendor/
RUN composer install --no-interaction --no-scripts -q \
    && composer dump-autoload -o
