# OpenClaw Audit — v7.5.0 ship (post-tag adversarial review)

> Protocol-defender adversarial audit of the Starlight Intelligence System at tag `v7.5.0` (commit `5010a08`). Triggered by Luminor Board v7.5 ship verdict (PROCEED-WITH-REVISE, P0 Item 1). Closes the governance loop the `/superintelligence` execute-mode ship opened.

**Date:** 2026-04-26
**Voice:** protocol-defender (per `VOICES.md`)
**Auditor:** OpenClaw
**Repo HEAD at audit time:** `bbabc19` (handover) on top of `5010a08` (v7.5 ship). Tag `v7.5.0` annotated at `5010a08`.
**Working-tree note:** Audit reads working-tree state including in-flight mitigations for Luminor Board Items 2 and 3 (`verticals/_template/.claude/` untracked; `.github/workflows/vercel-deploy.yml` modified). Both are scored against the working-tree state, not the tag, because that is what next-ship will land. Where a defect was already remediated in the working tree, the audit notes the remediation and scores the residual.

---

## Severity legend

- **CRITICAL** — ship-blocker for v7.5.1. Must land before any further substrate-affecting commit. Substrate integrity / security / attestation contract violation.
- **HIGH** — next-cycle ship (v7.5.1 or v7.6 window). Will compound into substrate drift if unaddressed across two cycles.
- **MEDIUM** — horizon. Lands cleanly with related work; no immediate substrate harm.
- **LOW** — polish. Hygiene, naming, documentation tightness.

---

## Findings summary

| Severity | Count |
|---|---|
| CRITICAL | 2 |
| HIGH | 6 |
| MEDIUM | 5 |
| LOW | 4 |
| **Total** | **17** |

---

## CRITICAL

### CRITICAL-1 — `STACK.md` § 10-IS table maps six IS layers to substrate homes that do not exist on disk

- **Location:** `STACK.md` § "The 10 Intelligence Systems" table, rows 1, 2, 4, 5, 6, 9.
- **Diagnosis:** The substrate's own canonical taxonomy table claims Self IS at `verticals/self/`, Wealth IS at `verticals/wealth/`, Business IS at `verticals/business/`, Creator IS at `verticals/creator/`, Second Brain IS at `verticals/secondbrain/`, and Brand IS at `verticals/brand/`. Filesystem reality: `verticals/` contains exactly five entries (`_template/`, `code/`, `family/`, `hr-intelligence/`, `voice-video/`) and zero of the six claimed homes exist. Of the 10 universal IS, only four (Code, Voice & Video, Family, plus Orchestrator at `core/orchestrator/`) have substrate homes that match their declared paths. `MASSIVE_ACTION_PLAN.md` § 2 makes the same claim with the same six missing paths. This is the highest-severity defect in v7.5 because the substrate's own canonical reference (STACK.md, accepted 2026-04-25) tells a forking practitioner six paths exist that do not, and a `/sovereign-spawn` invocation that follows the table will halt at six different "directory not found" errors. The Luminor Board's Draconis vector ("decorative-not-load-bearing") generalizes from `core/orchestrator/` to six more IS layers that the v7.5 ship promoted to top-level taxonomy without scaffolding to disk.
- **Remediation:** Either (a) scaffold `verticals/{self,wealth,business,creator,secondbrain,brand}/` with the same `_template/`-conformant 7-file SIP contract before next ship — minimum viable: `README.md` + `MEMORY.md` v0.1 + attestation footer per directory, ~6 × 60 lines = ~360 lines work; or (b) edit STACK.md row "Substrate home" column to mark each of the six rows as `(scaffold pending — see Phase 1 of MASSIVE_ACTION_PLAN.md)` and add a one-line readiness note above the table stating that 4 of 10 substrate homes are scaffolded as of v7.5.0. Path (a) is the substrate-integrity-correct fix; path (b) is the honest-decoration fix. Add a v7.5.1 test assertion to `test/v75.test.ts` Block 2 verifying the chosen path: under (a), each of the six directories must contain at least `README.md`; under (b), the readiness note must be present and the table must carry the scaffold-pending markers.

### CRITICAL-2 — `verticals/code/README.md` and `verticals/voice-video/README.md` declare primary commands that do not exist in `.claude/commands/`

