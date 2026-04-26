# Chat App

Laravel（API）と Next.js（フロント）で構成されたリアルタイムチャットアプリです。
Docker・認証・API設計・WebSocket・フロント連携を一通り実装する学習プロジェクトです。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| バックエンド | Laravel 12, PHP 8.2+, Laravel Sanctum（Cookie認証） |
| フロントエンド | Next.js 16, React 19, TypeScript（strict）, Tailwind CSS v4 |
| リアルタイム | Laravel Reverb（WebSocket）, Laravel Echo, pusher-js |
| データベース | MySQL 8.4 |
| インフラ | Docker（Laravel Sail）, Redis, Meilisearch, Mailpit |

---

## 実装済み機能

- ユーザー登録・ログイン（Laravel Sanctum Cookie認証）
- ユーザー検索
- DM・グループチャットのルーム作成
- メッセージ送受信（テキスト）
- リアルタイムメッセージング（WebSocket）
- カーソルベースのメッセージ無限スクロール
- APIドキュメント自動生成（Scramble）

## 今後の実装予定

- 既読機能（`message_reads` テーブルは作成済み）
- タイピングインジケーター（入力中表示）
- 画像・ファイル送信
- リアクション（絵文字リアクション）
- プロフィール編集・アバターアップロード

---

## ディレクトリ構成

```
chat-app/
├── backend/    # Laravel 12 API
└── frontend/   # Next.js フロント
```

---

## 必要環境

- Docker / Docker Compose
- Node.js 18+（推奨 20+）
- npm

※ Mac で動作確認済み

---

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/uchi-a000/chat-app.git
cd chat-app
```

### 2. Backend（Laravel）

```bash
cd backend
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
```

### 3. Frontend（Next.js）

```bash
cd frontend
npm install
```

`.env.local` を作成:

```
NEXT_PUBLIC_REVERB_APP_KEY=<backend/.env の Reverb アプリキーの値>
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=9080
```

### 4. 開発サーバー起動

以下の3つを別ターミナルで起動:

```bash
# ターミナル1: Docker（backend/）
./vendor/bin/sail up -d

# ターミナル2: WebSocket サーバー（backend/）
./vendor/bin/sail artisan reverb:start

# ターミナル3: フロント開発サーバー（frontend/）
npm run dev
```

### 5. 動作確認

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンド API | http://localhost |
| API ドキュメント | http://localhost/docs/api |
| phpMyAdmin | http://localhost:8080 |
| Mailpit | http://localhost:8025 |

テスト用アカウント:

| ユーザー | メール | パスワード |
|---|---|---|
| テスト太郎 | taro@example.com | password |
| テスト花子 | hanako@example.com | password |

---

## テスト

```bash
cd backend
./vendor/bin/sail artisan test
```

---

## 開発支援

本プロジェクトでは [Claude Code](https://claude.ai/code)（Anthropic の AI コーディングアシスタント）を活用して開発を行っています。

---

## ライセンス

MIT
