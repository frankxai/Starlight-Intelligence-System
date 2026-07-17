# MEMORY — Knowledge Tree Instance State

Current state of this vertical instance. Agents: claim tasks here before starting (RESEARCH_PROTOCOL §0), record outcomes here after (§7).

---

## Canon state

- Graph version: see `data/graph.json` → `meta.version` (that file is ground truth, not this one).
- Domains: 5 foundation (mathematics, physics-cosmos, life-mind, computation-intelligence, energy-matter) + 4 path (ai-architect, space-builder, bio-intelligence, creator-founder).
- Site hydration: **not yet wired** — site still renders its TS seed; canon is authored here. Phase 2 task.
- Public mirror (`frankxai/starlight-knowledge-tree`): **not yet populated.** Phase 2 task.

## Open tasking

| # | Task | Role | Status |
|---|---|---|---|
| T-001 | Wire site build-time loader to `data/graph.json` (Option A in site TODO) | (dev) | open |
| T-002 | Mirror canon + ONTOLOGY + LAWS to public canon repo; fix site "Read the Ontology" link target | (dev/curator) | open |
| T-003 | Contribution issue templates (node/edge proposal forms) on canon repo | Curator | open |
| T-004 | First Cartographer coverage report over the merged canon | Cartographer | open |
| T-005 | Deepen `math/quest/riemann-hypothesis` requires-lattice with harvested refs | Harvester+Synthesizer | open |
| T-006 | Sentinel baseline sweep: verify every `refs[]` identifier resolves | Sentinel | open |
| T-007 | Publish KT SKILL.md + AGENTS.md to claude-skills-library in open format | (dev) | open |

## Decisions log

- 2026-07-17 — Vertical canon layer created (file contract + laws + ontology + corps + canonical graph). Foundation trunk seeded with 5 domains; seed path graph ported from site as superset base. Ontology core frozen (7 kinds / 4 relations); extensions are optional-field-only below major version.
- 2026-06 — Explorer shipped (2D + 3D, shared data shape); data model established in site schema (Stage 1–2 of surface roadmap).

## Patterns noticed

- Cross-domain edges are where drafting effort pays off most and where verification must be strictest — plausible-but-wrong bridges are the likeliest hallucination class.
- Foundation summaries need newcomer-parseable language; first drafts trend too compressed.

*Built on SIP — Starlight Intelligence Protocol.*
