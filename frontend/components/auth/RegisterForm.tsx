"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ApiValidationError } from "@/types";

const STORAGE_KEY = "register-form";

type RegisterFormState = {
  first_name: string;
  last_name: string;
  email: string;
};

function loadSavedForm(): RegisterFormState {
  if (typeof window === "undefined") {
    return { first_name: "", last_name: "", email: "" };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as RegisterFormState;
  } catch {
    // ignore
  }
  return { first_name: "", last_name: "", email: "" };
}

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    ...loadSavedForm(),
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  // パスワード以外を localStorage に保存
  useEffect(() => {
    const { first_name, last_name, email } = form;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ first_name, last_name, email }),
    );
  }, [form]);

  const update = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await register(form);
      localStorage.removeItem(STORAGE_KEY);
      router.replace("/rooms");
    } catch (err: unknown) {
      const apiErr = err as ApiValidationError;
      if (apiErr.errors) {
        setErrors(apiErr.errors);
      } else if (apiErr.message) {
        setErrors({ email: [apiErr.message] });
      } else {
        setErrors({ email: ["登録に失敗しました。"] });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="姓"
          name="last_name"
          autoComplete="family-name"
          required
          value={form.last_name}
          onChange={(e) => update("last_name", e.target.value)}
          error={errors.last_name}
        />
        <Input
          label="名"
          name="first_name"
          autoComplete="given-name"
          required
          value={form.first_name}
          onChange={(e) => update("first_name", e.target.value)}
          error={errors.first_name}
        />
      </div>
      <Input
        label="メールアドレス"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />
      <Input
        label="パスワード"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password}
      />
      <Input
        label="パスワード（確認）"
        type="password"
        name="password_confirmation"
        autoComplete="new-password"
        required
        value={form.password_confirmation}
        onChange={(e) => update("password_confirmation", e.target.value)}
        error={errors.password_confirmation}
      />
      <Button type="submit" loading={loading} className="w-full">
        アカウント作成
      </Button>
    </form>
  );
}
