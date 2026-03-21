<?php

namespace App\UseCases\Room;

use App\Models\Room;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class RoomDetailAction
{
    public function __invoke(User $user, Room $room): Room
    {
        if (! $room->users()->where('users.id', $user->id)->exists()) {
            throw new AccessDeniedHttpException('このルームにアクセスする権限がありません。');
        }

        $room->load(['users', 'lastMessage.user']);

        return $room;
    }
}
