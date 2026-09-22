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

## UC-06 写真からItem登録を始める

認証済みユーザーが、PCでは画像選択またはDrag & Drop、Mobileではカメラ撮影または既存画像の選択により、JPEG / PNG / WebPを1件5MB以内・最大10枚まで追加する。システムは写真を非公開StorageへItem Photo Draftとして保存し、並べ替えた先頭を代表写真候補とする。

AIが利用可能な場合は、写真からItemの入力下書きを生成してフォームへ提示する。利用者は提案を確認・修正し、保存を明示する。AIが未設定・失敗・誤認した場合は、写真選択を失敗扱いにせず手入力を継続する。

システムは保存とAI解析の前に、撮影位置、人物、住居内情報等が含まれうることを説明する。位置情報はItem下書きの生成項目として利用しない。

新規Itemの保存時、システムはItem作成と所有者確認済みPhoto DraftのItem Photo化を単一DB transactionで確定する。DB確定前に中断したDraftは他ユーザーから参照できず、再開または期限付き回収の対象となる。

### 代替フロー

- 写真を選ばず、名前・Category・数量の3項目だけで登録する。
- AI提案を利用せず、または提案をすべて書き換えて手入力する。
- 対応外形式、5MB超、11枚目以降は追加せず、理由と修正方法を表示する。
