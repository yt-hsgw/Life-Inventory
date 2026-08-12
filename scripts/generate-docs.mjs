#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, "..");
const OUTPUT_DIRECTORY = resolve(REPOSITORY_ROOT, "docs/generated");
const SOURCE_ROOTS = ["src/app", "src/features", "src/lib", "src/components"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

function toPosixPath(value) {
  return value.split("\\").join("/");
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function repositoryPath(absolutePath) {
  return toPosixPath(relative(REPOSITORY_ROOT, absolutePath));
}

function markdownCode(value) {
  return `\`${String(value).replaceAll("`", "\\`")}\``;
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => compareText(left.name, right.name))) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function sourceExtension(filePath) {
  if (filePath.endsWith(".tsx")) return ".tsx";
  if (filePath.endsWith(".ts")) return ".ts";
  return "";
}

async function collectSourceFiles() {
  const nestedFiles = await Promise.all(
    SOURCE_ROOTS.map((sourceRoot) => walkFiles(resolve(REPOSITORY_ROOT, sourceRoot))),
  );

  return nestedFiles
    .flat()
    .filter((filePath) => SOURCE_EXTENSIONS.has(sourceExtension(filePath)))
    .sort((left, right) => compareText(repositoryPath(left), repositoryPath(right)));
}

function routePathFromFile(filePath) {
  const relativeToApp = repositoryPath(filePath).replace(/^src\/app\//, "");
  const segments = relativeToApp.split("/").slice(0, -1).filter((segment) => {
    return !(segment.startsWith("(") && segment.endsWith(")")) && !segment.startsWith("@");
  });

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function parseRoutes(sourceFilesByPath) {
  const routes = [];

  for (const [filePath, source] of sourceFilesByPath) {
    if (!filePath.startsWith("src/app/")) continue;
    const fileName = filePath.split("/").at(-1);
    if (fileName !== "page.tsx" && fileName !== "route.ts") continue;

    const title = source.match(/metadata\s*:[^=]+?=\s*\{[\s\S]*?title:\s*["']([^"']+)["']/)?.[1] ?? "—";
    const methods = fileName === "route.ts"
      ? [...source.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)]
          .map((match) => match[1])
          .sort()
      : ["PAGE"];

    routes.push({
      path: routePathFromFile(resolve(REPOSITORY_ROOT, filePath)),
      filePath,
      kind: fileName === "route.ts" ? "Route Handler" : "Page",
      methods,
      title,
    });
  }

  return routes.sort((left, right) => {
    return compareText(left.path, right.path) || compareText(left.filePath, right.filePath);
  });
}

function featureRole(filePath, featureName) {
  const relativeToFeature = filePath.replace(`src/features/${featureName}/`, "");
  const firstSegment = relativeToFeature.split("/")[0];
  if (relativeToFeature.endsWith(".test.ts") || relativeToFeature.endsWith(".test.tsx")) return "tests";
  if (firstSegment.includes(".")) return firstSegment.replace(/\.(?:ts|tsx)$/, "");
  return firstSegment;
}

function parseFeatures(sourceFilesByPath) {
  const features = new Map();

  for (const [filePath] of sourceFilesByPath) {
    const match = filePath.match(/^src\/features\/([^/]+)\//);
    if (!match) continue;

    const featureName = match[1];
    const feature = features.get(featureName) ?? { name: featureName, files: [], roles: new Map() };
    const role = featureRole(filePath, featureName);
    feature.files.push(filePath);
    feature.roles.set(role, (feature.roles.get(role) ?? 0) + 1);
    features.set(featureName, feature);
  }

  return [...features.values()]
    .map((feature) => ({
      ...feature,
      files: feature.files.sort(compareText),
      roles: [...feature.roles.entries()].sort(([left], [right]) => compareText(left, right)),
    }))
    .sort((left, right) => compareText(left.name, right.name));
}

function hasAdjacentJsDoc(lines, declarationIndex) {
  let lineIndex = declarationIndex - 1;
  while (lineIndex >= 0 && lines[lineIndex].trim() === "") lineIndex -= 1;
  if (lineIndex < 0 || !lines[lineIndex].trim().endsWith("*/")) return false;

  while (lineIndex >= 0) {
    const line = lines[lineIndex].trim();
    if (line.startsWith("/**")) return true;
    if (line.startsWith("/*") && !line.startsWith("/**")) return false;
    lineIndex -= 1;
  }

  return false;
}

function declarationsOnLine(line) {
  const declarations = [];
  const patterns = [
    { pattern: /^\s*export\s+default\s+(?:async\s+)?function\s*([A-Za-z_$][\w$]*)?/, kind: "default function" },
    { pattern: /^\s*export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/, kind: "function" },
    { pattern: /^\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/, kind: "value" },
    { pattern: /^\s*export\s+type\s+([A-Za-z_$][\w$]*)/, kind: "type" },
    { pattern: /^\s*export\s+interface\s+([A-Za-z_$][\w$]*)/, kind: "interface" },
    { pattern: /^\s*export\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/, kind: "class" },
    { pattern: /^\s*export\s+enum\s+([A-Za-z_$][\w$]*)/, kind: "enum" },
  ];

  for (const { pattern, kind } of patterns) {
    const match = line.match(pattern);
    if (match) {
      declarations.push({ name: match[1] ?? "default", kind });
      return declarations;
    }
  }

  const namedExport = line.match(/^\s*export\s*\{([^}]+)\}/);
  if (namedExport) {
    for (const entry of namedExport[1].split(",")) {
      const cleanEntry = entry.trim().replace(/^type\s+/, "");
      if (!cleanEntry) continue;
      const [localName, exportedName] = cleanEntry.split(/\s+as\s+/);
      declarations.push({ name: exportedName ?? localName, kind: "named export" });
    }
  }

  return declarations;
}

function parseExports(sourceFilesByPath) {
  const exports = [];

  for (const [filePath, source] of sourceFilesByPath) {
    if (filePath.endsWith(".test.ts") || filePath.endsWith(".test.tsx")) continue;
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      const declarations = declarationsOnLine(line);
      for (const declaration of declarations) {
        exports.push({
          ...declaration,
          filePath,
          line: index + 1,
          hasJsDoc: hasAdjacentJsDoc(lines, index),
        });
      }
    });
  }

  return exports.sort((left, right) => {
    return compareText(left.filePath, right.filePath) || left.line - right.line || compareText(left.name, right.name);
  });
}

function normalizeSqlIdentifier(identifier) {
  return identifier.replaceAll('"', "").toLowerCase();
}

function parseDatabase(migrations) {
  const tables = new Map();
  const functions = new Map();
  const policies = new Map();
  const rlsTables = new Set();

  for (const migration of migrations) {
    for (const match of migration.source.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([\w".]+)/gi)) {
      const name = normalizeSqlIdentifier(match[1]);
      tables.set(name, { name, migration: migration.filePath });
    }

    for (const match of migration.source.matchAll(/alter\s+table\s+([\w".]+)\s+enable\s+row\s+level\s+security\s*;/gi)) {
      rlsTables.add(normalizeSqlIdentifier(match[1]));
    }

    for (const match of migration.source.matchAll(/create\s+policy\s+"([^"]+)"\s+on\s+([\w".]+)([\s\S]*?);/gi)) {
      const tableName = normalizeSqlIdentifier(match[2]);
      const tablePolicies = policies.get(tableName) ?? new Map();
      const operation = match[3].match(/\bfor\s+(select|insert|update|delete|all)\b/i)?.[1]?.toUpperCase() ?? "ALL";
      tablePolicies.set(match[1], { name: match[1], operation });
      policies.set(tableName, tablePolicies);
    }

    for (const match of migration.source.matchAll(/drop\s+policy\s+(?:if\s+exists\s+)?"([^"]+)"\s+on\s+([\w".]+)\s*;/gi)) {
      policies.get(normalizeSqlIdentifier(match[2]))?.delete(match[1]);
    }

    const functionPattern = /create\s+(?:or\s+replace\s+)?function\s+([\w".]+)\s*\(([^)]*)\)([\s\S]*?)\bas\s+\$\$[\s\S]*?\$\$\s*;/gi;
    for (const match of migration.source.matchAll(functionPattern)) {
      const name = normalizeSqlIdentifier(match[1]);
      const header = match[3];
      const parameters = match[2]
        .split(",")
        .map((parameter) => parameter.trim().replace(/\s+/g, " "))
        .filter(Boolean);
      const returns = header.match(/\breturns\s+(.+?)(?:\s+language\b|\nlanguage\b)/i)?.[1]?.trim().replace(/\s+/g, " ") ?? "unknown";
      const language = header.match(/\blanguage\s+([\w]+)/i)?.[1]?.toLowerCase() ?? "unknown";
      const security = header.match(/\bsecurity\s+(invoker|definer)/i)?.[1]?.toUpperCase() ?? "INVOKER (default)";
      functions.set(name, {
        name,
        parameters,
        returns,
        language,
        security,
        migration: migration.filePath,
      });
    }
  }

  return {
    tables: [...tables.values()]
      .map((table) => ({
        ...table,
        rlsEnabled: rlsTables.has(table.name),
        policies: [...(policies.get(table.name)?.values() ?? [])].sort((left, right) => compareText(left.name, right.name)),
      }))
      .sort((left, right) => compareText(left.name, right.name)),
    functions: [...functions.values()].sort((left, right) => compareText(left.name, right.name)),
  };
}

