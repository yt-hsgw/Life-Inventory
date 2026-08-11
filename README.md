# Life Inventory

所有物・理想の状態・固定費を見直し、次の行動を穏やかに決めるための個人向けWebアプリです。

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- Supabase Auth / PostgreSQL / Row Level Security
- Zod / Vitest / Playwright

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Supabaseプロジェクトを作成し、`supabase/migrations` を適用してから `.env.local` にURLとPublishable Keyを設定してください。秘密鍵やService Role Keyはこのアプリでは使用しません。

Supabase AuthのSite URLをアプリURLに設定し、SSR確認メールのリンクを次の形式にします。

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
```

## Validation

DB統合テストと認証済みE2EにはDockerが必要です。Supabase CLIは互換性を固定するためdevDependencyに含めています。

```bash
npm run check
npm run build
npm run supabase:start
npm run test:db
npm run test:e2e
npm run supabase:stop
```

詳しい仕様と設計は [docs/Requirements.md](docs/Requirements.md) と [docs/Architecture.md](docs/Architecture.md) を参照してください。
