# Branch integration review â€” 2026-09-14

Target: `frankxai/Starlight-Intelligence-System`, base `12629bc74c5b60d842fa2688f44502151dc0597c`.
Source: Frankâ€™s request in Codex task `01a09d83-5ecf-7051-9a20-c6eb8d16de3c` to evaluate branches and integrate ready work into main.

## Decision

Integrate the loop recorder and instruction compiler from PR #142, with the review corrections below. Preserve the other branches and unfinished work. Branch age, closed PRs, successful Vercel status contexts, and apparent mergeability do not establish readiness. This is a complete ref inventory and selective code review, not a claim that every historical snapshot received line-by-line review.

The canonical checkout remains on `codex/consolidate` with its existing uncommitted federation, runtime, cockpit, capability, media, and memory changes. A separate `codex/integrate-reviewed-20260914` worktree owns this integration. No branch deletion, force push, shared-checkout switch, or bulk staging.

## Corrections required by review

- Preserve the exported v1 `allowedActions` allowlist; the original candidate silently inverted it into `silenceTriggers`. An optional denylist can narrow authority but cannot grant it.
- Reject duplicate instruction identities, malformed relation fields and inconsistent lifecycle metadata. Generated and inactive atoms cannot suppress active instructions. Deduplicate content by trusted host authority with deterministic ordering; reject unresolved reciprocal supersession and absent dependencies.
- Separate event identity namespaces, preserve checker evidence on completion, and record a blocked event on post-admission halts. Timestamps are sequence-derived, not measured execution durations. Hosts filter state snapshots before projecting events.
- Validate graph/config/input structures. Replace repeated edge scans and recursive cycle detection during compilation with adjacency indexes and iterative traversal. A 12,000-node chain is a regression fixture.
- Synchronize pnpm's lockfile with four dependency pins already present on main. No dependency upgrades.

The recorder does not launch agents or authenticate evidence. The host owns capacity admission, convergence rounds and actor/receipt authentication. These limits are explicit at its entry point.

## Branch disposition

Ahead counts are ancestry counts against the base, not counts of missing features. Squash-merged work can remain ahead by this measure. Paths compare each branch's merge-base delta against current main to identify exact retained content and later divergence.

