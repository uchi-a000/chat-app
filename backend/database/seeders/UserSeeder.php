<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // テスト用の固定ユーザー
        User::factory()->create([
            'first_name' => 'テスト',
            'last_name' => '太郎',
            'email' => 'taro@example.com',
        ]);

        User::factory()->create([
            'first_name' => 'テスト',
            'last_name' => '花子',
            'email' => 'hanako@example.com',
        ]);

        // ランダムユーザー
        User::factory(8)->create();
    }
}
