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
```

Generate the application key:

```bash
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

Install frontend dependencies:

```bash
npm install
```

Build the frontend:

```bash
npm run build
```

Start the Laravel development server:

```bash
php artisan serve
```

The application will then be available at the local address shown by Laravel.

## Production Build

The included Dockerfile handles the production build automatically.

It:

1. Installs PHP dependencies with Composer.
2. Installs frontend dependencies with npm.
3. Builds the Vue/Vite assets.
4. Configures Apache to serve Laravel from the `public` directory.
5. Sets the required Laravel permissions.

The frontend build is generated during the Docker image build and does not need to be committed to the repository.

## Database

The application can use SQLite for the assessment environment.

The SQLite database is located at:

```text
database/database.sqlite
```

For a production environment, a persistent database such as PostgreSQL or MySQL would be recommended.

## Deployment

The application can be deployed as a Docker-based Laravel service.

The container exposes port:

```text
80
```

Apache serves Laravel using the `public` directory as the document root.

### Environment Variables

Set the following environment variables in the deployment environment:

```text
APP_ENV=production
APP_DEBUG=false
APP_KEY=your-generated-laravel-key
APP_URL=https://your-service.onrender.com

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/database/database.sqlite

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

Keep any additional environment variables required by the application.

## Testing

Run the application test suite with:

```bash
php artisan test
```

Tests should cover the reward rules, including:

- First comment reward
- 30-comment reward
- 50+ comment reward
- First 10 likes reward
- Badge assignment
- Point calculation
- API authentication
- API filtering
- Next badge calculation

## API

The application provides a GET endpoint for listing users.

The endpoint requires an `access_token`.

Optional filters include:

- `type` — filter users by badge type
- `points` — filter users by points

The response also includes the next badge a user is eligible to receive.

Example:

```text
GET /api/users?access_token=YOUR_ACCESS_TOKEN
```

Example with filters:

```text
GET /api/users?access_token=YOUR_ACCESS_TOKEN&type=top-fan
```

```text
GET /api/users?access_token=YOUR_ACCESS_TOKEN&points=3000
```

An invalid or missing access token should not return the user data.

## Seed Data

The database includes seed data for testing the reward system.

The seed data can be recreated with:

```bash
php artisan migrate:fresh --seed
```

This resets the database and loads the predefined users, comments, likes, and related data.

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
└── ...

database/
├── migrations/
└── seeders/

resources/
├── js/
└── ...

routes/
├── api.php
└── web.php

public/
└── ...

Dockerfile
package.json
composer.json
vite.config.js
```

## Notes

The project was developed as a technical assessment for a Full Stack Developer position.

The implementation focuses on:

- Laravel backend development
- Vue.js frontend development
- REST API integration
- Database relationships
- Reward and badge logic
- Authentication
- Testing
- Responsive UI
- Production deployment