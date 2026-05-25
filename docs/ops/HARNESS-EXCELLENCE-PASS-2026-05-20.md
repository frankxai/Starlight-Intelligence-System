# Harness Excellence Pass — 2026-05-20

## Scope

Expanded repair pass across Starlight Intelligence System and Agentic Creator OS after the initial harness refresh.

Primary concern: make Codex, Gemini, Antigravity, OpenCode, site, console, and ACOS MCP workspaces truthful, buildable, and gated by repeatable checks.

## Starlight Intelligence System

Fixed live drift in public/operator surfaces:

- `DELIVERY.md` and `ONBOARDING.md` now publish the current 47-agent / 71-skill-rule / 6-vault reference build, SIP v1.1.1, and v8.0.0 reference surface.
- `context/STATE.md` no longer carries stale 69-skill / 42-agent diagnostic claims in load-bearing current-state rows.
- `site/content/explainer.md` no longer claims the old v7.3/v1.1.0 public explainer state or outdated harness coverage.
- `site/src/lib/sip.ts` fallback is now v1.1.1, matching the canonical SIP version if the spec file is unreadable.

Previously completed in the same pass:

- Harness count logic derives agents, skills, and vaults from source instead of static expectations.
- Antigravity is included in platform-prompt symmetry coverage.
- Site and console lint/build are part of root `npm run verify`.

Verification:

- `npm run verify` passed.
- `npm run agents:harness-check` passed earlier in the pass.
- `node --import tsx --test test/v80-platform-prompts.test.ts` passed earlier in the pass.

## Agentic Creator OS

Fixed setup and platform coverage:

- Added `npm run harness:check` and `npm run verify`.
- `.agent-harness.json` now points at `npm run verify`.
- New `scripts/check-agent-harness.mjs` checks v11 identity, real health command, platform adapter docs, installer routes, Windows-safe MCP build scripts, and LF line endings for `install.sh`.
- `install.sh` now supports `--platform=codex`, `--platform=antigravity`, and `--platform=opencode`.
- `install.sh --platform=all` now generates all portable context files, not only detected local platforms.
- Installer path handling now supports Windows `C:/...` paths under WSL/Git Bash and fails fast on mangled `C:Users...` paths.
- `install.sh` line endings normalized to LF so Bash execution works.
- ACOS README, QUICKSTART, adapter docs, package metadata, and CLAUDE context now publish Codex/Gemini/Antigravity/OpenCode surfaces.

Fixed build/security issues:

- All seven MCP workspaces build via Windows-safe esbuild scripts.
- Website MCP invalid TypeScript dependency keys were corrected.
- Vulnerable dependency set resolved: `npm audit --json` reports 0 vulnerabilities.
- `esbuild` upgraded to `^0.28.0` where directly declared.
- `nodemailer` upgraded to `^8.0.7`.

Verification:

- `npm run verify` passed.
- `npm audit --json` reports 0 vulnerabilities.
- Installer smoke generated:
  - `AGENTS.md` for Codex
  - `GEMINI.md` for Gemini
  - `.antigravity/instructions.md` for Antigravity
  - `AGENTS.md` + `opencode.json` for OpenCode

## Remaining Notes

- SIS still has many historical docs mentioning old versions and counts. Those were not rewritten when they are clearly archival handovers, changelogs, or research snapshots.
- SIS verify still emits the expected Next.js edge-runtime static-generation warning for dynamic edge routes; it does not fail the build.
- The working trees had unrelated pre-existing dirty changes before this pass. This pass did not revert them.

## 2026-05-21 Upgrade

Raised the bar from "builds pass" to "harness + audit + build pass" for both repos.

SIS:

- Added `audit:all`.
- Root `npm run verify` now runs `agents:harness-check`, root audit, site audit, console audit, TypeScript, tests, root build, site lint/build, and console lint/build.
- Added `site/package-lock.json` and `console/package-lock.json`.
- Upgraded both site and console from `next@16.2.3` to `next@16.2.6`.
- Added npm overrides for Next's nested `postcss` to `8.5.10`, resolving the remaining moderate PostCSS advisory.
- Refreshed site and console installed dependency trees with `npm ci --ignore-scripts`.
- Updated README development commands from pnpm to the repo's actual npm workflow.
- Verification passed: SIS `npm run verify`; all three audits report zero vulnerabilities.

ACOS:

- `npm run verify` now runs harness check, `npm audit`, and all MCP workspace builds.
- ACOS harness expectation updated to require the audit step.
- Verification passed: ACOS `npm run verify`; audit reports zero vulnerabilities.
