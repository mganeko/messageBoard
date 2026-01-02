# ADR-0006: Cloudflare Workers + D1への移行

## ステータス

採用

## 背景

当初、Node.js環境での開発の容易性を優先し、@hono/node-serverとSQLite（better-sqlite3）を採用していた（ADR-0001参照）。しかし、本番環境へのデプロイを検討する段階で、以下の課題が明らかになった：

- **スケーラビリティ**: 従来のサーバーベースの構成では、トラフィック増加時のスケーリングが課題
- **運用コスト**: サーバーの維持管理コストとインフラストラクチャの複雑性
- **グローバル配信**: エッジロケーションでの実行による低レイテンシの実現
- **コールドスタート**: サーバーレスアーキテクチャによる効率的なリソース利用

Hono.jsがCloudflare Workersをネイティブサポートしており、最小限のコード変更で移行可能であることが判明したため、Cloudflare Workers + D1への移行を検討した。

## 決定事項

以下の技術スタックへ移行する：

- **実行環境**: Node.js Server → **Cloudflare Workers**
- **データベース**: SQLite (better-sqlite3) → **Cloudflare D1**
- **Webフレームワーク**: Hono.js（継続、Workers対応）
- **開発ツール**: tsx → **Wrangler**
- **その他**: TypeScript、hono/html、テストフレームワークは継続

### 技術選定理由

#### Cloudflare Workers
- **エッジコンピューティング**: 世界中のエッジロケーションで実行、低レイテンシ
- **自動スケーリング**: トラフィックに応じた自動スケール、インフラ管理不要
- **コスト効率**: 従量課金制、アイドル時のコストなし
- **Honoネイティブサポート**: 既存のHono.jsコードをほぼそのまま利用可能
- **高速起動**: コールドスタート時間が非常に短い（数ms）

#### Cloudflare D1
- **SQLiteベース**: 既存のスキーマとクエリをほぼそのまま利用可能
- **エッジデータベース**: Workersとの統合が容易
- **移行が容易**: better-sqlite3からのマイグレーションパスが明確
- **コスト効率**: 無料枠が十分（月100万read、10万write）
- **バックアップ**: 自動バックアップとポイントインタイムリカバリ

#### Wrangler
- **公式開発ツール**: Cloudflare公式のCLIツール
- **ローカル開発**: Miniflareによるローカルシミュレーション
- **D1統合**: マイグレーション管理とデータ操作が統合

## 実装の詳細

### アーキテクチャ変更

```
Before:
Node.js Server → SQLite (ファイル)

After:
Cloudflare Workers (Edge) → D1 Database (Distributed)
```

### コード変更概要

1. **データベース層（src/db/messages.ts）**
   - 同期API → 非同期API（async/await）
   - `stmt.all()` → `await stmt.bind().all().results`
   - `stmt.get()` → `await stmt.first()`
   - `result.lastInsertRowid` → `result.meta.last_row_id`

2. **ルートハンドラー（src/routes/*.ts）**
   - 型パラメータ追加: `Hono<{ Bindings: Env }>()`
   - DBアクセス: `c.env.DB` 経由
   - 非同期処理: すべてのDB呼び出しに`await`追加

3. **エントリーポイント（src/index.ts）**
   - Node.jsサーバー削除: `serve()` 削除
   - Workers export: `export default app`
   - 静的ファイル: CSSをコード内に埋め込み

4. **設定ファイル**
   - `wrangler.toml`: Workers設定とD1バインディング
   - `package.json`: 依存関係とスクリプト更新
   - `tsconfig.json`: `@cloudflare/workers-types` 追加

### マイグレーション戦略

1. **スキーマ移行**: `migrations/0001_initial_schema.sql`
2. **データエクスポート**: `scripts/export-data.ts`
3. **データインポート**: `scripts/generate-import-sql.ts`
4. **段階的移行**: ローカル → ステージング → 本番

## 結果

### 良い点

- **パフォーマンス向上**: エッジでの実行により、世界中どこからでも低レイテンシ
- **スケーラビリティ**: 自動スケーリング、手動のキャパシティプランニング不要
- **運用コスト削減**: サーバー管理不要、従量課金で無駄なコストなし
- **開発体験維持**: Hono.jsを継続利用、学習コスト最小限
- **移行容易性**: コード変更が最小限（主にasync/await化とAPIアダプタ）
- **無料枠**: 小規模アプリケーションは無料枠内で運用可能
- **グローバル対応**: CDNやロードバランサー不要で自動的にグローバル配信

### 悪い点・制約事項

- **実行時間制限**: CPU時間制限あり（無料: 50ms/req、有料: 制限緩和可能）
- **D1制限**:
  - データベースサイズ制限（500MB〜10GB）
  - 同時接続数制限
  - トランザクション機能が限定的
- **デバッグ**: ローカル開発とWorkers環境で微妙な違いがある場合あり
- **ベンダーロックイン**: Cloudflare固有の機能を使用するため、他への移行コストが高い
- **Node.js API制限**: 一部のNode.js標準ライブラリが使用不可

### トレードオフ

- **スケーラビリティ vs ベンダーロックイン**:
  - スケーラビリティと運用の容易性を優先
  - Cloudflareへの依存を許容（Hono抽象化により一定の移植性は維持）

- **コスト vs 柔軟性**:
  - 小規模時の低コストを優先
  - 大規模時の柔軟性は制約（ただし、ほとんどのユースケースで十分）

- **開発速度 vs 完全な互換性**:
  - 迅速な移行を優先（非同期化のみで対応）
  - 100%の後方互換性は犠牲（依存関係の更新が必要）

## 移行パス

既存のNode.js環境を完全に置き換えるのではなく、以下の方針：

1. **開発環境**: `wrangler dev`でローカルWorkersシミュレーション
2. **データ保持**: スクリプトによる既存データの完全移行
3. **ロールバック可能**: better-sqlite3は開発依存関係として保持

## 関連ADR

- ADR-0001（置き換え対象）: 技術スタックの選定
- ADR-0002（影響なし）: アーキテクチャパターン（レイヤー構造は維持）

## 参考リンク

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Hono.js Cloudflare Workers Guide](https://hono.dev/getting-started/cloudflare-workers)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
