<?php

namespace App\Http\Resources\Room;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Room */
class RoomsResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_group' => $this->is_group,
            'last_message' => $this->whenLoaded('lastMessage', fn () => $this->lastMessage ? [
                'id' => $this->lastMessage->id,
                'content' => $this->lastMessage->content,
                'type' => $this->lastMessage->type,
                'user' => [
                    'id' => $this->lastMessage->user->id,
                    'first_name' => $this->lastMessage->user->first_name,
                    'last_name' => $this->lastMessage->user->last_name,
                ],
                'created_at' => $this->lastMessage->created_at,
            ] : null),
            'users' => $this->whenLoaded('users', fn () => $this->users->map(fn ($user) => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'nickname' => $user->nickname,
                'avatar' => $user->avatar,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
