# Architecture Decision Records (ADR)

このディレクトリには、メッセージボードアプリケーションの重要なアーキテクチャ決定を記録したドキュメント（ADR）が保存されています。

## ADR一覧

1. [ADR-0001: 技術スタックの選定](./0001-technology-stack-selection.md) **[置き換えられた]**
   - Hono.js + SQLite + TypeScriptの採用理由
   - ADR-0006でCloudflare Workers + D1に移行

2. [ADR-0002: アーキテクチャパターンの選択](./0002-architecture-pattern.md)
   - Multi Page Application、関心の分離の決定

3. [ADR-0003: 認証戦略の決定](./0003-authentication-strategy.md)
   - 認証機能を実装しない理由

4. [ADR-0004: テスト戦略](./0004-testing-strategy.md)
   - データアクセス層のみをテストする方針

5. [ADR-0005: UIスタイリングアプローチ](./0005-ui-styling-approach.md)
   - CSSフレームワークを使わない決定

6. [ADR-0006: Cloudflare Workers + D1への移行](./0006-cloudflare-workers-migration.md)
   - Node.js + SQLiteからCloudflare Workers + D1への移行理由
   - エッジコンピューティングとサーバーレスアーキテクチャの採用

## ADRとは

Architecture Decision Record (ADR)は、ソフトウェアアーキテクチャに関する重要な決定を記録するドキュメントです。

### ADRの構成
- **ステータス**: 提案中、採用、却下、廃止など
- **背景**: なぜこの決定が必要だったか
- **決定事項**: 何を決定したか
- **結果**: 良い点、悪い点、トレードオフ

### ADRの目的
- 設計決定の根拠を明確にする
- チームメンバー間での理解を共有する
- 将来の変更時に過去の判断を振り返る
- 新メンバーのオンボーディングを支援する

## 新しいADRの追加

新しいアーキテクチャ決定を行う場合は、以下の形式で追加してください：

```markdown
# ADR-XXXX: タイトル

## ステータス
[提案中|採用|却下|廃止|置き換えられた]

## 背景
なぜこの決定が必要か

## 決定事項
何を決定したか

## 結果
良い点、悪い点、トレードオフ
```

ファイル名: `XXXX-kebab-case-title.md`（XXXXは連番）
