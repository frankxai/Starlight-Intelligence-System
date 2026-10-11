# Starlight Repository Convergence Audit

Audit cutoff: 2026-08-12

Method: connected GitHub metadata, default-branch and PR inspection, targeted local validation
Scope: 24 repositories forming the Starlight intelligence and operations core

## Estate result

The core has capable components but no enforced repository constitution.

- 163 total branches; 139 are not the default branch.
- 23 non-default branches are clean-ahead, 104 diverged, eight fully behind, and four have no common ancestor with `main`.
- 127 branches contain ahead commits; 97 of those had no open pull request at the audit baseline.
- Aggregate ahead-count is 578 commits, with shared ancestry double-counted.
- Thirty open PRs existed in the focused set. Direct PR retrieval corrected a GitHub search-index undercount: 25 were technically mergeable against their stated base and five conflicted. "Mergeable" is not an approval signal; many are drafts, stacked on non-default branches, duplicated, or too broad for safe convergence.
- All 24 repos report `fork: false`; imported Ruflo, Hermes, Mem0, and other lineages therefore have no GitHub-native upstream relationship.

The problem is branch debt and authority ambiguity, not a shortage of code.

## Canonical decisions

| Repository | Evidence-based role | Disposition |
|---|---|---|
| `frankxai/Starlight-Intelligence-System` | Active TypeScript SIP/SIS substrate, reference memory/orchestration, Foundry, MCP, agents, site | Keep as protocol/substrate authority; stop absorbing every product |
| `Arcanea-Labs/Starlight-Intelligence-System` | Independent stale 2025 Python prototype | Harvest unique memory-publisher work; rename as legacy or archive with redirect |
| `frankxai/starlight-agent-skills` | 27 portable skills with manifests, validators, examples, adapters | Keep as portable procedure authority |
| `frankxai/starlight-memory` | Provider SDK/router/MCP, sync CLI, local reference implementation | Keep as canonical public memory implementation package; SIS owns policy/contracts |
| `frankxai/second-brain-os` | Public ingestion, reflection, cited synthesis, and two-vault product/template | Keep as human knowledge experience composed on Starlight Memory |
| `frankxai/second-brain-vault` | Private Obsidian corpus | Keep as human-curated knowledge instance |
| `frankxai/starlight-private-memory` | Private high-sensitivity profiles and evidence | Keep as hard-private trust domain with allowlisted projections only |
| `frankxai/starlight-memory-vault` | Private cross-machine coding-agent memory | Keep as machine-generated episodic memory, separately namespaced |
| `frankxai/starlight-agentic-os` | Pack registry, lifecycle, certification, router | Keep as pack-program control plane; do not let it own fleet config/execution |
| `frankxai/StarlightOS` | Stale private Cortex/product-surface prototype | Rename to `starlight-cortex` if alive; otherwise absorb unique UI and archive |
| `frankxai/starlight-intelligence` | Boilerplate main; actual constitution/workbench lives on branches | Elect a thin `starlight-intelligence-web` product or redirect/archive immediately |
| `frankxai/agentic-ops` | Active private ASPH, secrets, observability, media, Empire Registry | Keep as private estate operations and fleet SSOT; highest branch-convergence priority |
| `frankxai/agentic-ops-hub` | Public method mixed with fleet queues, ledgers, receipts, and runtime state | Split: public templates/sync here; live fleet state in private `agentic-ops` |
| `frankxai/hermes-cockpit` | Hermes-specific registry/dashboard | Make stateless; absorb registry authority and archive once operator console covers it |
| `frankxai/starlight-command` | Handover/planning/cockpit template | Fold durable public contracts into the standard/open ops layer, then archive/rename |
| `frankxai/starlight-command-center` | Tiny main; substantial Observatory/Queen app on stacked branches | Keep as sole operator UI after flattening; consider `starlight-operator-console` |
| `frankxai/starlight-agent-config` | Private cross-machine policies, adapters, installers, teams | Keep as compiled fleet config; remove generated loop/proof/runtime state |
| `frankxai/starlight-evals` | Real whole-system harness whose README still calls it a mirror | Promote to independent eval authority; SIS consumes releases/receipts |
| `frankxai/starlight-agent-lab` | Near-empty neutral sandbox | Repurpose for quarantined upstream comparisons; archive if the next cycle is empty |
| `frankxai/starlight-swarm` | Typed dry-run Queen/worker runtime and team-pack compiler | Keep as governed runtime; exclude unrelated website-skill branches |
| `frankxai/starlight-swarm-bus` | Explicitly created in error; no unique product | Archive after confirming active bus redirect |
| `frankxai/agent-registry` | Empty public placeholder | Archive; real registries already exist |
| `frankxai/starlight-agent-army-architecture` | Public playbook overlapping standard and runtime | Harvest contracts/recipes into canonical homes, then archive |
| `frankxai/agentic-operating-system-standard` | Public schemas, modules, validator, examples | Keep as canonical public standard; no live fleet state |

