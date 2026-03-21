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
