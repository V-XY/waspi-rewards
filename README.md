# WASPI Rewards

WASPI Rewards is a Laravel and Vue application for tracking user activity, points, badges and a shared comments feed.

## Live application

[Open WASPI Rewards](https://waspi-rewards-0iak.onrender.com)

The live Render service deploys from the repository's `main` branch. It runs on Render's Free plan and may take a short time to wake after inactivity. The isolated assessment preview is a separate service and is not the live application.

## Stack

- Laravel 13 on PHP 8.5 (8.4 is the minimum the locked packages support)
- Vue 3 with Vite
- PostgreSQL for hosted data; SQLite for local development
- Laravel Sanctum personal access tokens
- Docker and Apache

## Local development

Requirements: PHP 8.4+, Composer, Node.js, npm and SQLite or PostgreSQL.

```bash
git clone https://github.com/V-XY/waspi-rewards.git
cd waspi-rewards
composer install
cp .env.example .env
php artisan key:generate
```

Configure the database in `.env`. For SQLite, create the database file:

```bash
touch database/database.sqlite
php artisan migrate --seed
```

Install the frontend dependencies and start the development server:

```bash
npm ci
npm run build
php artisan serve
```

## Docker

Build and run the image with a unique application key:

```bash
docker build -t waspi-rewards .
docker run --detach --name waspi-rewards \
  --publish 8080:10000 \
  --env APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')" \
  waspi-rewards
```

The container listens on port `10000` and serves Laravel from `public/`. Vite assets are built during image construction. The image defaults to production mode with debug output disabled.

SQLite is the default for local container testing. Its data is not durable when the container is replaced. For a persistent deployment, configure PostgreSQL with `DB_CONNECTION=pgsql` and `DB_URL`.

Set `RUN_DATABASE_SETUP=true` only for an isolated environment where the container is expected to run migrations and seed data at startup. In a production release process, run migrations as a controlled deployment step.

## Hosted assessment preview

The assessment deployment is isolated on Render and uses:

- A Free Docker web service pinned to `test/harden-rewards-suite`.
- A separate Free PostgreSQL database in Frankfurt.
- A dedicated demo account and a one-hour demo token.
- The Laravel `/up` health endpoint.

The deployment guide is in [docs/deployment/render-preview.md](docs/deployment/render-preview.md).

Render's free web services sleep after inactivity and use an ephemeral filesystem. Its free PostgreSQL databases expire after 30 days. This environment is for assessment and demonstration, not production hosting or long-term data retention.

## Environment

A hosted deployment requires these settings:

```text
APP_ENV=production
APP_DEBUG=false
APP_KEY=your-generated-laravel-key
APP_URL=https://your-service.onrender.com
DB_CONNECTION=pgsql
DB_URL=your-postgresql-connection-string
SESSION_DRIVER=array
CACHE_STORE=array
QUEUE_CONNECTION=sync
```

Keep secrets in the hosting provider's environment settings. Never commit application keys, database URLs or bearer tokens.

`APP_URL` must match the address visitors use. Laravel builds the script and stylesheet links from it, so a mismatch between the two can stop the page from loading its JavaScript. If the Render service is renamed or given a custom domain, update `APP_URL` in the same change.

The application trusts the forwarded headers from Render's proxy, so HTTPS detection and generated links follow the public address. Every response carries security headers: `nosniff`, a frame lock, a referrer policy, and a Content-Security-Policy that allows scripts and API calls only from the same origin. The strict policy is skipped when `APP_ENV=local` so the Vite development server still works.

Caches for configuration and views are built when the container starts, after its environment variables are available.

## Demo access

Public demo access is disabled by default. Enable it only in an isolated demonstration environment:

```text
WASPI_DEMO_ACCESS_ENABLED=true
WASPI_DEMO_USER_EMAIL=demo@waspi-rewards.test
```

The seeded demo account is the only account that can receive a token from the rate-limited `POST /api/demo-token` endpoint. Tokens expire after one hour. Do not enable this endpoint in an environment containing real user data.

## API

The comments feed is paginated with cursors. Request a page with `GET /api/comments?per_page=20`, then pass the `next_cursor` value from the response as `cursor` to get the following page. `per_page` accepts 1 to 50 and defaults to 20.

The users endpoint requires a bearer token. It returns each user's name, points, badge and activity counts. Email addresses are not included.

```http
GET /api/users
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Optional filters:

- `type`: filter by badge type
- `points`: filter by points

Credentials must be sent in the Authorization header, not in query parameters.

## Reward rules

| Activity | Threshold | Points awarded |
|---|---:|---:|
| First comment | 1 comment | 50 |
| Comments milestone | 30 comments | 2,450 |
| Comments milestone | 50 comments | 2,500 |
| Likes milestone | 10 likes | 500 |

Each milestone is granted once per user. A database uniqueness constraint protects against duplicate awards. Comment and like writes are committed together with their reward handling, so a reward failure does not leave a partial activity record.

## Verification

Build the frontend first, because feature tests render a page that needs the compiled assets:

```bash
npm ci
npm run build
php artisan test
```

The suite covers reward rules, token handling, the demo endpoint, security headers, comment pagination, query-count stability and transaction rollback. The repository workflow in `.github/workflows/tests.yml` also runs the dependency audit, production Docker build and smoke checks, and hosted preview verification.

The assessment preview is deployed separately from the live service. The deployment guide records the hosting limits and verification steps.
