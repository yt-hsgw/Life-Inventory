# 実装ガイド

> このファイルは `node scripts/generate-docs.mjs` で生成されます。直接編集せず、ソースコードまたは生成スクリプトを更新してください。

## 目的

Life Inventory の実装境界を、ルーティング、機能、データベースの順に俯瞰するための資料です。解析はリポジトリ内の許可されたソースだけを対象とし、外部通信や環境変数の参照は行いません。

## アーキテクチャ概要

```text
src/app (routing / composition)
  -> src/features/*/components + actions
  -> src/features/*/server
  -> src/lib/supabase
  -> Supabase PostgreSQL (RLS)
```

- `src/app` はページ、Route Handler、レイアウトの構成を担当します。
- `src/features/<feature>` は機能単位の UI、Server Action、検証、ドメインロジック、DB アクセスをまとめます。
- `domain` は副作用を持たない計算、`schemas` は外部入力の検証、`server` は認証済み DB アクセスを担当します。
- 公開テーブルは RLS を有効にし、ユーザー境界は DB ポリシーでも強制します。

## 機能境界

| 機能 | ファイル数 | 内訳 |
| --- | ---: | --- |
| `auth` | 3 | actions: 1、components: 1、tests: 1 |
| `categories` | 4 | actions: 1、components: 1、schemas: 1、server: 1 |
| `dashboard` | 1 | server: 1 |
| `expenses` | 7 | actions: 1、components: 1、domain: 1、schemas: 1、server: 1、tests: 1、types: 1 |
| `ideal` | 6 | actions: 1、components: 1、domain: 1、schemas: 1、server: 1、tests: 1 |
| `items` | 15 | actions: 1、components: 4、domain: 2、schemas: 1、server: 1、tests: 5、types: 1 |
| `review` | 5 | actions: 1、components: 2、schemas: 1、server: 1 |

## Server Actions

Server Action は認証・入力検証を含む変更処理の入口です。複数の永続化操作を不可分にする必要がある場合は、DB 関数を transaction 境界として利用します。

| Action | 機能 | 実装 |
| --- | --- | --- |
| `signOutAction` | `auth` | `src/features/auth/actions.ts:6` |
| `saveCategoryAction` | `categories` | `src/features/categories/actions.ts:15` |
| `saveSubCategoryAction` | `categories` | `src/features/categories/actions.ts:38` |
| `saveExpenseAction` | `expenses` | `src/features/expenses/actions.ts:13` |
| `deleteExpenseAction` | `expenses` | `src/features/expenses/actions.ts:44` |
| `saveIdealAction` | `ideal` | `src/features/ideal/actions.ts:13` |
| `deleteIdealAction` | `ideal` | `src/features/ideal/actions.ts:44` |
| `saveItemAction` | `items` | `src/features/items/actions.ts:15` |
| `archiveItemAction` | `items` | `src/features/items/actions.ts:65` |
| `setReviewRequestedAction` | `items` | `src/features/items/actions.ts:86` |
| `updateItemStatusAction` | `items` | `src/features/items/actions.ts:113` |
| `reviewItemAction` | `review` | `src/features/review/actions.ts:8` |

## App Router の入口

| URL | 種別 | メソッド | 実装 |
| --- | --- | --- | --- |
| `/` | Page | PAGE | `src/app/page.tsx` |
| `/archive` | Page | PAGE | `src/app/(app)/archive/page.tsx` |
| `/auth/callback` | Route Handler | GET | `src/app/auth/callback/route.ts` |
| `/auth/confirm` | Route Handler | GET | `src/app/auth/confirm/route.ts` |
| `/dashboard` | Page | PAGE | `src/app/(app)/dashboard/page.tsx` |
| `/expenses` | Page | PAGE | `src/app/(app)/expenses/page.tsx` |
| `/ideal` | Page | PAGE | `src/app/(app)/ideal/page.tsx` |
| `/items` | Page | PAGE | `src/app/(app)/items/page.tsx` |
| `/items/[itemId]` | Page | PAGE | `src/app/(app)/items/[itemId]/page.tsx` |
| `/items/[itemId]/edit` | Page | PAGE | `src/app/(app)/items/[itemId]/edit/page.tsx` |
| `/items/new` | Page | PAGE | `src/app/(app)/items/new/page.tsx` |
| `/login` | Page | PAGE | `src/app/login/page.tsx` |
| `/review` | Page | PAGE | `src/app/(app)/review/page.tsx` |
| `/settings/categories` | Page | PAGE | `src/app/(app)/settings/categories/page.tsx` |

## データと権限の境界

- 公開テーブル: 6 件
- RLS 有効: 6 / 6 テーブル
- DB 関数: 4 件
- `SECURITY DEFINER` 関数は、認証確認、所有者条件、`search_path` 固定、実行権限を migration でレビューしてください。

## 変更時の実装順序

1. `docs/Requirements.md` と関連ユースケースを確認します。
2. データモデル、RLS、トランザクション境界を先に決めます。
3. 純粋なドメインロジックのテストを追加します。
4. `schemas`、`server`、`actions`、`components`、`app` の順に最小変更を実装します。
5. `npm run check` と関連 E2E / DB テストを実行します。
6. ドキュメントを再生成し、`node scripts/generate-docs.mjs --check` で同期を確認します。

## 生成コマンド

```bash
node scripts/generate-docs.mjs
node scripts/generate-docs.mjs --check
```

通常実行は `docs/generated` を更新します。`--check` は生成結果と既存ファイルが異なる場合に終了コード 1 を返し、ファイルは変更しません。
