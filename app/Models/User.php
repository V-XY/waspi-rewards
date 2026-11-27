<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'points',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'points' => 'integer',
    ];

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class)->where('vote_type', 'like');
    }

    public function getBadgeAttribute(): ?string
    {
        return match (true) {
            $this->points >= 5000 => 'super-fan',
            $this->points >= 2500 => 'top-fan',
            $this->points >= 50 => 'beginner-badge',
            default => null,
        };
    }

    public function getNextBadgeAttribute(): ?string
    {
        return match ($this->badge) {
            null => 'beginner-badge',
            'beginner-badge' => 'top-fan',
            'top-fan' => 'super-fan',
            default => null,
        };
    }

    public function addPoints(int $points): void
    {
        $this->increment('points', $points);
    }
}