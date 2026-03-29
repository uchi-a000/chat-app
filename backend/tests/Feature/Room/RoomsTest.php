<?php

namespace Tests\Feature\Room;

use App\Models\Message;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomsTest extends TestCase
{
    use RefreshDatabase;

    private string $endpoint = '/api/rooms';

    public function test_ルーム一覧を取得できる(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $room = Room::factory()->create();
        $room->users()->attach([$user->id, $otherUser->id]);

        $message = Message::factory()->create([
            'room_id' => $room->id,
            'user_id' => $user->id,
        ]);
        $room->update(['last_message_id' => $message->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson($this->endpoint);

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [
                    [
                        'id',
                        'name',
                        'is_group',
                        'last_message' => [
                            'id',
                            'content',
                            'type',
                            'user' => ['id', 'first_name', 'last_name'],
                            'created_at',
                        ],
                        'users',
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);
    }

    public function test_所属していないルームは取得されない(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $room = Room::factory()->create();
        $room->users()->attach($otherUser->id);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson($this->endpoint);

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_未認証の場合401が返る(): void
    {
        $response = $this->getJson($this->endpoint);

        $response->assertUnauthorized();
    }
}