## Pull-request queue at cutoff

Highest-priority mergeable candidates, pending repository-native validation and current-head checks:

- [`starlight-agent-skills#18`](https://github.com/frankxai/starlight-agent-skills/pull/18): release integrity.
- [`starlight-memory#10`](https://github.com/frankxai/starlight-memory/pull/10): privacy hardening and durable Graphiti outbox.
- [`second-brain-os#6`](https://github.com/frankxai/second-brain-os/pull/6): safe sharded ChatGPT ingestion.
- [`second-brain-os#3`](https://github.com/frankxai/second-brain-os/pull/3): Time OS, optional extension only.

Supersede rather than conflict-resolve:

- [`second-brain-os#2`](https://github.com/frankxai/second-brain-os/pull/2) regresses the public version from v0.3 to v0.1.
- [`second-brain-os#4`](https://github.com/frankxai/second-brain-os/pull/4) is stale documentation overtaken by `main`.

## Unsafe branch chains

1. **Starlight Memory:** merge and validate #10 first. Replay only independent Hindsight/Honcho/provider-eval commits from #11 onto the resulting `main`; both branches modify router, privacy, providers, package version, and CLI.
2. **Command Center:** flatten `agent/claude/observatory` then `agent/hermes/queen-agent-registry-20260806`; evaluate `brand-estate-cockpit` and `queen-mission-control` as sibling one-commit additions. Do not merge four stacks independently.
3. **Agent Config:** choose the best descendant of `agent/claude/main-excellence-control-plane`; exclude `.loop/**/proofs` and runtime state before replaying orthogonal contracts. Two open branches span about 1,594 files and are not safe conflict-resolution candidates.
4. **Agentic Ops:** use `agent/codex/media-control-plane` as the media integration candidate; compare, do not stack, the divergent `media-platform`, `media-deploy-hardening`, and `media-fabric-foundation` alternatives. Rebase `empire-registry-foundation` separately.
5. **SIS:** rebase the media-governance PR first. Creative Studio remains founder-gated. Supersede duplicate public-install and historical preservation branches rather than cherry-picking them all.
6. **Agentic Ops Hub:** most of its 26 branches are snapshots and receipts. Preserve history, extract durable contracts/code, and close the rest.

## Missing integration PRs to create

- `agentic-ops/agent/codex/media-control-plane`
- `agentic-ops/agent/codex/empire-registry-foundation`
- consolidated `starlight-command-center` Observatory chain
- `starlight-agentic-os/codex/windows-router-portability-20260729`
- `starlight-swarm/agent/hermes/runtime-hardening-20260809`
- `starlight-private-memory/codex/memory-graph-contract`
- `agentic-operating-system-standard/codex/estate-contracts-public`

## Immediate operating policy

Freeze new long-lived branches. New work uses a short-lived branch from current `main`, one isolated worktree per writing agent, a linked issue/decision, and a terminal receipt. Every existing branch receives `adopt`, `supersede`, `archive`, or `investigate`; only `adopt` commits are replayed.

Repository deletion and archival are deliberately not performed by this audit. Each archive action requires a canonical redirect, recovery tag, dependency/consumer check, and explicit owner sign-off.
