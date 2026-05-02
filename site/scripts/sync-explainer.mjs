#!/usr/bin/env node
// Built on SIP — copies docs/public/starlight-intelligence-system.md into
// site/content/explainer.md at build time so the /explainer route can read
// from a path that exists in the Vercel serverless function root
// (process.cwd() resolves to site/, repo-relative paths don't survive).

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const repoRoot = resolve(siteRoot, "..");

const src = join(repoRoot, "docs", "public", "starlight-intelligence-system.md");
const dstDir = join(siteRoot, "content");
const dst = join(dstDir, "explainer.md");

if (!existsSync(dstDir)) {
  mkdirSync(dstDir, { recursive: true });
}

if (!existsSync(src)) {
  // Vercel only mounts site/ as project root — the docs/ source isn't reachable
  // there. The committed site/content/explainer.md is used as-is. Locally the
  // sync runs and refreshes the copy. Both paths produce a renderable file.
  if (existsSync(dst)) {
    console.log(
      `[sync-explainer] source not reachable at ${src} — using committed copy at ${dst}`
    );
    process.exit(0);
  }
  console.error(
    `[sync-explainer] source missing at ${src} AND no committed copy at ${dst}`
  );
  process.exit(1);
}

copyFileSync(src, dst);
console.log(`[sync-explainer] copied ${src} -> ${dst}`);
