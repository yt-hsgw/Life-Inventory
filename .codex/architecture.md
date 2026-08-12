# Architecture Rules

依存方向は `app/components -> feature server/domain -> Supabase` とする。UIはDB型やSupabase clientへ直接依存しない。

各featureは必要な範囲で以下を持つ。

```text
feature/
├── components  presentation
├── domain      pure business rules
├── schemas     external input validation
├── server      authenticated queries/actions
└── types       feature contracts
```

Review decisionはItem更新とReview履歴追加を同一DB transactionで処理する。その他のmutationは単一aggregateの1回のServer Actionをtransaction boundaryとする。
