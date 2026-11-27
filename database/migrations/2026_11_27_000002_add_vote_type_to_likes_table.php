<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->string('vote_type', 8)->default('like');
            $table->index(['comment_id', 'vote_type']);
        });
    }

    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropIndex(['comment_id', 'vote_type']);
            $table->dropColumn('vote_type');
        });
    }
};
