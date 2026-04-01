# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## プロジェクト概要

Laravel API バックエンドと Next.js フロントエンドで構成されたリアルタイムチャットアプリ。Docker・認証・API設計・フロント連携を一通り実装する学習プロジェクト。

## アーキテクチャ

- **backend/** — Laravel 12 API (PHP 8.2+)、Laravel Sanctum（Cookieベース認証）、MySQL 8.4（Docker / Laravel Sail）
- **frontend/** — Next.js 16、React 19、TypeScript、Tailwind CSS v4
- **vendor/** — Sail ランタイム（Docker起動に必要なため `composer install` 前にコミット済み）

DBテーブル: users, rooms, room_users, messages, message_reads, sessions, cache, jobs

APIドキュメントは Scramble により `/docs/api` で自動生成。

## コマンド

### バックエンド（`backend/` で実行）

```bash
# Docker環境
./vendor/bin/sail up -d          # 全コンテナ起動
./vendor/bin/sail down           # コンテナ停止

# Laravel
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan test   # PHPUnit テスト実行
./vendor/bin/sail artisan tinker

# コードスタイル
./vendor/bin/sail php ./vendor/bin/pint   # Laravel Pint (PSR-12)
```

### フロントエンド（`frontend/` で実行）

```bash
npm install
npm run dev      # 開発サーバー（:3000）
npm run build
npm run lint     # ESLint
```

## 開発環境

- バックエンド: `http://localhost`（ポート80）via Sail
- フロントエンド: `http://localhost:3000`
- phpMyAdmin: `http://localhost:8080`
- Mailpit: `http://localhost:8025`
- Dockerサービス: MySQL, Redis, Meilisearch, Mailpit, Selenium

## 規約

- バックエンドは Laravel 標準ディレクトリ構成（ルート定義は `routes/api.php`、モデルは `app/Models/`）
- フロントエンドは Next.js App Router（`app/` ディレクトリ）、パスエイリアス `@/*`
- TypeScript strict モード有効

### バックエンド配置・命名規則

Controller の責務は UseCase（Action）に分離する。

| 種別 | 配置パス | 命名 |
|---|---|---|
| Controller | `app/Http/Controllers/{Entity}Controller.php` | `{Entity}Controller` |
| FormRequest | `app/Http/Requests/{Entity}/{Name}Request.php` | `{Name}Request` |
| Resource | `app/Http/Resources/{Entity}/{Name}Resource.php` | `{Name}Resource` |
| UseCase | `app/UseCases/{Entity}/{Name}Action.php` | `{Name}Action` |

命名に Get / Create などの動詞プレフィックスは付けない（例: `RoomsAction`, `RoomRequest`, `MessagesResource`）。

### フロントエンド ページ構成規則

各ページは責務を `page.tsx` と `Client.tsx` に分離する。

| ファイル | 責務 | 備考 |
|---|---|---|
| `page.tsx` | Server Component。params 解決、メタ情報、Client への props 渡し | `"use client"` を付けない |
| `Client.tsx` | Client Component。ブラウザイベント、状態管理、UI の組み立て | 同ディレクトリに配置 |

### テスト規約

Controller（APIエンドポイント）を作成・変更したら、対応する Feature テストも必ず作成・更新する。

| 種別 | 配置パス | 命名 |
|---|---|---|
| Feature テスト | `tests/Feature/{Entity}/{Name}Test.php` | `{Name}Test` |

テスト実装ルール:
- `RefreshDatabase` trait を使用
- `actingAs($user, 'sanctum')` で認証
- Factory でテストデータ作成
- テストメソッド名は日本語（`test_ルームを作成できる`）
- 各エンドポイントに対して最低限カバーするケース:
  - 正常系（成功パターン）
  - 未認証 → 401
  - 権限チェックがある場合 → 非メンバー 403
  - バリデーションがある場合 → 422（必須項目欠落、不正値）
