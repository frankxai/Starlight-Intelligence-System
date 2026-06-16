# Starlight Skill Registry

> 78 skills across 16 domains. Domain-specific registry parallel to `agents/AGENT_REGISTRY.md`. Source-of-truth for skill ownership, version, and status; `skill-rules.json` remains the source-of-truth for activation triggers (keywords, agents, intents).

---

## Architecture

The skill ecosystem is **catalog-shaped, not hierarchical** — every skill is a peer that auto-activates on context match. A skill's identity is its `domain/skill-name` key (e.g., `memory/vault-management`). The registry's job is to make ownership, version, and lifecycle explicit so cross-repo consumers (Arcanea, FrankX, ACOS, sovereign instances) can pin against a known-good state.

This file is **operational-tier** — it does not appear in the substrate-tier file-contract list (SIP / SIS / ALLIANCE / STACK / VERTICALS / VOICES / REGISTRY) and edits do not trigger `/starlight-board`. Compare to `/REGISTRY.md` (substrate-tier MCP server registry per SIP § Layer 3) — different purpose, different governance.

## Schema

```yaml
name: <domain>/<skill-name>          # canonical key, matches skill-rules.json `skill` field
domain: <top-level-dir>              # one of 15: business, crypto-intelligence, energy-intelligence,
                                     # health, integration, intelligence, machine, memory, music-is,
                                     # orchestration, people-intelligence, relational, safety, sound-intelligence, vision
activation_rule_id: <string>         # matches skill-rules.json `id` field; symmetry enforced by future v78 test
owner_repo: SIS | <repo-name>        # default SIS; named repo if forked or alliance-owned
version: <YYYY-MM-DD>                # date-stamped initial; semver upgrade reserved for Tier 3b
status: stable | experimental | deprecated
forked_from: <skill-key> (optional)  # reserved for v2 multi-owner branch tracking; unused in v1
```

## Status lifecycle

| Status | Meaning | Consumers should |
|---|---|---|
| `stable` | Activation rules + content production-ready | pin and rely |
| `experimental` | Active iteration; activation triggers may shift | use with awareness; expect drift |
| `deprecated` | Slated for removal; replacement (if any) named | migrate; do not pin new dependencies |

Promotion (experimental → stable) and demotion (stable → deprecated) require an entry in the skill's frontmatter changelog or a note here.

## Multi-owner branch points (reserved)

When a sovereign forks an SIS-canonical skill (e.g., Arcanea wants a divergent variant of `intelligence/strategic-reasoning` for canon-bound work), the fork carries `forked_from: <upstream-skill-key>` plus its own owner_repo. v1 does not enforce this; v2 may add a fork-tree resolver. The Seer vector at the 2026-05-06 board flagged this as the load-bearing concern for 18-month success-case scenarios.

---

## Registry

### business (2)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| business/entity-architecture | business-entity-architecture | SIS | 2026-05-06 | stable |
| business/revenue-modeling | business-revenue-modeling | SIS | 2026-05-06 | stable |

### energy-intelligence (7)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| energy-intelligence/sizing-architecture | energy-intelligence-sizing-architecture | SIS | 2026-05-06 | stable |
| energy-intelligence/cost-modeling | energy-intelligence-cost-modeling | SIS | 2026-05-06 | stable |
| energy-intelligence/installer-workflow | energy-intelligence-installer-workflow | SIS | 2026-05-06 | stable |
| energy-intelligence/operations-monitoring | energy-intelligence-operations-monitoring | SIS | 2026-05-06 | stable |
| energy-intelligence/buyer-journey | energy-intelligence-buyer-journey | SIS | 2026-05-06 | stable |
| energy-intelligence/grid-integration | energy-intelligence-grid-integration | SIS | 2026-05-06 | stable |
| energy-intelligence/recovery-protocol | energy-intelligence-recovery-protocol | SIS | 2026-05-06 | stable |

### health (2)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| health/body-substrate | health-body-substrate | SIS | 2026-05-06 | stable |
| health/energy-architecture | health-energy-architecture | SIS | 2026-05-06 | stable |

### integration (7)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| integration/domain-stack-architecture | integration-domain-stack-architecture | SIS | 2026-05-06 | stable |
| integration/repo-bridge | integration-repo-bridge | SIS | 2026-05-06 | stable |
| integration/ecosystem-sync | integration-ecosystem-sync | SIS | 2026-05-06 | stable |
| integration/transmission-protocol | integration-transmission-protocol | SIS | 2026-05-06 | stable |
| integration/universal-adapter | integration-universal-adapter | SIS | 2026-05-06 | stable |
| integration/idea-triage | integration-idea-triage | SIS | 2026-05-06 | stable |
| integration/creator-path | integration-creator-path | SIS | 2026-05-06 | stable |

