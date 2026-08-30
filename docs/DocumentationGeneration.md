# 開発者向けドキュメント生成

## 目的

ソースコードとmigrationから、実装調査やレビューの入口になる技術ドキュメントを再現可能に生成する。TypeScriptの構文・型・JSDoc/TSDocコメントはTypeDocで解析し、アプリ固有のroute、feature、Supabase migration、RLSは補助スクリプトで解析する。

生成物は次の2種類で構成される。

- `docs/generated/*.md`: Git管理するroute、feature、server action、migration、RLSの実装資料
- `docs/generated/api/`: TypeDocが生成する検索可能なHTML APIリファレンス。ファイル数が多いためGit管理せず、必要時にローカル生成する

TypeScript本体が公式に提供するのはJSDocの解釈と型検査であり、HTMLやMarkdownのドキュメント生成CLIではない。このプロジェクトでは、TypeScript向けの定番OSSであるTypeDocを採用する。TSDocはコメント記法の標準であり、単体のドキュメント生成ツールではない。

TypeDoc 0.28の日本語localeには未翻訳のUIキーが残るため、rendererのUIは英語に固定し、プロジェクト説明とJSDoc/TSDoc本文を日本語にする。未翻訳キーが解消された版へ更新した際に `typedoc.json` の `lang` を `ja` へ戻す。

参考: [TypeScriptのJSDoc対応](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)、[TypeDoc](https://typedoc.org/)、[TSDoc](https://tsdoc.org/)

`CommentSuggestions.md` はレビュー材料であり、生成処理がソースコードへコメントを自動挿入することはない。

## 使い方

Node.js 22以上と、リポジトリの依存関係を準備する。

```bash
npm ci
npm run docs:generate
```

生成後は `docs/generated/api/index.html` をブラウザで開き、APIリファレンスを確認する。Git管理されるMarkdownの差分も確認する。誤った説明や不要な公開APIが見つかった場合は、生成物だけを手で直さず、ソースコード、JSDoc/TSDocコメント、または生成設定を修正して再生成する。

生成済みMarkdownが現在のソースコードと一致し、TypeDocが現在の型を解析できるか確認する場合は、次を実行する。このコマンドはファイルを書き換えず、Markdownの不一致、TypeScriptエラー、無効なドキュメントリンク、閉じていないMermaidコードブロックがあれば失敗する。

```bash
npm run docs:check
```

通常の品質確認にも同じ検査が含まれる。

```bash
npm run check
```

CIで失敗した場合は、ローカルで `npm run docs:generate` を実行し、生成差分が実装変更を正しく説明していることをレビューしてからcommitする。

## 設計

```mermaid
flowchart LR
  TS["TypeScript / JSDoc / TSDoc"] --> TypeDoc["TypeDoc"]
  TypeDoc --> API["docs/generated/api/*.html"]
  Source["routes / features / actions"] --> Generator["scripts/generate-docs.mjs"]
  Migration["Supabase migrations / RLS"] --> Generator
  Generator --> Markdown["docs/generated/*.md"]
  Check["npm run docs:check"] -->|"Markdown鮮度・TypeDoc変換・リンク検証"| CI["GitHub Actions"]
  Markdown --> Check
  TS --> Check
```

生成処理はソースコードを読み取り、出力先を `docs/generated` に限定する。補助スクリプトの `--check` は同じ入力から期待内容を組み立て、Git管理されたMarkdownと比較する。TypeDocは `--emit none` で出力せず解析・検証できる。どちらもアプリの実行時には呼び出さず、ドキュメント生成を業務処理やSupabaseへの副作用から分離する。

### 設計理由

- 生成物をGit管理することで、GitHub上のコードレビューやオフラインの調査でも参照できる。
- TypeScript APIは独自の正規表現だけに依存せず、TypeScript Compiler APIを利用するTypeDocで正確に解析する。
- 生成と鮮度確認に同じエンジンを使い、ローカルとCIの判定差を避ける。
- `npm run check` に鮮度確認を含め、実装変更時の確認漏れを品質ゲートで検知する。
- コメントは提案に留め、意図を理解しない自動書換えや不要なJSDocの増加を防ぐ。

### トランザクション・権限境界

生成処理はローカルファイルの静的解析のみを行う。Supabase接続、認証情報、外部ネットワーク、DB transactionを必要としない。生成結果に記載されたRLSやserver actionの説明は参照情報であり、実際の認可境界はmigration、server-side認証、RLS policyが担う。

## トレードオフ

- アプリ固有MarkdownはGit管理してレビューしやすくする一方、TypeDoc HTMLは大量の静的ファイルになるためGit管理せず、必要時に再生成する。
- 静的解析は構造を再現しやすい一方、業務上の意図やruntimeの分岐を完全には説明できない。
- `npm run check` の時間が増える一方、型解析不能や無効なコメントリンクをmerge前に検出できる。
- コメントを自動挿入しないため採用は手作業になる一方、公開symbolの意味を人が確認するレビュー境界を維持できる。

代替案としてAPI Extractorで公開APIモデルを固定する方法がある。ライブラリの互換性管理には強いが、このNext.jsアプリには公開パッケージのAPI契約がなく構成が過剰になるため採用しない。Markdown形式が必須になった場合は `typedoc-plugin-markdown` も候補になるが、TypeDoc本体ではないcommunity pluginへの依存が増えるため、現時点では組み込みHTML rendererを使う。

## 危険ケースとレビュー観点

- **秘密情報の混入**: コード、fixture、コメントに秘密情報を置かない。生成差分にもtoken、cookie、個人情報がないことを確認する。
- **誤った安心感**: 生成文書をSource of Truthやセキュリティ検査の代替にしない。仕様は `Requirements.md`、DB定義とRLSはmigrationを優先する。
- **手修正の消失**: `docs/generated` を直接編集しても次回生成で上書きされる。恒久修正はソースまたは生成処理へ行う。
- **不安定な出力**: 実行時刻、環境依存の絶対path、走査順の揺れを出力へ含めるとCIが継続的に失敗する。生成結果は決定的であることを保つ。
- **公開範囲の誤認**: exported symbolであることと、外部利用を保証する公開APIであることは同義ではない。コメント候補の採用前にfeature境界を確認する。
- **非公開情報の露出**: API HTMLを外部公開する場合は、内部path、コメント、型名に公開不適切な情報がないことを別途確認する。現在の出力はローカル開発者向けである。
- **規模拡大**: ファイル数が増えて鮮度確認が遅くなった場合は、入力範囲の明示や解析結果のcacheを検討する。ただし差分検出を部分的にして取りこぼす最適化は行わない。
- **Markdownの安全性**: ソース由来の文字列をHTMLとして信頼しない。生成物を別システムへ公開する場合は、そのrenderer側でも危険なHTMLやURLを無効化する。

生成物のレビューでは、routeとfeatureの対応、mutationの認証再確認、Zodによる入力検証、RLSとtransaction boundary、URL安全性を必ず確認する。
