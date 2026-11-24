# Render assessment preview

This guide describes the isolated, free-tier WASPI Rewards preview. It does not use paid services.

## Architecture

- **Application:** Render Free web service, built from the repository Dockerfile.
- **Database:** Render Free PostgreSQL in Frankfurt.
- **Source branch:** `test/harden-rewards-suite`.
- **Health check:** `/up`.
- **Demo access:** enabled only in this isolated deployment.

The web service sleeps after inactivity and may take time to wake. Its filesystem is ephemeral, so SQLite is not suitable for persistent hosted data. Render Free PostgreSQL expires 30 days after creation. This preview is temporary and must not hold important or irreplaceable data.

## 1. Database

The assessment database has been provisioned separately in the Render workspace. In the Render dashboard, open the database and copy its **Internal Database URL**. Keep it private.

The application service must receive the following environment variables:

| Key | Value |
|---|---|
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | Internal Database URL from the Render database |
| `RUN_DATABASE_SETUP` | `true` |
| `SESSION_DRIVER` | `array` |
| `CACHE_STORE` | `array` |
| `QUEUE_CONNECTION` | `sync` |

Use the internal URL because the web service and database are in the same Render region. Do not put the URL in GitHub, this guide, screenshots or chat messages.

## 2. Web service

Create a separate web service. Do not modify the existing `waspi-rewards` service, which remains on `main`.

| Setting | Value |
|---|---|
| Repository | `https://github.com/V-XY/waspi-rewards` |
| Branch | `test/harden-rewards-suite` |
| Runtime | Docker |
| Dockerfile | `./Dockerfile` |
| Plan | Free |
| Region | Frankfurt |
| Health check | `/up` |
| Auto-deploy | Enabled |

Set these additional environment variables:

| Key | Value |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | A newly generated Laravel key |
| `APP_URL` | The exact HTTPS URL assigned to this service |
| `LOG_CHANNEL` | `stderr` |
| `DB_CONNECTION` | `pgsql` |
| `WASPI_DEMO_ACCESS_ENABLED` | `true` |
| `WASPI_DEMO_USER_EMAIL` | `demo@waspi-rewards.test` |
| `RUN_DATABASE_SETUP` | `true` |

Generate a new application key for this deployment. Never reuse a key from another environment or commit it to the repository. The demo account is seeded automatically when database setup is enabled.

## 3. First deployment checks

After Render reports a successful deployment:

1. Open the assigned HTTPS URL and confirm the page loads.
2. Confirm the Vue application and compiled assets load.
3. Obtain a token through `POST /api/demo-token`.
4. Call `GET /api/users` with the bearer token and confirm sample users are returned.
5. Add a comment and like a comment through the interface.
6. Reload the page and confirm changes remain in PostgreSQL.
7. Restart the service and confirm the sample dataset is not duplicated.

GitHub Actions already verifies the Docker image, container startup, SQLite migrations and seeding, health endpoint, rendered page, compiled assets, demo-token issuance and authenticated API access. These checks do not replace a live PostgreSQL and browser verification.

## 4. Limits

- Render Free web services sleep after inactivity and may have a cold start.
- The service filesystem is ephemeral. Do not rely on local uploads or SQLite persistence.
- The free PostgreSQL database expires 30 days after creation.
- Free-tier quotas and availability can change. Check the Render dashboard before relying on this preview.

This setup is suitable for a short assessment demonstration, not production workloads or long-term data retention.

## Demonstration flow

1. Open the service URL and allow the cold start to finish if needed.
2. Show the seeded leaderboard and reward totals.
3. Add a comment and show the points update.
4. Like a comment and show the reward logic.
5. Refresh the page and confirm the data persists.
6. Explain that the public demo token is restricted to the seeded demo account and expires after one hour.

Never publish database credentials, application keys or bearer tokens.