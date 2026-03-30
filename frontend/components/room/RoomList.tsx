"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/contexts/AuthContext";
import type { Room } from "@/types";
import { RoomItem } from "@/components/room/RoomItem";
import { RoomListSkeleton } from "@/components/room/RoomListSkeleton";
import { CreateRoomModal } from "@/components/room/CreateRoomModal";

type RoomsResponse = {
  data: Room[];
};

export function RoomList() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useSWR<RoomsResponse>(
    "/api/rooms",
    fetcher,
  );

  const rooms = data?.data ?? [];

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 dark:border-zinc-700">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          トーク
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="ルームを作成"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ログアウト
          </button>
        </div>
      </div>

      <CreateRoomModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* ルーム一覧 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <RoomListSkeleton />
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ルームがありません
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              新しいルームを作成して会話を始めましょう
            </p>
          </div>
        ) : (
          <div>
            {rooms.map((room) => (
              <RoomItem key={room.id} room={room} currentUser={user!} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
