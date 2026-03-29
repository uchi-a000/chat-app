# Frontend Design Document

## 概要

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 によるチャットアプリのフロントエンド設計。
BE の REST API（Laravel Sanctum Cookie 認証）と連携する SPA 的な構成。

---

## 技術選定

| 項目 | 選定 | 理由 |
|---|---|---|
| フレームワーク | Next.js 16 (App Router) | 既存構成。SSR/RSC 活用可 |
| データフェッチ | SWR | 軽量、Next.js 親和性◎、リアルタイムポーリング対応 |
| UI | Tailwind CSS v4 自作 | 学習目的。ライブラリ非依存 |
| フォーム | React 19 useActionState | 追加ライブラリ不要。Server Actions 不使用（API は BE） |
| 認証状態 | SWR + React Context | `/api/user` を SWR で取得し Context で配信 |
| リアルタイム | SWR refreshInterval（ポーリング） | 将来 WebSocket に置換可能な設計にする |

---

## 画面構成・ルーティング

| パス | 画面 | 認証 | フェーズ |
|---|---|---|---|
| `/login` | ログイン | 不要 | 1 |
| `/register` | ユーザー登録 | 不要 | 1 |
| `/rooms` | ルーム一覧 | 必要 | 2 |
| `/rooms/new` | ルーム作成 | 必要 | 2 |
| `/rooms/[roomId]` | チャット（メッセージ一覧 + 送信） | 必要 | 2 |

---

## ディレクトリ構成

```
frontend/
├── app/
│   ├── layout.tsx              # ルートレイアウト（AuthProvider ラップ）
│   ├── page.tsx                # / → /rooms にリダイレクト
│   ├── (auth)/                 # 認証不要グループ
│   │   ├── layout.tsx          # 認証済みなら /rooms にリダイレクト
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── (main)/                 # 認証必要グループ
│       ├── layout.tsx          # 未認証なら /login にリダイレクト
│       └── rooms/
│           ├── page.tsx        # ルーム一覧
│           ├── new/
│           │   └── page.tsx    # ルーム作成
│           └── [roomId]/
│               └── page.tsx    # チャット画面
├── components/
│   ├── ui/                     # 汎用 UI（Button, Input, Card 等）
│   ├── auth/                   # 認証系コンポーネント
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── room/                   # ルーム系コンポーネント（フェーズ2）
│   │   ├── RoomList.tsx
│   │   ├── RoomListItem.tsx
│   │   └── CreateRoomForm.tsx
│   └── message/                # メッセージ系コンポーネント（フェーズ2）
│       ├── MessageList.tsx
│       ├── MessageBubble.tsx
│       └── MessageInput.tsx
├── contexts/
│   └── AuthContext.tsx          # 認証状態の Context + Provider
├── lib/
│   ├── api.ts                  # API クライアント（fetch ラッパー）
│   └── fetcher.ts              # SWR 用 fetcher
└── types/
    └── index.ts                # 共通型定義
```

---

## 共通基盤

### API クライアント (`lib/api.ts`)

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Sanctum Cookie 認証のため credentials: "include" を常に付与
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    // 422 はバリデーションエラー → errors オブジェクトを throw
    // 401 は認証エラー → AuthContext 側でハンドリング
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, ...body };
  }

  // 204 No Content 等
  if (res.status === 204) return undefined as T;
  return res.json();
}
```

主要メソッド:
- `api.get<T>(path)` — GET リクエスト
- `api.post<T>(path, body)` — POST リクエスト
- `api.getCsrfCookie()` — `GET /sanctum/csrf-cookie`（ログイン/登録前に必須）

### SWR fetcher (`lib/fetcher.ts`)

```ts
// api.get をラップした SWR 用 fetcher
export const fetcher = (path: string) => api.get(path);
```

### 型定義 (`types/index.ts`)

```ts
// BE の API レスポンスに対応する型

type User = {
  id: string;          // ULID
  first_name: string;
  last_name: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
};

type MessageUser = Pick<User, "id" | "first_name" | "last_name">;

type RoomUser = Pick<User, "id" | "first_name" | "last_name" | "nickname" | "avatar">;

type Message = {
  id: string;
  room_id: string;
  content: string;
  type: "text" | "image" | "file";
  user: RoomUser | null;
  created_at: string;
  updated_at: string;
};

type LastMessage = {
  id: string;
  content: string;
  type: "text" | "image" | "file";
  user: MessageUser;
  created_at: string;
};

type Room = {
  id: string;
  name: string;
  is_group: boolean;
  last_message: LastMessage | null;
  users: RoomUser[] | null;
  created_at: string;
  updated_at: string;
};

