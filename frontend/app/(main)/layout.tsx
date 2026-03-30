"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { RoomList } from "@/components/room/RoomList";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen">
      {/* サイドバー（ルーム一覧） */}
      <aside className="w-80 shrink-0">
        <RoomList />
      </aside>

      {/* メインエリア */}
      <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
