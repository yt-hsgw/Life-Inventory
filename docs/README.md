# Life Inventory Documentation

このディレクトリは、Life Inventoryの仕様・設計・評価・運用情報の入口です。
Wiki形式の読み順と文書間の関係は [Wiki Home](wiki/README.md) を参照してください。

## 正本（Source of Truth）

仕様が競合した場合は、次の順で優先します。

1. [Requirements](Requirements.md)
2. [Use Cases](UseCases.md)
3. [Database Design](Database.md)
4. [Architecture](Architecture.md)

`docs/wiki/` は正本を読みやすく整理し、要求・仕様・設計・評価の追跡IDを付与するナビゲーション層です。正本とWikiの記述が競合した場合は上記の正本を優先し、同じ変更で両方を更新します。

## Wiki入口

- [要求・要件・USDM](wiki/10-product/stakeholder-requirements.md)
- [表示画面一覧](wiki/20-ux/screen-catalog.md)
- [画面遷移](wiki/20-ux/screen-flow.md)
- [基本設計](wiki/30-design/basic-design.md)
- [詳細設計](wiki/30-design/detailed-design.md)
- [単体評価](wiki/40-quality/unit-evaluation.md)
- [結合評価](wiki/40-quality/integration-evaluation.md)
- [開発・運用](wiki/50-operations/development-guide.md)

## 既存の専門文書

- [Interface Policy](API.md)
- [Manual Acceptance Checklist](ManualAcceptanceChecklist.md)
- [Documentation Generation](DocumentationGeneration.md)
- [TypeScript API](TypeScriptApi.md)
- [ADR](ADR/0001-use-nextjs.md)
- [生成ドキュメント](generated/ImplementationGuide.md)
