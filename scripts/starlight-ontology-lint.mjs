#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const excluded = new Set([
  "docs/canon/STARLIGHT_ONTOLOGY_BOUNDARY.md",
  "scripts/starlight-ontology-lint.mjs",
  "test/starlight-ontology-boundary.test.mjs",
]);

export const rules = [
  ["Starlight cannot be equated with God, Source, or Lumina", /starlight\s+is\s+(?:god|the\s+source|lumina)\b/i],
  ["Lumina cannot be equated with Starlight", /lumina\s+is\s+starlight\b/i],
  ["Shinkami cannot be equated with God", /shinkami\s+is\s+god\b/i],
  ["Tao cannot be flattened into The Source", /the\s+tao\s+is\s+the\s+source\b/i],
  ["Traditions cannot be flattened into Starlight", /all\s+religions\s+teach\s+starlight\b/i],
  ["Historical places cannot be retroactively declared Arcanea", /kunlun\s+was\s+actually\s+arcanea\b/i],
  ["Quantum manifestation is not an SIS scientific claim", /quantum[- ]manifestation\s+framing|future\s+as\s+collapsible\s+by\s+attention/i],
];

async function markdownFiles(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    if ([".git", "node_modules", "dist", ".next"].includes(name)) continue;
    const path = join(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) out.push(...await markdownFiles(path));
    else if (/\.(?:md|mdx)$/i.test(name)) out.push(path);
  }
  return out;
}

export async function violations() {
  const found = [];
  for (const file of await markdownFiles(root)) {
    const rel = relative(root, file).replaceAll("\\", "/");
    if (excluded.has(rel)) continue;
    const text = await readFile(file, "utf8");
    for (const [message, pattern] of rules) {
      const match = text.match(pattern);
      if (match) found.push({ file: rel, message, excerpt: match[0] });
    }
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const found = await violations();
  if (found.length) {
    for (const item of found) console.error(`${item.file}: ${item.message}: "${item.excerpt}"`);
    process.exitCode = 1;
  } else {
    console.log("Starlight ontology boundary: clean");
  }
}
