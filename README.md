# メッセージボード

シンプルなメッセージボードWebアプリケーション。ユーザーは名前とメッセージを投稿でき、投稿されたメッセージが新しい順に一覧表示されます。

## 特徴

- 📝 **シンプルな投稿機能**: 名前とメッセージを入力して投稿
- 📋 **一覧表示**: 投稿されたメッセージを新しい順に表示
- 📄 **ページネーション**: 1ページ20件ずつ表示
- ✅ **バリデーション**: 入力内容の検証とエラー表示
- 🎨 **レスポンシブデザイン**: モバイル・デスクトップ対応
- 🔒 **セキュリティ対策**: XSS・SQLインジェクション対策済み

## 技術スタック

- **ランタイム**: Node.js
- **Webフレームワーク**: [Hono.js](https://hono.dev/) v4
- **データベース**: SQLite3 ([better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- **言語**: TypeScript
- **開発ツール**: [tsx](https://github.com/privatenumber/tsx)
- **テンプレート**: hono/html
- **テスト**: Node.js Test Runner

## セットアップ

### 必要要件

- Node.js 18以上
- npm

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd messageBoard

# 依存関係のインストール
npm install
```

## 使い方

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス

### ビルド

```bash
npm run build
```

TypeScriptコードを `dist/` ディレクトリにコンパイルします。

### 本番環境での起動

```bash
npm run build
npm start
```

### テストの実行

```bash
npm test
```

データアクセス層のテストを実行します。

## プロジェクト構造

```
messageBoard/
├── src/
│   ├── index.ts              # アプリケーションエントリーポイント
│   ├── routes/               # ルートハンドラ
│   │   ├── index.ts          # トップページ（メッセージ一覧）
│   │   └── post.ts           # 投稿ページ
│   ├── db/                   # データベース関連
│   │   ├── connection.ts     # DB接続設定
│   │   ├── schema.ts         # DBスキーマ定義
│   │   └── messages.ts       # メッセージのCRUD操作
│   ├── views/                # HTMLビューコンポーネント
│   │   ├── layout.ts         # 共通レイアウト
│   │   ├── message-list.ts   # メッセージ一覧ビュー
│   │   └── post-form.ts      # 投稿フォームビュー
│   └── types/
│       └── message.ts        # 型定義
├── test/
│   └── db/
│       └── messages.test.ts  # データアクセス層のテスト
├── public/
│   └── style.css             # スタイルシート
├── docs/
│   └── adr/                  # Architecture Decision Records
├── message-board.db          # SQLiteデータベースファイル（自動生成）
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
   - データベース操作のロジック
   - 必ずテストを実装

3. **ビュー層** (`src/views/`)
   - HTML生成
   - テンプレートロジック

詳細は [claude.md](./claude.md) を参照してください。

### Architecture Decision Records (ADR)

設計上の重要な決定は `docs/adr/` に記録されています：

- [ADR-0001: 技術スタックの選定](./docs/adr/0001-technology-stack-selection.md)
- [ADR-0002: アーキテクチャパターンの選択](./docs/adr/0002-architecture-pattern.md)
- [ADR-0003: 認証戦略の決定](./docs/adr/0003-authentication-strategy.md)
- [ADR-0004: テスト戦略](./docs/adr/0004-testing-strategy.md)
- [ADR-0005: UIスタイリングアプローチ](./docs/adr/0005-ui-styling-approach.md)

## データベース

### スキーマ

**messagesテーブル**:

| カラム名 | 型 | 説明 |
|---------|------|------|
| id | INTEGER | 主キー（自動採番） |
| name | TEXT | 投稿者名 |
| message | TEXT | メッセージ本文 |
| created_at | DATETIME | 投稿日時（自動設定） |

### データベースファイル

SQLiteデータベースは `message-board.db` として自動生成されます。開発環境では初回起動時に自動的にテーブルが作成されます。

## セキュリティ

- **XSS対策**: hono/htmlによる自動エスケープ
- **SQLインジェクション対策**: パラメータ化クエリ（prepared statements）
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
- テストはコミット前に必ず実行する
- テストが失敗している状態でコミットしない

```bash
npm test
```

## ライセンス

MIT

## 今後の拡張案

- [ ] メッセージの編集・削除機能
- [ ] ユーザー認証機能
- [ ] 返信・スレッド機能
- [ ] マークダウン対応
- [ ] 検索機能
- [ ] いいね機能
- [ ] PostgreSQL等へのDB移行

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。
