#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseWorkGraphJsonl, projectWorkGraph } from "./work-graph.js";

export interface WorkGraphCliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function usage(): string {
  return [
    "Usage: starlight-workgraph <validate|project> <events.jsonl>",
    "",
    "  validate  Validate harness-neutral work graph events.",
    "  project   Validate events and emit proof-gated work receipts.",
  ].join("\n");
}

export function runWorkGraphCli(args: readonly string[]): WorkGraphCliResult {
  const [command, inputPath] = args;
  if ((command !== "validate" && command !== "project") || !inputPath) {
    return { exitCode: 2, stdout: "", stderr: usage() };
  }

  let input: string;
  try {
    input = readFileSync(inputPath, "utf8");
  } catch (error) {
    return {
      exitCode: 2,
      stdout: "",
      stderr: `Unable to read ${inputPath}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const parsed = parseWorkGraphJsonl(input);
  if (command === "validate") {
    const output = {
      valid: parsed.issues.length === 0,
      eventCount: parsed.events.length,
      issues: parsed.issues,
    };
    return {
      exitCode: output.valid ? 0 : 1,
      stdout: `${JSON.stringify(output, null, 2)}\n`,
      stderr: "",
    };
  }

  const projection = projectWorkGraph(parsed.events);
  const output = {
    workItems: projection.workItems,
    issues: [...parsed.issues, ...projection.issues],
  };
  return {
    exitCode: output.issues.length === 0 ? 0 : 1,
    stdout: `${JSON.stringify(output, null, 2)}\n`,
    stderr: "",
  };
}

function isDirectExecution(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isDirectExecution()) {
  const result = runWorkGraphCli(process.argv.slice(2));
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(`${result.stderr}\n`);
  process.exitCode = result.exitCode;
}
