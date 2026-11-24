# WASPI Rewards

A Laravel and Vue.js application implementing the WASPI Rewards point and badge system.

## Requirements

- PHP 8.4+
- Composer
- Node.js and npm
- SQLite or PostgreSQL

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

## Docker

Build the image:

```bash
docker build -t waspi-rewards .
```

Run it with a runtime application key:

```bash
docker run --detach --name waspi-rewards \
  --publish 8080:10000 \
  --env APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')" \
  waspi-rewards
```

The container listens on port `10000`, serves Laravel from `public/`, and builds the Vue/Vite assets during image construction. It defaults to production mode with debug output disabled. Supply a unique `APP_KEY` at runtime; never bake secrets into the image.

The image uses SQLite by default for local container testing. Its database is not durable when the container is replaced. For a persistent deployment, configure PostgreSQL through `DB_CONNECTION=pgsql` and `DB_URL`, or use a genuinely persistent volume for SQLite.

The optional `RUN_DATABASE_SETUP=true` setting runs pending migrations and the database seeder before Apache starts. It is intended for the isolated hosted assessment environment. The sample-data seeder is repeat-safe, so container restarts do not continually duplicate the sample comments and likes. For a normal production deployment, run migrations as a controlled release step instead.

## Free Hosted Assessment Preview (Render + Neon)

The repository includes a Render Blueprint in `render.yaml`. It is configured to deploy only the `test/harden-rewards-suite` branch on Render's Free web-service plan.

The hosted preview uses:

- Render Free Docker web service for the Laravel application.
- Neon Free PostgreSQL for durable relational data.
- A generated Laravel application key.
- A dedicated seeded demonstration account.
- Startup migrations and one-time sample-data seeding.
- The `/up` health endpoint.

Setup instructions, environment variables, free-tier limits, and the demonstration flow are documented in [the Render preview guide](docs/deployment/render-preview.md).

This is a demonstration environment, not production hosting. Render free services sleep after 15 minutes without traffic and can take about a minute to wake. Their local filesystem is ephemeral, so the database must remain external. Do not use Render's free PostgreSQL for this long-lived preview because Render deletes free PostgreSQL databases after 30 days.

## Environment Configuration

Minimum runtime settings for a conventional deployment:

```text
APP_ENV=production
APP_DEBUG=false
APP_KEY=your-generated-laravel-key
APP_URL=https://your-deployment-host

DB_CONNECTION=pgsql
DB_URL=your-postgresql-connection-string

SESSION_DRIVER=array
CACHE_STORE=array
QUEUE_CONNECTION=sync
```

Keep any additional environment variables required by the application. Store secrets in the hosting provider's environment settings, never in source control.

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

The GitHub Actions workflow installs frontend dependencies, audits the dependency tree, builds the Vue/Vite assets and Docker image, starts the container with database bootstrap enabled, and checks the health endpoint, rendered page, compiled JavaScript asset, demo-token endpoint, and authenticated users API.

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
render.yaml
package.json
composer.json
vite.config.js
```

## Assessment Context

This repository was developed as a technical assessment for a Full Stack Developer position. It demonstrates Laravel backend development, Vue.js frontend integration, REST API design, database relationships, reward and badge logic, authentication, automated testing, and containerised deployment.
