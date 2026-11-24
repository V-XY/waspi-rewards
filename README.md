# WASPI Rewards

A Laravel and Vue.js application implementing the WASPI Rewards point and badge system.

## Requirements

- PHP 8.4+
- Composer
- Node.js and npm
- SQLite or another supported database

## Local Installation

Clone the repository:

```bash
git clone https://github.com/V-XY/waspi-rewards.git
cd waspi-rewards
```

Install PHP dependencies:

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
php artisan key:generate
```

Configure the database in `.env`.

For SQLite, create the database file:

```bash
touch database/database.sqlite
```

Run migrations and seed the database:

```bash
php artisan migrate --seed
```

Install and build frontend dependencies:

```bash
npm ci
npm run build
```

Start the Laravel development server:

```bash
php artisan serve
```

## Docker Deployment

Build the image:

```bash
docker build -t waspi-rewards .
```

Run it with a runtime application key:

```bash
docker run --detach --name waspi-rewards \
  --publish 8080:80 \
  --env APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')" \
  waspi-rewards
```

The container defaults to production mode, disables debug output, and uses file-backed sessions/cache with a synchronous queue. Supply a unique `APP_KEY` at runtime. Never bake secrets into the image.

The container's SQLite database is located at `/var/www/html/database/database.sqlite`. The image contains an empty database file; migrations and seed data are not run during image construction. For a disposable assessment demo, initialise the database after the container starts:

```bash
docker exec waspi-rewards php artisan migrate --force
docker exec waspi-rewards php artisan db:seed --force
```

For any deployment where data must survive container replacement, mount persistent storage at `/var/www/html/database` or configure a managed PostgreSQL/MySQL database. A container-local SQLite file is not durable storage on platforms that replace containers or use ephemeral filesystems. Back up persistent data and run migrations as a release step before serving traffic.

The container exposes port `80`. Apache serves Laravel from the `public` directory.

## Environment Configuration

Minimum runtime settings:

```text
APP_ENV=production
APP_DEBUG=false
APP_KEY=your-generated-laravel-key
APP_URL=https://your-deployment-host

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/database/database.sqlite

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

Keep any additional environment variables required by the application. Use a managed database and its connection variables when deploying beyond a disposable demonstration.

## Controlled Public Demonstration

Public demo access is disabled by default.

Only enable it when a public demonstration is intended:

```text
WASPI_DEMO_ACCESS_ENABLED=true
WASPI_DEMO_USER_EMAIL=demo@waspi-rewards.test
```

Run the database seeder so the dedicated demo account exists. The rate-limited `POST /api/demo-token` endpoint issues a one-hour bearer token for that account only. It does not issue tokens for arbitrary users.

Do not enable this endpoint on an environment containing real user accounts or sensitive data. Keep it disabled for normal deployments.

## Testing

Run the application test suite:

```bash
php artisan test
```

The GitHub Actions workflow also installs frontend dependencies, audits the dependency tree, builds the Vue/Vite assets, builds the Docker image, starts the container, applies migrations and seed data, and checks the rendered page, compiled JavaScript asset, demo-token endpoint, and authenticated users API.

## API

The users endpoint requires a bearer token:

```http
GET /api/users
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Optional filters:

- `type` — filter users by badge type
- `points` — filter users by points

Missing or invalid credentials must not return user data. Tokens must not be supplied in query strings.

## Reward Rules

| Action | Requirement | Points | Badge |
|---|---:|---:|---|
| First comment | 1 comment | 50 | Beginner |
| Comments | 30 comments | 2,500 | Top Fan |
| Comments | 50+ comments | 5,000 | Super Fan |
| Likes | 10 likes | 500 | Beginner |

The application also determines the next badge available to each user based on their current activity and points.

## Project Structure

```text
app/
├── Http/
├── Models/
└── Services/

database/
├── migrations/
└── seeders/

resources/
├── js/
└── views/

routes/
├── api.php
└── web.php

public/
Dockerfile
package.json
composer.json
vite.config.js
```

## Assessment Context

This repository was developed as a technical assessment for a Full Stack Developer position. It demonstrates Laravel backend development, Vue.js frontend integration, REST API design, database relationships, reward and badge logic, authentication, automated testing, and containerised deployment.
