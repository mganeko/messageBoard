# Cloudflare Workers + D1 デプロイ手順

アプリケーションのCloudflare Workers + D1への移行が完了しました。

## 完了した作業

- ✅ wrangler.toml作成
- ✅ package.json の依存関係更新
- ✅ TypeScript設定の更新
- ✅ データベース層のD1 API対応（非同期化）
- ✅ アプリケーション層のWorkers対応
- ✅ マイグレーションファイルの作成
- ✅ 既存データのエクスポート（4件のメッセージ）

## 次のステップ: Cloudflareへのデプロイ

### 1. Cloudflareにログイン

```bash
npx wrangler login
```

ブラウザが開き、Cloudflareアカウントでログインします。

### 2. 本番環境のD1データベースを作成

```bash
npm run db:create
```

実行後、出力される `database_id` をコピーしてください。例：
```
✅ Successfully created DB 'message-board-db'!

binding = "DB"
database_name = "message-board-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. wrangler.toml にdatabase_idを設定

`wrangler.toml` ファイルを開いて、`database_id` の値を更新：

```toml
[[d1_databases]]
binding = "DB"
database_name = "message-board-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ここに実際のIDを設定
```

### 4. マイグレーションの適用

**重要:** デフォルトではローカルDBに適用されます。リモート（本番）DBに適用するには `--remote` フラグが必要です。

```bash
# 本番環境のリモートDBに適用
npm run db:migrate -- --remote
```

これでCloudflare上のD1データベースにテーブルが作成されます。

> **📝 Note:** `--remote` フラグを付けないと、ローカルの `.wrangler/state/v3/d1` 内のDBにのみ適用されます。

### 5. 既存データのインポート

```bash
# 本番環境のリモートDBにインポート
npm run db:execute -- --remote --file=migration-data.sql
```

既存の4件のメッセージが本番D1データベースにインポートされます。

> **📝 Note:** こちらも `--remote` フラグが必要です。

### 6. 本番環境へデプロイ

```bash
npm run deploy
```

デプロイが成功すると、URLが表示されます：
```
Published message-board (1.23 sec)
  https://message-board.your-account.workers.dev
```

### 7. 動作確認

ブラウザで表示されたURLにアクセスして、アプリケーションが正常に動作することを確認してください。

## ローカル開発環境

ローカルでテストする場合：

```bash
npm run dev
```

http://localhost:8787 でアクセスできます。ローカルのD1データベースは自動的にシミュレートされます。

> **💡 ローカルとリモートの違い**
> - `npm run db:migrate` → ローカルDBに適用（デフォルト）
> - `npm run db:migrate -- --remote` → Cloudflare上のリモートDBに適用
> - データは `.wrangler/state/v3/d1` に保存されます（ローカル環境）

### ローカルD1にマイグレーションを適用（初回のみ）

```bash
npx wrangler d1 migrations apply message-board-db --local
```

### ローカルD1にデータをインポート（オプション）

```bash
npx wrangler d1 execute message-board-db --local --file=migrations/0001_initial_schema.sql
npx wrangler d1 execute message-board-db --local --file=migration-data.sql
```

## トラブルシューティング

### database_idが未設定のエラー

wrangler.toml の `database_id` が空の場合、デプロイ時にエラーになります。
必ず `npm run db:create` を実行して、取得したIDを設定してください。

### TypeScriptのコンパイルエラー

```bash
npm run build
```

でTypeScriptのエラーを確認できます。

### データベース接続エラー

D1のバインディング名が正しいか確認：
- wrangler.toml: `binding = "DB"`
- コード: `c.env.DB`

## 主な変更点のまとめ

### データベースAPI
- `better-sqlite3` → `D1Database`
- 同期 → 非同期（async/await）
- `stmt.all()` → `await stmt.bind().all().results`
- `stmt.get()` → `await stmt.first()`
- `result.lastInsertRowid` → `result.meta.last_row_id`

### アプリケーション
- Node.jsサーバー → Cloudflare Workers
- `serve()` → `export default app`
- CSSファイルをコード内に埋め込み

## 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Hono.js](https://hono.dev/)
