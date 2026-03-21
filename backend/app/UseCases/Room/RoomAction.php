<?php

namespace App\UseCases\Room;

use App\Models\Room;
use App\Models\User;

class RoomAction
{
    /**
     * @param  array{name?: string|null, is_group: bool, user_ids: list<string>}  $data
     */
    public function __invoke(User $user, array $data): Room
    {
        $room = Room::create([
            'name' => $data['name'] ?? null,
            'is_group' => $data['is_group'],
        ]);

        $userIds = $data['user_ids'];
        if (! in_array($user->id, $userIds)) {
            $userIds[] = $user->id;
        }
        $room->users()->attach($userIds);

        $room->load('users');

        return $room;
    }
}
