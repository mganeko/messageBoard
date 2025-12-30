# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

シンプルなメッセージボードWebアプリケーション。ユーザーは名前とメッセージを投稿でき、投稿されたメッセージが一覧表示されます。

## 技術スタック

- **ランタイム**: Node.js
- **Webフレームワーク**: Hono.js (@hono/node-server使用)
- **データベース**: SQLite3 (better-sqlite3)
- **テンプレート**: hono/html
- **開発**: TypeScript (tsx使用)
- **テスト**: Node.js Test Runner

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（ホットリロード有効）
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start

# テストの実行
npm test
```

## アーキテクチャ

### ディレクトリ構造
```
src/
├── index.ts              # アプリケーションエントリーポイント
├── routes/               # ルートハンドラ（HTTPリクエスト/レスポンス処理のみ）
│   ├── index.ts          # トップページ（メッセージ一覧）
│   └── post.ts           # 投稿ページ
├── db/                   # データベース関連
│   ├── connection.ts     # DB接続設定
│   ├── schema.ts         # DBスキーマ定義・初期化
│   └── messages.ts       # メッセージのCRUD操作（必ずテスト実装）
├── views/                # HTMLビューコンポーネント
│   ├── layout.ts         # 共通レイアウト
│   ├── message-list.ts   # メッセージ一覧ビュー
│   └── post-form.ts      # 投稿フォームビュー
└── types/
    └── message.ts        # 型定義
```

### 関心の分離
- **ルートハンドラ** (routes/): HTTPリクエスト/レスポンスの処理のみ
- **データアクセス** (db/messages.ts): DB操作のビジネスロジック
- **ビュー** (views/): HTML生成

### データベース設計

**messagesテーブル**:
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL (投稿者名)
- `message`: TEXT NOT NULL (メッセージ本文)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

クエリは `ORDER BY created_at DESC, id DESC` で新しい順に取得

## テスト戦略

- データアクセス層（`src/db/messages.ts`）は**必ずテストを書く**
- テストファイル: `test/db/messages.test.ts`
- テストは独立して実行可能（beforeEachでDBクリア）
- ルートハンドラはシンプルなためテスト不要

## セキュリティ対策

- **XSS対策**: hono/htmlのエスケープ機能を利用
- **SQLインジェクション対策**: パラメータ化クエリ使用（better-sqlite3のprepared statements）

## コーディング規約

- **インデント**: スペース2個
- **クォート**: シングルクォート
- **セミコロン**: 使用する
- **命名規則**: camelCase（変数/関数）、PascalCase（型/クラス）

## 重要な注意点

- コードを変更する前に既存のコードを読んで理解する
- WebのGETやPOSTのハンドラ内と、データアクセスのロジックは必ず分離する
- データアクセスのロジックは必ずテストを書く
- ソースの変更をコミットする前に、これまでに作成したテストが成功することを確認する (`npm test`)
- バグ修正や機能追加の際は、必要最小限の変更に留める
- 過度な抽象化やリファクタリングは避ける
