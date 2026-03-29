/**
 * Laravel APIと通信するための共通ユーティリティ
 * - fetchラッパー（request）
 * - API呼び出し用の簡易メソッド（api）
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost";

// document.cookie から XSRF-TOKEN を読み取る（fetch は Axios と違い自動送信しない）
function getXsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

// fetch の共通ラッパー（baseURL付与・ヘッダー統一・認証Cookie送信・エラーハンドリング）
async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const xsrfToken = getXsrfToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(xsrfToken && { "X-XSRF-TOKEN": xsrfToken }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, ...body };
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// APIエンドポイント呼び出し用のラッパー（GET/POSTの簡易メソッド）
export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  // Laravel Sanctum用のCSRF Cookieを取得。ログイン・登録などのPOSTリクエスト前に必須
  async getCsrfCookie(): Promise<void> {
    await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
      credentials: "include",
    });
  },
};
