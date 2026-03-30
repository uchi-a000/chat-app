<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsersTest extends TestCase
{
    use RefreshDatabase;

    private string $endpoint = '/api/users';

    public function test_ユーザー一覧を取得できる(): void
    {
        $user = User::factory()->create();
        $others = User::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson($this->endpoint);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'first_name', 'last_name', 'nickname', 'avatar'],
                ],
            ]);

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertNotContains($user->id, $ids);
        $this->assertCount(3, $ids);
    }

    public function test_名前で検索できる(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create(['first_name' => '太郎', 'last_name' => '山田']);
        User::factory()->create(['first_name' => '花子', 'last_name' => '佐藤']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson($this->endpoint.'?search=太郎');

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($target->id, $ids);
        $this->assertCount(1, $ids);
    }

    public function test_ニックネームで検索できる(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create(['nickname' => 'taro123']);
        User::factory()->create(['nickname' => 'hanako']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson($this->endpoint.'?search=taro');

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($target->id, $ids);
        $this->assertCount(1, $ids);
    }

    public function test_自分自身は結果に含まれない(): void
    {
        $user = User::factory()->create(['first_name' => '太郎']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson($this->endpoint.'?search=太郎');

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertNotContains($user->id, $ids);
    }

    public function test_未認証の場合401が返る(): void
    {
        $response = $this->getJson($this->endpoint);

        $response->assertUnauthorized();
    }
}
