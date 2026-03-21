<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Room;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = Room::with('users')->get();

        foreach ($rooms as $room) {
            $users = $room->users;

            if ($users->isEmpty()) {
                continue;
            }

            // 各ルームに5〜10件のメッセージを作成
            $messageCount = rand(5, 10);
            $lastMessage = null;

            for ($i = 0; $i < $messageCount; $i++) {
                $lastMessage = Message::factory()->create([
                    'room_id' => $room->id,
                    'user_id' => $users->random()->id,
                ]);
            }

            // last_message_id を更新
            if ($lastMessage) {
                $room->update(['last_message_id' => $lastMessage->id]);
            }
        }
    }
}
