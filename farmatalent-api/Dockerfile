FROM php:8.3-cli-alpine

RUN apk add --no-cache bash git icu-dev libzip-dev oniguruma-dev unzip zip \
    && docker-php-ext-install intl mbstring pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .
RUN composer dump-autoload

EXPOSE 8000
