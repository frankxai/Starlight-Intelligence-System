#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const publicationChecks = [
  "scripts/check-public-install-contract.mjs",
  "scripts/check-layout-contract.mjs",
  "scripts/check-deploy-contract.mjs",
  "scripts/check-academy-observatory-contract.mjs",
];
const checks =
  process.env.VERCEL_ENV === "production"
    ? ["scripts/check-metrics-contract.mjs", ...publicationChecks]
    : publicationChecks;

function run(args) {
  const result = spawnSync(process.execPath, args, {
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const check of checks) run([check]);
run(["node_modules/next/dist/bin/next", "build"]);
