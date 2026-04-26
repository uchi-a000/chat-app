/**
 * Laravel Echo（WebSocket クライアント）の設定・初期化
 *
 * 役割:
 * - フロントエンドから Reverb（WebSocket サーバー :9080）への接続を確立
 * - プライベートチャンネル（room.{id}）の認証処理
 * - アプリ全体で1つの接続を使い回すシングルトン管理
 *
 * 使い方:
 *   const echo = getEcho();
 *   echo.private("room.123").listen("MessageSent", callback);
 */
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"reverb">;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost";

// シングルトン: アプリ全体で1つの Echo インスタンスを使い回す
let echo: Echo<"reverb"> | null = null;

/**
 * Echo インスタンスを取得（なければ初期化）
 * 初回呼び出し時に WebSocket 接続を確立し、以降は同じインスタンスを返す
 */
export function getEcho(): Echo<"reverb"> {
  if (echo) return echo;

  // Laravel Echo が内部で使う Pusher ライブラリをグローバルに登録
  window.Pusher = Pusher;

  echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,

    // WebSocket サーバー（Reverb）の接続先
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 9080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 9080),
    forceTLS: false,
    enabledTransports: ["ws", "wss"],

    // プライベートチャンネルの認証処理（カスタム authorizer）
    // デフォルトの authEndpoint 指定だと XSRF トークンが初期化時に固定されてしまうため、
    // 毎回最新のトークンを取得して送るようにカスタマイズしている
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: (error: Error | null, data: { auth: string; channel_data?: string } | null) => void) => {
        fetch(`${API_BASE}/broadcasting/auth`, {
          method: "POST",
          credentials: "include", // Cookie を送信（Sanctum 認証に必要）
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-XSRF-TOKEN": getXsrfToken() ?? "",
          },
          body: JSON.stringify({
            socket_id: socketId,       // Reverb から割り当てられた接続ID
            channel_name: channel.name, // 購読するチャンネル名（例: private-room.123）
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
            return res.json();
          })
          .then((data) => callback(null, data))
          .catch((error) => callback(error, null));
      },
    }),
  });

  return echo;
}

/** document.cookie から Laravel の XSRF-TOKEN を読み取る */
function getXsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}
