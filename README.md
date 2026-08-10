# WASPI Rewards

<div style="max-width: 800px; margin: 0 auto; padding: 20px 0;">

<p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 2rem;">
    This is a Laravel application I built to demonstrate a points and badge system. It rewards users for engaging with the platform through comments and likes.
</p>

<hr style="border: 0; border-top: 2px solid #eee; margin: 2rem 0;">

<p style="font-weight: 600; margin-bottom: 0.5rem;">Live Demo:</p>
<p style="margin-bottom: 2rem;">
    <a href="https://waspi-rewards-0iak.onrender.com" style="color: #0366d6; text-decoration: none; font-weight: 500;">https://waspi-rewards-0iak.onrender.com</a>
</p>

<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">The Tech Stack</h2>

<p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">
    The backend runs on Laravel 13 with PHP 8.4. I used Laravel Sanctum to handle the authentication. SQLite manages the database during development to keep things simple, and I used Vue 3 with Vite for the frontend, along with Axios for API calls and SCSS for styling.
</p>

<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">How the Rewards Work</h2>

<p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">
    When a user hits a specific milestone, they earn points. The first comment gives them 50 points. Reaching the 30th comment pushes their total comment points to 2,500, and the 50th comment takes it to 5,000. For likes, the 10th like on any comment earns an additional 500 points. Once they reach 50 points total, they unlock the beginner badge. At 2,500 points they get the top-fan badge, and crossing 5,000 points gives them the super-fan badge. The backend calculates all of this and returns the correct status in the API response.
</p>

<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Setting It Up Locally</h2>

<p style="line-height: 1.8; color: #333; margin-bottom: 1rem;">
    To run this on your own machine, clone the repository and run composer install to pull in the PHP dependencies. Copy the environment file, generate your application key, and run the migrations and seeders to get some demo data. You will need npm to install the frontend dependencies and build the assets. After that, php artisan serve starts the local server.
</p>

<div style="background: #f6f8fa; padding: 1.5rem; border-radius: 6px; overflow-x: auto; margin: 1.5rem 0;">
<pre style="margin: 0; font-family: monospace; font-size: 0.9rem; color: #24292e;">git clone [repo]
cd waspi-rewards

composer install
cp .env.example .env
php artisan key:generate

# Configure DB (SQLite by default)
php artisan migrate --seed

npm install
npm run build

php artisan serve</pre>
</div>

<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Interacting with the API</h2>

<p style="line-height: 1.8; color: #333; margin-bottom: 1rem;">
    There are a few RESTful endpoints for users and comments. You will need to pass a valid access token to access the users endpoint, either as a query parameter or in the Authorization header. You can filter users by their badge type or their exact point total.
</p>

<div style="background: #f6f8fa; padding: 1.5rem; border-radius: 6px; overflow-x: auto; margin: 1.5rem 0;">
<pre style="margin: 0; font-family: monospace; font-size: 0.9rem; color: #24292e;">GET /api/users?access_token={token}&type=top-fan
GET /api/users?access_token={token}&points=3000</pre>
</div>

<p style="line-height: 1.8; color: #333; margin-bottom: 1rem;">
    For comments, users can fetch the entire list, create a new one, and like or unlike individual comments. They are also able to delete their own comments. These routes are protected by Sanctum, meaning only authenticated users can use them.
</p>

<div style="background: #f6f8fa; padding: 1.5rem; border-radius: 6px; overflow-x: auto; margin: 1.5rem 0;">
<pre style="margin: 0; font-family: monospace; font-size: 0.9rem; color: #24292e;">GET    /api/comments
POST   /api/comments
DELETE /api/comments/{id}
POST   /api/comments/{id}/like
DELETE /api/comments/{id}/like</pre>
</div>

<p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">
    There is also a simple endpoint to generate a temporary test token if you want to test the API without setting up a full authentication flow.
</p>

<div style="background: #f6f8fa; padding: 1.5rem; border-radius: 6px; overflow-x: auto; margin: 1.5rem 0;">
<pre style="margin: 0; font-family: monospace; font-size: 0.9rem; color: #24292e;">GET /api/token</pre>
</div>

<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Testing the Application</h2>

<p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">
    I wrote feature tests to verify the reward milestones, badge calculations, API filters, and ownership rules. You can run the entire suite using the standard artisan command.
</p>

<div style="background: #f6f8fa; padding: 1.5rem; border-radius: 6px; overflow-x: auto; margin: 1.5rem 0;">
<pre style="margin: 0; font-family: monospace; font-size: 0.9rem; color: #24292e;">php artisan test</pre>
</div>

<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">A Few Implementation Notes</h2>

<p style="line-height: 1.8; color: #333; margin-bottom: 1rem;">
    The seed data includes a user named Kevin Talla who has exactly 30 comments and 10 likes. This puts him at 3,000 total points, making him a top-fan with the super-fan badge as his next goal. I stuck to the three explicitly defined badges from the assessment: beginner-badge, top-fan, and super-fan. I also decided that likes remain counted toward a user's total points even if they later unlike a comment, since the milestone was already achieved.
</p>

<hr style="border: 0; border-top: 2px solid #eee; margin: 2.5rem 0;">

<p style="text-align: center; font-size: 0.95rem; color: #666; margin-top: 2rem;">
    <strong>Author:</strong> Millenian N. Ngangmi
</p>

</div>