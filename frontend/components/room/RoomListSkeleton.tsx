"use client";

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* アバター */}
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex-1 space-y-2">
        {/* ルーム名 */}
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        {/* 最終メッセージ */}
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      {/* 日時 */}
      <div className="h-3 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

export function RoomListSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonItem key={i} />
      ))}
    </div>
  );
}
