<?php

namespace Tests\Feature\Room;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_ルーム詳細を取得できる(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $room->users()->attach($user->id);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/rooms/{$room->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'is_group',
                    'users',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJsonPath('data.id', $room->id);
    }

    public function test_非メンバーの場合403が返る(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/rooms/{$room->id}");

        $response->assertForbidden();
    }

    public function test_未認証の場合401が返る(): void
    {
        $room = Room::factory()->create();

        $response = $this->getJson("/api/rooms/{$room->id}");

        $response->assertUnauthorized();
    }
}