### intelligence (7)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| intelligence/strategic-reasoning | intelligence-strategic-reasoning | SIS | 2026-05-06 | stable |
| intelligence/systems-thinking | intelligence-systems-thinking | SIS | 2026-05-06 | stable |
| intelligence/pattern-recognition | intelligence-pattern-recognition | SIS | 2026-05-06 | stable |
| intelligence/decision-framework | intelligence-decision-framework | SIS | 2026-05-06 | stable |
| intelligence/genius-excavation | intelligence-genius-excavation | SIS | 2026-05-06 | stable |
| intelligence/knowledge-reclamation | intelligence-knowledge-reclamation | SIS | 2026-05-06 | stable |
| intelligence/hermes-search | intelligence-hermes-search | SIS | 2026-06-09 | stable |

### machine (2)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| machine/heart | machine-heart | SIS | 2026-05-10 | experimental |
| machine/storage | machine-storage | SIS | 2026-05-10 | experimental |

### marine-intelligence (1)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| marine-intelligence/contribute | marine-intelligence-contribute | SIS | 2026-06-15 | stable |

### memory (8)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| memory/vault-management | memory-vault-management | SIS | 2026-05-06 | stable |
| memory/knowledge-synthesis | memory-knowledge-synthesis | SIS | 2026-05-06 | stable |
| memory/context-preservation | memory-context-preservation | SIS | 2026-05-06 | stable |
| memory/memory-consolidation | memory-memory-consolidation | SIS | 2026-05-06 | stable |
| memory/capture-discipline | memory-capture-discipline | SIS | 2026-05-06 | stable |
| memory/insight-distillation | memory-insight-distillation | SIS | 2026-05-06 | stable |
| memory/sis-memory-orchestrator | memory-sis-memory-orchestrator | SIS | 2026-05-06 | stable |
| memory/mempalace-obsidian-bridge | memory-mempalace-obsidian-bridge | SIS | 2026-05-17 | stable |

### music-is (10)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| music-is/amplification-mesh | music-is-amplification-mesh | SIS | 2026-05-06 | stable |
| music-is/asset-render | music-is-asset-render | SIS | 2026-05-06 | stable |
| music-is/catalog-systems | music-is-catalog-systems | SIS | 2026-05-06 | stable |
| music-is/distribution-flow | music-is-distribution-flow | SIS | 2026-05-06 | stable |
| music-is/naming-intelligence | music-is-naming-intelligence | SIS | 2026-05-06 | stable |
| music-is/persona-canon | music-is-persona-canon | SIS | 2026-05-06 | stable |
| music-is/release-gate | music-is-release-gate | SIS | 2026-05-06 | stable |
| music-is/royalty-graph | music-is-royalty-graph | SIS | 2026-05-06 | stable |
| music-is/song-intake | music-is-song-intake | SIS | 2026-05-06 | stable |
| music-is/suno-prompt | music-is-suno-prompt | SIS | 2026-05-06 | stable |

### orchestration (9)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| orchestration/agent-handoff-packet | orchestration-agent-handoff-packet | SIS | 2026-05-06 | stable |
| orchestration/cli-tool-router | orchestration-cli-tool-router | SIS | 2026-06-12 | stable |
| orchestration/multi-agent-coordination | orchestration-multi-agent-coordination | SIS | 2026-05-06 | stable |
| orchestration/workflow-design | orchestration-workflow-design | SIS | 2026-05-06 | stable |
| orchestration/context-engineering | orchestration-context-engineering | SIS | 2026-05-06 | stable |
| orchestration/parallel-execution | orchestration-parallel-execution | SIS | 2026-05-06 | stable |
| orchestration/yolo-conductor | orchestration-yolo-conductor | SIS | 2026-05-11 | stable |
| orchestration/yolo-scan | orchestration-yolo-scan | SIS | 2026-05-11 | stable |
| orchestration/gencreator-stack | orchestration-gencreator-stack | SIS | 2026-05-13 | stable |

### people-intelligence (6)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| people-intelligence/structured-hiring | people-intelligence-structured-hiring | SIS | 2026-05-06 | stable |
| people-intelligence/learning-architecture | people-intelligence-learning-architecture | SIS | 2026-05-06 | stable |
| people-intelligence/culture-design | people-intelligence-culture-design | SIS | 2026-05-06 | stable |
| people-intelligence/org-architecture | people-intelligence-org-architecture | SIS | 2026-05-06 | stable |
| people-intelligence/people-dynamics | people-intelligence-people-dynamics | SIS | 2026-05-06 | stable |
| people-intelligence/feedback-conversations | people-intelligence-feedback-conversations | SIS | 2026-05-06 | stable |

