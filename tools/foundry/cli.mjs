#!/usr/bin/env node

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compilePackage } from "./lib/compile.mjs";
import { proposeEvolution } from "./lib/evolve.mjs";
import { buildCapabilityGraph, resolveCapabilities } from "./lib/graph.mjs";
import { readJson, writeJson } from "./lib/io.mjs";
import {
  assertValid,
  getContract,
  inferContractName,
  loadContractRegistry,
  validateValue,
} from "./lib/schema.mjs";
import { provePackage } from "./lib/prove.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const CONTRACTS = join(ROOT, "foundry", "contracts");
const registry = loadContractRegistry(CONTRACTS);

function option(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function requireOption(args, name) {
  const value = option(args, name);
  if (!value) throw new Error(`Missing required option: ${name}`);
  return value;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function help() {
  console.log(`Starlight Intelligence Foundry

Usage:
  node tools/foundry/cli.mjs validate <json> [--schema <name>]
  node tools/foundry/cli.mjs graph [--out <json>]
  node tools/foundry/cli.mjs route <task-envelope.json> [--graph <json>] [--out <json>]
  node tools/foundry/cli.mjs forge --envelope <json> --pack <json> --out <dir> [--graph <json>] [--force]
  node tools/foundry/cli.mjs prove <package-dir> [--out <json>] [--evidence <json>] [--execute-commands]
  node tools/foundry/cli.mjs evolve <evidence-receipt.json> --out <json>

Contracts:
  task-envelope, skill-pack, agent-pack, swarm-pack, vertical-pack,
  plugin-pack, taste-profile, evidence-receipt, capability-graph,
  foundry-manifest

Safety:
  Command tests never execute unless --execute-commands is present and the
  Task Envelope explicitly allows the executable. Manual and judge tests stay
  pending until independent evidence is supplied.`);
}

async function main() {
  const [, , command = "help", ...args] = process.argv;

  if (["help", "--help", "-h"].includes(command)) return help();

  if (command === "validate") {
    const path = args[0];
    if (!path) throw new Error("validate requires a JSON file");
    const value = readJson(resolve(path));
    const contractName = option(args, "--schema") ?? inferContractName(value);
    const schema = getContract(registry, contractName);
    const result = validateValue(value, schema, registry);
    printJson({ file: resolve(path), contract: contractName, ...result });
    if (!result.valid) process.exitCode = 1;
    return;
  }

  if (command === "graph") {
    const graph = buildCapabilityGraph(ROOT);
    assertValid(graph, getContract(registry, "capability-graph"), registry, "Capability Graph");
    const output = option(args, "--out");
    if (output) writeJson(resolve(output), graph);
    printJson({ nodes: graph.nodes.length, edges: graph.edges.length, output: output ? resolve(output) : null });
    return;
  }

  if (command === "route") {
    const envelopePath = args[0];
    if (!envelopePath) throw new Error("route requires a Task Envelope JSON file");
    const envelope = readJson(resolve(envelopePath));
    assertValid(envelope, getContract(registry, "task-envelope"), registry, "Task Envelope");
    const graphPath = option(args, "--graph");
    const graph = graphPath ? readJson(resolve(graphPath)) : buildCapabilityGraph(ROOT);
    const resolution = resolveCapabilities(envelope, graph);
    const output = option(args, "--out");
    if (output) writeJson(resolve(output), resolution);
    printJson(resolution);
    return;
  }

  if (command === "forge") {
    const envelope = readJson(resolve(requireOption(args, "--envelope")));
    const pack = readJson(resolve(requireOption(args, "--pack")));
    const output = resolve(requireOption(args, "--out"));
    const graphPath = option(args, "--graph");
    const graph = graphPath ? readJson(resolve(graphPath)) : buildCapabilityGraph(ROOT);
    assertValid(graph, getContract(registry, "capability-graph"), registry, "Capability Graph");
    const result = compilePackage({
      root: ROOT,
      envelope,
      pack,
      output,
      graph,
      registry,
      force: args.includes("--force"),
    });
    printJson(result);
    return;
  }

  if (command === "prove") {
    const packageDirectory = args[0];
    if (!packageDirectory) throw new Error("prove requires a package directory");
    const result = provePackage({
      packageDirectory: resolve(packageDirectory),
      output: option(args, "--out"),
      evidencePath: option(args, "--evidence"),
      executeCommands: args.includes("--execute-commands"),
      registry,
    });
    printJson({ output: result.output, status: result.receipt.status, summary: result.receipt.summary });
    if (["revise", "rejected"].includes(result.receipt.status)) process.exitCode = 1;
    return;
  }

  if (command === "evolve") {
    const receiptPath = args[0];
    if (!receiptPath) throw new Error("evolve requires an Evidence Receipt JSON file");
    const output = requireOption(args, "--out");
    const result = proposeEvolution({ receiptPath, output, registry });
    printJson({ output: result.output, patches: result.proposal.patches.length });
    return;
  }

  throw new Error(`Unknown Foundry command: ${command}`);
}

main().catch((error) => {
  console.error(`Foundry error: ${error.message}`);
  process.exitCode = 1;
});
