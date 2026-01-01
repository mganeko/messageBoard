# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

シンプルなメッセージボードWebアプリケーション。ユーザーは名前とメッセージを投稿でき、投稿されたメッセージが一覧表示されます。

## 技術スタック

- **ランタイム**: Cloudflare Workers（エッジコンピューティング）
- **Webフレームワーク**: Hono.js（Workers native）
- **データベース**: Cloudflare D1（分散SQLite）
- **テンプレート**: hono/html
- **開発**: TypeScript + Wrangler
- **テスト**: Node.js Test Runner
- **旧環境**: Node.js + SQLite（開発依存として保持）

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（Wrangler Dev、ローカルD1シミュレーション）
# --ip 0.0.0.0 でローカルネットワークからアクセス可能
npm run dev

# TypeScriptビルド（型チェック）
npm run build

# テストの実行
npm test

# Linter/Formatter
npm run lint        # チェックのみ
npm run lint:fix    # 自動修正

# D1データベース操作
npm run db:create       # D1データベースを作成
npm run db:migrate      # マイグレーション適用
npm run db:execute      # SQLコマンド実行
npm run export-data     # ローカルSQLiteからデータエクスポート

# デプロイ
npm run deploy      # Cloudflare Workersへデプロイ
```

## アーキテクチャ

### ディレクトリ構造
```
src/
├── index.ts              # Workers エントリーポイント（export default app）
├── routes/               # ルートハンドラ（HTTPリクエスト/レスポンス処理のみ）
│   ├── index.ts          # トップページ（メッセージ一覧）
│   └── post.ts           # 投稿ページ
├── db/                   # データベース関連
│   ├── connection.ts     # （レガシー、D1では不使用）
│   ├── schema.ts         # （レガシー、マイグレーションファイルに移行）
│   └── messages.ts       # メッセージのCRUD操作（必ずテスト実装、非同期）
├── views/                # HTMLビューコンポーネント
│   ├── layout.ts         # 共通レイアウト
│   ├── message-list.ts   # メッセージ一覧ビュー
│   └── post-form.ts      # 投稿フォームビュー
└── types/
    ├── message.ts        # メッセージ型定義
    └── bindings.ts       # Workers環境のバインディング型定義（D1等）

migrations/               # D1マイグレーションファイル
└── 0001_initial_schema.sql

scripts/                  # データ移行・管理スクリプト
├── export-data.ts        # SQLiteからデータエクスポート
└── generate-import-sql.ts # D1インポート用SQL生成
```

### 関心の分離
- **ルートハンドラ** (routes/): HTTPリクエスト/レスポンスの処理のみ
  - `c.env.DB` からD1データベースを取得
  - データアクセス層に渡して処理
- **データアクセス** (db/messages.ts): DB操作のビジネスロジック
  - **すべて非同期関数**（async/await必須）
  - D1Databaseを第一引数として受け取る
- **ビュー** (views/): HTML生成

### データベース設計

**Cloudflare D1（分散SQLite）**

**messagesテーブル**:
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL (投稿者名)
- `message`: TEXT NOT NULL (メッセージ本文)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

クエリは `ORDER BY created_at DESC, id DESC` で新しい順に取得

**D1 API の特徴**:
- すべて非同期（Promise）
- `.bind()` でパラメータをバインド
- `.all<T>()` は `{ results: T[], success: boolean, meta: {} }` を返す
- `.first<T>()` は `T | null` を返す
- `.run()` は `{ success: boolean, meta: { last_row_id: number } }` を返す

## テスト戦略

- データアクセス層（`src/db/messages.ts`）は**必ずテストを書く**
- テストファイル: `test/db/messages.test.ts`
- テストは独立して実行可能（beforeEachでDBクリア）
- ルートハンドラはシンプルなためテスト不要

## セキュリティ対策

- **XSS対策**: hono/htmlのエスケープ機能を利用
- **SQLインジェクション対策**: パラメータ化クエリ使用（D1のprepared statements）
- **エッジセキュリティ**: Cloudflare Workersの組み込みDDoS対策

## コーディング規約

- **インデント**: スペース2個
- **クォート**: シングルクォート
- **セミコロン**: 使用する
- **命名規則**: camelCase（変数/関数）、PascalCase（型/クラス）

## 重要な注意点

- コードを変更する前に既存のコードを読んで理解する
- WebのGETやPOSTのハンドラ内と、データアクセスのロジックは必ず分離する
- **データアクセスのロジックは必ずテストを書く**
- **データベース操作は必ず非同期（async/await）で実装する**
- D1 APIの戻り値の型に注意（`.all()`は`results`プロパティを持つオブジェクト）
- ルートハンドラで `c.env.DB` からD1Databaseを取得し、データアクセス層に渡す
- ソースの変更をコミットする前に、これまでに作成したテストが成功することを確認する (`npm test`)
- バグ修正や機能追加の際は、必要最小限の変更に留める
- 過度な抽象化やリファクタリングは避ける

## Cloudflare Workers固有の制約

- **実行時間制限**: CPU時間に制限あり（無料: 50ms/req）
- **Node.js API制限**: 一部のNode.js標準ライブラリは使用不可
- **ファイルシステムなし**: 静的ファイルはコード内に埋め込むか外部から提供
- **グローバル状態なし**: 各リクエストは独立、データベース接続の共有不可

## 参考ドキュメント

- Cloudflare移行の詳細: `CLOUDFLARE_DEPLOYMENT.md`
- アーキテクチャ決定: `docs/adr/0006-cloudflare-workers-migration.md`
- D1ドキュメント: https://developers.cloudflare.com/d1/
- Hono + Workers: https://hono.dev/getting-started/cloudflare-workers
