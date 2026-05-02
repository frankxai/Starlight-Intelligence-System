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

if (!existsSync(src)) {
  console.error(`[sync-explainer] source missing: ${src}`);
  process.exit(1);
}

if (!existsSync(dstDir)) {
  mkdirSync(dstDir, { recursive: true });
}

copyFileSync(src, dst);
console.log(`[sync-explainer] copied ${src} -> ${dst}`);
