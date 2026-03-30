<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->timestamp('last_message_at')->nullable()->after('last_message_id')->index();
        });

        // Backfill: 既存ルームの last_message_at を最新メッセージの created_at で埋める
        DB::statement('
            UPDATE rooms
            SET last_message_at = (
                SELECT messages.created_at
                FROM messages
                WHERE messages.id = rooms.last_message_id
            )
            WHERE last_message_id IS NOT NULL
        ');
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('last_message_at');
        });
    }
};
