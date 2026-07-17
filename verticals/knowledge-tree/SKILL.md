---
name: knowledge-tree
description: Starlight Knowledge Tree vertical — civilizational-scale open knowledge graph. Load when mapping knowledge domains, running the research corps (harvest/synthesize/verify/curate), posing or deepening open-problem quests, editing the canon graph data, or working on the Knowledge Tree site surfaces. Enforces provenance, adversarial verification, and the privacy boundary.
license: MIT (definitions) / CC-BY-4.0 (graph data)
---

# Knowledge Tree skill

## Premise

This vertical maps human knowledge and capability as a typed, provenance-carrying graph — foundations (mathematics, physics & cosmos, life & mind, computation & intelligence, energy & matter) as the trunk, capability paths as branches, open problems (`quest` nodes) as the frontier. Working "inside this vertical" means any task that reads or grows the graph: research sweeps, quest framing, canon edits, ontology questions, or the starlightintelligence.org surfaces.

The core loop every unit of knowledge lives on: `concept → skill → practice → artifact → evidence → contribution`, pointed at `quest`. The core rule: **capability over consumption, provenance or it doesn't exist.**

## Always load alongside this skill

- `LAWS.md` — the 13 invariants; cite by number in any review or rejection.
- `ONTOLOGY.md` — the closed kind/relation sets; never invent types.
- `RESEARCH_PROTOCOL.md` — the seven-step loop for any research task.
- `AGENTS.md` — pick the role the task needs; respect its refusals.
- `MEMORY.md` — claim tasks before starting; record outcomes after.
- `SYSTEM.md` — when architecture, data flow, or versioning is in scope.
- `INTEGRATIONS.md` — when harvesting; use open APIs, never model memory.

## Operating rules at this layer

1. **Layer check first.** Canon data (`data/graph.json`) changes go through proposal → verification → curator; never direct edits, never from the surface. Site work (`site/src/**`) is read-only toward canon.
2. **Schema-valid or nothing.** Validate every node/edge against `data/graph.schema.json` before proposing. ID grammar: `<domain-prefix>/<kind>/<slug>`, permanent once published.
3. **Confidence honesty.** `established / supported / contested / speculative / unknown` — assign the lowest defensible level. Displaying "contested" plainly is the product working.
4. **Weakest true relation.** `requires` only for hard prerequisites; otherwise `unlocks`. Hunt cross-domain edges — they are the tree's highest-value structure.
5. **Privacy boundary is absolute.** Nothing person-typed enters the public graph (LAW-11). Skill DNA and progression state are local-first, in personal vaults.
6. **Ontology is frozen at this tier.** New kinds or relations = major version + `/starlight-board` review. Add optional fields instead.
7. **Record or it didn't happen.** Outcomes to `MEMORY.md`; substrate-relevant patterns to SIS vaults.

## Voice at this layer

Architect primary (structure, rigor, versioning discipline) with sovereign-creator warmth on every learner-facing summary — a smart newcomer must be able to parse any node summary. Wonder is welcome and stated plainly; mysticism dressed as knowledge is refused. No guru language, no inflated claims about the tree itself (LAW-12).

## Quick reference

| Task | Entry point |
|---|---|
| Grow a domain | RESEARCH_PROTOCOL §0–7, Cartographer gap report first |
| Pose an open problem | Questwright role; LAW-5 well-posedness test |
| Check a proposal | Verifier role; default refuted when uncertain |
| Merge to canon | Curator role; human-review lane per LAW-3 |
| Site/renderer work | SYSTEM §6; canon → surface, one-way |
| External API work | INTEGRATIONS.md registry; open-first per LAW-8 |

*Built on SIP — Starlight Intelligence Protocol. Substrate: starlightintelligence.org/protocol.*
