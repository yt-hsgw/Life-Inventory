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

責務フォルダ / ファイル: `actions` (1)、`components` (1)、`schemas` (1)、`server` (1)

- `src/features/categories/actions.ts`
- `src/features/categories/components/category-manager.tsx`
- `src/features/categories/schemas/category-schema.ts`
- `src/features/categories/server/categories.ts`

### `dashboard`

責務フォルダ / ファイル: `server` (1)

- `src/features/dashboard/server/dashboard.ts`

### `expenses`

責務フォルダ / ファイル: `actions` (1)、`components` (1)、`domain` (1)、`schemas` (1)、`server` (1)、`tests` (1)、`types` (1)

- `src/features/expenses/actions.ts`
- `src/features/expenses/components/expense-form.tsx`
- `src/features/expenses/domain/calculate-expenses.test.ts`
- `src/features/expenses/domain/calculate-expenses.ts`
- `src/features/expenses/schemas/expense-schema.ts`
- `src/features/expenses/server/expenses.ts`
- `src/features/expenses/types.ts`

### `ideal`

責務フォルダ / ファイル: `actions` (1)、`components` (1)、`domain` (1)、`schemas` (1)、`server` (1)、`tests` (1)

- `src/features/ideal/actions.ts`
- `src/features/ideal/components/ideal-form.tsx`
- `src/features/ideal/domain/calculate-gap.test.ts`
- `src/features/ideal/domain/calculate-gap.ts`
- `src/features/ideal/schemas/ideal-schema.ts`
- `src/features/ideal/server/ideal.ts`

### `items`

責務フォルダ / ファイル: `actions` (1)、`components` (5)、`domain` (2)、`schemas` (1)、`server` (1)、`tests` (6)、`types` (1)

- `src/features/items/actions.test.ts`
- `src/features/items/actions.ts`
- `src/features/items/components/item-color-display.tsx`
- `src/features/items/components/item-color-field.test.tsx`
- `src/features/items/components/item-color-field.tsx`
- `src/features/items/components/item-form.tsx`
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

## Exported symbols

JSDoc 付与済み: 0 / 119

