"use client";

import { useState, useCallback } from "react";

type MessageInputProps = {
  onSend: (content: string) => Promise<void>;
};

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = useCallback(
    async (event?: React.SyntheticEvent) => {
      event?.preventDefault();
      const trimmed = content.trim();
      if (!trimmed || isSending) return;

      setIsSending(true);
      try {
        await onSend(trimmed);
        setContent("");
      } finally {
        setIsSending(false);
      }
    },
    [content, isSending, onSend],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter で送信、Shift+Enter で改行
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700"
    >
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力..."
        rows={1}
        className="max-h-32 flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
      />
      <button
        type="submit"
        disabled={!content.trim() || isSending}
        className="shrink-0 rounded-lg bg-emerald-500 p-2 text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="送信"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </form>
  );
}