| Branch refs sharing a commit | Commit | Ahead | Changed paths | Decision |
|---|---|---:|---:|---|
| `agent/claude/memory-backlog-20260911` | `ed3d54ba2a` | 12 | 3 | Hold memory snapshot: deletes unchecked promotion candidates and references character assets/docs absent from main. Reconcile append-only history and evidence before landing. |
| `agent/claude/sip-evidence-graph`<br>`origin/agent/claude/sip-evidence-graph` | `adf977a439` | 11 | 17 | Hold #141: reproduced a privacy defect at adf977a — validateProfile returns PASS with a public claim in redactFields, but traceClaim exposes its synthetic private marker. Its tests also reference a generated site mask absent from the branch. Requires fixes, complete artifacts and protocol review before integration. |
| `agent/claude/site-integrity` | `d60b39b0b8` | 1 | 5 | Prior PR already merged; remaining differences include later main edits. Do not replay the old snapshot. |
| `agent/claude/starlight-proof-first-night-20260717` | `c68efd2e63` | 1 | 1 | Hold source-install variant: existing install fixes landed through #51 and subsequent revisions; reconcile remaining five divergent files individually. |
| `agent/claude/substrate-security-and-adoption` | `9a79cbb419` | 9 | 34 | Priority follow-up: unique security/adoption changes overlap #135 and current src edits. Rebase tests and evaluate each security patch against current contracts; do not replay old package/vault snapshots. |
| `agent/codex/brand-evolution-engine-20260807` | `725517d3c3` | 1 | 43 | Hold standalone engine: 43 unique paths and new governed contracts need current ownership/dependency and cross-provider review. |
| `agent/codex/music-rights-foundation`<br>`origin/agent/codex/music-rights-foundation` | `88073a201a` | 0 | 0 | Already in main by ancestry; no merge needed. |
| `agent/hermes/media-guard-canary-20260819`<br>`origin/agent/hermes/media-guard-canary-20260819` | `546aa6b10c` | 1 | 1 | Exclude: intentional failing BMP fixture, PR #94 explicitly tests rejection. |
| `agent/hermes/opencode-free-arena-20260816` | `6247148eb5` | 0 | 0 | Already in main by ancestry; no merge needed. |
| `agent/hermes/sis-eve-agent-platform-strategy` | `e567c77745` | 1 | 1 | Changed content already retained exactly in main; no replay. |
| `agent/hermes/sis-loop-kernel-20260911`<br>`origin/agent/hermes/sis-loop-kernel-20260911` | `90c6a7af75` | 2 | 10 | Integrate with corrections and fresh checks; original #142 is superseded by this integration. |
| `agent/hermes/sis-operational-work-graph`<br>`origin/agent/hermes/sis-operational-work-graph` | `a1540389c2` | 7 | 48 | Partially salvage kernel through #142. Preserve #137 atlas/UI and contract remainder; conflicting old branch and explicitly failing visual evidence prohibit wholesale merge. |
| `agent/hermes/starlight-applied-intelligence-visual-system` | `a0a06b1e06` | 0 | 0 | Already in main by ancestry; no merge needed. |
| `agent/hermes/starlight-world-excellence` | `72ba05e802` | 1 | 8 | Changed content already retained exactly in main; no replay. |
| `agent/hermes/starlight-world-palace`<br>`origin/agent/hermes/starlight-world-palace` | `9fa983fef9` | 7 | 30 | Superseded: only six world files differ from current implementation landed in #136. |
| `agent/hermes/vercel-heal-sis-20260817` | `2fa5d7ce8d` | 1 | 2 | Prior PR already merged; remaining differences include later main edits. Do not replay the old snapshot. |
| `backup/pre-rebase-20260911` | `b77428cc1e` | 13 | 10 | Preserve recovery ref. Security changes were superseded by #135; remaining memory/package delta needs selective reconciliation. |
| `codex/agent-platform-federation-20260912`<br>`codex/consolidate` | `8ed3aaf6ce` | 13 | 4 | Hold: committed delta is memory history; implementation is uncommitted in another owned checkout. Do not mistake branch name for landed implementation. |
| `codex/agentic-record-studio-20260711`<br>`origin/codex/agentic-record-studio-20260711` | `52afae5575` | 1 | 62 | Hold preserved music release packet: includes media and explicit no-external-upload notes. Requires rights, media and product routing review, not a root merge. |
| `codex/constellation-protocol-50`<br>`origin/codex/constellation-protocol-50` | `e2f90f981d` | 7 | 505 | Hold broad preservation snapshot: hundreds of overlapping files, embedded worktree/patch artifacts and stale substrate surfaces require selective extraction. |
| `codex/empire-visualization`<br>`codex/main-preserve-20260630`<br>`origin/codex/main-preserve-20260630` | `642a2b253c` | 5 | 421 | Hold broad preservation snapshot: hundreds of overlapping files, embedded worktree/patch artifacts and stale substrate surfaces require selective extraction. |
| `codex/handprint-intelligence-vertical` | `4f5046110e` | 0 | 0 | Already in main by ancestry; no merge needed. |
| `codex/japanese-excellence-characters-20260828` | `982a902684` | 3 | 2 | Hold memory snapshot: deletes unchecked promotion candidates and references character assets/docs absent from main. Reconcile append-only history and evidence before landing. |
| `codex/music-identity-lab-20260710` | `df0f589cd5` | 3 | 364 | Hold broad preservation snapshot: hundreds of overlapping files, embedded worktree/patch artifacts and stale substrate surfaces require selective extraction. |
| `codex/org-agent-entry-20260829` | `e074f09a7c` | 1 | 2 | Changed content already retained exactly in main; no replay. |
| `codex/org-field-notes-20`<br>`origin/codex/org-field-notes-20` | `cfb6bf80ef` | 2 | 14 | Superseded visual implementation: assets/docs retained, five UI files differ after later redesigns. Preserve current homepage/navigation. |
| `codex/portable-agent-runtimes-20260912`<br>`codex/portable-runtime-isolated-20260912`<br>`main`<br>`origin/agent/claude/memory-backlog-20260911` | `ab07b6783b` | 11 | 3 | Hold memory snapshot: deletes unchecked promotion candidates and references character assets/docs absent from main. Reconcile append-only history and evidence before landing. |
| `codex/sis-consolidation-community-20260906` | `fd955ba3d8` | 18 | 209 | Prior PR already merged; remaining differences include later main edits. Do not replay the old snapshot. |
| `codex/starlight-network-v01-20260815` | `42f9ef85f8` | 0 | 0 | Already in main by ancestry; no merge needed. |
| `codex/update-his-v020-links` | `79fe20e766` | 2 | 1 | Changed content already retained exactly in main; no replay. |
| `codex/vercel-actions-cost-heal-20260826` | `436dea5ca2` | 1 | 4 | Prior PR already merged; remaining differences include later main edits. Do not replay the old snapshot. |
| `codex/verceldeploy`<br>`origin/codex/verceldeploy` | `f29e010cf5` | 6 | 1176 | Hold broad preservation snapshot: hundreds of overlapping files, embedded worktree/patch artifacts and stale substrate surfaces require selective extraction. |
| `merge/codex-wave-20260714`<br>`origin/merge/codex-wave-20260714` | `311a27fd0c` | 5 | 413 | Hold broad preservation snapshot: hundreds of overlapping files, embedded worktree/patch artifacts and stale substrate surfaces require selective extraction. |
| `origin/agent/c940/sovereign-memory-maint-20260806` | `4079a5b773` | 21 | 13 | Hold machine/memory history: operational scripts overlap dirty owned paths; reconcile with current backup/secret-scan policy on their source host. |
| `origin/agent/claude/substrate-security-and-adoption` | `fc67e2e1f7` | 8 | 34 | Priority follow-up: unique security/adoption changes overlap #135 and current src edits. Rebase tests and evaluate each security patch against current contracts; do not replay old package/vault snapshots. |
| `origin/agent/codex/portfolio-agent-registrar-20260816` | `82310eb99e` | 16 | 8 | Hold advisory registrar from closed #89; historical inventory is not fresh deployment truth. |
| `origin/agent/codex/starlight-public-install-truth` | `7143262d24` | 2 | 9 | Hold source-install variant: existing install fixes landed through #51 and subsequent revisions; reconcile remaining five divergent files individually. |
| `origin/canon/starlight-boundary-v1-20260904` | `4c4df2ef17` | 8 | 8 | Hold #132: authoritative frankxai/starlight-canon cannot be resolved through GitHub. Do not invent canonical authority. |
| `origin/codex/academy-fabric-v0-1-20260829` | `47c9430b33` | 9 | 142 | Hold #112 preserved Academy work: 142 paths mix contracts and public product surface. Needs product ownership, release and visual gates before activation. |
| `origin/main` | `12629bc74c` | 0 | 0 | Already in main by ancestry; no merge needed. |
| `origin/night/2026-07-17-sis-verify` | `973b5f7390` | 12 | 11 | Hold machine/memory history: operational scripts overlap dirty owned paths; reconcile with current backup/secret-scan policy on their source host. |
| `origin/starlight-intelligence-system` | `9ba7ffd320` | 3 | 14 | Hold old homepage/3D replacement: conflicts with the current shipped visual system and adds root dependencies. Needs a new comparative visual review. |
| `origin/sync/c940/20260909T145049Z` | `54c67a926d` | 1 | 17 | Priority follow-up: preservation commit mixes memory-provider/cache code, swarm changes, machine scripts and harness rewrites. Split/test code against current main and preserve private machine receipts. |

