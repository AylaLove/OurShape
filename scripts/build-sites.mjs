import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const web = resolve(root, "apps/web");
const nextCli = resolve(web, "node_modules/next/dist/bin/next");

const result = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: web,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "client"), { recursive: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await cp(resolve(web, "out"), resolve(dist, "client"), { recursive: true });
await cp(resolve(root, "sites/worker.js"), resolve(dist, "server/index.js"));
