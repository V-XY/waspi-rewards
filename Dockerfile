FROM php:8.5-apache

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libsqlite3-dev \
    libpq-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application
COPY . .

# Install PHP dependencies
RUN composer install \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-dev

# Install frontend dependencies and build Vite assets
RUN npm ci \
    && npm run build \
    && rm -rf node_modules

# Create SQLite database file for local/container smoke tests.
RUN mkdir -p database \
    && touch database/database.sqlite

# Laravel permissions
RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache \
    database

RUN chmod -R 775 \
    storage \
    bootstrap/cache \
    database

# Safe container defaults. APP_KEY must be supplied at runtime.
ENV APP_ENV=production \
    APP_DEBUG=false \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/database/database.sqlite \
    SESSION_DRIVER=array \
    CACHE_STORE=array \
    QUEUE_CONNECTION=sync \
    RUN_DATABASE_SETUP=false \
    LOG_CHANNEL=stderr \
    LOG_LEVEL=warning

# Apache configuration
RUN a2enmod rewrite \
    && sed -ri 's/^Listen 80$/Listen 10000/' /etc/apache2/ports.conf \
    && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:10000>/' /etc/apache2/sites-available/*.conf

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri \
    -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
    /etc/apache2/sites-available/*.conf

RUN sed -ri \
    -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

# Allow Laravel .htaccess to control requests under the public document root
RUN sed -ri \
    '/<Directory \/var\/www\/html\/public>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' \
    /etc/apache2/apache2.conf

COPY docker/container-entrypoint.sh /usr/local/bin/container-entrypoint
RUN chmod +x /usr/local/bin/container-entrypoint

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1:10000/up || exit 1

ENTRYPOINT ["/usr/local/bin/container-entrypoint"]
CMD ["apache2-foreground"]
