"use client";

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import type { User, LoginRequest, RegisterRequest } from "@/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    isLoading,
    mutate,
  } = useSWR<User>("/api/user", fetcher, {
    // 401 時はエラーにせず null を返す
    onError: () => {},
    shouldRetryOnError: false,
  });

  const login = useCallback(
    async (data: LoginRequest) => {
      await api.getCsrfCookie();
      const loggedInUser = await api.post<User>("/api/login", data);
      await mutate(loggedInUser);
    },
    [mutate],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      await api.getCsrfCookie();
      const newUser = await api.post<User>("/api/register", data);
      await mutate(newUser);
    },
    [mutate],
  );

  const logout = useCallback(async () => {
    await api.post("/api/logout");
    await mutate(undefined, { revalidate: false });
  }, [mutate]);

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
