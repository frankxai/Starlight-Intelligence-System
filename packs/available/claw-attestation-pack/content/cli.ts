#!/usr/bin/env node
// claw-attestation-pack — CLI
//
// Usage:
//   node cli.ts <path>
//   node cli.ts --self-check
//
// Exit code: 0 if PASS, 1 if FAIL, 2 on usage error.

import { verifyPath } from "./verify.js";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

function main(argv: string[]): number {
  if (argv.length < 1) {
    console.error("usage: cli.ts <path> | --self-check");
    return 2;
  }
  const target =
    argv[0] === "--self-check"
      ? dirname(fileURLToPath(import.meta.url))
      : argv[0];
  const result = verifyPath(target);
  console.log(JSON.stringify(result, null, 2));
  return result.verdict === "PASS" ? 0 : 1;
}

process.exit(main(process.argv.slice(2)));
