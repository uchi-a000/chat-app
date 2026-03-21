<?php

namespace App\UseCases\Message;

use App\Models\Room;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class MessagesAction
{
    public function __invoke(User $user, Room $room): CursorPaginator
    {
        if (! $room->users()->where('users.id', $user->id)->exists()) {
            throw new AccessDeniedHttpException('このルームにアクセスする権限がありません。');
        }

        return $room
            ->messages()
            ->with('user')
            ->orderByDesc('created_at')
            ->cursorPaginate(50);
    }
}
