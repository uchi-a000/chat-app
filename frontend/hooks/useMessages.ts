"use client";

import useSWRInfinite from "swr/infinite";
import { useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { getEcho } from "@/lib/echo";
import type { Message, SendMessageRequest } from "@/types";

type CursorPage = {
  data: Message[];
  next_cursor: string | null;
  next_page_url: string | null;
};

function getKey(roomId: string) {
  return (pageIndex: number, previousPageData: CursorPage | null) => {
    // 最初のページ
    if (pageIndex === 0) return `/api/rooms/${roomId}/messages`;
    // 前ページにカーソルがなければ末端
    if (!previousPageData?.next_cursor) return null;
    return `/api/rooms/${roomId}/messages?cursor=${previousPageData.next_cursor}`;
  };
}

export function useMessages(roomId: string) {
  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<CursorPage>(getKey(roomId), fetcher, {
      revalidateFirstPage: false,
    });

  // 全ページのメッセージをフラット化（API は降順なので reverse して時系列順に）
  const messages: Message[] = data
    ? data.flatMap((page) => page.data).reverse()
    : [];

  const hasMore = data ? data[data.length - 1]?.next_cursor !== null : false;

  const loadMore = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [isValidating, hasMore, setSize]);

  const sendMessage = useCallback(
    async (content: string) => {
      const body: SendMessageRequest = { content, type: "text" };
      await api.post(`/api/rooms/${roomId}/messages`, body);
      mutate();
    },
    [roomId, mutate],
  );

  // WebSocket でリアルタイム受信
  const mutateRef = useRef(mutate);

  useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);

  useEffect(() => {
    const echo = getEcho();
    const channel = echo.private(`room.${roomId}`);

    channel.listen("MessageSent", (event: { message: Message }) => {
      mutateRef.current((pages) => {
        if (!pages || pages.length === 0) return pages;

        // 最初のページ（最新）にメッセージを追加
        const firstPage = pages[0];
        return [
          { ...firstPage, data: [event.message, ...firstPage.data] },
          ...pages.slice(1),
        ];
      }, { revalidate: false });
    });

    return () => {
      echo.leave(`room.${roomId}`);
    };
  }, [roomId]);

  return {
    messages,
    isLoading,
    isLoadingMore: isValidating && size > 1,
    hasMore,
    loadMore,
    sendMessage,
    error,
  };
}
