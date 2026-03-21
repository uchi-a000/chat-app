---
paths:
  - "backend/database/migrations/**"
---

# マイグレーション作成時のルール

新しいテーブルのマイグレーションを作成する際は、以下のファイルをセットで作成すること。

1. **マイグレーション** — `database/migrations/`
2. **モデル** — `app/Models/`（HasUlids トレイト、リレーション定義を含む）
3. **シーダー** — `database/seeders/`（DatabaseSeeder への登録も行う）
4. **ファクトリ** — `database/factories/`（テスト・シーダー用）
5. **Enum** — `app/Enums/`（カラムに決まった値のみ入る場合に作成）

## 注意点

- 主キーは ULID を使用（`$table->ulid('id')->primary()`、モデルに `HasUlids` トレイト）
- 外部キーは `foreignUlid()` を使用
- 既存モデルに関連するリレーションがあれば、そちらにも追加する
