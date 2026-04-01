"use client";

import type { Room, User } from "@/types";

type ChatHeaderProps = {
  room: Room;
  currentUser: User;
};

function getRoomDisplayName(room: Room, currentUser: User): string {
  if (room.is_group) {
    return room.name || "名前なしグループ";
  }
  const other = room.users?.find((user) => user.id !== currentUser.id);
  if (other) {
    return `${other.last_name} ${other.first_name}`;
  }
  return room.name || "ダイレクトメッセージ";
}

function getMemberCount(room: Room): number {
  return room.users?.length ?? 0;
}

export function ChatHeader({ room, currentUser }: ChatHeaderProps) {
  const displayName = getRoomDisplayName(room, currentUser);
  const memberCount = getMemberCount(room);

  return (
    <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {displayName}
        </h2>
        {room.is_group && memberCount > 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            メンバー {memberCount}人
          </p>
        )}
      </div>
    </div>
  );
}
