"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import type { Room } from "@/types";

type Props = {
  roomId: string;
};

type RoomResponse = {
  data: Room;
};

export default function Client({ roomId }: Props) {
  const { user } = useAuth();
  const { data: roomData, isLoading: isRoomLoading } = useSWR<RoomResponse>(
    `/api/rooms/${roomId}`,
    fetcher,
  );
  const {
    messages,
    isLoading: isMessagesLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    sendMessage,
  } = useMessages(roomId);

  if (isRoomLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          読み込み中...
        </p>
      </div>
    );
  }

  const room = roomData?.data;
  if (!room) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          ルームが見つかりません
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader room={room} currentUser={user} />
      <MessageList
        messages={messages}
        currentUserId={user.id}
        isLoading={isMessagesLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
