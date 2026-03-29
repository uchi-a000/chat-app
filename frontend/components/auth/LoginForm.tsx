"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ApiValidationError } from "@/types";

const STORAGE_KEY = "login-form";

function loadSavedEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(loadSavedEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  // メールアドレスを localStorage に保存（パスワードは保存しない）
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, email);
  }, [email]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login({ email, password });
      localStorage.removeItem(STORAGE_KEY);
      router.replace("/rooms");
    } catch (err: unknown) {
      const apiErr = err as ApiValidationError;
      if (apiErr.errors) {
        setErrors(apiErr.errors);
      } else if (apiErr.message) {
        setErrors({ email: [apiErr.message] });
      } else {
        setErrors({ email: ["ログインに失敗しました。"] });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="メールアドレス"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label="パスワード"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <Button type="submit" loading={loading} className="w-full">
        ログイン
      </Button>
    </form>
  );
}