// リクエスト型
type LoginRequest = { email: string; password: string };
type RegisterRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};
type CreateRoomRequest = {
  name?: string;
  is_group: boolean;
  user_ids: string[];
};
type SendMessageRequest = {
  content: string;
  type: "text" | "image" | "file";
};

// API エラー
type ApiValidationError = {
  status: 422;
  message: string;
  errors: Record<string, string[]>;
};
```

---

## 認証基盤 (`contexts/AuthContext.tsx`)

```
AuthProvider（layout.tsx でラップ）
├── SWR で GET /api/user を取得
├── user: User | null を配信
├── isLoading: boolean
├── login(email, password) → POST /login
├── register(data) → POST /register
└── logout() → POST /logout → mutate(null)
```

**認証フロー:**

1. `GET /sanctum/csrf-cookie`（XSRF-TOKEN Cookie 取得）
2. `POST /login` or `POST /register`（Cookie セッション確立）
3. 以降のリクエストは Cookie 自動送信（`credentials: "include"`）

**ルーティングガード:**
- `(auth)/layout.tsx` — `user` が存在すれば `/rooms` にリダイレクト
- `(main)/layout.tsx` — `user` が null かつ `isLoading` が false なら `/login` にリダイレクト

---

## フェーズ1: 認証画面（詳細設計）

### ログイン画面 (`/login`)

```
┌─────────────────────────────────┐
│          Chat App               │
│                                 │
│  ┌───────────────────────────┐  │
│  │ メールアドレス            │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ パスワード                │  │
│  └───────────────────────────┘  │
│                                 │
│  [      ログイン      ]         │
│                                 │
│  アカウントをお持ちでない方は   │
│  → 新規登録                     │
│                                 │
└─────────────────────────────────┘
```

**コンポーネント構成:**
- `LoginForm` — フォーム本体
  - `Input` (email) + `Input` (password) + `Button` (submit)
  - バリデーションエラー表示（BE 422 レスポンスの `errors` を各フィールドに表示）
  - 送信中は Button を disabled + ローディング表示

### 登録画面 (`/register`)

```
┌─────────────────────────────────┐
│          Chat App               │
│                                 │
│  ┌────────────┐┌────────────┐  │
│  │ 姓         ││ 名         │  │
│  └────────────┘└────────────┘  │
│  ┌───────────────────────────┐  │
│  │ メールアドレス            │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ パスワード                │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ パスワード（確認）        │  │
│  └───────────────────────────┘  │
│                                 │
│  [     アカウント作成     ]     │
│                                 │
│  すでにアカウントをお持ちの方は │
│  → ログイン                     │
│                                 │
└─────────────────────────────────┘
```

**コンポーネント構成:**
- `RegisterForm` — フォーム本体
  - 姓・名は横並び
  - バリデーションは BE の 422 に依存（FE 側の即時バリデーションは最小限）
  - 登録成功 → 自動ログイン状態 → `/rooms` にリダイレクト

### 共通 UI コンポーネント（フェーズ1で作成）

| コンポーネント | 責務 |
|---|---|
| `Button` | 汎用ボタン。variant (primary/secondary), disabled, loading 対応 |
| `Input` | テキスト入力。label, error メッセージ表示, type (text/email/password) |
| `Card` | コンテンツをカード風にラップ |
| `FormError` | フィールド単位のエラーメッセージ表示 |

---

## フェーズ2: メイン画面（概要のみ）

> フェーズ1完了後に詳細設計する。以下は方向性のみ。

### ルーム一覧 (`/rooms`)

- SWR で `GET /rooms` をフェッチ
- 各ルームに最新メッセージ・参加者アバターを表示
- ルームクリック → `/rooms/[roomId]` に遷移
- 新規作成ボタン → `/rooms/new`

### チャット画面 (`/rooms/[roomId]`)

- SWR で `GET /rooms/{roomId}` + `GET /rooms/{roomId}/messages` をフェッチ
- メッセージ一覧（自分/相手で左右分け）
- 下部にメッセージ入力欄
- ポーリング: `refreshInterval: 3000`（3秒）で新着取得
  - 将来 WebSocket に置換する際は、SWR の `mutate` を WebSocket イベントから呼ぶだけで移行可能

---

## リアルタイム戦略

**現在（ポーリング）:**
```
SWR refreshInterval → GET /rooms/{id}/messages → 差分表示
```

**将来（WebSocket 移行時）:**
```
Laravel Echo + Pusher/Soketi → WebSocket イベント受信 → SWR mutate() で即時反映
```

SWR の `mutate` をリアルタイム更新のインターフェースとして使うことで、ポーリング → WebSocket の移行がデータ層の差し替えのみで済む。

---

## 環境変数

| 変数名 | 用途 | デフォルト |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | BE API のベース URL | `http://localhost` |
