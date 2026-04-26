<?php

use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['api', 'auth:sanctum']]);

Broadcast::channel('room.{roomId}', function (User $user, string $roomId) {
    return Room::where('id', $roomId)
        ->whereHas('users', fn ($query) => $query->where('users.id', $user->id))
        ->exists();
});