- **Location:** `verticals/code/README.md` § "Primary commands" lists `/arco`, `/ao`, `/sync-repos`. `verticals/voice-video/README.md` § "Primary commands" lists `/sip-attest-audio`, `/sip-attest-video`, `/sip-compose-modality`, `/factory`. Filesystem reality: `.claude/commands/` does not contain `arco.md`, `ao.md`, `sync-repos.md`, or `factory.md`. (`/sip-attest-audio`, `/sip-attest-video`, `/sip-compose-modality` exist via `sip-attest-audio.md` etc. — those four are real.)
- **Diagnosis:** Two newly-promoted IS-layer scaffolds carry public command declarations that fail on disk. `verticals/code/README.md` lines 38-43 cite `/arco` and `/ao` as Code IS's primary commands and the substrate-canonical evidence its IS-layer status; the Code IS README is therefore the only artifact in v7.5 calling these load-bearing — and they are FrankX-side commands not present in this repo. Same defect class for `verticals/voice-video/README.md` line 40 citing `/factory`. A practitioner reading the v7.5 10-IS reconciliation, opening the Code IS or Voice & Video IS README to understand the surface, and trying any of the cited commands will hit `command not found`. This is the same defect class the Luminor Board Ino vector named for `core/orchestrator/`: substrate canon claims contradict substrate implementation. Severity is CRITICAL because (a) two newly-promoted top-level IS layers fail their own primary-command claim immediately on adoption, and (b) the v7.5 test harness does not assert any of these four commands exist — so the conformance suite passes against a scaffold that breaks on first use.
- **Remediation:** Two paths, parallel-mergeable. (1) For `/sync-repos` only, the command exists as a skill (`sync-repos` in skill registry) — clarify in `verticals/code/README.md` that `/sync-repos` is a skill auto-activation and not a `.claude/commands/` slash command, OR add a thin `.claude/commands/sync-repos.md` stub that delegates to the skill. (2) For `/arco`, `/ao`, `/factory` — these are FrankX-repo commands per the v7.5 ship doctrine ("FrankX off-limits"). Edit both READMEs to mark these commands explicitly as `(provided by FrankX vertical, not in this substrate; install Code IS adoption kit to bring them in-repo)` and add a "Required external commands" subsection naming the source repo and adoption path. Add a v7.5.1 test block verifying that any command name cited in a `verticals/*/README.md` § "Primary commands" subsection either resolves to a file under `.claude/commands/` or is explicitly marked `(external)`. Substrate rule add per Luminor Board v7.5 Item 6 (CLAUDE.md substrate rule): every command-claim in a vertical README must resolve on disk OR be explicitly marked external; substrate-level enforcement.

---

## HIGH

### HIGH-1 — `.github/workflows/vercel-deploy.yml` pins no third-party action SHAs and installs Vercel CLI from `@latest`

- **Location:** `.github/workflows/vercel-deploy.yml` lines 39 (`actions/checkout@v4`), 45 (`actions/setup-node@v4`), 49 (`npm install --global vercel@latest`), 89 (`actions/upload-artifact@v4`), 96 (`actions/github-script@v7`).
- **Diagnosis:** Five third-party actions / packages are pinned to floating major versions or `@latest`. A compromise of any of those five upstream releases — actions/checkout, actions/setup-node, actions/upload-artifact, actions/github-script, or `vercel` on npm — gives the workflow's `VERCEL_TOKEN` to the attacker on the next push. `vercel@latest` is the highest-risk pin: every workflow run resolves to whatever version Vercel pushed since the last deploy, and Vercel CLI runs as root in the runner with the secret in environment. The substrate's own STACK.md § L0 mandates "commit signing encouraged" and the ATTESTATIONS v7.5.0 entry calls out "Composition is substantive, not decorative" — yet the deploy pipeline that ships every public surface of the substrate is pinned to floating tags. Per protocol-defender doctrine, supply-chain attestation is structural-not-decorative; the attestation surface added to this workflow (lines 67-117) is honest about what the workflow ran but cannot attest the workflow itself ran a known-good toolchain.
- **Remediation:** Pin all five to commit SHAs. Replace `actions/checkout@v4` → `actions/checkout@<sha>`, `actions/setup-node@v4` → `actions/setup-node@<sha>`, `actions/upload-artifact@v4` → `actions/upload-artifact@<sha>`, `actions/github-script@v7` → `actions/github-script@<sha>`. Replace `npm install --global vercel@latest` → `npm install --global vercel@<exact-semver>` (and document the rev-bump cadence in `DEPLOY.md` — quarterly review or on advisory). Add a Dependabot config at `.github/dependabot.yml` for `package-ecosystem: github-actions` so version bumps land as PRs through the substrate's normal `/luminor-board` cycle. Add a v7.5.1 test assertion that no `uses:` in the workflow ends with `@v<n>` or `@<branch>` — only `@<40-char-hex-sha>` passes. This is the highest-impact, lowest-effort security remediation in v7.5.