### relational (2)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| relational/network-architecture | relational-network-architecture | SIS | 2026-05-06 | stable |
| relational/alliance-readiness | relational-alliance-readiness | SIS | 2026-05-06 | stable |

### sound-intelligence (6)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| sound-intelligence/audience-architecture | sound-intelligence-audience-architecture | SIS | 2026-05-06 | stable |
| sound-intelligence/catalog-systems | sound-intelligence-catalog-systems | SIS | 2026-05-06 | stable |
| sound-intelligence/composition-architecture | sound-intelligence-composition-architecture | SIS | 2026-05-06 | stable |
| sound-intelligence/performance-design | sound-intelligence-performance-design | SIS | 2026-05-06 | stable |
| sound-intelligence/production-systems | sound-intelligence-production-systems | SIS | 2026-05-06 | stable |
| sound-intelligence/sync-licensing | sound-intelligence-sync-licensing | SIS | 2026-05-06 | stable |

### crypto-intelligence (2)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| crypto-intelligence | crypto-intelligence-vertical | SIS | 2026-05-17 | experimental |
| crypto-intelligence/onchain | crypto-intelligence-onchain | SIS | 2026-05-17 | experimental |

### vision (3)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| vision/fundamentals-excavation | vision-fundamentals-excavation | SIS | 2026-05-06 | stable |
| vision/design-coherence | vision-design-coherence | SIS | 2026-05-06 | stable |
| vision/voice-anti-slop | vision-voice-anti-slop | SIS | 2026-05-06 | stable |

### safety (4)

| Skill | Activation rule ID | Owner repo | Version | Status |
|---|---|---|---|---|
| safety/permission-gate | safety-permission-gate | SIS | 2026-06-09 | stable |
| safety/secret-detector | safety-secret-detector | SIS | 2026-06-09 | stable |
| safety/private-public-split | safety-private-public-split | SIS | 2026-06-09 | stable |
| safety/mutation-approval | safety-mutation-approval | SIS | 2026-06-09 | stable |

---

## How this composes

- **`skills/skill-rules.json`** — activation triggers (keywords, agents, intents). This registry references its rule IDs; the JSON file is the activation source-of-truth.
- **`skills/skill-rules.json` ↔ `skills/**/*.md` symmetry** — enforced by `test/v77-skill-rules.test.ts` (every rule points at a real file; every skill file is registered or in `EXEMPT_PHANTOMS`).
- **`SKILL_REGISTRY.md` ↔ `skill-rules.json` symmetry** — to be enforced by future `test/v78-skill-registry.test.ts` (separate ship per board's Verifier vector — drift detection on first commit must be addressed before adding to pre-commit hook scope).
- **`agents/AGENT_REGISTRY.md`** — sibling registry for the 21 agents. Same operational-tier governance posture.
- **Cross-Repo Indexer** — surfaces this registry as an indexable atom; sibling repos can query "what's the canonical X skill" and get this file as the answer.

## How to add a new skill

1. Author `skills/<domain>/<skill-name>/SKILL.md` (or `skills/<domain>/<skill-name>.md`) with proper frontmatter.
2. Add an activation rule to `skills/skill-rules.json` with a unique `id`.
3. Add a row to the appropriate domain table in this file with version `<today's date>` and status `stable` (or `experimental` if iterating).
4. Run `node --import tsx --test test/v77-skill-rules.test.ts` — should pass green.
5. Commit. Pre-commit hook will re-run v77 (and v78 once it ships).

## How to deprecate a skill

1. Set status to `deprecated` in this registry.
2. Add a note in the skill's frontmatter or the registry row naming the replacement (if any).
3. Activation rule stays in `skill-rules.json` for one release cycle to give consumers time to migrate.
4. Remove activation rule + skill file in a follow-up commit no sooner than 30 days later.

## How to fork

(Reserved for v2.) When a sovereign repo forks an SIS-canonical skill with divergent intent:

1. The fork lives in the sovereign repo at the same `domain/skill-name` path.
2. The fork's row in *its own* SKILL_REGISTRY.md sets `forked_from: SIS:<skill-key>` and `owner_repo: <sovereign-repo>`.
3. The SIS canonical entry remains unchanged — `forked_from` points upstream, never downstream.
4. v2 may add a fork-tree resolver to the registry.

---

**Built on SIP** · Skill Registry v1.0 · operational-tier · 2026-05-06
- Layers used: [skill-activation, file-contract]
- Board verdict: REVISE applied (board verdict at `docs/boards/2026-05-06-skills-registry.md`)
- Precedent: `agents/AGENT_REGISTRY.md` (domain-specific registry pattern)
