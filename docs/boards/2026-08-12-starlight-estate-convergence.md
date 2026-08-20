# Starlight Estate Convergence Board

Date: 2026-08-12

Decision owner: FrankX / Starlight

Scope: repository authority, branch convergence, harness upstreams, and memory boundaries

Verdict: **REVISE the merge-all premise, then PROCEED through gated convergence**

## Question before the board

How should the Starlight intelligence estate be brought into one coherent system without erasing valid repo boundaries, importing stale branch history, or turning an upstream harness or memory vendor into a second source of truth?

## Evidence considered

- The connected GitHub estate contains 367 repositories across the installed accounts at this audit cutoff. Sixty-one are archived, 36 are forks, 56 have no description, and 23 are empty or near-empty.
- The focused Starlight audit found dozens of intelligence and operations surfaces. The 24-repository convergence set alone contains 139 non-default branches and 30 open pull requests at the audit baseline. Direct PR retrieval corrected a search-index undercount: 25 were technically mergeable against their stated base and five conflicted, but most of the 25 were drafts, stacked on non-default bases, duplicated, or otherwise not safe to merge as-is.
- Existing estate maps describe about 15 or 42 repositories and are dated June or July 2026. They remain useful historical snapshots, but are no longer a complete present-tense control plane.
- `starlight-agent-skills` passed its repository check; `starlight-memory` passed lint, build, and 33 tests; `starlight-swarm` passed typecheck, 159 tests, production build, and a fail-closed dry run for the selected provenance convergence commit.
- The strongest adjacent projects are evolving quickly and sometimes contradict their own documentation. Their patterns are useful; their histories are not safe wholesale merge inputs.

## Six-lens pressure test

### Sovereign

One repo must own each kind of truth. SIS owns protocol and cross-repo contracts. The private vault owns evidence, consent, retention, and deletion truth. `starlight-memory` owns public types, routing, and rebuildable projections. `second-brain-os` is the human-facing interface and workflow, not a competing memory database. `agentic-ops` owns the live fleet registry; public doctrine and installed config consume that authority.

### Seer

If every branch is merged, stacked experiments and obsolete generated files become permanent maintenance debt. If the current ambiguity continues, new agents will choose repos by name rather than contract and silently fork the architecture. The future-safe move is to publish explicit authority boundaries and classify every branch as adopt, supersede, archive, or investigate.

### Harmonizer

The system should expose a small vocabulary:

- **substrate** — protocol, policy, contracts, attestation;
- **procedure** — versioned Agent Skills;
- **runtime** — bounded execution and checkpoints;
- **evidence** — immutable, private source material;
- **projection** — rebuildable search, graph, summary, or belief views;
- **experience** — second-brain interfaces and correction workflows;
- **operations** — fleet inventory, policy distribution, release, and observability.

Repositories that cannot state which noun they own must be folded, redirected, or archived.

### Strategist

Converge in waves:

1. Publish the authority map and upstream contract.
2. Land only isolated commits that pass current-main checks.
3. Repair public truth surfaces and scorecards.
4. Migrate unique value from duplicate and legacy repos.
5. Archive only after redirects, owners, and recovery tags exist.

Ruflo, Oh My OpenAgent, Omnigent, MemPalace, Mem0, Graphiti, Letta, Cognee, and similar systems are adapter or evaluation upstreams. No upstream is merged wholesale into SIS.

### Verifier

Every convergence change must prove:

- current-main ancestry or an explicitly documented rebase;
- a narrow, reviewable diff;
- repository-native lint, type, test, build, and dry-run gates where present;
- security, privacy, cost, and deletion/export contract tests for memory providers;
- a recorded upstream tag or immutable SHA;
- no new source-of-truth collision.

Retrieval recall is not end-to-end memory correctness. Evals must score evidence recall, answer correctness, citations, temporal truth, deletion, poisoning, and cross-tenant leakage separately.

### Overseer

Stop the rollout when a change:

- weakens a fail-closed permission or human approval boundary;
- writes concurrently to a shared worktree or last-writer-wins memory document;
- promotes model-derived content directly into trusted memory;
- cannot delete or export the data it ingests;
- launches an unpinned `latest` dependency;
- combines more than one orchestration authority in a single execution path;
- merges a branch whose unique commits have not been classified.

## Decision

The original goal is approved after revision:

- Do **not** bulk-merge all branches.
- Establish the canonical topology in `docs/architecture/STARLIGHT_PORTFOLIO_TOPOLOGY.md`.
- Track volatile external systems in `context/empire/upstreams.json`, enforced by `scripts/validate-upstreams.mjs`.
- Use fresh, current-main convergence branches and cherry-pick only isolated, verified commits.
- Keep raw evidence, projections, runtime state, procedures, and the second-brain experience as separate layers.
- Quarantine upstream experiments in `starlight-agent-lab`; promote a primitive only through an ADR, contract tests, and Starlight-native evals.

This board authorizes documentation and control-plane enforcement. It does not authorize deletion of repositories, disclosure of private memory, autonomous deployment, or bypass of protected-branch checks.
