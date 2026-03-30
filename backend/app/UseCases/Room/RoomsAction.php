<?php

namespace App\UseCases\Room;

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
            ->orderByDesc('last_message_at')
            ->get();
    }
}