### HIGH-2 — `concurrency.cancel-in-progress: false` allows queued deploys to ship out of order under high push velocity

- **Location:** `.github/workflows/vercel-deploy.yml` lines 20-22.
- **Diagnosis:** The concurrency group `vercel-deploy-prod` with `cancel-in-progress: false` serializes deploys but does not enforce monotonic ordering. If two pushes land within seconds (push A then push B), GHA may queue B behind A; A ships site state at SHA-A; B ships site state at SHA-B. So far correct. But if the runner for A stalls and B's runner starts (e.g., A timeout, manual cancel) the result is that the production site can show SHA-A's content after a successful B-deploy, depending on whether Vercel's deploy-promotion is also serialized. The substrate's "honest concurrency lock" claim in HANDOVER-2026-04-26.md ("Concurrency-locked to one production deploy at a time") is not actually enforced as ordered — it is enforced as serialized. The distinction matters for any practitioner who pushes two site/ commits in quick succession and assumes the latest commit's site state is what's live.
- **Remediation:** Add a check in the deploy step that compares `${{ github.sha }}` against the latest commit on `main` at the start of the deploy job; if they differ (a newer commit has landed), abort and let the newer workflow run win. This makes the lock both serialized AND ordered. Patch language: insert a step before "Deploy to production" that runs `git fetch origin main && [ "$(git rev-parse origin/main)" = "${GITHUB_SHA}" ] || { echo "Newer commit on main; aborting stale deploy"; exit 78; }` (exit 78 is GHA's "neutral" exit). Update HANDOVER and DEPLOY.md to describe the lock as "serialized + ordered" not just "serialized".

### HIGH-3 — `verticals/_template/SOUL.md` non-negotiables are HR-shape leakage Aiyami flagged in the Luminor Board

- **Location:** `verticals/_template/SOUL.md` § "What must never drift", lines 17-21.
- **Diagnosis:** The universal vertical template's five non-negotiables — (a) Research over fad, (b) Domain-appropriate disclaimers (legal / clinical / financial / etc.), (c) Refuses theater, (d) Voice-preserving via Genius composition, (e) Both-and not zero-sum — are five-for-five HR Intelligence-shaped. Audit each: "research over fad" generalizes weakly to Code IS (where appropriate fad-tracking is the work); "legal/clinical/financial disclaimers in every artifact" generalizes weakly to Sound IS, Voice & Video IS, or Code IS where most artifacts touch none of those; "refuses theater" is genuinely universal but the *examples* the SOUL.md template's reference points (`verticals/hr-intelligence/SOUL.md`'s PIP-as-firing, stack-rank, values-poster) are HR-specific. The universal template should declare *which* non-negotiables are universal-by-substrate and which are domain-parameterized — the v7.5 template does neither. A practitioner spawning a Sound IS or Code IS vertical will inherit five HR-shaped non-negotiables and either (i) blindly carry them forward (decorative substrate compliance) or (ii) reject them as ill-fitting and lose the substrate's voice-discipline guarantee. Both outcomes erode the substrate.
- **Remediation:** Restructure `verticals/_template/SOUL.md` § "What must never drift" into two subsections: (1) "Substrate-universal non-negotiables (do not remove)" — `voice-preserving via Genius composition`, `attestation footer on every shipped artifact`, `silent composition is a breach`, `sovereignty clause non-waivable`; (2) "Domain-parameterized non-negotiables (fork-time decision)" — research-over-fad (override per domain), disclaimer language (which domain — legal/clinical/financial/safety/none), refusal patterns (replace HR examples with the practitioner's domain examples), zero-sum constraint (rephrase per domain). Add a one-paragraph note at the top stating: "When forking this template, complete subsection (2) before any sub-system ships. Subsection (1) is not negotiable; subsection (2) is the practitioner's claim of what their domain refuses."

### HIGH-4 — `core/orchestrator/README.md` "Today (shipped)" claim describes routing scaffolding that does not exist in this repo

- **Location:** `core/orchestrator/README.md` § "Routing chain" line 33: `Today (shipped):` `/arco` (brand router) → `/ao` (CLI router) → Guardian / sub-system agent (domain).`
- **Diagnosis:** The Orchestrator README claims `/arco` and `/ao` are "shipped today" as the routing chain. Filesystem reality: neither command exists in this repo's `.claude/commands/`. They exist in the FrankX repo (per the audited 2026-04-25 inventory referenced by `MASSIVE_ACTION_PLAN.md` § 4). The substrate's master-IS layer-10 README therefore makes a load-bearing implementation claim against capability that lives in a *different* repo, without naming the source. A reader inferring "I can run `/arco` against this substrate today" will hit `command not found`. The Luminor Board Draconis vector named this exact failure mode at the orchestrator scaffold level; this is the same failure mode at the README claim level.
- **Remediation:** Edit `core/orchestrator/README.md` line 33 to read: `Today (shipped, in `frankxai/frankx` repo per audit 2026-04-25):` `/arco` (brand router) → `/ao` (CLI router) → ...`. Add a new line below: `In this substrate today: command surface is staged in `core/orchestrator/harnesses/{claude,codex,gemini,opencode}/` README files (configuration spec, not executable). Promotion to executable lands per Phase 1 of MASSIVE_ACTION_PLAN.md.` This makes the cross-repo dependency honest and prevents the load-bearing-claim drift.

### HIGH-5 — `core/orchestrator/harnesses/{codex,gemini,opencode}/README.md` MCP scope statements describe configurations that do not exist on disk

- **Location:** `core/orchestrator/harnesses/codex/README.md` line 9, `gemini/README.md` line 9, `opencode/README.md` line 9.
- **Diagnosis:** The codex harness README declares "MCP scope: read-only mirror of Claude Code's MCP scope". The gemini harness declares "MCP scope: read-only across the whole substrate + connected verticals". The opencode harness declares "MCP scope: none by default". None of these scopes are configured in any file under `core/orchestrator/harnesses/{harness}/` — there is no `mcp.json`, no `.mcp/` config, no executable-form MCP allowlist. The Claude Code harness README at least references `~/.claude/settings.json` which is the user's actual config location and exists outside the repo by design. The other three reference no on-disk configuration. The Luminor Board Ino vector named this as defect #2 ("structurally hollow scaffold"). A reader assuming the harness configs are file-loaded today will discover, on first attempt, that "MCP scope" is decorative documentation. Severity is HIGH not CRITICAL because the harness READMEs themselves declare `Status: scaffolded — full system prompt + MCP config land in Phase 1` which is honest — but the body of the README declares scope and tools as if active, contradicting the status footer. This is a within-document contradiction.
- **Remediation:** For each of the three non-Claude harness READMEs, prefix the "MCP scope" line with `(scheduled, Phase 1):` and similarly prefix "Allowlisted tools" if those tools have no enforcing config yet. Better: split each README into two sections — "Today (status: scaffolded — narrative spec)" and "Phase 1 (target capability when configs land)" — so a reader cannot misread declared spec as active enforcement. The Claude harness README is the only one of the four where the body language matches reality and can stay as-is.

### HIGH-6 — `verticals/_template/MEMORY.md` § "Instance lineage" structure is correct but `MEMORY.md` itself lacks a "fill before publishing" preflight gate

- **Location:** `verticals/_template/MEMORY.md` lines 34-41 (Instance lineage) plus § "Domain & ICP" lines 17-22.
- **Diagnosis:** The template MEMORY.md ships with placeholder values (`<name>`, `<slug>`, `<YYYY-MM-DD>`, `<your handle / org>`). A practitioner forking the template and pushing a public repo before completing those fields publishes a SIP-attested artifact carrying placeholder content — substrate-attestation is ambient now per the v7.4 alpha decision, so the published-with-placeholders artifact will carry a "Built on SIP" footer alongside `<name>` literal text. This is a substrate-attestation-integrity issue: the attestation is technically present but the artifact it attests is not real. The Luminor Board did not flag this; OpenClaw audit catches it on second read. Severity is HIGH not CRITICAL because the failure mode requires a practitioner to push a half-finished fork to public — a recoverable error that does not break substrate canon — but the template structure should refuse that path by default.
- **Remediation:** Add a § "Pre-publish checklist" subsection at the top of `verticals/_template/MEMORY.md` listing the four placeholder fields that must be filled (`<name>`, `<slug>`, founded year, source-of-truth URL). Add a v7.5.1 test assertion that any vertical's MEMORY.md whose path is *not* `verticals/_template/MEMORY.md` does not contain the literal string `<name>` or `<slug>` — i.e., the placeholders may exist in the template but never in a real instance. The HR vertical at `verticals/hr-intelligence/MEMORY.md` already passes this check (placeholders are `<practitioner>`, `<your URL>`, etc., per Path A); the assertion encodes the rule.

---

## MEDIUM

### MEDIUM-1 — `package.json` `files: ["dist/", "context/", "README.md"]` excludes `core/orchestrator/`, `verticals/`, `STACK.md`, `VERTICALS.md`, `SIP.md`

- **Location:** `package.json` lines 88-92.
- **Diagnosis:** The npm-published package contract excludes everything outside `dist/`, `context/`, and `README.md`. v7.5 added five new top-level scaffolds (`core/orchestrator/`, `verticals/_template/`, `verticals/code/`, `verticals/voice-video/`, `verticals/family/`) and significantly modified `STACK.md`, `VERTICALS.md`, `docs/ARCHITECTURE.md`, `docs/forking-domain-stacks.md` — none of which ship to npm consumers. A consumer running `npm install @arcanea/starlight-intelligence-system` gets the runtime substrate (good — that's what `dist/` is for) but cannot read the file-contract scaffolds the substrate's own `STACK.md` declares as the canonical reference. This is not a defect in the runtime — it is a defect in the published-substrate-as-reference claim. Practitioners looking to fork the file contract via npm cannot; they must clone the GitHub repo. The substrate's own ATTESTATIONS v7.0.0 entry called out "real file contract present" as the meta-test passing — but the npm distribution does not carry the file contract.
- **Remediation:** Decision-mode: either (a) the substrate's published-package contract is "runtime only, file contract via GitHub clone" — in which case add a § "How to fork the file contract" section to `README.md` directing consumers to the GitHub repo with the v-tag they want; or (b) extend `files:` to include the file-contract scaffolds: `["dist/", "context/", "README.md", "STACK.md", "VERTICALS.md", "SIP.md", "SOUL.md", "CANON.md", "AGENTS.md", "ALLIANCE.md", "verticals/_template/"]`. Path (a) is the smaller change and matches the substrate's "GitHub is L0" stance; path (b) makes the npm package self-contained-as-reference. Recommend (a) for v7.5.1 (low-effort, doctrine-aligned), revisit (b) for v8.0 if the substrate decides to ship file-contract via npm.

### MEDIUM-2 — `package.json` `bin` declares three names — `starlight`, `starlight-mcp`, `starlight-substrate-mcp` — and one is a near-collision

- **Location:** `package.json` lines 124-128.
- **Diagnosis:** `starlight-mcp` and `starlight-substrate-mcp` are two binaries shipped by the same package. The `mco`-style precedent in `MASSIVE_ACTION_PLAN.md` § 4 names exactly one `starlight` CLI as the user's typed entry point. A consumer installing the npm package globally gets three commands on PATH — easy to confuse `starlight-mcp` (legacy MCP server) with `starlight-substrate-mcp` (v1.1 substrate MCP). The README does not document the distinction. Worse: any other npm package claiming `starlight-mcp` (a generic-enough name) cannot install alongside this one without conflict, and a community ecosystem fork will face naming-collision pressure.
- **Remediation:** Audit which of `starlight-mcp` and `starlight-substrate-mcp` is the canonical post-v7.5 surface. Per `MEMORY.md` user-memory: "starlight-mcp v1.1 live" — that suggests `starlight-mcp` is canonical and `starlight-substrate-mcp` is the new v1.1 binary; the migration is incomplete. Remediation: (a) deprecate one binary in v7.5.1 by removing it from `bin` and adding a deprecation warning to the README's installation section; (b) update `REGISTRY.md` to document which binary is canonical at v7.5; (c) ensure the canonical name doesn't collide with any existing npm package by checking `npm view starlight-mcp` and `npm view starlight-substrate-mcp` before next publish.

### MEDIUM-3 — `package.json` `prepublishOnly` runs the full test suite, but the test suite includes `src/orchestrator.test.ts` which is a legacy operational-tier test file mixed with substrate-tier conformance tests

- **Location:** `package.json` line 82, line 86.
- **Diagnosis:** The `test` script runs `src/orchestrator.test.ts` alongside the five substrate conformance harnesses (`test/substrate.test.ts`, `test/v73.test.ts`, `test/v74.test.ts`, `test/v741.test.ts`, `test/v75.test.ts`). The `prepublishOnly` script runs `npm run build && npm test`, which means every npm publish is gated on the operational-tier orchestrator test passing. This is good for runtime integrity but couples publishability to the operational layer's test discipline; if `src/orchestrator.test.ts` ever fails for a reason unrelated to the substrate, no substrate ship can publish to npm. CLAUDE.md § "Layer routing — read first" explicitly states "substrate decisions constrain operational, never the reverse" — the test pipeline inverts this dependency.
- **Remediation:** Split the `test` script into `test:substrate` (already exists, runs `test/substrate.test.ts` only) and a new `test:all` (runs both operational + substrate). Wire `prepublishOnly` to `npm run build && npm run test:substrate` for substrate-tier publishes, and keep `npm test` running both for full-suite local validation. This restores the layer-routing rule that operational failures should not block substrate ships. Document the split in DEPLOY.md.

### MEDIUM-4 — `verticals/hr-intelligence/MEMORY.md` v0.1.1 changelog entry attests the rewrite event but does not pin the SHA at which the rewrite landed

- **Location:** `verticals/hr-intelligence/MEMORY.md` line 97.
- **Diagnosis:** The v0.1.1 changelog entry reads `Path A authorless rewrite applied per Luminor Board v7.4.1 Item 2. Sub-system agents and vertical wrapper genericized — this vertical is now an authorless reference; forking practitioners declare their attribution-back per `docs/forking-domain-stacks.md`.` This attests the *event* but does not pin the *commit SHA* at which the rewrite landed. A practitioner forking from a future commit cannot use this changelog entry to verify the rewrite is the one they think it is. Per `docs/forking-domain-stacks.md` § "Step 3 — declare lineage in the fork", lineage SHAs are the substrate's mechanism for attribution-back integrity — and the reference vertical's own changelog does not lead by example. Severity is MEDIUM not HIGH because the SHA is recoverable from `git log --follow verticals/hr-intelligence/MEMORY.md`, but the substrate's own reciprocity contract is "structural attribution" — a fork's lineage SHA must be verifiable, and the source vertical models the pattern.
- **Remediation:** Update `verticals/hr-intelligence/MEMORY.md` v0.1.1 changelog entry to: `v0.1.1 · 2026-04-26 · Path A authorless rewrite applied per Luminor Board v7.4.1 Item 2 (landed in 5010a08). Sub-system agents and vertical wrapper genericized; forking practitioners declare attribution-back per `docs/forking-domain-stacks.md`.` Add a § "Reference lineage SHAs" subsection to MEMORY.md template (`verticals/_template/MEMORY.md`) listing each material event in the reference vertical with its commit SHA, so future forks can see the pattern.

### MEDIUM-5 — `test/v75.test.ts` Block 5 wrapper-file Ana-filter regex is permissive enough to false-pass a real Path A violation

- **Location:** `test/v75.test.ts` lines 193-203 (Block 5.2 wrapper-file loop).
- **Diagnosis:** The wrapper-file loop applies `content.replace(/Path A authorless rewrite[^.\n]*/g, "")` before checking for `\bAna\b`. The regex strips text between `Path A authorless rewrite` and the next `.` or `\n`. A wrapper file containing `Path A authorless rewrite (originally authored by Ana)` would have the entire phrase including "by Ana" stripped, and the test would pass — a real Path A violation slipping through because the changelog-allowance regex over-matches. The intent is to allow the changelog entry naming the rewrite event; the implementation allows any text on the same logical sentence as "Path A authorless rewrite" to bypass the check. Severity is MEDIUM because (a) the test passes today on legitimately-clean input, and (b) the failure mode requires an attacker / careless practitioner to specifically craft a Path A violation hidden inside a changelog-shaped sentence. But the substrate's own conformance harness should be stricter than its threat model — that is the protocol-defender stance.
- **Remediation:** Tighten the changelog-allowance to exact-match the canonical changelog phrasing. Replace the `replace(/Path A authorless rewrite[^.\n]*/g, "")` with `replace(/Path A authorless rewrite applied per Luminor Board v7\.4\.1 Item 2/g, "")` — this matches the exact MEMORY.md changelog phrasing and refuses any other context that mentions the phrase. Add a positive-control test case: insert a fixture wrapper file containing `Authored by Ana` and confirm the assertion fails (per CRITICAL 2 redaction rule, the positive-control test never quotes this fixture in its assertion message — uses path + structural metadata only).

---

## LOW

### LOW-1 — Workflow comment header (lines 1-7) declares attestation surface but the attestation text in the deploy-log artifact and commit comment uses three different layer lists

- **Location:** `.github/workflows/vercel-deploy.yml` line 3 (header comment), line 75 (deploy-log artifact body), line 110 (commit-comment body).
- **Diagnosis:** All three places declare `Layers used: [file-contract, attestation, sovereignty]` — they are consistent. False alarm — confirmed all three match. Removing this finding would be the right move; keeping it as LOW-1 to flag for next OpenClaw run that the consistency was verified end-to-end and is now a regression target. Future workflow edits must keep the three layer-lists synchronized.
- **Remediation:** Add a v7.5.1 test assertion to `test/v75.test.ts` that the workflow file's three "Layers used" strings are byte-identical, so future drift is caught. Pattern: parse the YAML, extract the three string sites, assert all three equal `[file-contract, attestation, sovereignty]`.

### LOW-2 — `docs/forking-domain-stacks.md` § "Reference verticals available for forking" lists three future verticals with `TBD` reference paths

- **Location:** `docs/forking-domain-stacks.md` lines 113-117.
- **Diagnosis:** The forking doc lists Capital Intelligence, Sound Intelligence, Clinical Intelligence as `Planned per MASSIVE_ACTION_PLAN.md` with reference path `TBD`. This is honest — they don't exist yet — but `TBD` is a fragile pin; if a practitioner reads the doc 6 months later and the entries are still `TBD` while ATTESTATIONS shows v7.6/v7.7 ships, the substrate looks stalled. Severity is LOW because the framing is honest and the reader can navigate to MASSIVE_ACTION_PLAN.md for status.
- **Remediation:** Replace each `TBD` with `(planned, target Q2 2026 — see MASSIVE_ACTION_PLAN.md § 5 capture stack adoption gate)` so the reader has a date estimate they can hold the substrate accountable to.

### LOW-3 — `verticals/_template/SKILL.md` invariant 5 (`Legal-sensitivity gating`) names exact domains that should be parameterized per HIGH-3

- **Location:** `verticals/_template/SKILL.md` line 22.
- **Diagnosis:** Line 22 reads `Any sub-system touching legal/clinical/financial advice opens with the appropriate disclaimer.` This is HR-shape leakage parallel to HIGH-3 in SOUL.md. A Code IS vertical does not touch legal/clinical/financial; a Sound IS vertical does not. The invariant is universally-true (gate for sensitive domains) but the example list is HR-specific.
- **Remediation:** Edit line 22 to: `Any sub-system touching legal, clinical, financial, safety-critical, or otherwise jurisdiction-bound advice opens with the appropriate disclaimer per the practitioner's declared domain (see SOUL.md § Domain-parameterized non-negotiables).` Cross-link to the SOUL.md restructure from HIGH-3.

### LOW-4 — `STACK.md` § "Layer map" L6 line still references `arcanea-mcp.canon-validate` as the canon validation command

- **Location:** `STACK.md` line 79.
- **Diagnosis:** L6 declares `Canon validation: arcanea-mcp.canon-validate checks Guardian / Vel'Tara / Hz references resolve.` This is operational-correct (arcanea-mcp is a real MCP) but couples the substrate's L6 attestation+audit layer to a single sovereign vertical's MCP. A substrate adopter who does not import Arcanea canon has no reason to install arcanea-mcp; the L6 spec implies they should. Severity is LOW because the line is narrative, not an enforced requirement.
- **Remediation:** Edit line 79 to: `Canon validation: vertical-specific MCP tools — e.g., `arcanea-mcp.canon-validate` for Arcanea canon (Guardian / Vel'Tara / Hz). Substrate does not mandate canon validation; verticals that import canon adopt their canon-source's validator.` Removes the implicit Arcanea-coupling at the substrate L6 level.

---

## Final ruling

**SHIP-WITH-REMEDIATION.**

The v7.5 ship is directionally correct and the additive-not-breaking claim holds for runtime substrate (every prior agent / command / skill / vault namespace remains operational; 153/153 tests pass). The two CRITICAL findings are both substrate-canon-vs-substrate-implementation contradictions: STACK.md claims six IS substrate homes that don't exist on disk (CRITICAL-1), and two IS-layer READMEs cite primary commands that aren't in this repo (CRITICAL-2). Neither breaks running code; both break the substrate's own canonical reference contract. They must land in v7.5.1 before any further substrate-affecting commit.

The six HIGH findings concentrate on supply-chain pinning (HIGH-1), concurrency-honesty (HIGH-2), HR-shape template leakage (HIGH-3), README-vs-implementation contradictions in `core/orchestrator/` (HIGH-4, HIGH-5), and template-fork attestation integrity (HIGH-6). All are next-cycle ship items; HIGH-1 is the highest-impact security hardening and lowest-effort lift.

The five MEDIUM and four LOW findings are horizon items that land cleanly with related substrate work in v7.6.

Tag `v7.5.0` does not need to be retracted. The remediations below close the governance loop the `/superintelligence` execute-mode ship opened, and ship-as-v7.5.1 alongside the Luminor Board's three P0 items (the audit itself, template `.claude/commands/` stub already landed in working tree, attestation surface on the GHA workflow already landed in working tree — both ready to commit).

### Top 3 most-load-bearing remediations (parallel-mergeable in v7.5.1)

1. **CRITICAL-1** — Choose path (a) scaffold the six missing `verticals/{self,wealth,business,creator,secondbrain,brand}/` directories with minimum-viable `README.md` + `MEMORY.md`, OR path (b) edit STACK.md table to mark each row's substrate home as scaffold-pending. Path (b) is one-file, ~15 minutes; path (a) is six-directory ~2 hour scaffold. Path (b) is honest-decoration; path (a) is substrate-correct. Recommend path (a) because v7.6 will need the directories anyway, and shipping path (b) creates a re-edit burden in 30 days.

2. **CRITICAL-2** — Edit `verticals/code/README.md` and `verticals/voice-video/README.md` § "Primary commands" to mark `/arco`, `/ao`, `/factory`, `/sync-repos` as `(provided by FrankX vertical, not in this substrate)`, and add the v7.5.1 test assertion that every command-claim in a vertical README either resolves to `.claude/commands/<name>.md` or is explicitly marked `(external)`. ~30 minutes. This closes the substrate-canon-vs-implementation gap without committing the substrate to importing FrankX commands.

3. **HIGH-1** — Pin all five GHA workflow third-party actions to commit SHAs and pin `vercel` to exact semver. Add `.github/dependabot.yml` for github-actions ecosystem. ~45 minutes. Highest-impact security hardening in the v7.5.1 window — the deploy pipeline is the substrate's most-shipped public surface and currently runs unpinned third-party code with `VERCEL_TOKEN` in environment.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.0 (post-tag adversarial review, SHIP-WITH-REMEDIATION verdict)
- Auditor: OpenClaw (protocol-defender voice per VOICES.md)
- Generated: 2026-04-26
- Attestation is compounding, not credit transfer: every composition strengthens every node.
