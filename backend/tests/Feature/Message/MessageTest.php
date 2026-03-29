<?php

namespace Tests\Feature\Message;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_メッセージを送信できる(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $room->users()->attach($user->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/rooms/{$room->id}/messages", [
                'content' => 'こんにちは',
                'type' => 'text',
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
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
            ])
            ->assertJsonPath('data.content', 'こんにちは')
            ->assertJsonPath('data.type', 'text');

        $this->assertDatabaseHas('messages', [
            'room_id' => $room->id,
            'user_id' => $user->id,
            'content' => 'こんにちは',
        ]);
    }

    public function test_送信後にルームのlast_message_idが更新される(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $room->users()->attach($user->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/rooms/{$room->id}/messages", [
                'content' => 'テスト',
                'type' => 'text',
            ]);

        $messageId = $response->json('data.id');
        $this->assertDatabaseHas('rooms', [
            'id' => $room->id,
            'last_message_id' => $messageId,
        ]);
    }

    public function test_contentが未指定の場合バリデーションエラー(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $room->users()->attach($user->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/rooms/{$room->id}/messages", [
                'type' => 'text',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['content']);
    }

    public function test_typeが不正な場合バリデーションエラー(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $room->users()->attach($user->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/rooms/{$room->id}/messages", [
                'content' => 'テスト',
                'type' => 'invalid',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    public function test_非メンバーの場合403が返る(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/rooms/{$room->id}/messages", [
                'content' => 'テスト',
                'type' => 'text',
            ]);

        $response->assertForbidden();
    }

    public function test_未認証の場合401が返る(): void
    {
        $room = Room::factory()->create();

        $response = $this->postJson("/api/rooms/{$room->id}/messages", [
            'content' => 'テスト',
            'type' => 'text',
        ]);

        $response->assertUnauthorized();
    }
}
