# 技術リファレンス

> このファイルは `node scripts/generate-docs.mjs` で生成されます。直接編集せず、ソースコードまたは生成スクリプトを更新してください。

## ルート一覧

| URL | タイトル | 種別 | メソッド | ファイル |
| --- | --- | --- | --- | --- |
| `/` | — | Page | PAGE | `src/app/page.tsx` |
| `/archive` | アーカイブ | Page | PAGE | `src/app/(app)/archive/page.tsx` |
| `/auth/callback` | — | Route Handler | GET | `src/app/auth/callback/route.ts` |
| `/auth/confirm` | — | Route Handler | GET | `src/app/auth/confirm/route.ts` |
| `/dashboard` | インベントリ | Page | PAGE | `src/app/(app)/dashboard/page.tsx` |
| `/expenses` | 固定費 | Page | PAGE | `src/app/(app)/expenses/page.tsx` |
| `/ideal` | 理想 | Page | PAGE | `src/app/(app)/ideal/page.tsx` |
| `/items` | 持ち物 | Page | PAGE | `src/app/(app)/items/page.tsx` |
| `/items/[itemId]` | 持ち物の詳細 | Page | PAGE | `src/app/(app)/items/[itemId]/page.tsx` |
| `/items/[itemId]/edit` | 持ち物を編集 | Page | PAGE | `src/app/(app)/items/[itemId]/edit/page.tsx` |
| `/items/new` | 持ち物を追加 | Page | PAGE | `src/app/(app)/items/new/page.tsx` |
| `/login` | ログイン | Page | PAGE | `src/app/login/page.tsx` |
| `/review` | 見直し | Page | PAGE | `src/app/(app)/review/page.tsx` |
| `/settings/categories` | カテゴリ設定 | Page | PAGE | `src/app/(app)/settings/categories/page.tsx` |

## Feature 一覧

### `auth`

責務フォルダ / ファイル: `actions` (1)、`components` (1)、`tests` (1)

- `src/features/auth/actions.ts`
- `src/features/auth/components/google-auth-button.test.tsx`
- `src/features/auth/components/google-auth-button.tsx`

### `categories`

責務フォルダ / ファイル: `actions` (1)、`components` (1)、`schemas` (1)、`server` (1)、`tests` (1)

- `src/features/categories/actions.ts`
- `src/features/categories/components/category-manager.test.tsx`
- `src/features/categories/components/category-manager.tsx`
- `src/features/categories/schemas/category-schema.ts`
- `src/features/categories/server/categories.ts`

### `dashboard`

責務フォルダ / ファイル: `server` (1)

- `src/features/dashboard/server/dashboard.ts`

### `expenses`

責務フォルダ / ファイル: `actions` (1)、`components` (1)、`domain` (1)、`schemas` (1)、`server` (1)、`tests` (2)、`types` (1)

- `src/features/expenses/actions.ts`
- `src/features/expenses/components/expense-form.test.tsx`
- `src/features/expenses/components/expense-form.tsx`
- `src/features/expenses/domain/calculate-expenses.test.ts`
- `src/features/expenses/domain/calculate-expenses.ts`
- `src/features/expenses/schemas/expense-schema.ts`
- `src/features/expenses/server/expenses.ts`
- `src/features/expenses/types.ts`

### `ideal`

責務フォルダ / ファイル: `actions` (1)、`components` (1)、`domain` (1)、`schemas` (1)、`server` (1)、`tests` (2)

- `src/features/ideal/actions.ts`
- `src/features/ideal/components/ideal-form.test.tsx`
- `src/features/ideal/components/ideal-form.tsx`
- `src/features/ideal/domain/calculate-gap.test.ts`
- `src/features/ideal/domain/calculate-gap.ts`
- `src/features/ideal/schemas/ideal-schema.ts`
- `src/features/ideal/server/ideal.ts`

### `items`

責務フォルダ / ファイル: `actions` (1)、`components` (5)、`domain` (2)、`schemas` (1)、`server` (1)、`tests` (8)、`types` (1)

