<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $taro = User::where('email', 'taro@example.com')->firstOrFail();
        $hanako = User::where('email', 'hanako@example.com')->firstOrFail();
        $others = User::whereNotIn('id', [$taro->id, $hanako->id])->get();

        // DM 1: 太郎 ↔ 花子
        $dm1 = Room::factory()->create();
        $dm1->users()->attach([$taro->id, $hanako->id]);

        // DM 2: 太郎 ↔ ランダムユーザー1
        $dm2 = Room::factory()->create();
        $dm2->users()->attach([$taro->id, $others[0]->id]);

        // DM 3: 太郎 ↔ ランダムユーザー2
        $dm3 = Room::factory()->create();
        $dm3->users()->attach([$taro->id, $others[1]->id]);

        // グループ 1: 全体チャット（太郎・花子 + 3人）
        $group1 = Room::factory()->group()->create([
            'name' => '全体チャット',
        ]);
        $group1->users()->attach([
            $taro->id,
            $hanako->id,
            $others[0]->id,
            $others[1]->id,
            $others[2]->id,
        ]);

        // グループ 2: プロジェクトA（太郎・花子 + 1人）
        $group2 = Room::factory()->group()->create([
            'name' => 'プロジェクトA',
        ]);
        $group2->users()->attach([
            $taro->id,
            $hanako->id,
            $others[0]->id,
        ]);
    }
}
