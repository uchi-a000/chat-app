# Chat App

Laravel（API）と Next.js（フロント）で構成されたリアルタイムチャットアプリです。
学習目的として、Docker・認証・API設計・フロント連携まで一通り実装しています。

---

## 📦 構成

```
chat-app/
├── backend/   # Laravel API
└── frontend/  # Next.js フロント
```

* **backend/** … Laravel 12、PHP、Laravel Sanctum、MySQL（Docker）
* **frontend/** … Next.js、React、TypeScript、Tailwind CSS

---

## 🛠 必要環境

* Docker / Docker Compose
* Node.js 18+（推奨 20+）
* npm / yarn / pnpm

※ Mac で動作確認済み

---

## 🚀 環境構築手順

### 1. リポジトリをクローン

```
git clone https://github.com/uchi-a000/chat-app.git
cd chat-app
```

---

### 2. Backend（Laravel）

```
cd backend
cp .env.example .env
```

Docker起動：

```
./vendor/bin/sail up -d
```

アプリキー生成：

```
./vendor/bin/sail artisan key:generate
```

マイグレーション：

```
./vendor/bin/sail artisan migrate
```

ブラウザで確認：

👉 http://localhost

---

### 3. Frontend（Next.js）

```
cd ../frontend
npm install
npm run dev
```

ブラウザ：

👉 http://localhost:3000

---

## 🔐 認証

Laravel Sanctum を使用しています。
ログイン後、Cookieベース認証で API にアクセスします。

---

## 📚 APIドキュメント

Scramble による API ドキュメント：

👉 http://localhost/docs/api

---

## ✨ 今後の実装予定

* リアルタイム通信（WebSocket）
* 画像送信機能
* グループチャット
* 未読メッセージ管理
* 通知機能

---

## 🧑‍💻 技術スタック

* Laravel 12
* Next.js
* TypeScript
* Tailwind CSS
* Docker
* MySQL
* Laravel Sanctum

---

## 📌 学習ポイント

* Laravel API設計
* Next.js連携
* Docker環境構築
* 認証フロー実装
* チャットアプリのDB設計

---

## 📷 スクリーンショット

（ここに後で追加）

---

## 📄 ライセンス

MIT
