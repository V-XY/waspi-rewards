# WASPI REWARDS – Full Stack Developer Technical Test

A small point and badge system for rewarding user engagement through comments and likes.

## Live Demo

[Insert your deployed URL here]

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Authentication | Laravel Sanctum |
| Database | SQLite (development) / MySQL |
| Frontend | Vue 3, Vite, Axios |
| Styling | SCSS |

## Features

- Users earn points from comment and like milestones
- Badges are based on the user's current points
- The next badge is returned by the API
- Comment creation through a modal
- Like and unlike comments
- Users can delete their own comments
- Token-protected users API with filters
- Seed data with different reward states
- Feature tests for the main reward and API rules

## Reward Rules

| Action | Milestone | Points Awarded | Badge at the milestone |
|---|---:|---:|---|
| Comment | 1st | 50 | beginner-badge |
| Comment | 30th | 2,500 total comment points | top-fan |
| Comment | 50th | 5,000 total comment points | super-fan |
| Like | 10th | 500 | beginner-badge |

Comment rewards are cumulative toward the milestone total. The first comment gives 50 points, the 30th comment brings the user's comment-earned points to 2,500, and the 50th brings them to 5,000.

Like rewards are added separately. A user with 30 comments and 10 likes therefore has 3,000 points.

Badge status is based on points:

- 50+ points → beginner-badge
- 2,500+ points → top-fan
- 5,000+ points → super-fan

This also means a user with 3,000 points is a top-fan, as specified in the assessment.

## Setup

### Requirements

- PHP 8.3+
- Composer
- Node.js and NPM
- SQLite or MySQL

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd waspi-rewards

# Install PHP dependencies
composer install

# Configure the application
cp .env.example .env
php artisan key:generate

# Configure the database in .env, for example:
# DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite

# Run migrations and seed demo data
php artisan migrate --seed

# Install frontend dependencies
npm install

# Build frontend assets
npm run build

# Start the application
php artisan serve
```

Visit the application URL shown by `php artisan serve`.

## API

The users endpoint accepts an access token through either the required `access_token` query parameter or an `Authorization: Bearer` header.

### Get users

```http
GET /api/users?access_token=YOUR_TOKEN
```

### Filters

```http
GET /api/users?access_token=YOUR_TOKEN&type=top-fan
GET /api/users?access_token=YOUR_TOKEN&points=3000
```

`type` filters by badge type. `points` filters by the user's exact point total.

Example response:

```json
{
  "data": [
    {
      "id": 4,
      "name": "Kevin Talla",
      "email": "kevin@example.com",
      "points": 3000,
      "badge": "top-fan",
      "next_badge": "super-fan",
      "comments_count": 30,
      "likes_count": 10
    }
  ]
}
```

A missing or invalid token returns `401 Unauthorized`.

### Other endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments` | List comments |
| POST | `/api/comments` | Add a comment |
| DELETE | `/api/comments/{id}` | Delete the user's own comment |
| POST | `/api/comments/{id}/like` | Like a comment |
| DELETE | `/api/comments/{id}/like` | Unlike a comment |

Protected comment and like routes use a Sanctum bearer token.

### Assessment access token

The demo includes a simple token endpoint so the seeded application can be tested quickly:

```bash
curl http://localhost:8000/api/token
```

The returned token can be supplied to the users endpoint or as a bearer token for the protected comment and like routes.

This endpoint is included for the technical-test demo. In a production application, token issuance would be handled through the application's normal authentication flow.

## Testing

Run:

```bash
php artisan test
```

The feature tests cover:

- first comment reward
- 30-comment milestone
- 50-comment milestone
- 10-like reward
- badge calculation from points
- next badge calculation
- missing and invalid access tokens
- `type` and `points` API filters
- comment creation
- duplicate likes
- unlike
- comment deletion
- ownership checks

## Seed Data

The seeder uses named users and varied comment text so the application has useful content when it starts instead of an empty or repetitive feed.

The seeded users cover the main reward states. Kevin Talla has 30 comments and 10 likes, giving him **3,000 points**, a **top-fan** badge, and **super-fan** as his next badge.

## Assumptions

1. The assessment mentions four badges but only defines three named badges: beginner-badge, top-fan, and super-fan. No additional badge was invented.
2. The detailed task describes likes on comments, so this implementation uses comments rather than introducing a separate post system.
3. Comment milestones are awarded once when the user reaches the specified count and the milestone values represent the total points earned from comments at that stage.
4. Like rewards are awarded at the 10-like milestone and remain part of the user's earned points even if a like is later removed.
5. Users can only delete their own comments.
6. A user cannot like the same comment more than once.
7. `type` is the badge filter parameter requested by the assessment. `badge` is not required by the API.

## Project Structure

```text
app/
├── Http/
│   ├── Controllers/
│   └── Middleware/
├── Models/
└── Services/

resources/
├── js/
└── scss/

tests/
└── Feature/
```

The reward rules are kept in `RewardService` so they are separate from the controllers and can be tested independently.

## Contact

**Millenian Ngu Ngangmi**  
Email: millenianngu@gmail.com  
GitHub: https://github.com/V-XY

## License

This project is submitted as part of a technical assessment for Waspito.
