# Life Inventory Agent Rules

## Source of Truth

優先順は `docs/Requirements.md`、`docs/UseCases.md`、`docs/Database.md`、`docs/Architecture.md`。競合時はRequirementsを優先する。

## Architecture

- Feature-based + lightweight Clean Architectureを採用する。
- `src/app` はroutingとcompositionに限定し、業務ルールは `src/features/*/domain` に置く。
- DBアクセスは `src/features/*/server` と `src/lib/supabase` に隔離する。
- 外部入力はZodでServer側でも検証する。
- Schema変更はmigrationで行い、全公開テーブルでRLSを有効にする。

## Workflow

1. 仕様を確認する。
2. データ・権限・トランザクション境界を確認する。
3. ビジネスロジックのテストを先に追加する。
4. 最小の完全な変更を実装する。
5. `npm run check` と関連E2Eを実行する。
6. `.codex/review-checklist.md` で自己レビューする。

## Do Not

- 仕様変更を暗黙に行わない。
- 必要性のない抽象化や依存を追加しない。
- TypeScriptエラーを無効化しない。理由のない `any` を使わない。
- Clientだけで認可しない。Supabase RLSを迂回しない。
- 秘密情報をコード・ログ・fixtureへ書かない。
- Itemを通常操作で物理削除しない。

## Completion

- lint / typecheck / unit tests / build が成功している。
- 重要導線のE2Eが成功している。
- Loading / Error / Empty state、Keyboard操作、Focus表示を確認している。
- OWASP Top 10、RLS、入力検証、URL安全性を確認している。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
