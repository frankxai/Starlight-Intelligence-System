#!/usr/bin/env node
// verify-lane.mjs — mechanical enforcement of AGENTS.md §0 (repository routing hard stop)
// and the WORKSPACE_MAP.md worktree convention. Run before any write, from any harness.
//
// Usage:
//   node starlight/tools/verify-lane.mjs [targetPath]   (defaults to cwd)
//
// Exit 0  = PASS, write is allowed
// Exit 1  = BLOCK, do not write — print reason and the correct target
// Warnings do not block but are printed so the calling agent can self-correct.

import { execSync, execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ESTATE_ROOT = path.resolve(__dirname, ".."); // .../starlight
const CANONICAL_WORKTREE_ROOT = path.join(ESTATE_ROOT, "worktrees");

const target = path.resolve(process.argv[2] || process.cwd());
const targetDir = (() => {
  try {
    return statSync(target).isDirectory() ? target : path.dirname(target);
  } catch {
    return path.dirname(target);
  }
})();

function git(args, cwd) {
  try {
    return execSync(`git ${args}`, { cwd, stdio: ["ignore", "pipe", "pipe"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function normalize(p) {
  return p.replace(/\\/g, "/").toLowerCase();
}

const findings = { blocks: [], warns: [], info: [] };

const toplevel = git("rev-parse --show-toplevel", targetDir);

if (!toplevel) {
  findings.blocks.push(
    `"${target}" is not inside a git repository. Do not write here — pick a target ` +
      `under ${ESTATE_ROOT}\\repos\\<repo> first (AGENTS.md §0).`
  );
} else {
  const toplevelWin = toplevel.replace(/\//g, "\\");
  findings.info.push(`toplevel: ${toplevelWin}`);

  if (normalize(toplevel) === normalize(ESTATE_ROOT)) {
    findings.blocks.push(
      `Git resolves to the estate control plane itself (${ESTATE_ROOT}). This is a shared, ` +
        `read-mostly control-plane repo — not a product repo. Stop and pick a child repo under ` +
        `${ESTATE_ROOT}\\repos\\<repo> before writing (AGENTS.md §0).`
    );
  }

  const remote = git("remote get-url origin", toplevel);
  if (!remote) {
    findings.warns.push(
      "No 'origin' remote on this repo — work here has no GitHub-backed durability yet."
    );
  } else {
    findings.info.push(`origin: ${remote}`);
    if (!/frankxai|arcanea-labs/i.test(remote)) {
      findings.warns.push(
        `origin (${remote}) is not under the frankxai / Arcanea-Labs org — confirm this is intentional.`
      );
    }
  }

  const branch = git("branch --show-current", toplevel);
  findings.info.push(`branch: ${branch || "(detached HEAD)"}`);
  if (branch && !/^(agent\/|codex\/|fix\/|feat\/)/.test(branch) && !["main", "master"].includes(branch)) {
    findings.warns.push(
      `Branch "${branch}" doesn't match the lane convention (agent/<harness>/<scope> or codex/*). ` +
        `Confirm this is a dedicated lane, not shared main.`
    );
  }
  if (["main", "master"].includes(branch || "")) {
    findings.warns.push(
      `On "${branch}" directly. AGENTS.md §1 requires one agent = one branch/worktree — ` +
        `commits belong on a dedicated lane, not directly on ${branch}.`
    );
  }

  // Worktree-location convention check
  const gitDir = git("rev-parse --git-dir", targetDir);
  const commonDir = git("rev-parse --git-common-dir", targetDir);
  const isWorktree = gitDir && commonDir && path.resolve(targetDir, gitDir) !== path.resolve(targetDir, commonDir);

  if (isWorktree) {
    const normTarget = normalize(toplevel);
    const normCanonical = normalize(CANONICAL_WORKTREE_ROOT);
    if (!normTarget.startsWith(normCanonical)) {
      findings.warns.push(
        `This is a git worktree but its path is NOT under the canonical root ` +
          `(${CANONICAL_WORKTREE_ROOT}). Non-canonical patterns seen on this estate: ` +
          `repos\\<repo>\\.worktrees\\, repos\\.codex-worktrees\\, bare drive roots (C:\\fxm). ` +
          `New worktrees must be created as ${CANONICAL_WORKTREE_ROOT}\\<repo>-<scope>.`
      );
    }
  }
}

// Routing says WHERE you may write. It cannot say whether another harness is already writing
// there right now — that is what let 23 PRs rewrite the same homepage while every one of them
// passed this check. Ask the cross-harness lane ledger too.
{
  const repoDir = git("rev-parse --show-toplevel", targetDir);
  if (repoDir) {
    const repo = path.basename(repoDir);
    const rel = path.relative(repoDir, target).replace(/\\/g, "/") || ".";
    try {
      // execFileSync, not a shell string: repo and rel come from the filesystem and a path
      // containing a quote or an ampersand would otherwise be interpreted by the shell.
      execFileSync(
        process.execPath,
        [path.join(__dirname, "lane.mjs"), "check", "--repo", repo, "--paths", rel, "--quiet"],
        { stdio: ["ignore", "pipe", "pipe"] }
      );
      findings.info.push(`no other harness holds a lane over ${repo}/${rel}`);
    } catch (e) {
      const out = String(e.stderr ?? "").trim();
      // Exit 3 is a real conflict. Any other failure means the ledger could not answer, which is a
      // warning — a missing ledger must not block every write in the estate.
      if (e.status === 3) findings.blocks.push(`another harness holds a live lane here.\n         ${out.split("\n").join("\n         ")}\n         Claim your own slice, or coordinate: node tools/lane.mjs list`);
      else findings.warns.push(`lane ledger unreadable (${e.status}) — collision protection is OFF for this write`);
    }
  }
}

const lines = [];
lines.push(`verify-lane: ${target}`);
findings.info.forEach((l) => lines.push(`  info : ${l}`));
findings.warns.forEach((l) => lines.push(`  warn : ${l}`));
findings.blocks.forEach((l) => lines.push(`  BLOCK: ${l}`));
lines.push(findings.blocks.length ? "RESULT: BLOCK" : findings.warns.length ? "RESULT: PASS (with warnings)" : "RESULT: PASS");
console.log(lines.join("\n"));

process.exit(findings.blocks.length ? 1 : 0);
