<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_grants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reward_key', 64);
            $table->unsignedInteger('points');
            $table->timestamps();

            $table->unique(['user_id', 'reward_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_grants');
    }
};
