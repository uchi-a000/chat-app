<?php

namespace App\UseCases\Room;

use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class RoomsAction
{
    /**
     * @return Collection<int, Room>
     */
    public function __invoke(User $user): Collection
    {
        return $user
            ->rooms()
            ->with(['lastMessage.user', 'users'])
            ->orderByDesc(
                Room::query()
                    ->select('messages.created_at')
                    ->from('messages')
                    ->whereColumn('messages.id', 'rooms.last_message_id')
                    ->limit(1)
            )
            ->get();
    }
}
