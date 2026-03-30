"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { RoomUser, CreateRoomRequest, ApiValidationError } from "@/types";

type CreateRoomResponse = {
  data: { id: string };
};

type UsersResponse = {
  data: RoomUser[];
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateRoomModal({ open, onClose }: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [roomName, setRoomName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<RoomUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<RoomUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // リセット
  useEffect(() => {
    if (open) {
      setMode("dm");
      setRoomName("");
      setSearch("");
      setSearchResults([]);
      setSelectedUsers([]);
      setErrors({});
    }
  }, [open]);

  // ユーザー検索（デバウンス）
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get<UsersResponse>(
          `/api/users?search=${encodeURIComponent(search.trim())}`,
        );
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectUser = useCallback(
    (user: RoomUser) => {
      if (mode === "dm") {
        setSelectedUsers([user]);
        setSearch("");
        setSearchResults([]);
      } else {
        if (!selectedUsers.some((u) => u.id === user.id)) {
          setSelectedUsers((prev) => [...prev, user]);
        }
        setSearch("");
        setSearchResults([]);
      }
    },
    [mode, selectedUsers],
  );

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const body: CreateRoomRequest = {
        is_group: mode === "group",
        user_ids: selectedUsers.map((u) => u.id),
        ...(mode === "group" && roomName.trim() ? { name: roomName.trim() } : {}),
      };

      const res = await api.post<CreateRoomResponse>("/api/rooms", body);
      await mutate("/api/rooms");
      onClose();
      router.push(`/rooms/${res.data.id}`);
    } catch (err) {
      const apiErr = err as ApiValidationError;
      if (apiErr.errors) {
        setErrors(apiErr.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = (user: RoomUser) => {
    const name = `${user.last_name} ${user.first_name}`;
    return user.nickname ? `${name} (@${user.nickname})` : name;
  };

  const canSubmit = selectedUsers.length > 0 && !isSubmitting;

  return (
    <Modal open={open} onClose={onClose} title="ルームを作成">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DM / グループ 切替 */}
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setMode("dm");
              setSelectedUsers([]);
            }}
            className={`flex-1 rounded-l-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "dm"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            DM
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("group");
              setSelectedUsers([]);
            }}
            className={`flex-1 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "group"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            グループ
          </button>
        </div>

        {/* グループ名 */}
        {mode === "group" && (
          <Input
            label="グループ名"
            placeholder="グループ名を入力"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            error={errors.name}
          />
        )}

        {/* ユーザー検索 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {mode === "dm" ? "相手を選択" : "メンバーを追加"}
          </label>

          {/* 選択済みチップ */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                >
                  {user.last_name} {user.first_name}
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    className="ml-0.5 rounded-full p-0.5 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 検索入力 */}
          <div className="relative">
            <input
              type="text"
              placeholder="名前またはニックネームで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>

          {/* 検索結果 */}
          {searchResults.length > 0 && (
            <ul className="max-h-40 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              {searchResults
                .filter((u) => !selectedUsers.some((s) => s.id === u.id))
                .map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      {displayName(user)}
                    </button>
                  </li>
                ))}
            </ul>
          )}

          {search.trim() && !isSearching && searchResults.length === 0 && (
            <p className="text-xs text-zinc-400">該当するユーザーが見つかりません</p>
          )}

          {errors.user_ids && (
            <p className="text-xs text-red-500">{errors.user_ids[0]}</p>
          )}
        </div>

        {/* 送信 */}
        <Button
          type="submit"
          disabled={!canSubmit}
          loading={isSubmitting}
          className="w-full"
        >
          {mode === "dm" ? "トークを開始" : "グループを作成"}
        </Button>
      </form>
    </Modal>
  );
}