- `src/features/items/actions.test.ts`
- `src/features/items/actions.ts`
- `src/features/items/components/item-color-display.tsx`
- `src/features/items/components/item-color-field.test.tsx`
- `src/features/items/components/item-color-field.tsx`
- `src/features/items/components/item-form.test.tsx`
- `src/features/items/components/item-form.tsx`
- `src/features/items/components/item-list.test.tsx`
- `src/features/items/components/item-list.tsx`
- `src/features/items/components/item-state-controls.test.tsx`
- `src/features/items/components/item-state-controls.tsx`
- `src/features/items/domain/item-color.test.ts`
- `src/features/items/domain/item-color.ts`
- `src/features/items/domain/item-metrics.test.ts`
- `src/features/items/domain/item-metrics.ts`
- `src/features/items/schemas/item-schema.test.ts`
- `src/features/items/schemas/item-schema.ts`
- `src/features/items/server/items.ts`
- `src/features/items/types.ts`

### `review`

責務フォルダ / ファイル: `actions` (1)、`components` (2)、`schemas` (1)、`server` (1)

- `src/features/review/actions.ts`
- `src/features/review/components/review-card.tsx`
- `src/features/review/components/review-decision-buttons.tsx`
- `src/features/review/schemas/review-schema.ts`
- `src/features/review/server/review.ts`

## TypeScript API

exported symbol、型、JSDoc/TSDocコメントはTypeDocが解析します。`npm run docs:generate:api` の後、`docs/generated/api/index.html` を開いて参照してください。

## Supabase migrations

- `supabase/migrations/20260810164719_initial_schema.sql`
- `supabase/migrations/20260811102207_harden_review_invariants.sql`

### テーブルと RLS

| テーブル | RLS | 現在のポリシー | 作成 migration |
| --- | --- | --- | --- |
| `public.categories` | 有効 | categories_delete_own (DELETE)、categories_insert_own (INSERT)、categories_select_own (SELECT)、categories_update_own (UPDATE) | `supabase/migrations/20260810164719_initial_schema.sql` |
| `public.expenses` | 有効 | expenses_delete_own (DELETE)、expenses_insert_own (INSERT)、expenses_select_own (SELECT)、expenses_update_own (UPDATE) | `supabase/migrations/20260810164719_initial_schema.sql` |
| `public.ideal_items` | 有効 | ideal_items_delete_own (DELETE)、ideal_items_insert_own (INSERT)、ideal_items_select_own (SELECT)、ideal_items_update_own (UPDATE) | `supabase/migrations/20260810164719_initial_schema.sql` |
| `public.item_reviews` | 有効 | item_reviews_select_own (SELECT) | `supabase/migrations/20260810164719_initial_schema.sql` |
| `public.items` | 有効 | items_insert_own (INSERT)、items_select_own (SELECT)、items_update_own (UPDATE) | `supabase/migrations/20260810164719_initial_schema.sql` |
| `public.sub_categories` | 有効 | sub_categories_delete_own (DELETE)、sub_categories_insert_own (INSERT)、sub_categories_select_own (SELECT)、sub_categories_update_own (UPDATE) | `supabase/migrations/20260810164719_initial_schema.sql` |

### DB 関数

| 関数 | 引数 | 戻り値 | language | security | 最終定義 migration |
| --- | --- | --- | --- | --- | --- |
| `private.set_updated_at` | `なし` | `trigger` | plpgsql | INVOKER | `supabase/migrations/20260810164719_initial_schema.sql` |
| `public.get_review_queue` | `p_session_id uuid, p_limit integer default 500` | `setof public.items` | sql | INVOKER | `supabase/migrations/20260811102207_harden_review_invariants.sql` |
| `public.get_review_queue_count` | `なし` | `bigint` | sql | INVOKER | `supabase/migrations/20260811102207_harden_review_invariants.sql` |
| `public.review_item` | `p_item_id uuid, p_decision text, p_session_id uuid, p_memo text default null` | `public.item_reviews` | plpgsql | DEFINER | `supabase/migrations/20260811102207_harden_review_invariants.sql` |
