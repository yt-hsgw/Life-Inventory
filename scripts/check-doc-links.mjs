import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = process.cwd();

function collectMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdownFiles(path);
    return extname(entry.name) === ".md" ? [path] : [];
  });
}

const files = [
  join(root, "README.md"),
  ...collectMarkdownFiles(join(root, "docs")),
];
const failures = [];

for (const file of files) {
  const markdown = readFileSync(file, "utf8");
  const relativeFile = file.slice(root.length + 1);
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const match of markdown.matchAll(linkPattern)) {
    let target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:https?:|mailto:|data:|#|\/)/.test(target)) continue;

    target = target.split("#", 1)[0].split("?", 1)[0];
    if (!target) continue;

    const linkedPath = resolve(dirname(file), decodeURIComponent(target));
    if (!existsSync(linkedPath)) {
      failures.push(`${relativeFile}: linked file does not exist: ${match[1]}`);
    }
  }

  let inMermaid = false;
  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    if (line === "```mermaid") {
      if (inMermaid) {
        failures.push(`${relativeFile}:${index + 1}: nested Mermaid fence`);
      }
      inMermaid = true;
    } else if (line === "```" && inMermaid) {
      inMermaid = false;
    }
  }
  if (inMermaid) failures.push(`${relativeFile}: unclosed Mermaid fence`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Documentation links and Mermaid fences are valid (${files.length} Markdown files).`,
  );
}
