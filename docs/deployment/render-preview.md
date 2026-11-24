# Free hosted assessment preview

This guide deploys WASPI Rewards on a $0 demonstration stack. It does not create paid resources.

## Architecture

- **Application:** Render Free web service, built from the repository Dockerfile.
- **Database:** Neon Free PostgreSQL.
- **Source branch:** `test/harden-rewards-suite`.
- **Health check:** `/up`.
- **Demo access:** enabled only in this isolated assessment deployment.

Render's free service sleeps after 15 minutes without traffic and may take about a minute to wake. Its filesystem is ephemeral. Neon Free provides a small persistent PostgreSQL database, with compute that scales to zero when idle.

Do not create a Render persistent disk, paid compute instance, or Render PostgreSQL database for this setup. Render's free PostgreSQL database expires after 30 days.

## 1. Create the Neon database

1. Create a free account at https://neon.tech/.
2. Create a PostgreSQL project. Choose a region close to the Render Frankfurt region if available.
3. Open the project's connection details.
4. Copy the pooled connection string. It should use the PostgreSQL scheme and include SSL, usually `sslmode=require`.
5. Keep the connection string private. Do not put it in GitHub, this repository, or a public issue.

Neon Free currently includes 1 GB of storage per project and 100 compute-hours per month. The compute scales to zero after inactivity. Check the current limits in the Neon dashboard before relying on the service for an extended period.

## 2. Connect Render to GitHub

1. Create or sign in to a Render account at https://render.com/.
2. Connect the GitHub account that owns `V-XY/waspi-rewards`.
3. Grant Render access to this repository.
4. In Render, choose **New → Blueprint** and select `V-XY/waspi-rewards`.
5. Select the `test/harden-rewards-suite` branch.
6. Render should detect the root `render.yaml` Blueprint.
7. Confirm the web service plan is **Free**. Do not add paid resources.

If Render asks for `DB_URL`, paste the Neon pooled connection string. When prompted for `APP_KEY`, generate a Laravel-formatted key locally with `php -r 'echo "base64:".base64_encode(random_bytes(32)).PHP_EOL;'` and paste the result. Do not reuse an application key from another environment.

The Blueprint pins deployment to the assessment branch. It does not deploy `main`.

## 3. Verify service settings

The resulting service should have these settings:

| Setting | Value |
|---|---|
| Runtime | Docker |
| Dockerfile | `./Dockerfile` |
| Plan | Free |
| Region | Frankfurt |
| Health check | `/up` |
| Branch | `test/harden-rewards-suite` |
| Database | Neon PostgreSQL |
| Demo access | Enabled |

The Blueprint sets `DB_CONNECTION=pgsql`, `DB_URL`, `RUN_DATABASE_SETUP=true`, and the dedicated demo email. At startup, the container applies pending migrations and seeds the sample dataset. The seeder checks for its sentinel sample account before creating the dataset, preventing duplicate comments and likes after restarts.

If the service name is unavailable and Render assigns a different URL, update `APP_URL` in the Render environment to the actual HTTPS service URL.

## 4. First deployment checks

Wait for Render to report a successful deploy. Then open the service's `onrender.com` URL.

Verify:

1. The page renders without a server error.
2. The Vue application and compiled assets load.
3. The demo account can obtain a token through `POST /api/demo-token`.
4. The users API returns data when called with the bearer token.
5. Comments, likes, and reward points work through the UI.
6. Reloading the page preserves database-backed changes.
7. A container restart does not duplicate the sample dataset.

The GitHub Actions workflow verifies container startup, database migrations and seeding against SQLite, health, page rendering, asset delivery, demo-token issuance, and authenticated API access. The hosted PostgreSQL checks above are still required after the first Render deployment.

## 5. Free-tier behaviour and limits

- Render Free services sleep after 15 minutes without inbound traffic. The first request after sleeping can take about a minute to wake the app.
- Render can restart free services at any time.
- Render's free filesystem is ephemeral. Uploaded files and SQLite data are not durable.
- Render Free provides 750 instance hours per workspace each month, enough for one free service to run continuously if it does not exceed other quotas.
- Neon Free currently includes 1 GB storage and 100 compute-hours per project per month. Its database compute scales to zero after inactivity.
- Render's free PostgreSQL databases expire after 30 days, so this setup intentionally uses Neon instead.
- Stay within free bandwidth and compute quotas. Do not enable paid add-ons or upgrade prompts.

These free tiers are suitable for a low-traffic assessment preview, not a production service with uptime guarantees or critical user data.

## 6. Demonstration path

Use this sequence when showing the application:

1. Open the public Render URL. If the service has been idle, allow the cold start to finish.
2. Wait for the feed and sample users to load.
3. Demonstrate the seeded leaderboard and reward totals.
4. Add a comment and show the points update.
5. Like a comment and show the reward logic.
6. Refresh the page and confirm the data remains.
7. Explain that the public demo token is restricted to the seeded demo account and expires after one hour.

Do not publish database credentials, application keys, or bearer tokens in screenshots, documentation, or the public repository.
