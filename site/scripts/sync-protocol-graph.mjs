#!/usr/bin/env node
// Built on SIP — copies the canonical SIP graph fixture from protocol/ into
// site/content/protocol-graph/ and regenerates its conformance receipt, so the
// /protocol/graph route can read both from a path that exists in the Vercel
// project root (process.cwd() resolves to site/; repo-relative paths do not
// survive the build).
//
// Same pattern as sync-changelog.mjs: when the repo-root source is not
// reachable, the committed copies are used as-is. The route therefore renders
// identically whether or not this script ran.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const repoRoot = resolve(siteRoot, "..");

const src = join(repoRoot, "protocol", "fixtures", "valid-profile.json");
const dstDir = join(siteRoot, "content", "protocol-graph");
const profileDst = join(dstDir, "profile.json");
const receiptDst = join(dstDir, "receipt.json");

// The projection masking the explorer applies is the protocol's own function,
// vendored here byte-for-byte rather than re-implemented in TypeScript: the page
// must not be able to mask less than the validator does. A test in
// protocol/test/conform.test.mjs fails if this copy drifts.
const maskSrc = join(repoRoot, "protocol", "lib", "mask.mjs");
const maskDstDir = join(siteRoot, "src", "lib", "generated");
const maskDst = join(maskDstDir, "sip-mask.mjs");

if (!existsSync(dstDir)) mkdirSync(dstDir, { recursive: true });

if (existsSync(maskSrc)) {
  if (!existsSync(maskDstDir)) mkdirSync(maskDstDir, { recursive: true });
  const mask = readFileSync(maskSrc, "utf8");
  if (!existsSync(maskDst) || readFileSync(maskDst, "utf8") !== mask) {
    writeFileSync(maskDst, mask);
    console.log(`[sync-protocol-graph] ${maskSrc} -> ${maskDst}`);
  }
} else if (!existsSync(maskDst)) {
  console.error(`[sync-protocol-graph] mask source not reachable AND no committed copy at ${maskDst}`);
  process.exit(1);
}

if (!existsSync(src)) {
  if (existsSync(profileDst) && existsSync(receiptDst)) {
    console.log(`[sync-protocol-graph] source not reachable at ${src} — using committed copies`);
    process.exit(0);
  }
  console.error(`[sync-protocol-graph] source not reachable AND no committed copy at ${dstDir}`);
  process.exit(1);
}

const { buildReceipt } = await import(
  new URL("../../protocol/conform.mjs", import.meta.url).href
);

const raw = readFileSync(src, "utf8");
const profile = JSON.parse(raw);
const receipt = buildReceipt({ profile, raw, checkedAt: new Date().toISOString() });

if (receipt.verdict !== "PASS") {
  console.error(
    `[sync-protocol-graph] refusing to publish a profile that does not conform (verdict ${receipt.verdict}). Run: node protocol/conform.mjs ${src}`
  );
  process.exit(1);
}

writeFileSync(profileDst, raw);
writeFileSync(receiptDst, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`[sync-protocol-graph] ${src} -> ${profileDst} (+ receipt, ${receipt.verdict})`);
