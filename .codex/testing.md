# Testing Rules

- Business ruleとvalidationはVitestでテストする。
- 認証、Item追加・編集・Archive、Review、Ideal、Expenseの主要導線はPlaywright対象とする。
- implementation detailや理由のないsnapshotはテストしない。
- 完了前に `npm run check`、`npm run build`、可能なら `npm run test:e2e` を実行する。