## Verification and release gate

Initial #142: 41 focused tests passed. The corrected candidate: 51 focused tests passed, strict TypeScript check passed, full compilation passed. An isolated pnpm install and native SQLite rebuild resolved the initial missing binary. The full local suite then stopped at existing Windows Foundry failures: EPERM creating a directory symlink and RULES_LOCK checks. Main has a successful Linux harness run at the base SHA (34690853563); require the candidate’s Linux CI rather than bypassing the full suite. The local mesh check also discovers unrelated sibling worktrees; its clean-checkout CI result remains required. Independent provider re-review is pending.

Vercel connector verified project `site` / `prj_wDNGrb1R1rB5PJOG9cUEICSER887`, team `team_q6LNT6rnFRlqlcjBJ2Wxz6PE`. Production deployment `dpl_Q7FB8up6dBPb7mR6YXP4FxQgaWQj` is READY at the base SHA. #142's green Vercel status corresponds to a CANCELED deployment; it is not build proof. No project build was active at inspection. Use the existing Git deployment path.

## Board pressure test before commitment

**Sovereign:** Keep the current v1 action boundary and the user's ability to stop the host. Do not merge a protocol extension or invent external authority as part of repository cleanup.

**Seer:** Old preservation snapshots can undo months of security and interface corrections. Retain their provenance and extract remaining work with tests.

**Harmonizer:** A single writer owns this worktree; the shared checkout's ongoing changes remain untouched. Runtime admission is still the host's responsibility.

**Strategist:** The narrow recorder integration recovers useful kernel work from two overlapping PRs without forcing their unfinished UI into production.

**Verifier:** Passing fixtures did not detect authority and event-identity defects. Require adversarial regressions, independent provider review, and full CI on the final revision.

**Overseer:** The load-bearing concern is false completion or authority escalation. Proceed only with the corrected candidate after those exact release gates pass; preserve all unresolved branches.

**Recommendation:** PROCEED with the operational review candidate commit. Main merge remains held until independent re-review and full clean-checkout checks pass; this does not approve the held protocol/canon branches.

**Built on SIP â€” Starlight Intelligence Protocol v1.1.1.**

### CI reconciliation

Candidate Linux runs 34797027266 and 34797027292 failed because the new package test command changed package.json, which Foundry pins in two source-closure maps. The original diagnosis of RULES_LOCK as Windows-specific was incorrect. Refreshed those exact two SHA-256 pins for the reviewed script addition; all 22 Foundry conformance/preflight tests now pass, including positive fixtures and tamper rejection. No validator behavior or dependency version changed. Windows symlink EPERM is a separate local limitation.
