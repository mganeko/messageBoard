# メッセージボード

シンプルなメッセージボードWebアプリケーション。ユーザーは名前とメッセージを投稿でき、投稿されたメッセージが新しい順に一覧表示されます。

> このアプリケーションは [Claude Code](https://claude.com/claude-code) を使用して開発されています。

## 特徴

- 📝 **シンプルな投稿機能**: 名前とメッセージを入力して投稿
- 📋 **一覧表示**: 投稿されたメッセージを新しい順に表示
- 📄 **ページネーション**: 1ページ20件ずつ表示
- ✅ **バリデーション**: 入力内容の検証とエラー表示
- 🎨 **レスポンシブデザイン**: モバイル・デスクトップ対応
- 🔒 **セキュリティ対策**: XSS・SQLインジェクション対策済み
- ⚡ **エッジコンピューティング**: Cloudflare Workersで世界中から低レイテンシでアクセス可能
- 🌐 **自動スケーリング**: トラフィックに応じた自動スケール

## 技術スタック

- **ランタイム**: [Cloudflare Workers](https://workers.cloudflare.com/)（エッジコンピューティング）
- **Webフレームワーク**: [Hono.js](https://hono.dev/) v4（Workers最適化）
- **データベース**: [Cloudflare D1](https://developers.cloudflare.com/d1/)（分散SQLite）
- **言語**: TypeScript
- **開発ツール**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/)（Cloudflare CLI）
- **テンプレート**: hono/html
- **テスト**: Node.js Test Runner
- **旧環境**: Node.js + SQLite（ローカル開発用に保持）

## セットアップ

### 必要要件

- Node.js 18以上
- npm
- Cloudflareアカウント（デプロイ時のみ）

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd messageBoard

# 依存関係のインストール
npm install
```

### Cloudflareへのログイン（デプロイ時のみ）

```bash
npx wrangler login
```

## 使い方

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:8787` にアクセス

**ローカルネットワークからアクセス:**
- 開発サーバーは `--ip 0.0.0.0` で起動
- 同じネットワーク内の他のデバイスから `http://<IPアドレス>:8787` でアクセス可能

**特徴:**
- D1データベースがローカルでシミュレート
- ホットリロード有効
- Cloudflare Workers環境を完全再現

### TypeScriptビルド（型チェック）

```bash
npm run build
```

TypeScriptの型チェックを実行します。

### デプロイ

**初回デプロイ:**
```bash
# 1. D1データベースを作成
npm run db:create

# 2. wrangler.tomlにdatabase_idを設定（出力されたIDをコピー）

# 3. マイグレーション適用
npm run db:migrate

# 4. 既存データをインポート（オプション）
npm run db:execute -- --file=migration-data.sql

# 5. デプロイ
npm run deploy
```

**更新デプロイ:**
```bash
npm run deploy
```

詳細な手順は [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) を参照してください。

### テストの実行

```bash
npm test
```

データアクセス層のテストを実行します。

### Linter/Formatter

```bash
npm run lint        # チェックのみ
npm run lint:fix    # 自動修正
```

## プロジェクト構造

```
messageBoard/
├── src/
│   ├── index.ts              # Workers エントリーポイント（export default app）
│   ├── routes/               # ルートハンドラ
│   │   ├── index.ts          # トップページ（メッセージ一覧）
│   │   └── post.ts           # 投稿ページ
│   ├── db/                   # データベース関連
│   │   ├── connection.ts     # （レガシー、D1では不使用）
│   │   ├── schema.ts         # （レガシー、マイグレーション化）
│   │   └── messages.ts       # メッセージのCRUD操作（非同期）
│   ├── views/                # HTMLビューコンポーネント
│   │   ├── layout.ts         # 共通レイアウト
│   │   ├── message-list.ts   # メッセージ一覧ビュー
│   │   └── post-form.ts      # 投稿フォームビュー
│   └── types/
│       ├── message.ts        # メッセージ型定義
│       └── bindings.ts       # D1バインディング型定義
├── migrations/               # D1マイグレーションファイル
│   └── 0001_initial_schema.sql
├── scripts/                  # データ移行スクリプト
│   ├── export-data.ts        # SQLiteからデータエクスポート
│   └── generate-import-sql.ts # D1インポート用SQL生成
├── test/
│   └── db/
│       └── messages.test.ts  # データアクセス層のテスト
├── public/
│   └── style.css             # スタイルシート
├── docs/
│   └── adr/                  # Architecture Decision Records
├── wrangler.toml             # Cloudflare Workers設定
├── CLOUDFLARE_DEPLOYMENT.md  # デプロイ手順ガイド
├── message-board.db          # ローカルSQLite（開発用）
├── migration-data.json       # エクスポートされたデータ
├── migration-data.sql        # D1インポート用SQL
├── package.json
├── tsconfig.json
└── README.md
```

## アーキテクチャ

### 関心の分離

このアプリケーションは、保守性とテスタビリティを考慮して3層に分離されています：

1. **ルートハンドラ** (`src/routes/`)
   - HTTPリクエスト/レスポンスの処理のみ
   - ビジネスロジックは含まない

2. **データアクセス層** (`src/db/`)
   - データベース操作のロジック（すべて非同期）
   - D1Databaseを引数として受け取る
   - 必ずテストを実装

3. **ビュー層** (`src/views/`)
   - HTML生成
   - テンプレートロジック

詳細は [claude.md](./claude.md) を参照してください。

### Architecture Decision Records (ADR)

設計上の重要な決定は `docs/adr/` に記録されています：

- [ADR-0001: 技術スタックの選定](./docs/adr/0001-technology-stack-selection.md) **[置き換えられた]**
- [ADR-0002: アーキテクチャパターンの選択](./docs/adr/0002-architecture-pattern.md)
- [ADR-0003: 認証戦略の決定](./docs/adr/0003-authentication-strategy.md)
- [ADR-0004: テスト戦略](./docs/adr/0004-testing-strategy.md)
- [ADR-0005: UIスタイリングアプローチ](./docs/adr/0005-ui-styling-approach.md)
- [ADR-0006: Cloudflare Workers + D1への移行](./docs/adr/0006-cloudflare-workers-migration.md) **[現行]**

## データベース

### Cloudflare D1（分散SQLite）

本番環境では、Cloudflareの分散SQLiteデータベース「D1」を使用しています。

**特徴:**
- エッジロケーションに分散配置
- 自動バックアップとリカバリ
- SQLiteとの高い互換性
- 非同期API（Promise）

### スキーマ

**messagesテーブル**:

| カラム名 | 型 | 説明 |
|---------|------|------|
| id | INTEGER | 主キー（自動採番） |
| name | TEXT | 投稿者名 |
| message | TEXT | メッセージ本文 |
| created_at | DATETIME | 投稿日時（自動設定） |

### マイグレーション

スキーマ変更は `migrations/` ディレクトリで管理：

```bash
# マイグレーション適用
npm run db:migrate

# ローカル環境
npx wrangler d1 migrations apply message-board-db --local
```

### ローカル開発

`wrangler dev` 実行時、D1はMiniflareによって自動的にシミュレートされます。本番環境と同じAPIで動作します。

## セキュリティ

- **XSS対策**: hono/htmlによる自動エスケープ
- **SQLインジェクション対策**: パラメータ化クエリ（D1 prepared statements）
- **DDoS対策**: Cloudflare組み込みの保護機能
- **エッジセキュリティ**: Workers実行環境の隔離
- **CSRF対策**: 現バージョンでは未実装（セッション管理がないため不要）

## 開発ガイドライン

### コーディング規約

- **インデント**: スペース2個
- **クォート**: シングルクォート
- **セミコロン**: 使用する
- **命名規則**:
  - 変数/関数: camelCase
  - 型/クラス: PascalCase
  - ファイル名: kebab-case

### テスト

- データアクセス層は**必ず**テストを書く
- **すべてのデータベース操作は非同期（async/await）で実装する**
- テストはコミット前に必ず実行する
- テストが失敗している状態でコミットしない

```bash
npm test
```

### Cloudflare Workers固有の注意点

- D1 APIは非同期（Promise）を返す
- `.all<T>()` の戻り値は `{ results: T[] }` 形式
- `c.env.DB` でD1Databaseインスタンスを取得
- ファイルシステムは使用不可（静的ファイルはコード埋め込み）
- 実行時間制限あり（無料: 50ms CPU時間/リクエスト）

## ライセンス

MIT

## 今後の拡張案

- [ ] メッセージの編集・削除機能
- [ ] ユーザー認証機能（Cloudflare Access統合）
- [ ] 返信・スレッド機能
- [ ] マークダウン対応
- [ ] 検索機能（D1全文検索）
- [ ] いいね機能
- [ ] リアルタイム更新（Durable Objects）
- [ ] 画像アップロード（R2統合）
- [ ] Analytics（Workers Analytics）

## 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Hono.js 公式サイト](https://hono.dev/)
- [デプロイ手順](./CLOUDFLARE_DEPLOYMENT.md)
- [アーキテクチャ決定記録](./docs/adr/)
