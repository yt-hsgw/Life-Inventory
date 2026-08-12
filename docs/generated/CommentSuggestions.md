# コードコメント候補

> このファイルは `node scripts/generate-docs.mjs` で生成されます。直接編集せず、ソースコードまたは生成スクリプトを更新してください。

## 使い方

この文書は JSDoc が隣接していない exported symbol を機械的に抽出したレビュー用候補です。ソースコードは自動変更しません。コメントは実際の契約や設計理由を確認し、単なるコードの言い換えにならないよう編集してから採用してください。

優先度は `domain` / `server` / Server Action / 共通ライブラリを高、型・schema・component を中、Next.js の規約ファイルを低として分類しています。

候補数: 115

| 優先度 | シンボル | 種別 | 定義 | コメントで説明する観点 |
| --- | --- | --- | --- | --- |
| 高 | `signOutAction` | function | `src/features/auth/actions.ts:6` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `saveCategoryAction` | function | `src/features/categories/actions.ts:15` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `saveSubCategoryAction` | function | `src/features/categories/actions.ts:38` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `CategoryWithSubs` | type | `src/features/categories/server/categories.ts:8` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `getCategories` | function | `src/features/categories/server/categories.ts:10` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `getDashboard` | function | `src/features/dashboard/server/dashboard.ts:7` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `saveExpenseAction` | function | `src/features/expenses/actions.ts:13` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `deleteExpenseAction` | function | `src/features/expenses/actions.ts:44` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `monthlyEquivalent` | function | `src/features/expenses/domain/calculate-expenses.ts:3` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `annualEquivalent` | function | `src/features/expenses/domain/calculate-expenses.ts:7` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `calculateExpenseTotals` | function | `src/features/expenses/domain/calculate-expenses.ts:11` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `getExpenses` | function | `src/features/expenses/server/expenses.ts:6` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `saveIdealAction` | function | `src/features/ideal/actions.ts:13` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `deleteIdealAction` | function | `src/features/ideal/actions.ts:44` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `GapDirection` | type | `src/features/ideal/domain/calculate-gap.ts:1` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `calculateGap` | function | `src/features/ideal/domain/calculate-gap.ts:3` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `getGapDirection` | function | `src/features/ideal/domain/calculate-gap.ts:7` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `IdealComparison` | type | `src/features/ideal/server/ideal.ts:12` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `getIdealComparisons` | function | `src/features/ideal/server/ideal.ts:19` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `saveItemAction` | function | `src/features/items/actions.ts:15` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `archiveItemAction` | function | `src/features/items/actions.ts:65` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `setReviewRequestedAction` | function | `src/features/items/actions.ts:86` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `updateItemStatusAction` | function | `src/features/items/actions.ts:113` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `ITEM_COLOR_PRESETS` | value | `src/features/items/domain/item-color.ts:1` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `ITEM_COLOR_HEX_PATTERN` | value | `src/features/items/domain/item-color.ts:15` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `normalizeItemColor` | function | `src/features/items/domain/item-color.ts:17` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `getItemColorPresentation` | function | `src/features/items/domain/item-color.ts:27` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `countItemQuantity` | function | `src/features/items/domain/item-metrics.ts:3` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `isReviewTarget` | function | `src/features/items/domain/item-metrics.ts:12` | 計算規則、値の単位、境界値、不変条件 |
| 高 | `attachCategories` | function | `src/features/items/server/items.ts:10` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `getItems` | function | `src/features/items/server/items.ts:40` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `getItem` | function | `src/features/items/server/items.ts:72` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `getArchivedItems` | function | `src/features/items/server/items.ts:91` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `reviewItemAction` | function | `src/features/review/actions.ts:8` | 入力検証、認証境界、永続化・再検証・遷移の副作用 |
| 高 | `getReviewQueue` | function | `src/features/review/server/review.ts:7` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `getReviewSummary` | function | `src/features/review/server/review.ts:20` | 認証済みユーザーへの絞り込み、取得条件、失敗時の契約 |
| 高 | `ActionState` | type | `src/lib/action-state.ts:1` | 表現するドメイン概念、単位、不変条件 |
| 高 | `INITIAL_ACTION_STATE` | value | `src/lib/action-state.ts:7` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `invalidAction` | function | `src/lib/action-state.ts:9` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `failedAction` | function | `src/lib/action-state.ts:23` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `requireUserId` | value | `src/lib/auth.ts:7` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `getPublicEnv` | function | `src/lib/env.ts:8` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `getSafeRedirectPath` | function | `src/lib/safe-redirect.ts:1` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `createClient` | function | `src/lib/supabase/client.ts:7` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `updateSession` | function | `src/lib/supabase/proxy.ts:5` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `createClient` | function | `src/lib/supabase/server.ts:6` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `cn` | function | `src/lib/utils.ts:4` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `formatCurrency` | function | `src/lib/utils.ts:8` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 高 | `formatDate` | function | `src/lib/utils.ts:16` | 共通契約、セキュリティ前提、戻り値と失敗条件 |
| 中 | `EmptyState` | function | `src/components/feedback/empty-state.tsx:4` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `AppShell` | function | `src/components/layout/app-shell.tsx:41` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `PageHeader` | function | `src/components/layout/page-header.tsx:3` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `Badge` | function | `src/components/ui/badge.tsx:4` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `Button` | function | `src/components/ui/button.tsx:25` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `buttonVariants` | named export | `src/components/ui/button.tsx:34` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `Card` | function | `src/components/ui/card.tsx:4` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `DisclosureSummary` | function | `src/components/ui/disclosure-summary.tsx:5` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `FormField` | function | `src/components/ui/form-field.tsx:11` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `Input` | function | `src/components/ui/input.tsx:4` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `SubmitButton` | function | `src/components/ui/submit-button.tsx:6` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `Textarea` | function | `src/components/ui/textarea.tsx:4` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `GoogleAuthButton` | function | `src/features/auth/components/google-auth-button.tsx:10` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `CategoryManager` | function | `src/features/categories/components/category-manager.tsx:200` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `categorySchema` | value | `src/features/categories/schemas/category-schema.ts:3` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 中 | `subCategorySchema` | value | `src/features/categories/schemas/category-schema.ts:13` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 中 | `ExpenseForm` | function | `src/features/expenses/components/expense-form.tsx:16` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `expenseSchema` | value | `src/features/expenses/schemas/expense-schema.ts:4` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 中 | `EXPENSE_CATEGORIES` | value | `src/features/expenses/types.ts:3` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 中 | `EXPENSE_CATEGORY_LABELS` | value | `src/features/expenses/types.ts:11` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 中 | `IdealForm` | function | `src/features/ideal/components/ideal-form.tsx:13` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `idealSchema` | value | `src/features/ideal/schemas/ideal-schema.ts:3` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 中 | `ItemColorDisplay` | function | `src/features/items/components/item-color-display.tsx:4` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `ItemColorField` | function | `src/features/items/components/item-color-field.tsx:15` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `ItemForm` | function | `src/features/items/components/item-form.tsx:17` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `ItemList` | function | `src/features/items/components/item-list.tsx:13` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `itemSchema` | value | `src/features/items/schemas/item-schema.ts:40` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 中 | `itemListQuerySchema` | value | `src/features/items/schemas/item-schema.ts:72` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 中 | `ITEM_STATUSES` | value | `src/features/items/types.ts:7` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 中 | `ITEM_STATUS_LABELS` | value | `src/features/items/types.ts:8` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 中 | `ItemView` | type | `src/features/items/types.ts:14` | 表現するドメイン概念、単位、不変条件 |
| 中 | `ReviewCard` | function | `src/features/review/components/review-card.tsx:8` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `ReviewDecisionButtons` | function | `src/features/review/components/review-decision-buttons.tsx:7` | UI の責務、主要 props、ユーザー操作と副作用 |
| 中 | `reviewSessionSchema` | value | `src/features/review/schemas/review-schema.ts:3` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 中 | `reviewSchema` | value | `src/features/review/schemas/review-schema.ts:5` | 受け付ける外部入力、正規化、上限、拒否条件 |
| 低 | `metadata` | value | `src/app/(app)/archive/page.tsx:8` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `ArchivePage` | default function | `src/app/(app)/archive/page.tsx:10` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/dashboard/page.tsx:15` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `DashboardPage` | default function | `src/app/(app)/dashboard/page.tsx:38` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/expenses/page.tsx:15` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `ExpensesPage` | default function | `src/app/(app)/expenses/page.tsx:17` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/ideal/page.tsx:14` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `IdealPage` | default function | `src/app/(app)/ideal/page.tsx:16` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/items/[itemId]/edit/page.tsx:6` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `EditItemPage` | default function | `src/app/(app)/items/[itemId]/edit/page.tsx:8` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/items/[itemId]/page.tsx:20` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `ItemDetailPage` | default function | `src/app/(app)/items/[itemId]/page.tsx:22` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/items/new/page.tsx:6` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `NewItemPage` | default function | `src/app/(app)/items/new/page.tsx:8` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/items/page.tsx:9` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `ItemsPage` | default function | `src/app/(app)/items/page.tsx:11` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `AuthenticatedLayout` | default function | `src/app/(app)/layout.tsx:5` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/review/page.tsx:16` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `ReviewPage` | default function | `src/app/(app)/review/page.tsx:18` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/(app)/settings/categories/page.tsx:6` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `CategoriesPage` | default function | `src/app/(app)/settings/categories/page.tsx:8` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `GET` | function | `src/app/auth/callback/route.ts:5` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `GET` | function | `src/app/auth/confirm/route.ts:6` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `ErrorPage` | default function | `src/app/error.tsx:5` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/layout.tsx:5` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `RootLayout` | default function | `src/app/layout.tsx:13` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `Loading` | default function | `src/app/loading.tsx:1` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `metadata` | value | `src/app/login/page.tsx:5` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `LoginPage` | default function | `src/app/login/page.tsx:7` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `NotFound` | default function | `src/app/not-found.tsx:4` | 公開する理由、呼び出し側との契約、変更時の影響 |
| 低 | `HomePage` | default function | `src/app/page.tsx:3` | 公開する理由、呼び出し側との契約、変更時の影響 |

## 採用時の雛形

```ts
/**
 * 何を保証するかを説明します。
 * @param value 値の意味、単位、許容範囲を説明します。
 * @returns 戻り値の意味と不変条件を説明します。
 * @throws 失敗条件が呼び出し側の制御対象になる場合だけ記載します。
 */
```

コメントは実装の逐語訳ではなく、型だけでは伝わらない設計理由、権限境界、単位、重要な副作用に限定してください。
