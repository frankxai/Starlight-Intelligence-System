#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const model = JSON.parse(readFileSync(join(root, "docs/graph-engineering/atlas/estate-graph.v1.json"), "utf8"));
const instructionCompiler = JSON.parse(readFileSync(join(root, "docs/graph-engineering/atlas/instruction-compiler-contract.v1.json"), "utf8"));
const errors = [];

if (model.schema !== "starlight.graph-atlas.v1") errors.push("graph atlas schema drifted");
if (instructionCompiler.schema !== "starlight.instruction-compiler-contract.v1") errors.push("instruction compiler schema drifted");
if ((instructionCompiler.compilePipeline ?? []).length < 8) errors.push("instruction compiler pipeline is incomplete");
if ((instructionCompiler.qualityGates ?? []).length < 5) errors.push("instruction compiler quality gates are incomplete");
if (!Array.isArray(model.views) || model.views.length < 5) errors.push("atlas requires at least five projections");
if (!Array.isArray(model.routes) || model.routes.length < 6) errors.push("atlas requires at least six domain routes");

const nodeIds = new Set();
for (const view of model.views ?? []) {
  if (!view.id || !view.title || !Array.isArray(view.nodes) || !Array.isArray(view.edges)) {
    errors.push(`view ${view.id ?? "unknown"} is incomplete`);
    continue;
  }
  const local = new Set();
  for (const node of view.nodes) {
    if (local.has(node.id)) errors.push(`duplicate node ${node.id} in ${view.id}`);
    local.add(node.id);
    nodeIds.add(node.id);
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) errors.push(`node ${node.id} lacks deterministic position`);
    if (!node.receipt) errors.push(`node ${node.id} lacks receipt contract`);
  }
  for (const edge of view.edges) {
    if (!local.has(edge.from) || !local.has(edge.to)) errors.push(`edge ${edge.from}->${edge.to} escapes view ${view.id}`);
    if (!edge.contract) errors.push(`edge ${edge.from}->${edge.to} lacks contract`);
  }
}
for (const route of model.routes ?? []) {
  if (!Array.isArray(route.nodeIds) || route.nodeIds.length < 3) errors.push(`route ${route.id} is too small`);
  for (const id of route.nodeIds ?? []) if (!nodeIds.has(id)) errors.push(`route ${route.id} references missing node ${id}`);
}
if ((model.policies ?? []).some((policy) => !policy.enforcement)) errors.push("every policy requires enforcement");

if (errors.length > 0) {
  console.error("INVALID");
  for (const error of errors) console.error("-", error);
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, views: model.views.length, routes: model.routes.length, nodes: nodeIds.size }));
