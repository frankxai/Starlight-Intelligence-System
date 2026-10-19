#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const REPO_ROOT = resolve(SITE_ROOT, "..");
const SOURCE_VERSION = JSON.parse(
  readFileSync(join(REPO_ROOT, "package.json"), "utf8"),
).version;
const SEARCH_ROOTS = [
  join(SITE_ROOT, "src"),
  join(SITE_ROOT, "public"),
];
const TEXT_EXTENSIONS = new Set([
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
]);

function walkTextFiles(root) {
  const files = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTextFiles(path));
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

const forbidden = [
  {
    pattern: /releases\/(?:tag|download)\/v8\.3\.0/g,
    reason: "v8.3.0 has no published GitHub release or release assets",
  },
  {
    pattern:
      /(?:npm|pnpm|yarn)\s+(?:install|add)\s+@arcanea\/starlight-intelligence-system/g,
    reason: "the source workflow must build the checkout rather than substitute a registry release",
  },
  {
    pattern:
      /npx\s+@arcanea\/starlight-intelligence-system[\s\S]{0,80}--list-tools/g,
    reason: "the published CLI has no --list-tools command",
  },
  {
    pattern: /path\/to\/sis-mcp-server\.mjs/g,
    reason: "the current built server is dist/mcp-server.js",
  },
  {
    pattern: /vaults\/frank\/technical\.jsonl/g,
    reason: "the current default vault is ~/.starlight/vaults/technical.jsonl",
  },
  {
    pattern: /Operational layer \(TS package\)\. v7\.6\.0/g,
    reason: "crawler output must not invent an unpublished package version",
  },
  {
    pattern: /~\/\.config\/opencode\/config\.json/g,
    reason: "OpenCode's global configuration is ~/.config/opencode/opencode.json",
  },
  {
    pattern: /~\/\.opencode\/config\.json/g,
    reason: "OpenCode's global configuration is ~/.config/opencode/opencode.json",
  },
];

const files = SEARCH_ROOTS.flatMap(walkTextFiles);
const failures = [];

for (const path of files) {
  const content = readFileSync(path, "utf8");
  for (const rule of forbidden) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(content)) {
      failures.push(
        `${relative(REPO_ROOT, path)}: ${rule.reason}`,
      );
    }
  }
}

function requireMarkers(path, markers) {
  const content = readFileSync(path, "utf8");
  for (const marker of markers) {
    if (!content.includes(marker)) {
      failures.push(
        `${relative(REPO_ROOT, path)}: missing contract marker ${JSON.stringify(marker)}`,
      );
    }
  }
}

requireMarkers(join(SITE_ROOT, "src/app/quickstart/page.tsx"), [
  "git clone https://github.com/frankxai/Starlight-Intelligence-System",
  "npm run build",
  "/path/to/Starlight-Intelligence-System/dist/mcp-server.js",
  "result.tools contains the server's current sis_* tool definitions",
  "content",
  "~/.starlight/vaults/technical.jsonl",
  "npm serves",
  "v8.5.1",
  `v${SOURCE_VERSION}`,
  "~/.config/opencode/opencode.json",
]);

requireMarkers(join(SITE_ROOT, "src/app/docs/page.tsx"), [
  "git clone https://github.com/frankxai/Starlight-Intelligence-System",
  "/path/to/Starlight-Intelligence-System/dist/mcp-server.js",
  "Inspect the server&apos;s current tool inventory",
  "npm serves v8.5.1",
  `v${SOURCE_VERSION}`,
]);

requireMarkers(join(SITE_ROOT, "src/app/download/page.tsx"), [
  "Inspect source",
  "A checksum-backed SIP Starter",
  "The machine-readable endpoint reports the same",
  `SIP Starter v${SOURCE_VERSION}`,
]);

requireMarkers(join(SITE_ROOT, "src/lib/sip-download.ts"), [
  'status: "source-only"',
  "tag: null",
  "releaseUrl: null",
  "assets: []",
  `SIP_STARTER_VERSION = "${SOURCE_VERSION}"`,
  `No v${SOURCE_VERSION} tag, release, or checksum-backed SIP Starter archive has been published`,
]);

requireMarkers(join(SITE_ROOT, "public/llms.txt"), [
  `Use this path for v${SOURCE_VERSION}`,
  "Published operational package v8.5.1 as verified October 18, 2026",
  `SIP Starter v${SOURCE_VERSION} is source-only until a release archive exists`,
]);

requireMarkers(join(SITE_ROOT, "public/agents.md"), [
  "Discovery is not execution authority",
  "https://starlightintelligence.org/download/latest.json",
  "https://starlightintelligence.org/download/plugins/latest.json",
  "https://starlightintelligence.ai/api/v1/departments",
  "https://starlightintelligence.academy/academy/catalog.json",
  "a published artifact",
  "Built on SIP",
]);

requireMarkers(join(REPO_ROOT, "src/cli.ts"), [
  'join(getPackageRoot(), "dist", "mcp-server.js")',
  '--vault-dir "${result.vaultDir}"',
]);

requireMarkers(join(REPO_ROOT, "README.md"), [
  "~/.config/opencode/opencode.json",
]);

if (failures.length > 0) {
  console.error("Public install contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Public install contract passed across ${files.length} recursively scanned files.`,
);
