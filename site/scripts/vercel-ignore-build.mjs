#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA;
const currentSha = process.env.VERCEL_GIT_COMMIT_SHA;

// Fail open: if Vercel cannot give us a complete comparison, build the site.
if (!previousSha || !currentSha) process.exit(1);

const comparison = spawnSync(
  "git",
  [
    "diff",
    "--quiet",
    previousSha,
    currentSha,
    "--",
    ".",
    "../foundry/contracts/academy-fabric",
    "../plugins/starlight-graph-engineering",
  ],
  { stdio: "ignore" },
);

// Exit 0 only when the watched surfaces are unchanged, which tells Vercel to skip.
// A diff (1), an invalid comparison, or a process error all trigger a build.
process.exit(comparison.status === 0 ? 0 : 1);
