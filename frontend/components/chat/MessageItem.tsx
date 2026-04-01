"use client";

import Image from "next/image";
import { format } from "date-fns";
import type { Message } from "@/types";

type MessageItemProps = {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
};

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function MessageItem({ message, isMine, showAvatar }: MessageItemProps) {
  const user = message.user;
  const displayName = user
    ? `${user.last_name} ${user.first_name}`
    : "不明なユーザー";
  const time = format(new Date(message.created_at), "H:mm");

  if (isMine) {
    return (
      <div className="flex justify-end gap-2 px-4 py-1">
        <span className="self-end text-[10px] text-zinc-400 dark:text-zinc-500">
          {time}
        </span>
        <div className="max-w-[70%] rounded-2xl rounded-br-sm bg-emerald-500 px-3 py-2 text-sm text-white">
          <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 px-4 py-1">
      {/* アバター（連続メッセージではスペーサー） */}
      <div className="w-8 shrink-0">
        {showAvatar && user && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-300 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={displayName}
                width={32}
                height={32}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitial(user.last_name || "?")
            )}
          </div>
        )}
      </div>

      <div className="max-w-[70%]">
        {showAvatar && (
          <p className="mb-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {displayName}
          </p>
        )}
        <div className="flex items-end gap-1">
          <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100">
            <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
          </div>
          <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