| シンボル | 種別 | JSDoc | 定義 |
| --- | --- | --- | --- |
| `metadata` | value | なし | `src/app/(app)/archive/page.tsx:8` |
| `ArchivePage` | default function | なし | `src/app/(app)/archive/page.tsx:10` |
| `metadata` | value | なし | `src/app/(app)/dashboard/page.tsx:15` |
| `DashboardPage` | default function | なし | `src/app/(app)/dashboard/page.tsx:38` |
| `metadata` | value | なし | `src/app/(app)/expenses/page.tsx:15` |
| `ExpensesPage` | default function | なし | `src/app/(app)/expenses/page.tsx:17` |
| `metadata` | value | なし | `src/app/(app)/ideal/page.tsx:15` |
| `IdealPage` | default function | なし | `src/app/(app)/ideal/page.tsx:17` |
| `metadata` | value | なし | `src/app/(app)/items/[itemId]/edit/page.tsx:6` |
| `EditItemPage` | default function | なし | `src/app/(app)/items/[itemId]/edit/page.tsx:8` |
| `metadata` | value | なし | `src/app/(app)/items/[itemId]/page.tsx:16` |
| `ItemDetailPage` | default function | なし | `src/app/(app)/items/[itemId]/page.tsx:18` |
| `metadata` | value | なし | `src/app/(app)/items/new/page.tsx:6` |
| `NewItemPage` | default function | なし | `src/app/(app)/items/new/page.tsx:8` |
| `metadata` | value | なし | `src/app/(app)/items/page.tsx:9` |
| `ItemsPage` | default function | なし | `src/app/(app)/items/page.tsx:11` |
| `AuthenticatedLayout` | default function | なし | `src/app/(app)/layout.tsx:5` |
| `AuthenticatedLoading` | default function | なし | `src/app/(app)/loading.tsx:1` |
| `metadata` | value | なし | `src/app/(app)/review/page.tsx:16` |
| `ReviewPage` | default function | なし | `src/app/(app)/review/page.tsx:18` |
| `metadata` | value | なし | `src/app/(app)/settings/categories/page.tsx:6` |
| `CategoriesPage` | default function | なし | `src/app/(app)/settings/categories/page.tsx:8` |
| `GET` | function | なし | `src/app/auth/callback/route.ts:5` |
| `GET` | function | なし | `src/app/auth/confirm/route.ts:6` |
| `ErrorPage` | default function | なし | `src/app/error.tsx:5` |
| `metadata` | value | なし | `src/app/layout.tsx:5` |
| `RootLayout` | default function | なし | `src/app/layout.tsx:13` |
| `Loading` | default function | なし | `src/app/loading.tsx:1` |
| `metadata` | value | なし | `src/app/login/page.tsx:5` |
| `LoginPage` | default function | なし | `src/app/login/page.tsx:7` |
| `NotFound` | default function | なし | `src/app/not-found.tsx:4` |
| `HomePage` | default function | なし | `src/app/page.tsx:3` |
| `EmptyState` | function | なし | `src/components/feedback/empty-state.tsx:4` |
| `AppShell` | function | なし | `src/components/layout/app-shell.tsx:43` |
| `PageHeader` | function | なし | `src/components/layout/page-header.tsx:3` |
| `NavigationPendingHint` | function | なし | `src/components/navigation/navigation-pending-hint.tsx:7` |
| `Badge` | function | なし | `src/components/ui/badge.tsx:4` |
| `ButtonProps` | type | なし | `src/components/ui/button.tsx:22` |
| `Button` | function | なし | `src/components/ui/button.tsx:25` |
| `buttonVariants` | named export | なし | `src/components/ui/button.tsx:34` |
| `Card` | function | なし | `src/components/ui/card.tsx:4` |
| `DisclosureSummary` | function | なし | `src/components/ui/disclosure-summary.tsx:5` |
| `FormField` | function | なし | `src/components/ui/form-field.tsx:11` |
| `Input` | function | なし | `src/components/ui/input.tsx:4` |
| `SubmitButton` | function | なし | `src/components/ui/submit-button.tsx:13` |
| `Textarea` | function | なし | `src/components/ui/textarea.tsx:4` |
| `signOutAction` | function | なし | `src/features/auth/actions.ts:6` |
| `GoogleAuthButton` | function | なし | `src/features/auth/components/google-auth-button.tsx:10` |
| `saveCategoryAction` | function | なし | `src/features/categories/actions.ts:15` |
| `saveSubCategoryAction` | function | なし | `src/features/categories/actions.ts:38` |
| `CategoryManager` | function | なし | `src/features/categories/components/category-manager.tsx:200` |
| `categorySchema` | value | なし | `src/features/categories/schemas/category-schema.ts:3` |
| `subCategorySchema` | value | なし | `src/features/categories/schemas/category-schema.ts:13` |
| `CategoryWithSubs` | type | なし | `src/features/categories/server/categories.ts:8` |
| `getCategories` | function | なし | `src/features/categories/server/categories.ts:11` |
| `getDashboard` | function | なし | `src/features/dashboard/server/dashboard.ts:7` |
| `saveExpenseAction` | function | なし | `src/features/expenses/actions.ts:13` |
| `deleteExpenseAction` | function | なし | `src/features/expenses/actions.ts:44` |
| `ExpenseForm` | function | なし | `src/features/expenses/components/expense-form.tsx:16` |
| `monthlyEquivalent` | function | なし | `src/features/expenses/domain/calculate-expenses.ts:3` |
| `annualEquivalent` | function | なし | `src/features/expenses/domain/calculate-expenses.ts:7` |
| `calculateExpenseTotals` | function | なし | `src/features/expenses/domain/calculate-expenses.ts:11` |
| `expenseSchema` | value | なし | `src/features/expenses/schemas/expense-schema.ts:4` |
| `getExpenses` | function | なし | `src/features/expenses/server/expenses.ts:6` |
| `EXPENSE_CATEGORIES` | value | なし | `src/features/expenses/types.ts:3` |
| `EXPENSE_CATEGORY_LABELS` | value | なし | `src/features/expenses/types.ts:11` |
| `saveIdealAction` | function | なし | `src/features/ideal/actions.ts:13` |
| `deleteIdealAction` | function | なし | `src/features/ideal/actions.ts:44` |
| `IdealForm` | function | なし | `src/features/ideal/components/ideal-form.tsx:13` |
| `GapDirection` | type | なし | `src/features/ideal/domain/calculate-gap.ts:1` |
| `calculateGap` | function | なし | `src/features/ideal/domain/calculate-gap.ts:3` |
| `getGapDirection` | function | なし | `src/features/ideal/domain/calculate-gap.ts:7` |
| `idealSchema` | value | なし | `src/features/ideal/schemas/ideal-schema.ts:3` |
| `IdealComparison` | type | なし | `src/features/ideal/server/ideal.ts:12` |
| `getIdealComparisons` | function | なし | `src/features/ideal/server/ideal.ts:19` |
| `saveItemAction` | function | なし | `src/features/items/actions.ts:16` |
| `archiveItemAction` | function | なし | `src/features/items/actions.ts:66` |
| `setReviewRequestedAction` | function | なし | `src/features/items/actions.ts:87` |
| `updateItemStatusAction` | function | なし | `src/features/items/actions.ts:118` |
| `ItemColorDisplay` | function | なし | `src/features/items/components/item-color-display.tsx:4` |
| `ItemColorField` | function | なし | `src/features/items/components/item-color-field.tsx:15` |
| `ItemForm` | function | なし | `src/features/items/components/item-form.tsx:17` |
| `ItemList` | function | なし | `src/features/items/components/item-list.tsx:13` |
| `ItemStateControls` | function | なし | `src/features/items/components/item-state-controls.tsx:15` |
| `ITEM_COLOR_PRESETS` | value | なし | `src/features/items/domain/item-color.ts:1` |
| `ITEM_COLOR_HEX_PATTERN` | value | なし | `src/features/items/domain/item-color.ts:15` |
| `normalizeItemColor` | function | なし | `src/features/items/domain/item-color.ts:17` |
| `getItemColorPresentation` | function | なし | `src/features/items/domain/item-color.ts:27` |
| `countItemQuantity` | function | なし | `src/features/items/domain/item-metrics.ts:3` |
| `isReviewTarget` | function | なし | `src/features/items/domain/item-metrics.ts:12` |
| `itemSchema` | value | なし | `src/features/items/schemas/item-schema.ts:40` |
| `itemListQuerySchema` | value | なし | `src/features/items/schemas/item-schema.ts:72` |
| `attachCategories` | function | なし | `src/features/items/server/items.ts:10` |
| `getItems` | function | なし | `src/features/items/server/items.ts:40` |
| `getItem` | function | なし | `src/features/items/server/items.ts:74` |
| `getArchivedItems` | function | なし | `src/features/items/server/items.ts:94` |
| `ITEM_STATUSES` | value | なし | `src/features/items/types.ts:7` |
| `ITEM_STATUS_LABELS` | value | なし | `src/features/items/types.ts:8` |
| `ItemView` | type | なし | `src/features/items/types.ts:14` |
| `reviewItemAction` | function | なし | `src/features/review/actions.ts:8` |
| `ReviewCard` | function | なし | `src/features/review/components/review-card.tsx:8` |
| `ReviewDecisionButtons` | function | なし | `src/features/review/components/review-decision-buttons.tsx:7` |
| `reviewSessionSchema` | value | なし | `src/features/review/schemas/review-schema.ts:3` |
| `reviewSchema` | value | なし | `src/features/review/schemas/review-schema.ts:5` |
| `getReviewQueue` | function | なし | `src/features/review/server/review.ts:7` |
| `getReviewSummary` | function | なし | `src/features/review/server/review.ts:21` |
| `ActionState` | type | なし | `src/lib/action-state.ts:1` |
| `INITIAL_ACTION_STATE` | value | なし | `src/lib/action-state.ts:7` |
| `invalidAction` | function | なし | `src/lib/action-state.ts:9` |
| `failedAction` | function | なし | `src/lib/action-state.ts:23` |
| `requireUserId` | value | なし | `src/lib/auth.ts:7` |
| `getPublicEnv` | function | なし | `src/lib/env.ts:8` |
| `getSafeRedirectPath` | function | なし | `src/lib/safe-redirect.ts:1` |
| `createClient` | function | なし | `src/lib/supabase/client.ts:7` |
| `updateSession` | function | なし | `src/lib/supabase/proxy.ts:5` |
| `createClient` | function | なし | `src/lib/supabase/server.ts:6` |
| `cn` | function | なし | `src/lib/utils.ts:4` |
| `formatCurrency` | function | なし | `src/lib/utils.ts:8` |
| `formatDate` | function | なし | `src/lib/utils.ts:16` |

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