function commentPriority(exportedSymbol) {
  if (/\/(domain|server)\//.test(exportedSymbol.filePath) || exportedSymbol.filePath.includes("/actions.ts")) return "高";
  if (exportedSymbol.filePath.startsWith("src/lib/")) return "高";
  if (/\/(schemas|components)\//.test(exportedSymbol.filePath) || /\/types(?:\/|\.tsx?$)/.test(exportedSymbol.filePath)) return "中";
  return "低";
}

function suggestedCommentFocus(exportedSymbol) {
  if (exportedSymbol.filePath.includes("/actions.ts")) {
    return "入力検証、認証境界、永続化・再検証・遷移の副作用";
  }
  if (exportedSymbol.filePath.includes("/server/")) {
    return "認証済みユーザーへの絞り込み、取得条件、失敗時の契約";
  }
  if (exportedSymbol.filePath.includes("/domain/")) {
    return "計算規則、値の単位、境界値、不変条件";
  }
  if (exportedSymbol.filePath.includes("/schemas/")) {
    return "受け付ける外部入力、正規化、上限、拒否条件";
  }
  if (exportedSymbol.filePath.includes("/components/")) {
    return "UI の責務、主要 props、ユーザー操作と副作用";
  }
  if (exportedSymbol.kind === "type" || exportedSymbol.kind === "interface") {
    return "表現するドメイン概念、単位、不変条件";
  }
  if (exportedSymbol.filePath.startsWith("src/lib/")) {
    return "共通契約、セキュリティ前提、戻り値と失敗条件";
  }
  return "公開する理由、呼び出し側との契約、変更時の影響";
}

function generatedHeader(title) {
  return `# ${title}\n\n> このファイルは \`node scripts/generate-docs.mjs\` で生成されます。直接編集せず、ソースコードまたは生成スクリプトを更新してください。\n`;
}

function renderImplementationGuide(model) {
  const serverActions = model.exports.filter((entry) => {
    return entry.filePath.includes("/actions.ts") && entry.kind.includes("function");
  });
  const lines = [
    generatedHeader("実装ガイド"),
    "## 目的",
    "",
    "Life Inventory の実装境界を、ルーティング、機能、データベースの順に俯瞰するための資料です。解析はリポジトリ内の許可されたソースだけを対象とし、外部通信や環境変数の参照は行いません。",
    "",
    "## アーキテクチャ概要",
    "",
    "```text",
    "src/app (routing / composition)",
    "  -> src/features/*/components + actions",
    "  -> src/features/*/server",
    "  -> src/lib/supabase",
    "  -> Supabase PostgreSQL (RLS)",
    "```",
    "",
    "- `src/app` はページ、Route Handler、レイアウトの構成を担当します。",
    "- `src/features/<feature>` は機能単位の UI、Server Action、検証、ドメインロジック、DB アクセスをまとめます。",
    "- `domain` は副作用を持たない計算、`schemas` は外部入力の検証、`server` は認証済み DB アクセスを担当します。",
    "- 公開テーブルは RLS を有効にし、ユーザー境界は DB ポリシーでも強制します。",
    "",
    "## 機能境界",
    "",
    "| 機能 | ファイル数 | 内訳 |",
    "| --- | ---: | --- |",
    ...model.features.map((feature) => {
      const roles = feature.roles.map(([role, count]) => `${role}: ${count}`).join("、");
      return `| ${markdownCode(feature.name)} | ${feature.files.length} | ${roles} |`;
    }),
    "",
    "## Server Actions",
    "",
    "Server Action は認証・入力検証を含む変更処理の入口です。複数の永続化操作を不可分にする必要がある場合は、DB 関数を transaction 境界として利用します。",
    "",
    "| Action | 機能 | 実装 |",
    "| --- | --- | --- |",
    ...serverActions.map((entry) => {
      const featureName = entry.filePath.match(/^src\/features\/([^/]+)\//)?.[1] ?? "—";
      return `| ${markdownCode(entry.name)} | ${markdownCode(featureName)} | ${markdownCode(`${entry.filePath}:${entry.line}`)} |`;
    }),
    "",
    "## App Router の入口",
    "",
    "| URL | 種別 | メソッド | 実装 |",
    "| --- | --- | --- | --- |",
    ...model.routes.map((route) => `| ${markdownCode(route.path)} | ${route.kind} | ${route.methods.join(", ")} | ${markdownCode(route.filePath)} |`),
    "",
    "## データと権限の境界",
    "",
    `- 公開テーブル: ${model.database.tables.length} 件`,
    `- RLS 有効: ${model.database.tables.filter((table) => table.rlsEnabled).length} / ${model.database.tables.length} テーブル`,
    `- DB 関数: ${model.database.functions.length} 件`,
    "- `SECURITY DEFINER` 関数は、認証確認、所有者条件、`search_path` 固定、実行権限を migration でレビューしてください。",
    "",
    "## 変更時の実装順序",
    "",
    "1. `docs/Requirements.md` と関連ユースケースを確認します。",
    "2. データモデル、RLS、トランザクション境界を先に決めます。",
    "3. 純粋なドメインロジックのテストを追加します。",
    "4. `schemas`、`server`、`actions`、`components`、`app` の順に最小変更を実装します。",
    "5. `npm run check` と関連 E2E / DB テストを実行します。",
    "6. `npm run docs:generate` でMarkdownとTypeDoc APIを再生成し、`npm run docs:check` で検証します。",
    "",
    "## 生成コマンド",
    "",
    "```bash",
    "npm run docs:generate",
    "npm run docs:check",
    "```",
    "",
    "通常実行は `docs/generated` を更新します。`--check` は生成結果と既存ファイルが異なる場合に終了コード 1 を返し、ファイルは変更しません。",
    "",
  ];

  return lines.join("\n");
}

function renderTechnicalReference(model) {
  const lines = [
    generatedHeader("技術リファレンス"),
    "## ルート一覧",
    "",
    "| URL | タイトル | 種別 | メソッド | ファイル |",
    "| --- | --- | --- | --- | --- |",
    ...model.routes.map((route) => `| ${markdownCode(route.path)} | ${route.title} | ${route.kind} | ${route.methods.join(", ")} | ${markdownCode(route.filePath)} |`),
    "",
    "## Feature 一覧",
    "",
    ...model.features.flatMap((feature) => [
      `### ${markdownCode(feature.name)}`,
      "",
      `責務フォルダ / ファイル: ${feature.roles.map(([role, count]) => `${markdownCode(role)} (${count})`).join("、")}`,
      "",
      ...feature.files.map((filePath) => `- ${markdownCode(filePath)}`),
      "",
    ]),
    "## TypeScript API",
    "",
    "exported symbol、型、JSDoc/TSDocコメントはTypeDocが解析します。`npm run docs:generate:api` の後、`docs/generated/api/index.html` を開いて参照してください。",
    "",
    "## Supabase migrations",
    "",
    ...model.migrations.map((migration) => `- ${markdownCode(migration.filePath)}`),
    "",
    "### テーブルと RLS",
    "",
    "| テーブル | RLS | 現在のポリシー | 作成 migration |",
    "| --- | --- | --- | --- |",
    ...model.database.tables.map((table) => {
      const policies = table.policies.length === 0
        ? "なし"
        : table.policies.map((policy) => `${policy.name} (${policy.operation})`).join("、");
      return `| ${markdownCode(table.name)} | ${table.rlsEnabled ? "有効" : "無効"} | ${policies} | ${markdownCode(table.migration)} |`;
    }),
    "",
    "### DB 関数",
    "",
    "| 関数 | 引数 | 戻り値 | language | security | 最終定義 migration |",
    "| --- | --- | --- | --- | --- | --- |",
    ...model.database.functions.map((dbFunction) => {
      const parameters = dbFunction.parameters.length === 0 ? "なし" : dbFunction.parameters.join(", ");
      return `| ${markdownCode(dbFunction.name)} | ${markdownCode(parameters)} | ${markdownCode(dbFunction.returns)} | ${dbFunction.language} | ${dbFunction.security} | ${markdownCode(dbFunction.migration)} |`;
    }),
    "",
  ];

  return lines.join("\n");
}

function renderCommentSuggestions(model) {
  const suggestions = model.exports
    .filter((entry) => !entry.hasJsDoc)
    .sort((left, right) => {
      const priorities = { 高: 0, 中: 1, 低: 2 };
      return priorities[commentPriority(left)] - priorities[commentPriority(right)]
        || compareText(left.filePath, right.filePath)
        || left.line - right.line;
    });

  const lines = [
    generatedHeader("コードコメント候補"),
    "## 使い方",
    "",
    "この文書は JSDoc が隣接していない exported symbol を機械的に抽出したレビュー用候補です。ソースコードは自動変更しません。コメントは実際の契約や設計理由を確認し、単なるコードの言い換えにならないよう編集してから採用してください。",
    "",
    "優先度は `domain` / `server` / Server Action / 共通ライブラリを高、型・schema・component を中、Next.js の規約ファイルを低として分類しています。",
    "",
    `候補数: ${suggestions.length}`,
    "",
    "| 優先度 | シンボル | 種別 | 定義 | コメントで説明する観点 |",
    "| --- | --- | --- | --- | --- |",
    ...suggestions.map((entry) => `| ${commentPriority(entry)} | ${markdownCode(entry.name)} | ${entry.kind} | ${markdownCode(`${entry.filePath}:${entry.line}`)} | ${suggestedCommentFocus(entry)} |`),
    "",
    "## 採用時の雛形",
    "",
    "```ts",
    "/**",
    " * 何を保証するかを説明します。",
    " * @param value 値の意味、単位、許容範囲を説明します。",
    " * @returns 戻り値の意味と不変条件を説明します。",
    " * @throws 失敗条件が呼び出し側の制御対象になる場合だけ記載します。",
    " */",
    "```",
    "",
    "コメントは実装の逐語訳ではなく、型だけでは伝わらない設計理由、権限境界、単位、重要な副作用に限定してください。",
    "",
  ];

  return lines.join("\n");
}

async function buildModel() {
  const sourceFiles = await collectSourceFiles();
  const sourceFilesByPath = await Promise.all(
    sourceFiles.map(async (filePath) => [repositoryPath(filePath), await readFile(filePath, "utf8")]),
  );
  const migrationFiles = (await walkFiles(resolve(REPOSITORY_ROOT, "supabase/migrations")))
    .filter((filePath) => filePath.endsWith(".sql"))
    .sort((left, right) => compareText(repositoryPath(left), repositoryPath(right)));
  const migrations = await Promise.all(
    migrationFiles.map(async (filePath) => ({ filePath: repositoryPath(filePath), source: await readFile(filePath, "utf8") })),
  );

  return {
    routes: parseRoutes(sourceFilesByPath),
    features: parseFeatures(sourceFilesByPath),
    exports: parseExports(sourceFilesByPath),
    database: parseDatabase(migrations),
    migrations,
  };
}

function parseArguments(argumentsList) {
  const unknownArguments = argumentsList.filter((argument) => argument !== "--check");
  if (unknownArguments.length > 0) {
    throw new Error(`未対応の引数です: ${unknownArguments.join(", ")}`);
  }
  return { check: argumentsList.includes("--check") };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const model = await buildModel();
  const generatedFiles = new Map([
    ["ImplementationGuide.md", renderImplementationGuide(model)],
    ["TechnicalReference.md", renderTechnicalReference(model)],
    ["CommentSuggestions.md", renderCommentSuggestions(model)],
  ]);

  if (options.check) {
    const differences = [];
    for (const [fileName, expectedContent] of generatedFiles) {
      const outputPath = resolve(OUTPUT_DIRECTORY, fileName);
      let actualContent;
      try {
        actualContent = await readFile(outputPath, "utf8");
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        actualContent = null;
      }
      if (actualContent !== expectedContent) differences.push(repositoryPath(outputPath));
    }

    if (differences.length > 0) {
      console.error(`生成ドキュメントが最新ではありません: ${differences.join(", ")}`);
      process.exitCode = 1;
      return;
    }
    console.log("生成ドキュメントは最新です。");
    return;
  }

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  for (const [fileName, content] of generatedFiles) {
    await writeFile(resolve(OUTPUT_DIRECTORY, fileName), content, "utf8");
  }
  console.log(`生成しました: ${[...generatedFiles.keys()].map((fileName) => `docs/generated/${fileName}`).join(", ")}`);
}

await main();
