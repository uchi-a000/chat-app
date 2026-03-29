<?php

namespace Tests\Feature\Message;

use App\Models\Message;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_メッセージ一覧を取得できる(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $room->users()->attach($user->id);

        Message::factory()->count(3)->create([
            'room_id' => $room->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/rooms/{$room->id}/messages");

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    [
                        'id',
                        'room_id',
                        'content',
                        'type',
                        'user' => [
                            'id',
                            'first_name',
                            'last_name',
                            'nickname',
                            'avatar',
                        ],
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);
    }

    public function test_メッセージは新しい順に返る(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $room->users()->attach($user->id);

        $old = Message::factory()->create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'created_at' => now()->subMinutes(10),
        ]);
        $new = Message::factory()->create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/rooms/{$room->id}/messages");

        $response->assertOk();

        $data = $response->json('data');
        $this->assertEquals($new->id, $data[0]['id']);
        $this->assertEquals($old->id, $data[1]['id']);
    }

    public function test_非メンバーの場合403が返る(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/rooms/{$room->id}/messages");

        $response->assertForbidden();
    }

    public function test_未認証の場合401が返る(): void
    {
        $room = Room::factory()->create();

        $response = $this->getJson("/api/rooms/{$room->id}/messages");

        $response->assertUnauthorized();
    }
}
