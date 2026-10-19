#!/usr/bin/env node
/**
 * Starlight Queen — CLI Runner for Continuous Immune Sweeper and Review Receipts
 *
 * Usage:
 *   node --import tsx tools/queen/immune-sweeper.mjs --sweep
 *   node --import tsx tools/queen/immune-sweeper.mjs --route --title "Fix navbar" --files "src/app/nav.tsx"
 *   node --import tsx tools/queen/immune-sweeper.mjs --receipt --repo "frankxai/Starlight-Intelligence-System" --pr 430 --head <sha> --maker codex --provider cto --files "a.ts,b.ts" --review-file review.md --resolution "<what the reviewer verified>"
 *
 * Receipts have no defaults. Only the reviewing seat runs --receipt, with its own written
 * report. Posting stays with the trusted GitHub Apps that merge_review_gate.py admits.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { existsSync, readFileSync, lstatSync, realpathSync } from 'node:fs';
import { dirname, join, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  createReviewReceipt,
  routeSwarmTask,
  runImmuneSweep,
} from '../../src/queen/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const fileList =
    typeof args.files === 'string'
      ? args.files
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  if (args.receipt) {
    // No defaults: a receipt attests that a named reviewer read this exact head.
    // The tool must never invent the review, the seats, or the resolution.
    const required = ['repo', 'pr', 'head', 'maker', 'provider', 'review-file', 'resolution', 'files'];
    const missing = required.filter((key) => typeof args[key] !== 'string' || !args[key].trim());
    if (missing.length > 0) {
      process.stderr.write(
        `Refusing to build a receipt. Missing: ${missing.map((k) => `--${k}`).join(', ')}.\n` +
          'The reviewer must supply their own written report (--review-file) and resolution.\n',
      );
      return 2;
    }
    const reviewPath = String(args['review-file']);
    if (!existsSync(reviewPath)) {
      process.stderr.write(`Review file not found: ${reviewPath}\n`);
      return 2;
    }

    const { body } = createReviewReceipt({
      repository: String(args.repo),
      pr: Number(args.pr),
      headSha: String(args.head),
      maker: String(args.maker),
      provider: String(args.provider),
      reviewedFiles: fileList,
      review: readFileSync(reviewPath, 'utf8'),
      resolution: String(args.resolution),
    });
    process.stdout.write(`${body}\n`);
    return 0;
  }

  if (args.route) {
    if (!['codex', 'claude-code', 'antigravity', 'cto', 'jules', 'grok', 'dependabot', 'github-actions'].includes(args.maker) ||
        typeof args.ram !== 'string' || typeof args.agents !== 'string' ||
        !Number.isFinite(Number(args.ram)) || Number(args.ram) < 0 ||
        !Number.isInteger(Number(args.agents)) || Number(args.agents) < 0) {
      process.stderr.write('Routing requires --maker and finite --ram / integer --agents telemetry.\n');
      return 2;
    }
    const plan = routeSwarmTask(
      {
        maker: args.maker,
        id: String(args.id || 'cli-task'),
        repo: String(args.repo || 'frankxai/Starlight-Intelligence-System'),
        title: String(args.title || 'Swarm task'),
        description: String(args.description || args.title || ''),
        scopeFiles: fileList,
      },
      {
        freeRamGb: Number(args.ram),
        activeLocalAgents: Number(args.agents),
      },
    );
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return 0;
  }

  if (fileList.length === 0) {
    process.stderr.write('Sweep requires an explicit non-empty --files scope. No files were audited.\n');
    return 2;
  }
  for (const relPath of fileList) {
    const fullPath = join(REPO_ROOT, relPath);
    const relativePath = relative(REPO_ROOT, fullPath);
    if (isAbsolute(relPath) || relativePath === '..' || relativePath.startsWith(`..${sep}`) ||
        !existsSync(fullPath) || !lstatSync(fullPath).isFile() ||
        relative(REPO_ROOT, realpathSync(fullPath)).startsWith(`..${sep}`)) {
      process.stderr.write(`Sweep scope must name existing regular files inside the repository: ${relPath}\n`);
      return 2;
    }
  }
  const samples = fileList
    .map((relPath) => {
      const fullPath = join(REPO_ROOT, relPath);
      if (!existsSync(fullPath)) return null;
      return {
        path: relPath,
        content: readFileSync(fullPath, 'utf8'),
      };
    })
    .filter((item) => item !== null);

  const report = runImmuneSweep({
    repoRoot: REPO_ROOT,
    files: samples,
    changedPaths: fileList,
    autoMergeArmed: Boolean(args.automerge),
  });

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report.healthy ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
