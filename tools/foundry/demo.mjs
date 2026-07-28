#!/usr/bin/env node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compilePackage } from "./lib/compile.mjs";
import { buildCapabilityGraph } from "./lib/graph.mjs";
import { readJson } from "./lib/io.mjs";
import { loadContractRegistry } from "./lib/schema.mjs";
import { provePackage } from "./lib/prove.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const examples = join(ROOT, "foundry", "examples");
const outputIndex = process.argv.indexOf("--out");
const output = outputIndex >= 0
  ? resolve(process.argv[outputIndex + 1])
  : join(mkdtempSync(join(tmpdir(), "starlight-foundry-demo-")), "research-brief-forge");
const envelope = readJson(join(examples, "research-brief.task-envelope.json"));
const pack = readJson(join(examples, "research-brief.skill-pack.json"));
const graph = buildCapabilityGraph(ROOT);
const registry = loadContractRegistry(join(ROOT, "foundry", "contracts"));

compilePackage({
  root: ROOT,
  envelope,
  pack,
  output,
  graph,
  registry,
});
const { receipt } = provePackage({ packageDirectory: output, registry });

console.log(JSON.stringify({
  output,
  status: receipt.status,
  summary: receipt.summary,
  unresolved: receipt.unresolved,
}, null, 2));
