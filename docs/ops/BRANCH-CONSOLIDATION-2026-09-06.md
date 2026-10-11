# Branch consolidation — 2026-09-06

Source: Codex task `01a0740d-878e-7dc1-88c5-86f91ec18382`. Repository verified:
`frankxai/Starlight-Intelligence-System`. Integration: [PR #133](https://github.com/frankxai/Starlight-Intelligence-System/pull/133).

The user requested all branches considered, correct repository ownership checked,
and useful community/plugin expansion. This inventory accounts for every local and
remote branch visible after fetching complete history. A shallow clone initially
misrepresented divergence; after unshallowing, local main had eight memory commits
and origin/main had 62 newer commits. Never use incomplete history to decide deletion.

## Integrated source

PRs #50, #85, #87, #99, #100, #102, #109, #111, #119, #120, #126, and #128 are
consolidated in this review branch. #102 also includes local commit `05f5629` (the
independently reviewed graph adoption kit). Package scripts and append-only technical
vault entries were reconciled. All original refs remain recoverable until merge.

PR #119 carried a corrupt binary operational-vault blob with 30 NUL bytes. The intact
mainline vault was preserved and a new factual receipt appended. Its Worker is a
shared operator workspace, not the community runtime. Production deployment is now
manual; Cloudflare identity, connected-host scans, and publication remain separate gates.

## Community result and claim boundary

Issue #66 now has an executable in-memory event/consent fixture, replay and causal
checks, current-consent projections, a private scorecard, and a portable weekly planning
skill registered in the repository marketplace. No durable adapter, real community
pilot, authenticated member identity store, public sender, or marketplace publication
is claimed. Foundry, work graphs, the operator Worker, and Community OS remain distinct
components; putting their source in one branch does not make one integrated product.

## Review and validation

Independent Grok 4.6 Build review returned REVISE and identified five real source
issues. Fixes add public-sharing consent at admission, canonical work-event hashing,
`allowedActions` brake naming, nonempty cloud searches, and server-authoritative render
snapshots. Thirty-three focused tests passed after these fixes. Root TypeScript build,
pre-commit symmetry, Track D evals, 15 blueprint tests, 9 Reality fixtures, and the graph
adoption tests passed. Exact CI status belongs to PR #133, not this dated count.

Integration CI caught stale Foundry package hashes and mesh measurements. Refreshed
only the reviewed package closure and SIS measurements; carried other repositories'
measurements forward verbatim. No dependency validation or security gate was disabled.
The current shared local install lacks Ajv; full Foundry and cloud build proof runs in CI.

## Excluded work remains substantive

- #132: `frankxai/starlight-canon` returned GitHub 404. Ratify/create the authority before
  binding SIS to it. No source-document claim substitutes for that decision.
- #89: the August advisory inventory declares SIS its portfolio control plane; reconcile
  it with the current estate registry before treating it as an authoritative inventory.
  Its historical mesh check failed. Keep the work and its v1.1 evidence requirements.
- Large legacy/checkpoint, academy, security, brand, and memory lanes require extraction
  or their own review; merging them wholesale would regress current code or publish
  unsupported cross-repository state. They are retained, not marked finished.
- The canonical checkout contains other sessions' uncommitted brand, dreaming, backup,
  graph, and visual work. It was not stashed, reset, cleaned, or silently committed.

## Recovery priorities, with source evidence

The unmerged recovery lanes are not hidden by this receipt:

1. Security/adoption: `edf929e` and `fc67e2e` change shell quoting, JSONL locks,
   MCP entrypoints, sanitization and npm publish lifecycle. Extract those commits
   from intervening dreaming commits; run injection, crash recovery and packed-artifact
   tests before release. They were not exercised by the community tests.
2. C940 memory: `9b9d4b4` bounds remote recall; `55574a8` retries failed mirrors;
   `973b5f7` changes backup/watchdog/secret scan. These overlap the canonical checkout's
   live dirty operations files. Reconcile that owner's deltas first; do not overwrite them.
