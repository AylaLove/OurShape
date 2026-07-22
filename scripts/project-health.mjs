import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const required = [
  "README.md",
  "docs/PRODUCT_CONTRACT.md",
  "docs/ARCHITECTURE.md",
  "docs/DECISIONS.md",
  "apps/web/app/page.tsx",
  "packages/domain/src/index.ts",
];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".mjs"]);
const ignoredDirectories = new Set([".git", ".next", "node_modules"]);
const problems = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }

  return files;
}

for (const path of required) {
  try {
    await stat(join(root, path));
  } catch {
    problems.push(`Missing required file: ${path}`);
  }
}

for (const file of await walk(root)) {
  const extension = file.slice(file.lastIndexOf("."));
  if (!sourceExtensions.has(extension)) continue;

  const path = relative(root, file);
  const source = await readFile(file, "utf8");
  const lines = source.split("\n").length;

  if (lines > 400) problems.push(`${path} has ${lines} lines; review its ownership before extending it.`);
  if (/localStorage\s*\./.test(source)) problems.push(`${path} uses localStorage. Confirm it is disposable UI state only.`);
  if (/service[_-]?role/i.test(source) && !path.endsWith("project-health.mjs")) {
    problems.push(`${path} mentions a service-role secret. Confirm it is server-only.`);
  }
}

if (problems.length) {
  console.error("Project health check failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Project health check passed.");

