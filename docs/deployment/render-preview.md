# Render assessment preview

The WASPI Rewards assessment preview runs on a separate Render service and database. It is isolated from the existing `waspi-rewards` service on `main`.

## Live environment

- **Application:** [waspi-rewards-assessment.onrender.com](https://waspi-rewards-assessment.onrender.com)
- **Render service:** `waspi-rewards-assessment`
- **Source branch:** `test/harden-rewards-suite`
- **Runtime:** Docker, PHP 8.5 and Apache
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
| `LOG_LEVEL=warning` | Keep routine request noise out of the Render logs |
| `APP_KEY` | Unique Laravel encryption key stored in Render |
| `APP_URL` | Public HTTPS service URL. It must match the address visitors use, because asset links are built from it |
| `DB_CONNECTION=pgsql` | PostgreSQL driver |
| `DB_URL` | Private Render database connection |
| `RUN_DATABASE_SETUP=true` | Apply migrations and seed the assessment data at startup |
| `WASPI_DEMO_ACCESS_ENABLED=true` | Enable the restricted demo-token endpoint |
| `WASPI_DEMO_USER_EMAIL` | Dedicated demo account |

The database bootstrap is repeat-safe. Migrations run on startup, the demo account is created if absent, and the sample dataset uses a sentinel account to avoid duplicate records after restarts.

## Verification

The GitHub Actions workflow in `.github/workflows/tests.yml` installs PHP and npm dependencies, audits frontend dependencies, builds the frontend and Docker image, runs the container smoke test, and checks the hosted preview.

Render checks the service through the Laravel `/up` endpoint before it routes traffic to a new deployment, and the initial hosted boot completed the PostgreSQL migrations and the seed operation.

A browser walkthrough is still the final check for the assessor-facing behavior: load the page, add a comment, like it, reload to confirm persistence, load more comments, and delete a comment that belongs to the demo account.

## Free-tier limits

- The web service sleeps after inactivity and can take time to wake.
- Its filesystem is ephemeral. Do not rely on local uploads or SQLite for hosted persistence.
- The Free PostgreSQL database expires on **24 December 2026**, 30 days after creation.
- The preview is temporary and is not suitable for production workloads or long-term data retention.

No paid Render resources are part of this assessment setup. Check the Render dashboard for current free-tier limits before relying on the preview.

## If the page stays blank

The page first shows the words "Loading WASPI Rewards." and then replaces them with the rewards feed. If the words stay on screen, the JavaScript did not run. Open the browser developer tools and check two places. The Console tab shows script or MIME type errors. The Network tab shows whether the request for the file under `/build/assets/` returned a JavaScript file. A response of type HTML for that file means the build output is missing or the path does not match `APP_URL`.

If the feed shows "The rewards feed is not available right now," the demo account or the demo token endpoint is disabled. Check `WASPI_DEMO_ACCESS_ENABLED` and `WASPI_DEMO_USER_EMAIL`.

## Known limits

The comments feed is paginated with cursors, 20 comments per page. Each page eagerly loads its authors and computes like counts and the viewer's like state without an N+1 query per comment.

Comment creation and its reward handling share a database transaction. Like creation and its reward handling also share a transaction. A failure in reward handling therefore rolls back the activity record rather than leaving a partial write.

The deployment currently builds from the branch `test/harden-rewards-suite`. Changes merged to `main` do not reach this service until the branch or the Blueprint changes.

## Demonstration flow

1. Open the [assessment preview](https://waspi-rewards-assessment.onrender.com) and allow it to wake if it has been idle.
2. Review the seeded leaderboard and reward totals.
3. Add a comment and observe the points update.
4. Like a comment and observe the reward logic.
5. Reload the page and confirm that the data persists in PostgreSQL.
6. Explain that the demo token is restricted to the seeded demo account and expires after one hour.

Never publish database credentials, application keys or bearer tokens.
