<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => config('waspi.demo_user_email')],
            [
                'name' => 'Demo User',
                'password' => Hash::make(Str::random(40)),
            ]
        );\n\n        $rewardService = new RewardService();

        $users = [
            User::factory()->create(['name' => 'Maxime Heidenreich V', 'email' => 'maxime@example.com']),
            User::factory()->create(['name' => 'Ms. Kelli Huels V', 'email' => 'kelli@example.com']),
            User::factory()->create(['name' => 'Tito Daniel V', 'email' => 'tito@example.com']),
            User::factory()->create(['name' => 'Kevin Talla V', 'email' => 'kevin@example.com']),
            User::factory()->create(['name' => 'Sarah Njoya V', 'email' => 'sarah@example.com']),
        ];

        $maximeComments = $this->addComments($users[0], [
            'The new layout feels much easier to use.',
        ], $rewardService);

        $kelliComments = $this->addComments($users[1], [
            'I had the same issue yesterday.',
            'This makes more sense now.',
            'Good explanation.',
            'I will try this approach.',
            'That was useful, thanks.',
            'The second option looks better to me.',
            'I agree with this point.',
            'This is a much simpler way to handle it.',
            'I had not looked at it that way before.',
            'Nice update.',
            'The example helped a lot.',
            'I think this would work well for smaller teams.',
            'That is exactly what I was looking for.',
            'The last part is especially useful.',
            'Makes sense.',
            'I would probably keep the first version.',
            'This could save quite a bit of time.',
            'I like how straightforward this is.',
            'Good point. I had missed that.',
            'The result looks clean.',
            'I tested something similar and got the same result.',
            'This is worth keeping.',
            'I would like to see this in the next update.',
            'That is a fair approach.',
            'The difference is clearer now.',
            'I think the smaller change is enough.',
            'This works for me.',
            'Thanks for sharing the details.',
            'I will come back to this later.',
            'Good improvement.',
        ], $rewardService);

        $titoComments = $this->addComments($users[2], [
            'The first version was already useful.',
            'I like the direction this is taking.',
            'This part could be a little clearer.',
            'That makes the process easier to follow.',
            'I had a similar question.',
            'The example makes the difference obvious.',
            'I would use this approach.',
            'This is a good improvement.',
            'The explanation is clear enough for me.',
            'I think the last option is the better one.',
            'That is a useful detail.',
            'I had not considered that case.',
            'The flow feels much better now.',
            'This should be easier for new users.',
            'I agree with the change.',
            'The smaller details make a difference.',
            'That solves the problem I was having.',
            'Good catch.',
            'I would keep it simple like this.',
            'The result looks better.',
            'This is practical.',
            'I like the way this was handled.',
            'That explanation cleared it up.',
            'This is something I would actually use.',
            'The change is small but useful.',
            'I think this is ready.',
            'That is a better way to structure it.',
            'I will test it on my side.',
            'Thanks, this helped.',
            'The final result is much cleaner.',
        ], $rewardService);

        // Kevin reaches 30 comments and 10 likes, totaling 3050 points.
        // This demonstrates the 3000-point case from the assessment.
        $kevinComments = $this->addComments($users[3], [
            'I like the direction of this.',
            'The change is noticeable.',
            'This is easier to understand.',
            'I would use this version.',
            'That makes sense.',
            'Good improvement.',
            'The example helped.',
            'This feels more practical.',
            'I had the same question.',
            'The second option works better.',
            'This is clear enough.',
            'Nice work on this part.',
            'I agree with the approach.',
            'That solves it for me.',
            'The flow is much better.',
            'This should be easier to maintain.',
            'I like how simple this is.',
            'That is a useful change.',
            'I would keep it this way.',
            'The result looks good.',
            'That was worth changing.',
            'This is more straightforward.',
            'I had not thought about that.',
            'The last example is helpful.',
            'Good point.',
            'I think this is enough.',
            'This works well.',
            'The difference is clear now.',
            'I will test this later.',
            'Looks good to me.',
        ], $rewardService);

        $sarahComments = $this->addComments($users[4], [
            'The full flow looks good from here.',
            'This is a useful addition.',
            'I would keep the interface this simple.',
            'That is a good way to handle it.',
            'The result is easy to follow.',
            'I like this approach.',
            'This should work well.',
            'Good work.',
            'The change makes sense.',
            'I would probably use this version.',
            'That is clearer.',
            'The example was helpful.',
            'This feels more natural.',
            'Nice improvement.',
            'I agree with that.',
            'The details are useful.',
            'This is a better flow.',
            'I like the final result.',
            'That solves the main issue.',
            'This is simple enough to use.',
            'Good explanation.',
            'The smaller changes work well.',
            'I think this is ready.',
            'That is a fair solution.',
            'I would keep the same structure.',
            'This is much clearer.',
            'Good point.',
            'I will try this out.',
            'The final version looks solid.',
            'That works for me.',
            'The interface feels clean.',
            'This is easier to follow.',
            'I like the way this was done.',
            'That is useful.',
            'I had the same thought.',
            'The result is better this way.',
            'This is a good balance.',
            'The change is small but helpful.',
            'I would use this.',
            'Looks good.',
            'That makes things simpler.',
            'The example makes it clear.',
            'I agree with the decision.',
            'This is practical.',
            'Good improvement overall.',
            'The flow works well.',
            'That is exactly what was needed.',
            'I like this version.',
            'The result is clean.',
            'Nice work.',
        ], $rewardService);

        // Seed likes for all users to make the feed look populated.

        $kevinLikeable = Comment::where('user_id', '!=', $users[3]->id)
            ->whereNotIn('id', $kevinComments->pluck('id'))
            ->limit(10)
            ->get();

        foreach ($kevinLikeable as $comment) {
            $like = Like::create([
                'user_id' => $users[3]->id,
                'comment_id' => $comment->id,
            ]);
            $rewardService->handleNewLike($like);
        }

        $maximeLikeable = Comment::where('user_id', '!=', $users[0]->id)
            ->whereNotIn('id', $maximeComments->pluck('id'))
            ->limit(3)
            ->get();

        foreach ($maximeLikeable as $comment) {
            Like::create([
                'user_id' => $users[0]->id,
                'comment_id' => $comment->id,
            ]);
        }

        $kelliLikeable = Comment::where('user_id', '!=', $users[1]->id)
            ->whereNotIn('id', $kelliComments->pluck('id'))
            ->limit(5)
            ->get();

        foreach ($kelliLikeable as $comment) {
            Like::create([
                'user_id' => $users[1]->id,
                'comment_id' => $comment->id,
            ]);
        }

        $titoLikeable = Comment::where('user_id', '!=', $users[2]->id)
            ->whereNotIn('id', $titoComments->pluck('id'))
            ->limit(5)
            ->get();

        foreach ($titoLikeable as $comment) {
            Like::create([
                'user_id' => $users[2]->id,
                'comment_id' => $comment->id,
            ]);
        }

        $sarahLikeable = Comment::where('user_id', '!=', $users[4]->id)
            ->whereNotIn('id', $sarahComments->pluck('id'))
            ->limit(8)
            ->get();

        foreach ($sarahLikeable as $comment) {
            Like::create([
                'user_id' => $users[4]->id,
                'comment_id' => $comment->id,
            ]);
        }
    }

    private function addComments(User $user, array $texts, RewardService $rewardService)
    {
        $comments = collect();

        foreach ($texts as $text) {
            $comment = Comment::create([
                'user_id' => $user->id,
                'text' => $text,
            ]);

            $rewardService->handleNewComment($comment);
            $comments->push($comment);
        }

        return $comments;
    }
}