<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        // 1対1のDMルームを作成（最初の3ユーザー間）
        for ($i = 0; $i < min(3, $users->count()); $i++) {
            for ($j = $i + 1; $j < min(3, $users->count()); $j++) {
                $room = Room::factory()->create();
                $room->users()->attach([$users[$i]->id, $users[$j]->id]);
            }
        }

        // グループチャットを1つ作成
        $group = Room::factory()->group()->create([
            'name' => '全体チャット',
        ]);
        $group->users()->attach($users->take(5)->pluck('id'));
    }
}