3. Historical visual/checkpoint family contains `.asph-wip` patches, a worktree gitlink,
   agent harness changes and FrankX assets. Those are mixed recovery records, not an
   atomic SIS feature. Keep their original refs while extracting by verified owner.
4. Academy #112 was closed by a weekly prune despite substantive work; its exact head
   remains. The 142-file program still carries draft portfolio/credential authority
   and #113 ratification work. This session does not silently ratify those authorities.
5. Evidence-console #70 was also parked by prune, not rejected on its merits. Preserve
   its nine-file mobile/claims correction for rebasing and visual verification.
6. Quickstart #43 has an explicit supersession receipt: its sole homepage change was
   replaced by #59/#60. Do not resurrect the old homepage. Its worktree remains owned.
7. The two public-install-truth refs share exact head `7143262`; their fail-closed
   install contract now has later mainline edits (including #110). Reconcile specific
   remaining deltas rather than replacing today's source with the historical script.
8. The old `starlight-intelligence-system` branch changes the root dependency manager
   and a prior homepage/3D scene. It is not a current package-only dependency bump.

Seven local branch heads match their historical merged PR head exactly (#25, #46,
#75, #91, #103, #107, #110). Checked-out worktree refs stay intact; unoccupied redundant
refs may be removed after final main verification. No branch deletion is justified by
age alone. PR #31's local head differs from its merged head and remains for recovery.

## Full ref inventory

Snapshot base: `d5fb5a0d6bf31b5405a6a9a0e8ef1db518fb73c1`.
Commits counts are ancestry differences, not proof of missing content after squash merges.

| Ref | Head | Commits outside base | Disposition |
|---|---|---:|---|
| `refs/heads/agent/claude/site-integrity` | `d60b39b0b88d` | 1 | Prior squash merge #31; retain any newer delta until separately checked |
| `refs/heads/agent/claude/starlight-proof-first-night-20260717` | `c68efd2e6386` | 1 | Preserve unpublished or superseded lane; no deletion justified by age or absent PR |
| `refs/heads/agent/claude/substrate-security-and-adoption` | `9a79cbb419a6` | 9 | Preserve; dedicated security/publish lifecycle review required for 34-file hardening branch |
| `refs/heads/agent/codex/brand-evolution-engine-20260807` | `725517d3c38c` | 1 | Preserve; reconcile brand-engine ownership with starlight-design-intelligence before porting |
| `refs/heads/agent/codex/music-rights-foundation` | `88073a201a5a` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/heads/agent/hermes/heading-a11y-20260809` | `0e58cc9bc67e` | 1 | Exact head matches merged PR #75; no newer branch commits. Retain if attached to a worktree |
| `refs/heads/agent/hermes/media-guard-canary-20260819` | `546aa6b10ce1` | 1 | Preserve intentional negative canary; not a production behavior change |
| `refs/heads/agent/hermes/opencode-free-arena-20260816` | `6247148eb5c7` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/heads/agent/hermes/reality-kernel-m0-20260816` | `e5bc4b1df4e8` | 4 | Source consolidated in #133 from #87; preserve original until merge |
| `refs/heads/agent/hermes/sis-eve-agent-platform-strategy` | `e567c777457b` | 1 | Exact head matches merged PR #46; no newer branch commits. Retain if attached to a worktree |
| `refs/heads/agent/hermes/sis-operational-work-graph` | `05f5629cf2d9` | 4 | Source consolidated in #133 from #102; preserve original until merge |
| `refs/heads/agent/hermes/starlight-applied-intelligence-visual-system` | `a0a06b1e063f` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/heads/agent/hermes/starlight-world-palace` | `9fa983fef992` | 7 | Source consolidated in #133 from #99; preserve original until merge |
| `refs/heads/agent/hermes/vercel-heal-sis-20260817` | `2fa5d7ce8de4` | 1 | Exact head matches merged PR #91; no newer branch commits. Retain if attached to a worktree |
| `refs/heads/codex/agentic-record-studio-20260711` | `cfacd6c2b811` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/heads/codex/constellation-protocol-50` | `e2f90f981dc7` | 7 | Preserve mixed historical checkpoint; extract owned deltas, never restore wholesale over newer main |
| `refs/heads/codex/empire-visualization` | `642a2b253c6c` | 5 | Preserve mixed historical checkpoint; extract owned deltas, never restore wholesale over newer main |
| `refs/heads/codex/handprint-intelligence-vertical` | `4f5046110e83` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/heads/codex/japanese-excellence-characters-20260828` | `982a90268447` | 3 | Preserve memory/checkpoint work; public asset evidence and dirty working files require their original lane |
| `refs/heads/codex/main-preserve-20260630` | `642a2b253c6c` | 5 | Preserve mixed historical checkpoint; extract owned deltas, never restore wholesale over newer main |
| `refs/heads/codex/music-identity-lab-20260710` | `df0f589cd5f7` | 3 | Preserve mixed historical checkpoint; extract owned deltas, never restore wholesale over newer main |
| `refs/heads/codex/org-agent-entry-20260829` | `e074f09a7c01` | 1 | Exact head matches merged PR #110; no newer branch commits. Retain if attached to a worktree |
| `refs/heads/codex/org-field-notes-20` | `cfb6bf80ef6e` | 2 | Source consolidated in #133 from #100; preserve original until merge |
| `refs/heads/codex/sis-consolidation-community-20260906` | `0bdeb3551319` | 14 | Integration branch for PR #133 |
| `refs/heads/codex/starlight-network-v01-20260815` | `42f9ef85f8bb` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/heads/codex/update-his-v020-links` | `79fe20e766eb` | 2 | Exact head matches merged PR #25; no newer branch commits. Retain if attached to a worktree |
| `refs/heads/codex/vercel-actions-cost-heal-20260826` | `436dea5ca272` | 1 | Exact head matches merged PR #107; no newer branch commits. Retain if attached to a worktree |
| `refs/heads/codex/vercel-deploy-product` | `55e6add212dd` | 1 | Exact head matches merged PR #103; no newer branch commits. Retain if attached to a worktree |
| `refs/heads/codex/verceldeploy` | `f29e010cf5b0` | 6 | Preserve mixed historical checkpoint; extract owned deltas, never restore wholesale over newer main |
| `refs/heads/docs/drift-fixes-2026-05-26` | `8ddb65eca5fa` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/heads/main` | `4286d68e1e78` | 8 | Preserve memory/checkpoint work; public asset evidence and dirty working files require their original lane |
| `refs/heads/merge/codex-wave-20260714` | `311a27fd0cb5` | 5 | Preserve mixed historical checkpoint; extract owned deltas, never restore wholesale over newer main |
| `refs/remotes/origin/agent/c940/sovereign-memory-maint-20260806` | `4079a5b77309` | 21 | Preserve memory/checkpoint work; public asset evidence and dirty working files require their original lane |
| `refs/remotes/origin/agent/claude/substrate-security-and-adoption` | `fc67e2e1f744` | 8 | Preserve; dedicated security/publish lifecycle review required for 34-file hardening branch |
| `refs/remotes/origin/agent/codex/architecture-blueprint-v1` | `9d3738cf2743` | 2 | Source consolidated in #133 from #126; preserve original until merge |
| `refs/remotes/origin/agent/codex/editorial-contract-20260828` | `bbb1f98d6332` | 1 | Source consolidated in #133 from #109; preserve original until merge |
| `refs/remotes/origin/agent/codex/portfolio-agent-registrar-20260816` | `82310eb99e5d` | 16 | Hold #89: reconcile advisory SIS inventory with current estate authority; old mesh gate failed |
| `refs/remotes/origin/agent/codex/starlight-public-install-truth` | `7143262d240a` | 2 | Preserve unpublished or superseded lane; no deletion justified by age or absent PR |
| `refs/remotes/origin/agent/hermes/media-guard-canary-20260819` | `546aa6b10ce1` | 1 | Preserve intentional negative canary; not a production behavior change |
| `refs/remotes/origin/agent/hermes/reality-kernel-m0-20260816` | `e5bc4b1df4e8` | 4 | Source consolidated in #133 from #87; preserve original until merge |
| `refs/remotes/origin/agent/hermes/sis-operational-work-graph` | `f2379dbedeb8` | 3 | Source consolidated in #133 from #102; preserve original until merge |
| `refs/remotes/origin/agent/hermes/starlight-world-palace` | `9fa983fef992` | 7 | Source consolidated in #133 from #99; preserve original until merge |
| `refs/remotes/origin/canon/starlight-boundary-v1-20260904` | `4c4df2ef1717` | 8 | Hold #132: external canon authority returns GitHub 404; no invented authority |
| `refs/remotes/origin/claude/agent-quality-review-iwkkff` | `6dfb23c6abbf` | 4 | Source consolidated in #133 from #111; preserve original until merge |
| `refs/remotes/origin/claude/starlight-multiagent-validation-gxd3bp` | `3f4e92602065` | 1 | Preserve unpublished or superseded lane; no deletion justified by age or absent PR |
| `refs/remotes/origin/codex-starlight-public-install-truth` | `7143262d240a` | 2 | Preserve unpublished or superseded lane; no deletion justified by age or absent PR |
| `refs/remotes/origin/codex/academy-fabric-v0-1-20260829` | `47c9430b3371` | 9 | Preserve; 142-file academy/graph/site program has ratification and separate public-site ownership dependencies (#113) |
| `refs/remotes/origin/codex/cross-ecosystem-release-factory-20260831` | `598f27d2439b` | 1 | Source consolidated in #133 from #120; preserve original until merge |
| `refs/remotes/origin/codex/main-preserve-20260630` | `642a2b253c6c` | 5 | Preserve mixed historical checkpoint; extract owned deltas, never restore wholesale over newer main |
| `refs/remotes/origin/codex/org-field-notes-20` | `cfb6bf80ef6e` | 2 | Source consolidated in #133 from #100; preserve original until merge |
| `refs/remotes/origin/codex/reality-architecture-genesis-20260816` | `47d5d1dd3f92` | 3 | Source consolidated in #133 from #85; preserve original until merge |
| `refs/remotes/origin/codex/sis-consolidation-community-20260906` | `0bdeb3551319` | 14 | Integration branch for PR #133 |
| `refs/remotes/origin/codex/starlight-cloud-plugin` | `f7c166c28cdb` | 3 | Source consolidated in #133 from #119; preserve original until merge |
| `refs/remotes/origin/feat/foundry-release-assurance` | `8be6be6b895f` | 2 | Source consolidated in #133 from #128; preserve original until merge |
| `refs/remotes/origin/feat/register-gravity-engine-vertical` | `38866ab11757` | 1 | Source consolidated in #133 from #50; preserve original until merge |
| `refs/remotes/origin/main` | `d5fb5a0d6bf3` | 0 | Already in origin/main; retain checked-out worktree refs |
| `refs/remotes/origin/night/2026-07-17-sis-verify` | `973b5f73906b` | 12 | Preserve unpublished or superseded lane; no deletion justified by age or absent PR |
| `refs/remotes/origin/starlight-intelligence-system` | `9ba7ffd32085` | 3 | Preserve unpublished or superseded lane; no deletion justified by age or absent PR |

## Continuation

Merge #133 only after independent closure and all checks pass. The user explicitly authorized reviewed main consolidation in this task. Close the twelve source
PRs as consolidated with a link to #133; only remove refs whose exact source heads are
accounted for, and never remove worktree branches or dirty work. Keep #66 open for
production adapters, durable replay storage, actual pilot measurements, and host testing.
The source-only community plugin can be reviewed and installed separately from that work.

Built on SIP — Starlight Intelligence Protocol v1.1.1. Canon: none.
