<?php

namespace App\Events;

use App\Http\Resources\Message\MessagesResource;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('room.'.$this->message->room_id),
        ];
    }

    public function broadcastWith(): array
    {
        $this->message->loadMissing('user');

        return [
            'message' => (new MessagesResource($this->message))->resolve(),
        ];
    }
}
