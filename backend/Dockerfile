# syntax=docker/dockerfile:1.7

FROM composer:2 AS vendor-dev
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-progress --no-scripts

FROM composer:2 AS vendor-prod
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-scripts \
    --classmap-authoritative

FROM php:8.2-fpm-alpine AS php-base
WORKDIR /var/www/html

RUN apk add --no-cache \
        bash \
        icu-dev \
        libzip-dev \
        postgresql-dev \
        shadow \
    && docker-php-ext-install \
        intl \
        opcache \
        pcntl \
        pdo_mysql \
        pdo_pgsql \
        zip \
    && apk del shadow

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/entrypoint.sh /usr/local/bin/hackpath-entrypoint
RUN chmod +x /usr/local/bin/hackpath-entrypoint \
    && mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data /var/www/html

ENTRYPOINT ["hackpath-entrypoint"]
CMD ["php-fpm"]

FROM php-base AS development
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=vendor-dev --chown=www-data:www-data /app/vendor ./vendor
USER www-data

FROM php-base AS production
ENV APP_ENV=production
COPY --from=vendor-prod --chown=www-data:www-data /app/vendor ./vendor
COPY --chown=www-data:www-data backend ./
RUN php artisan package:discover --ansi \
    && php artisan event:cache \
    && rm -rf \
        storage/logs/* \
        storage/framework/cache/data/* \
        storage/framework/sessions/* \
        storage/framework/testing/* \
        storage/framework/views/*
USER www-data
