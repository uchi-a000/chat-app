<?php

namespace App\UseCases\Room;

use App\Models\Room;
use App\Models\User;

class RoomAction
{
    /**
     * @param  array{name?: string|null, is_group: bool, user_ids: list<string>}  $data
     * @return array{room: Room, is_new: bool}
     */
    public function __invoke(User $user, array $data): array
    {
        $userIds = $data['user_ids'];
        if (! in_array($user->id, $userIds)) {
            $userIds[] = $user->id;
        }

        if (! $data['is_group']) {
            $existing = $this->findExistingDm($user, $userIds);
            if ($existing) {
                $existing->load('users');

                return ['room' => $existing, 'is_new' => false];
            }
        }

        $room = Room::create([
            'name' => $data['name'] ?? null,
            'is_group' => $data['is_group'],
        ]);

        $room->users()->attach($userIds);
        $room->load('users');

        return ['room' => $room, 'is_new' => true];
    }

    /**
     * @param  list<string>  $userIds
     */
    private function findExistingDm(User $user, array $userIds): ?Room
    {
        $query = Room::where('is_group', false);

        foreach ($userIds as $userId) {
            $query->whereHas('users', fn ($subQuery) => $subQuery->where('users.id', $userId));
        }

        return $query
            ->withCount('users')
            ->having('users_count', '=', count($userIds))
            ->first();
    }
}
