#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = join(ROOT, "skills", "academy");
const PLUGIN = join(ROOT, "plugins", "starlight-graph-engineering", "skills");
const SKILLS = [
  "capability-graph-architecture",
  "mission-graph-design",
  "execution-graph-engineering",
  "evidence-graph-evaluation",
  "passport-graph-projection",
  "agent-team-composition",
];
const CHECK = process.argv.includes("--check");

function files(root) {
  const output = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      if (entry.isFile()) output.push(relative(root, absolute).replaceAll("\\", "/"));
    }
  }
  if (existsSync(root)) walk(root);
  return output.sort();
}

function compare(source, target) {
  const sourceFiles = files(source);
  const targetFiles = files(target);
  if (JSON.stringify(sourceFiles) !== JSON.stringify(targetFiles)) return false;
  return sourceFiles.every((file) => readFileSync(join(source, file)).equals(readFileSync(join(target, file))));
}

const drift = [];
for (const skill of SKILLS) {
  const source = join(CANONICAL, skill);
  const target = join(PLUGIN, skill);
  if (!statSync(source).isDirectory()) throw new Error(`Canonical Academy skill is missing: ${skill}`);
  if (CHECK) {
    if (!existsSync(target) || !compare(source, target)) drift.push(skill);
    continue;
  }
  if (existsSync(target)) rmSync(target, { recursive: true });
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

if (CHECK && drift.length > 0) {
  console.error(`Academy Graph plugin skill drift: ${drift.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(CHECK ? "Academy Graph plugin skills match canonical sources." : "Academy Graph plugin skills synchronized.");
}
