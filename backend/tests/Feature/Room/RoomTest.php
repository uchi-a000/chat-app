<?php

namespace Tests\Feature\Room;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomTest extends TestCase
{
    use RefreshDatabase;

    private string $endpoint = '/api/rooms';

    public function test_ルームを作成できる(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'name' => 'テストルーム',
                'is_group' => true,
                'user_ids' => [$otherUser->id],
            ]);

        $response->assertCreated()
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
            ->assertJsonPath('data.name', 'テストルーム')
            ->assertJsonPath('data.is_group', true);

        $this->assertDatabaseHas('rooms', ['name' => 'テストルーム', 'is_group' => true]);
        $this->assertDatabaseHas('room_users', ['user_id' => $user->id]);
        $this->assertDatabaseHas('room_users', ['user_id' => $otherUser->id]);
    }

    public function test_作成者がuser_idsに含まれていなくても自動追加される(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'is_group' => false,
                'user_ids' => [$otherUser->id],
            ]);

        $response->assertCreated();

        $roomId = $response->json('data.id');
        $this->assertDatabaseHas('room_users', ['room_id' => $roomId, 'user_id' => $user->id]);
        $this->assertDatabaseHas('room_users', ['room_id' => $roomId, 'user_id' => $otherUser->id]);
    }

    public function test_is_groupが未指定の場合バリデーションエラー(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'user_ids' => [$user->id],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['is_group']);
    }

    public function test_user_idsが空配列の場合バリデーションエラー(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'is_group' => false,
                'user_ids' => [],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_ids']);
    }

    public function test_存在しないuser_idの場合バリデーションエラー(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'is_group' => false,
                'user_ids' => ['nonexistent-id'],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_ids.0']);
    }

    public function test_既存DMルームがある場合は新規作成せず既存を返す(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $first = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'is_group' => false,
                'user_ids' => [$otherUser->id],
            ]);

        $first->assertCreated();
        $firstRoomId = $first->json('data.id');

        $second = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'is_group' => false,
                'user_ids' => [$otherUser->id],
            ]);

        $second->assertOk();
        $this->assertEquals($firstRoomId, $second->json('data.id'));
    }

    public function test_グループルームは重複チェックされない(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $first = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'name' => 'グループ1',
                'is_group' => true,
                'user_ids' => [$otherUser->id],
            ]);

        $first->assertCreated();

        $second = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'name' => 'グループ2',
                'is_group' => true,
                'user_ids' => [$otherUser->id],
            ]);

        $second->assertCreated();
        $this->assertNotEquals($first->json('data.id'), $second->json('data.id'));
    }

    public function test_別ユーザーとのDMが既存でも誤マッチしない(): void
    {
        $user = User::factory()->create();
        $userB = User::factory()->create();
        $userC = User::factory()->create();

        // A-B の DM を作成
        $dmAB = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'is_group' => false,
                'user_ids' => [$userB->id],
            ]);

        $dmAB->assertCreated();

        // A-C の DM を作成 → A-B とは別の新規ルームになるべき
        $dmAC = $this->actingAs($user, 'sanctum')
            ->postJson($this->endpoint, [
                'is_group' => false,
                'user_ids' => [$userC->id],
            ]);

        $dmAC->assertCreated();
        $this->assertNotEquals($dmAB->json('data.id'), $dmAC->json('data.id'));
    }

    public function test_未認証の場合401が返る(): void
    {
        $response = $this->postJson($this->endpoint, [
            'is_group' => false,
            'user_ids' => ['dummy'],
        ]);

        $response->assertUnauthorized();
    }
}
