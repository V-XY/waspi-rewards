FROM php:8.4-apache

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libsqlite3-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
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
RUN npm ci && npm run build

# Create SQLite database if it does not already exist
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

# Apache configuration
RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri \
    -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
    /etc/apache2/sites-available/*.conf

RUN sed -ri \
    -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

# Allow Laravel .htaccess to control requests under the public document root
RUN sed -ri \\\n    '/<Directory \\/var\\/www\\/html\\/public>/,/<\\/Directory>/ s/AllowOverride None/AllowOverride All/' \\\n    /etc/apache2/apache2.conf

EXPOSE 80

CMD ["apache2-foreground"]