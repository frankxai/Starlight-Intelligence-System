#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { jsonlToAtom } from "./atom-schema.ts";
import type { Atom, BucketReport } from "./atom-schema.ts";
import { applyAtomBudget, clusterAtoms } from "./clusterer.ts";
import { classifyDensity } from "./density-classifier.ts";

function usage(): never {
  console.error("Usage: tsx tools/sis-forge/cli.ts <input-jsonl> [--out <path>]");
  process.exit(64);
}

function parseArgs(argv: string[]): { input: string; out?: string } {
  const args = argv.slice(2);
  if (args.length === 0) usage();
  const input = args[0];
  let out: string | undefined;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--out" && args[i + 1]) {
      out = args[i + 1];
      i++;
    }
  }
  return { input, out };
}

function main(): void {
  const { input, out } = parseArgs(process.argv);

  if (!existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(66);
  }

  const lines = readFileSync(input, "utf8").split(/\r?\n/).filter((l) => l.trim().length > 0);
  const atoms: Atom[] = lines.map(jsonlToAtom);

  const budgeted = applyAtomBudget(atoms);
  const clusters = clusterAtoms(budgeted);
  const classification = classifyDensity(clusters);

  const ts = new Date().toISOString();
  const snapshotPath = resolve(input);

  const report: BucketReport = {
    mode: classification.mode,
    clusters,
    totalAtoms: budgeted.length,
    byBucket: classification.byBucket,
    snapshotPath,
    generatedAt: ts,
  };

  const outPath = out ?? `.sis-forge/buckets-${ts.replace(/[:.]/g, "-")}.json`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify({
    mode: report.mode,
    totalAtoms: report.totalAtoms,
    byBucket: report.byBucket,
    clusterCount: report.clusters.length,
    outPath,
  }, null, 2));
}

main();
