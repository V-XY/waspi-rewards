<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->string('timestamp_source', 16)->default('native');
        });

        // These five accounts are created exclusively by the assessment seeder.
        // Their sample comments have no historical source timestamp to restore.
        DB::table('comments')
            ->whereIn('user_id', function ($query) {
                $query->select('id')
                    ->from('users')
                    ->whereIn('email', [
                        'maxime@example.com',
                        'kelli@example.com',
                        'tito@example.com',
                        'kevin@example.com',
                        'sarah@example.com',
                    ]);
            })
            ->update(['timestamp_source' => 'seeded']);
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropColumn('timestamp_source');
        });
    }
};
