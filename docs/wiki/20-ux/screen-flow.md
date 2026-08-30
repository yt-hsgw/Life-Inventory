# 画面遷移

## 全体遷移

```mermaid
stateDiagram-v2
  [*] --> AuthCheck
  AuthCheck --> Login: 未認証
  AuthCheck --> Dashboard: 認証済み
  Login --> OAuth: Googleで続ける
  OAuth --> Login: 中断 / 失敗
  OAuth --> Dashboard: callback成功

  state App {
    Dashboard --> Items
    Dashboard --> Review
    Dashboard --> Ideal
    Dashboard --> Expenses

    Items --> NewItem: 追加
    NewItem --> ItemDetail: 保存成功
    Items --> ItemDetail: Item選択
    ItemDetail --> EditItem: 編集
    EditItem --> ItemDetail: 更新成功
    ItemDetail --> Review: 見直しへ移動
    ItemDetail --> Archive: Archive成功

    Ideal --> Ideal: 追加 / 編集 / 削除 / filter
    Expenses --> Expenses: 追加 / 編集 / 削除
    Dashboard --> Categories: 設定
    Categories --> Categories: Category更新
    Dashboard --> Archive
  }

  Dashboard --> Login: ログアウト
  Items --> Login: session失効
  Review --> Login: session失効
  Ideal --> Login: session失効
  Expenses --> Login: session失効
```

## 認証遷移

```mermaid
sequenceDiagram
  actor User as 利用者
  participant Login as Login画面
  participant Google as Google OAuth
  participant Auth as Supabase Auth
  participant Callback as /auth/callback
  participant App as 認証必須画面

  User->>Login: Googleで続ける
  Login->>Auth: OAuth開始
  Auth->>Google: 認証・同意
  Google-->>Auth: authorization result
  Auth-->>Callback: code + safe next path
  Callback->>Auth: codeをsessionへ交換
  alt 成功
    Callback-->>App: 同一origin pathへredirect
  else 失敗
    Callback-->>Login: /login?error=oauth
  end
```

## Itemの状態と画面

```mermaid
stateDiagram-v2
  [*] --> ActiveKeep: 新規登録
  ActiveKeep --> ActiveMaybe: 状態を迷っているへ
  ActiveKeep --> ActiveRelease: 状態を手放すへ
  ActiveMaybe --> ActiveKeep: 見直しで残す
  ActiveMaybe --> ActiveRelease: 見直しで手放す
  ActiveRelease --> ActiveKeep: 状態を残すへ
  ActiveRelease --> ActiveMaybe: 状態を迷っているへ
  ActiveKeep --> Archived: Archive
  ActiveMaybe --> Archived: Archive
  ActiveRelease --> Archived: Archive
  Archived --> [*]: 履歴として参照
```

Review RequestはStatusとは別のbooleanです。OFFでもStatusがMAYBEならReview対象のままです。

## 遷移ルール

- `/` は `/dashboard` へredirectし、認証境界で未認証なら `/login` へ進みます。
- Auth callbackの`next`は同一originの相対pathだけを許可します。
- mutation成功後は関連routeをrevalidateしてから遷移または再描画します。
- mutation失敗時は原則として同じ画面に留まり、入力とエラーを表示します。
- 存在しない、またはRLSで参照できないItem IDは他ユーザー情報を示さずNot Foundにします。
