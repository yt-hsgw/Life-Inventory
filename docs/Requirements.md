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
- Item Photo: Itemに紐づく非公開写真。並び順の先頭を代表写真とする。
- Item Photo Draft: Item確定前に一時アップロードした、認証ユーザー所有の写真候補。

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

### Photo-first Item Registration

- PCでは画像選択とDrag & Drop、Mobileではカメラ撮影と既存画像の選択からItem登録を開始できる。
- 1件のItemへ最大10枚を登録できる。対応形式はJPEG / PNG / WebP、上限は1枚5MB・最大辺8,192px・4,000万画素とし、ClientとServerの両方で検証する。Storage濫用を抑えるため、確定写真と有効Draftの合計はユーザーあたり500枚までとする。
- 写真は非公開のSupabase Storage bucketへ保存し、認証済み所有者だけが参照・追加・削除できる。公開URLは発行しない。
- 写真はItemへ紐づけ、利用者が指定した並び順の先頭を代表写真として一覧と詳細に表示する。
- Item確定前の写真はItem Photo Draftとして扱い、他ユーザーのItemへ紐づけられない。
- 写真付き新規ItemのDB保存は、Item作成とPhoto DraftからItem Photoへの紐付けを単一transactionで確定する。Storage uploadはDB transaction外の先行処理であり、失敗・中断時はItemを作らず、Draftを安全に再利用または期限付きで回収する。
- AIが設定されている場合は、外部送信の説明後に利用者が明示操作したときだけ、写真からItem入力の下書きを提案できる。AIの出力は未確定の候補としてフォームへ反映し、利用者が確認・修正して明示的に保存するまでDBへ確定しない。費用と可用性を守るため、同一Draftは最大2回、ユーザーごとは1時間20回までとする。
- AIが未設定、利用不可、応答失敗、または誤認した場合も、アップロード済み写真と入力内容を可能な範囲で維持し、手入力で登録を継続できる。
- 撮影写真には位置情報、人物、住居内情報等が含まれうるため、保存とAI解析の前にプライバシー上の注意を表示する。位置情報をItem下書きの生成項目として利用しない。

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
- 写真起点の登録は任意であり、写真を使わない従来の3入力登録も維持する。
- Itemの詳細情報は任意であることを明示し、意味が曖昧な項目には入力例または判断のヒントを表示する。
- Ideal・Expenseの編集欄は、数量・金額・周期など判断を誤りやすい項目に最小限の入力例またはヒントを表示する。
- Keyboard、明確なFocus、十分なContrast、Icon buttonのaria-labelを保証する。
- 更新中は対象操作を無効化し、処理内容を示す文言を表示する。失敗時は入力値を保ち、再試行できるエラーを対象フォーム内に表示する。
- 画面遷移中は現在のApp Shellを維持し、押したナビゲーションと遷移先領域に待機状態を表示する。
- Dashboard / Item Listは通常データ量で約1秒表示を目標とする。

## Out of Scope

URLからの商品取得、置換関係、90日自動Review、One In One Out、Resale、Ideal Budget、Mobile native app。AIによる無確認の自動登録、人物識別、写真の公開共有は対象外。
