"use client";

import Image from "next/image";
import type { Room, User } from "@/types";
import { formatRelativeTime } from "@/lib/date";

type RoomItemProps = {
  room: Room;
  currentUser: User;
};

/** DM の場合、相手ユーザーの名前を返す。グループはルーム名をそのまま返す */
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

/** メンバーのイニシャルを返す（アバター未設定時のフォールバック） */
function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function RoomItem({ room, currentUser }: RoomItemProps) {
  const displayName = getRoomDisplayName(room, currentUser);
  const lastMessage = room.last_message;

  // DM: 相手のアバター、グループ: ルーム名のイニシャル
  const avatarUser = !room.is_group
    ? room.users?.find((u) => u.id !== currentUser.id)
    : null;

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      {/* アバター */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-sm font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
        {avatarUser?.avatar ? (
          <Image
            src={avatarUser.avatar}
            alt={displayName}
            width={40}
            height={40}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          getInitial(displayName)
        )}
      </div>

      {/* ルーム情報 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {displayName}
          </span>
          {lastMessage && (
            <span className="ml-2 shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
              {formatRelativeTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {room.is_group && (
              <span className="font-medium">
                {lastMessage.user.last_name}:{" "}
              </span>
            )}
            {lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}
