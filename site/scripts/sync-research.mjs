#!/usr/bin/env node
// Built on SIP — copies docs/research/published/*.md into
// site/content/research/ at build time so the /research/[slug] route can read
// from a path that exists in the Vercel serverless function root.
//
// Mirrors the sync-explainer.mjs pattern: process.cwd() resolves to site/
// on both Vercel and local builds, so we resolve repoRoot relative to here.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const repoRoot = resolve(siteRoot, "..");

const srcDir = join(repoRoot, "docs", "research", "published");
const dstDir = join(siteRoot, "content", "research");

if (!existsSync(dstDir)) {
  mkdirSync(dstDir, { recursive: true });
}

if (!existsSync(srcDir)) {
  // Vercel only mounts site/ as project root — the docs/ source isn't reachable
  // there. Committed copies in site/content/research/ are used as-is.
  console.log(
    `[sync-research] source dir not reachable at ${srcDir} — using committed copies in ${dstDir}`
  );
  process.exit(0);
}

let copied = 0;
for (const entry of readdirSync(srcDir)) {
  if (!entry.endsWith(".md")) continue;
  const src = join(srcDir, entry);
  if (!statSync(src).isFile()) continue;
  const dst = join(dstDir, entry);
  copyFileSync(src, dst);
  copied += 1;
  console.log(`[sync-research] copied ${entry}`);
}

console.log(`[sync-research] synced ${copied} research file(s) to ${dstDir}`);
