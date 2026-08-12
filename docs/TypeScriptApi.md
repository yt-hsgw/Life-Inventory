# TypeScript API リファレンス

このページ以下は、TypeDoc が `src` のexported symbolと型情報から生成する開発者向けAPIリファレンスです。関数・コンポーネント・型・定数をモジュール単位で検索できます。

- 型とシグネチャの解析、JSDoc/TSDocコメントの表示: TypeDoc
- route、feature、Server Action、Supabase migration、RLSの俯瞰: [`ImplementationGuide.md`](generated/ImplementationGuide.md) と [`TechnicalReference.md`](generated/TechnicalReference.md)
- JSDocを追加すべき候補のレビュー: [`CommentSuggestions.md`](generated/CommentSuggestions.md)

TypeScript本体はJSDocコメントを解釈しますが、HTMLドキュメントの生成機能は提供していません。このプロジェクトでは、TypeScript向けドキュメント生成の定番ツールであるTypeDocを使用します。コメントはTSDoc互換の記法を基本とし、型だけでは伝わらない契約、単位、権限境界、副作用、失敗条件を記載します。

## 境界

TypeDocはTypeScriptの構文と型を解析しますが、Next.jsのroute規約やSupabaseのRLSを業務上の意味まで解釈しません。そのため、アプリ固有の静的解析は既存ジェネレーターに残しています。

自動生成されたDB型 `src/types/database.generated.ts`、テスト、宣言ファイルはAPIリファレンスの入口から除外します。生成済みDB型は実装時の型安全性には使用しますが、データと権限のSource of TruthはSupabase migrationです。

## コメント例

```typescript
/**
 * 認証済みユーザーが所有する持ち物だけを返します。
 *
 * @param userId Supabase AuthのユーザーID。
 * @returns 所有者条件を満たす持ち物の一覧。
 */
export async function getItems(userId: string) {
  // ...
}
```

実装をそのまま言い換えるコメントや、型から明らかな説明は追加しません。
