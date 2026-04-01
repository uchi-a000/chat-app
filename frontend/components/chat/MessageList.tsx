"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { MessageItem } from "@/components/chat/MessageItem";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const { sentinelRef } = useInfiniteScroll({
    onIntersect: onLoadMore,
    enabled: hasMore && !isLoadingMore,
  });

  // 新しいメッセージが追加されたとき（末尾に追加 = 送信時）のみ自動スクロール
  useEffect(() => {
    const prev = prevMessagesLengthRef.current;
    const curr = messages.length;
    prevMessagesLengthRef.current = curr;

    // 初回読み込み or 末尾にメッセージ追加（送信）時にスクロール
    if (prev === 0 || (curr > prev && messages[curr - 1]?.user?.id === currentUserId)) {
      bottomRef.current?.scrollIntoView({ behavior: prev === 0 ? "instant" : "smooth" });
    }
  }, [messages, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          メッセージを読み込み中...
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          メッセージはまだありません
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto py-4">
      {/* 上方向の無限スクロール用センチネル */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-2">
          {isLoadingMore && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              読み込み中...
            </p>
          )}
        </div>
      )}

      {messages.map((message, index) => {
        const isMine = message.user?.id === currentUserId;
        // 前のメッセージと同じユーザーならアバターを非表示
        const prevMessage = messages[index - 1];
        const showAvatar =
          !isMine &&
          (!prevMessage || prevMessage.user?.id !== message.user?.id);

        return (
          <MessageItem
            key={message.id}
            message={message}
            isMine={isMine}
            showAvatar={showAvatar}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
