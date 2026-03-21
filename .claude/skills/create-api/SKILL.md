---
name: create-api
description: Laravel の API エンドポイントを一式作成する（Controller, FormRequest, ルート定義）
argument-hint: [リソース名]
---

# API一式作成

指定されたリソース「$ARGUMENTS」に対して、以下のファイルをセットで作成する。

## 作成するファイル

1. **Controller** — `app/Http/Controllers/` に作成。単一アクションなら `__invoke` メソッド、CRUDなら `index`, `show`, `store`, `update`, `destroy` メソッドを持つリソースコントローラ
2. **FormRequest** — `app/Http/Requests/` に作成。`store` と `update` それぞれにバリデーションルールを定義
3. **ルート定義** — `routes/api.php` に追加。認証が必要なエンドポイントは `auth:sanctum` ミドルウェアグループ内に配置

## 手順

1. 対象リソースのモデルとマイグレーションを確認し、カラム構成を把握する
2. Controller を作成する
3. FormRequest を作成する（バリデーションルールはカラム定義に基づく）
4. `routes/api.php` にルートを追加する
5. 作成したエンドポイント一覧をテーブル形式で表示する
