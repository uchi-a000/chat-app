"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export default function RoomsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        ようこそ、{user?.last_name} {user?.first_name} さん
      </p>
      <p className="text-sm text-zinc-400">
        ルーム一覧はフェーズ2で実装予定
      </p>
      <Button variant="secondary" onClick={logout}>
        ログアウト
      </Button>
    </div>
  );
}
