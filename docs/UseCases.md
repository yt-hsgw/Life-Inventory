# Use Cases

## UC-01 Inventoryを管理する

認証済みユーザーがActive Itemを検索・filterし、最短3項目で追加する。編集でき、手放したItemは物理削除せずArchiveする。

## UC-02 Reviewする

対象Itemを1件ずつ確認しKEEP / MAYBE / RELEASEを選ぶ。システムはItem状態と履歴を原子的に保存し、次のItemまたは完了結果を表示する。

## UC-03 Idealを定義する

理想のItem数量を登録し、同名・同CategoryのCurrent quantityと比較してReduce / Add / Matchedを表示する。

## UC-04 固定費を把握する

MONTHLY / YEARLY支出を登録し、正規化した月額と年額を確認する。

## UC-05 状態を俯瞰する

Dashboardで所有数、Ideal Gap、Review / Release、固定費を確認し、必要なfeatureへ移動する。
