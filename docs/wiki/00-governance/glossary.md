# 用語集

| 用語            | 意味                                                 | 補足                                        |
| --------------- | ---------------------------------------------------- | ------------------------------------------- |
| Item / 持ち物   | 現在所有している物                                   | 通常操作では物理削除せずアーカイブする      |
| Active Item     | `archived_at is null` のItem                         | インベントリ集計と見直しの対象              |
| Archive         | Itemを通常一覧と集計から外し、記録として保持すること | 削除ではない                                |
| Status          | `KEEP` / `MAYBE` / `RELEASE` の判断状態              | UIでは残す / 迷っている / 手放す            |
| Review Request  | 利用者が明示的に見直し対象へ入れるフラグ             | `MAYBE` はOFFでも対象                       |
| Review Session  | 一連の見直し操作を識別するUUID                       | 同一session・同一Itemの二重判断を防ぐ       |
| Ideal Item      | 理想の物と数量                                       | Itemとは直接FKで結ばない                    |
| Gap             | `ideal quantity - current quantity`                  | 負は減らす、正は増やす、0は一致             |
| Expense         | 定期的な固定費                                       | `MONTHLY` / `YEARLY`。変動費はMVP外         |
| Category        | ItemとIdeal Itemを分類するユーザー所有データ         | Sub Categoryを持てる                        |
| RLS             | PostgreSQL Row Level Security                        | `auth.uid() = user_id` をDB境界で強制       |
| Server Action   | App内の変更処理を受けるNext.jsのサーバー関数         | 認証再確認・Zod検証・再検証を行う           |
| Source of Truth | 競合時に優先する正本                                 | 優先順位は[文書管理](document-map.md)を参照 |
| USDM            | 要求を「要求・理由・説明・仕様」に分ける記述方法     | 曖昧な意図と検証可能な仕様を分離する        |
