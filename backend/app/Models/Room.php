<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'is_group',
        'last_message_id', // 最新メッセージの中身を取得するための FK
        'last_message_at', // ルーム一覧のソート順に使う timestamp
    ];

    protected function casts(): array
    {
        return [
            'is_group' => 'boolean',
            'last_message_at' => 'datetime',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'room_users')->withTimestamps();
    }

    public function roomUsers(): HasMany
    {
        return $this->hasMany(RoomUser::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }
}
