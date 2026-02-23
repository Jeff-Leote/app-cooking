FROM node:22-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY assets ./assets
COPY webpack.config.mjs postcss.config.js tailwind.config.js ./
RUN npm run build

FROM php:8.3-cli-alpine
WORKDIR /var/www/html

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
COPY --from=assets /app/public/build ./public/build

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public public/index.php"]