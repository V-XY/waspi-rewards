# Render assessment preview

The WASPI Rewards assessment preview runs on a separate Render service and database. It is isolated from the existing `waspi-rewards` service on `main`.

## Live environment

- **Application:** [waspi-rewards-assessment.onrender.com](https://waspi-rewards-assessment.onrender.com)
- **Render service:** `waspi-rewards-assessment`
- **Source branch:** `test/harden-rewards-suite`
- **Runtime:** Docker, PHP 8.4 and Apache
- **Region:** Frankfurt
- **Plan:** Free
- **Health check:** `/up`
- **Database:** separate Render Free PostgreSQL instance in Frankfurt
- **Demo access:** enabled for the dedicated seeded demo account

The first deployment completed successfully. Render reported the service live, returned HTTP 200 for its `/up` health check and root HEAD request, and completed the database migrations and seed operation. The latest branch revision is deployed automatically after its GitHub checks pass.

## Deployment configuration

The service is defined in the repository's `render.yaml` Blueprint. The Blueprint links the web service to the separately provisioned assessment database through Render's internal connection string. Application secrets are stored in Render environment settings, not in Git.

Important runtime settings:

| Key | Purpose |
|---|---|
| `APP_ENV=production` | Production Laravel configuration |
| `APP_DEBUG=false` | Prevent debug details from being exposed |
| `APP_KEY` | Unique Laravel encryption key stored in Render |
| `APP_URL` | Public HTTPS service URL |
| `DB_CONNECTION=pgsql` | PostgreSQL driver |
| `DB_URL` | Private Render database connection |
| `RUN_DATABASE_SETUP=true` | Apply migrations and seed the assessment data at startup |
| `WASPI_DEMO_ACCESS_ENABLED=true` | Enable the restricted demo-token endpoint |
| `WASPI_DEMO_USER_EMAIL` | Dedicated demo account |

The database bootstrap is repeat-safe. Migrations run on startup, the demo account is created if absent, and the sample dataset uses a sentinel account to avoid duplicate records after restarts.

## Verification

GitHub Actions verifies the PHP test suite, npm dependency audit, Vite production build, Docker image build and a container smoke test. The container smoke test checks:

- Laravel health endpoint.
- Rendered application page and compiled Vue asset.
- Demo-token issuance.
- Authenticated users API and authenticated-user metadata.
- PostgreSQL PHP driver availability.

Render's own deployment checks confirm that the hosted service starts and that `/up` returns HTTP 200. The initial hosted boot also completed PostgreSQL migrations and the seed operation.

A full manual browser walkthrough of adding a comment, liking it and reloading to confirm persistence remains the final assessor-facing interaction check.

## Free-tier limits

- The web service sleeps after inactivity and can take time to wake.
- Its filesystem is ephemeral. Do not rely on local uploads or SQLite for hosted persistence.
- The Free PostgreSQL database expires on **24 December 2026**, 30 days after creation.
- The preview is temporary and is not suitable for production workloads or long-term data retention.

No paid Render resources are part of this assessment setup. Check the Render dashboard for current free-tier limits before relying on the preview.

## Demonstration flow

1. Open the [assessment preview](https://waspi-rewards-assessment.onrender.com) and allow it to wake if it has been idle.
2. Review the seeded leaderboard and reward totals.
3. Add a comment and observe the points update.
4. Like a comment and observe the reward logic.
5. Reload the page and confirm that the data persists in PostgreSQL.
6. Explain that the demo token is restricted to the seeded demo account and expires after one hour.

Never publish database credentials, application keys or bearer tokens.
