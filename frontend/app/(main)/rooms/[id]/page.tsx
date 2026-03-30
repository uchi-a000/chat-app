"use client";

import { use } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function RoomPage({ params }: Props) {
  const { id } = use(params);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        ルーム {id} — チャット画面は今後実装予定
      </p>
    </div>
  );
}
