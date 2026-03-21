<?php

namespace App\UseCases\Message;

use App\Models\Message;
use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class MessageAction
{
    /**
     * @param  array{content: string, type: string}  $data
     */
    public function __invoke(User $user, Room $room, array $data): Message
    {
        if (! $room->users()->where('users.id', $user->id)->exists()) {
            throw new AccessDeniedHttpException('このルームにアクセスする権限がありません。');
        }

        return DB::transaction(function () use ($user, $room, $data) {
            $message = $room->messages()->create([
                'user_id' => $user->id,
                'content' => $data['content'],
                'type' => $data['type'],
            ]);

            $room->update(['last_message_id' => $message->id]);

            $message->load('user');

            return $message;
        });
    }
}
