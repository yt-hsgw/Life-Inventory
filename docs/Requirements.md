# Life Inventory MVP Requirements

この文書は提供された `Requirements.md` のMVP実装用Source of Truthである。

## Product Goal

所有物を可視化し、必要性をReviewし、CurrentとIdealの差および固定費を把握して次の行動を決められること。削減を強制せず、判断材料を穏やかに提示する。

## Domain Terms

- Item: 現在所有している物。通常削除せずArchiveする。
- Review: ItemをKEEP / MAYBE / RELEASEに判断し履歴を残す行為。
- Ideal Item: 理想の物と数量。Itemとは直接FKで結ばない。
- Gap: `target quantity - current quantity`。負は減らす、正は増やす。
- Expense: MONTHLY / YEARLYの固定費。変動費は対象外。

## MVP Features

### Inventory

- Active Itemの一覧、名前検索、Category / Status filter。
- 名前（1〜100文字）、Category、数量（1以上）を必須として追加・編集。
- Sub Category、色、サイズ、用途、URL、購入価格・日、最終使用日、Memoは任意。
- 色は未設定、プリセット、カラーパレット、16進入力から選べる。保存時は `#RRGGBB` に正規化し、プリセット色は色名と16進値を併記する。
- StatusはKEEP / MAYBE / RELEASE。既定はKEEP。
- 明示的なReview依頼はItem詳細からON / OFFできる。ただしStatusがMAYBEのItemは依頼をOFFにしてもReview対象である。
- Archive後は通常一覧から除外し、Archive画面へ表示する。
- Category / Sub Categoryを追加・編集できる。紐づくItemがあるCategoryは削除しない。

### Review

- `status = MAYBE OR review_requested = true` のActive Itemを1件ずつ表示する。
- KEEP / MAYBE / RELEASE決定時、Item更新とReview履歴保存を同一transactionで行う。
- 完了時に判断件数を表示する。

### Ideal

- 名前、Category、Target Quantityを必須としてIdeal Itemを登録・編集・削除できる。
- Current、Ideal、Gapを一覧表示し、All / Reduce / Add / Matchedでfilterできる。

### Expenses

- 名前、Category、金額、Billing Cycleを必須として追加・編集・削除できる。
- MONTHLYは月額=amount、YEARLYは月額=amount/12。年額は月額合計×12。

### Dashboard

- Current Item数量、Ideal数量、Gap、Review対象件数、Release数量、月額・年額固定費を表示する。
- Category別所有数量を表示し各featureへ遷移できる。

### Auth & Authorization

- Supabase AuthのGoogle OAuthを使用し、未認証ユーザーはLoginへ誘導する。
- Loginは「Googleで続ける」の単一導線とし、初回認証時は同じ導線でユーザーを作成する。
- ユーザー向けのEmail / Password登録・ログインは提供しない。
- 全domain tableは `user_id` を持ち、RLSで `(select auth.uid()) = user_id` を強制する。
- Client判定だけに依存しない。

## UX / NFR

- 色はPrimary `#89916B`、Background `#F5F3ED`、Text `#34382D` を基準とする。
- Desktop優先、Tablet / Mobileも利用可能。Mobileではbottom navigationを使う。
- Item追加は最短3入力。詳細は必要時だけ展開する。
- Itemの詳細情報は任意であることを明示し、意味が曖昧な項目には入力例または判断のヒントを表示する。
- Keyboard、明確なFocus、十分なContrast、Icon buttonのaria-labelを保証する。
- 更新中は対象操作を無効化し、処理内容を示す文言を表示する。失敗時は入力値を保ち、再試行できるエラーを対象フォーム内に表示する。
- 画面遷移中は現在のApp Shellを維持し、押したナビゲーションと遷移先領域に待機状態を表示する。
- Dashboard / Item Listは通常データ量で約1秒表示を目標とする。

## Out of Scope

画像、URLからの商品取得、置換関係、90日自動Review、One In One Out、Resale、Ideal Budget、Mobile native app。
