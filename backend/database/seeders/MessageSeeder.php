<?php

namespace Database\Seeders;

use App\Enums\MessageType;
use App\Models\Message;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $taro = User::where('email', 'taro@example.com')->firstOrFail();
        $hanako = User::where('email', 'hanako@example.com')->firstOrFail();
        $rooms = Room::with('users')->get();

        // ルームごとの会話テンプレート（ルーム作成順に対応）
        $conversations = $this->getConversations($taro, $hanako, $rooms);

        foreach ($rooms as $index => $room) {
            $messages = $conversations[$index] ?? [];
            if (empty($messages)) {
                continue;
            }

            // ルームごとに基準時刻をずらす（一覧のソート順確認用）
            $baseTime = Carbon::now()->subDays(5 - $index)->subHours(rand(1, 12));
            $lastMessage = null;

            foreach ($messages as $i => $msg) {
                $createdAt = $baseTime->copy()->addMinutes($i * rand(2, 15));

                $lastMessage = Message::create([
                    'room_id' => $room->id,
                    'user_id' => $msg['user_id'],
                    'content' => $msg['content'],
                    'type' => MessageType::Text,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }

            if ($lastMessage) {
                $room->update([
                    'last_message_id' => $lastMessage->id,
                    'last_message_at' => $lastMessage->created_at,
                ]);
            }
        }
    }

    /**
     * @return array<int, list<array{user_id: string, content: string}>>
     */
    private function getConversations(User $taro, User $hanako, $rooms): array
    {
        $users = [];
        foreach ($rooms as $room) {
            $users[$room->id] = $room->users->keyBy('id');
        }

        // 各ルームのメンバーから太郎以外を取得するヘルパー
        $otherIn = fn (Room $room) => $room->users->firstWhere('id', '!=', $taro->id);

        $conversations = [];

        // --- DM 1: 太郎 ↔ 花子 ---
        $conversations[] = [
            ['user_id' => $taro->id, 'content' => 'おはよう！今日の会議って10時からだっけ？'],
            ['user_id' => $hanako->id, 'content' => 'おはよう！そうだよ、10時から第1会議室'],
            ['user_id' => $taro->id, 'content' => '了解、ありがとう。資料は昨日送ったやつでOK？'],
            ['user_id' => $hanako->id, 'content' => 'うん、あれで大丈夫。追加のデータだけ持ってきてもらえると助かる'],
            ['user_id' => $taro->id, 'content' => 'OK、準備しておくね'],
            ['user_id' => $hanako->id, 'content' => 'ありがとう！よろしく〜'],
            ['user_id' => $taro->id, 'content' => '会議お疲れさま。議事録あとで共有するね'],
            ['user_id' => $hanako->id, 'content' => 'お疲れさま！助かります'],
        ];

        // --- DM 2: 太郎 ↔ ランダムユーザー1 ---
        $other1 = $otherIn($rooms[1]);
        $conversations[] = [
            ['user_id' => $other1->id, 'content' => 'お疲れさまです。先日の件、進捗どうですか？'],
            ['user_id' => $taro->id, 'content' => 'お疲れさまです！だいたい8割くらい終わりました'],
            ['user_id' => $other1->id, 'content' => 'おお、早いですね。レビューお願いしてもいいですか？'],
            ['user_id' => $taro->id, 'content' => 'はい、明日の午前中にはPR出せると思います'],
            ['user_id' => $other1->id, 'content' => '了解です。楽しみにしてます'],
            ['user_id' => $taro->id, 'content' => 'PR出しました！お手すきの時にお願いします 🙏'],
        ];

        // --- DM 3: 太郎 ↔ ランダムユーザー2 ---
        $other2 = $otherIn($rooms[2]);
        $conversations[] = [
            ['user_id' => $taro->id, 'content' => 'ランチ行かない？'],
            ['user_id' => $other2->id, 'content' => '行く行く！何食べたい？'],
            ['user_id' => $taro->id, 'content' => '新しくできたラーメン屋気になってるんだけど'],
            ['user_id' => $other2->id, 'content' => 'いいね！12時に1階集合で'],
            ['user_id' => $taro->id, 'content' => '👍'],
        ];

        // --- グループ 1: 全体チャット ---
        $g1Members = $rooms[3]->users;
        $conversations[] = [
            ['user_id' => $taro->id, 'content' => '今週の定例MTGのアジェンダ共有します'],
            ['user_id' => $hanako->id, 'content' => 'ありがとうございます！確認しました'],
            ['user_id' => $g1Members[2]->id, 'content' => '1点追加お願いしたいんですが、リリーススケジュールの件も議題に入れてもらえますか？'],
            ['user_id' => $taro->id, 'content' => 'もちろんです。追加しておきますね'],
            ['user_id' => $g1Members[3]->id, 'content' => 'テスト環境の件も相談したいです'],
            ['user_id' => $taro->id, 'content' => '了解です。アジェンダ更新しました'],
            ['user_id' => $hanako->id, 'content' => '今日の定例お疲れさまでした！'],
            ['user_id' => $g1Members[4]->id, 'content' => 'お疲れさまでした。次回までにデザイン案まとめておきます'],
            ['user_id' => $taro->id, 'content' => 'お疲れさまでした！来週もよろしくお願いします'],
            ['user_id' => $g1Members[2]->id, 'content' => 'よろしくお願いします！'],
        ];

        // --- グループ 2: プロジェクトA ---
        $g2Other = $rooms[4]->users->firstWhere('id', '!=', $taro->id)?->id === $hanako->id
            ? $rooms[4]->users->first(fn ($u) => $u->id !== $taro->id && $u->id !== $hanako->id)
            : $rooms[4]->users->firstWhere('id', '!=', $taro->id);
        $conversations[] = [
            ['user_id' => $taro->id, 'content' => 'プロジェクトAのキックオフお疲れさまでした'],
            ['user_id' => $hanako->id, 'content' => 'お疲れさまです！まずはDB設計からですかね'],
            ['user_id' => $g2Other->id, 'content' => 'そうですね。ER図のたたき台作ってみます'],
            ['user_id' => $taro->id, 'content' => 'ありがとうございます。API設計も並行して進めましょう'],
            ['user_id' => $hanako->id, 'content' => '了解です。OpenAPIのテンプレート用意しておきますね'],
            ['user_id' => $taro->id, 'content' => '助かります！金曜までに一旦まとめましょう'],
            ['user_id' => $g2Other->id, 'content' => 'ER図の初版できました。共有ドライブに置いておきます'],
            ['user_id' => $taro->id, 'content' => '早い！確認しますね'],
        ];

        return $conversations;
    }
}
