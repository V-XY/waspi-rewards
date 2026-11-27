<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = ['user_id', 'text', 'timestamp_source'];

    protected function casts(): array
    {
        return [
            'liked_by_user' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function likes(): HasMany
    {
        return $this->votes()->where('vote_type', 'like');
    }

    public function dislikes(): HasMany
    {
        return $this->votes()->where('vote_type', 'dislike');
    }
}