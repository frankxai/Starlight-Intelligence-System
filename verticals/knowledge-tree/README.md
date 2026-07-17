# Starlight Knowledge Tree

> An open intelligence graph for human capability, scientific knowledge, and contribution paths. The Knowledge Tree maps what exists, what matters, what you know, what you can build, what you can contribute, and what unlocks next — for humans and agents working together. This is the civilizational-scale vertical of the Starlight Intelligence System: the pursuit of mapping all verifiable knowledge, anchored in the foundations of mathematics, physics, life, computation, and energy, and made walkable by anyone.

**Tier:** Sovereign vertical (civilizational scope).
**License:** Graph data + ontology: CC-BY-4.0. Code + agent/skill definitions: MIT. See `LAWS.md` §10.
**Status:** `alpha — v0.2` (canon layer live; explorer shipped at starlightintelligence.org/knowledge-tree).

---

## What this vertical is

The Knowledge Tree is not a course library and not a wiki. It is a **typed, versioned, provenance-carrying graph** where every node is a unit of understanding or capability at a specific progression level (`concept → skill → practice → artifact → evidence → contribution → quest`) and every edge is a typed relation (`unlocks / requires / part-of / contributes-to`). Most learning systems track consumption. The Knowledge Tree tracks capability — and points every capable person at the open frontier.

File contract (vertical-standard + KT-specific):

| File | Role |
|---|---|
| `SKILL.md` | Auto-loading skill (open SKILL.md standard, cross-vendor) |
| `SOUL.md` | Essence that must not drift |
| `AGENTS.md` | The research corps — agent roles any harness can run |
| `MEMORY.md` | Current instance state |
| `SYSTEM.md` | Greater architecture — layers, repos, data flow |
| `ONTOLOGY.md` | Formal graph ontology + open-standard mappings |
| `LAWS.md` | Foundational laws — epistemic + operational invariants |
| `RESEARCH_PROTOCOL.md` | The verifiable research loop every agent follows |
| `INTEGRATIONS.md` | External APIs, datasets, and open standards registry |
| `ROADMAP.md` | Phased build-out with verifiable milestones |
| `data/graph.json` | Canonical graph — the single source of truth |
| `data/graph.schema.json` | JSON Schema that validates the canon |

This vertical declines defining its own CANON.md mythology — the knowledge itself is the canon, and `LAWS.md` governs how it earns its place.

---

## The thesis

Humanity's knowledge is fragmented across papers, repos, textbooks, and heads. The frontier is invisible to most people who could push it. The Knowledge Tree exists to make three things legible at once:

1. **The map** — what is known, organized by foundations (mathematics, physics & cosmos, life & mind, computation & intelligence, energy & matter), with provenance for every claim.
2. **The path** — how a specific person gets from curiosity to contribution, via typed progression paths (AI Architect, Space Builder, Bio/Human Intelligence, Creator-Founder — and any path the community forks).
3. **The frontier** — the open problems (`quest` nodes) that matter, ranked by leverage, each linked to the concepts that unlock it and the evidence that constrains it.

The test for every addition: *does this help someone build, verify, or contribute — not just consume?*

---

## The repo constellation

The project deliberately spans a small number of repos with sharp boundaries — canon, substrate, and surface never blur:

| Repo | Role | Holds |
|---|---|---|
| `frankxai/starlight-knowledge-tree` | **Public canon** (the durable, forkable artifact) | `data/graph.json`, `ONTOLOGY.md`, `LAWS.md`, contribution quests, research maps — mirrored from this vertical once populated |
| `frankxai/Starlight-Intelligence-System` | **Substrate + governance** (this repo) | This vertical, SIP attestation, `/starlight-board` gating, agent registry, harness checks |
| `Starlight-Intelligence-System/site` | **Surface** | starlightintelligence.org/knowledge-tree (thesis + paths) and `/knowledge-tree/explore` (2D/3D graph renderers) — hydrates from the canon, never authors it |
| `frankxai/agentic-creator-os` | **Creator adapter** | Commands/skills that turn KT contribution quests into creator pipelines (build logs, explainers, visual atlases) |
| `frankxai/claude-skills-library` | **Distribution** | The KT `SKILL.md` + `AGENTS.md` published in the open SKILL.md format so any harness (Claude, Codex, Gemini, Grok, Nous Hermes-class agents) can run the research corps |

Rule: **data flows canon → surface, never the reverse.** The site's seed data in `site/src/lib/knowledge-tree/data.ts` is a bootstrap; `data/graph.json` here is now canonical and the site's documented hydration target (`TODO(knowledge-tree-data)` in the site code).

---

## Built on open standards, by design

Interoperability is the strategy, not a feature. See `INTEGRATIONS.md` for the full registry; the load-bearing choices:

- **SKILL.md open standard** (agent skills readable by 30+ cross-vendor tools) for every agent capability we ship.
- **MCP** for tool access; **A2A** as the inter-agent wire protocol as it stabilizes.
- **JSON + JSON Schema** for the canon; **JSON-LD / schema.org / SKOS** mappings so the graph is linked-data addressable (`ONTOLOGY.md` §5).
- **W3C PROV** vocabulary for provenance; **CC-BY / MIT** licensing; **persistent identifiers** (DOI, arXiv ID, ORCID, Wikidata QID) as the anchor for every external claim.
- Harvest sources are open-first: OpenAlex, Wikidata, arXiv, Crossref, Semantic Scholar, PubMed, NASA ADS — never a proprietary index as a dependency.

---

## Who this is for

- **Learners** who want a map instead of a syllabus — see what unlocks what, and where they stand.
- **Builders** who want the shortest path from concept to shipped artifact with proof.
- **Researchers** (human and agent) who want open problems with context, constraints, and prior evidence attached.
- **Agent operators** who want a governed, verifiable research loop their swarms can execute without hallucinating a knowledge base into existence.

This is **not** for: credential theater, engagement-optimized content feeds, or private data of any kind — health, biometric, financial, and identity data stay in local/private vaults and never enter the public tree (`LAWS.md` §11).

---

## How to contribute

Every contribution enters through the same gate: a typed node or edge proposal carrying provenance, validated against `data/graph.schema.json`, passed through the verification stage of `RESEARCH_PROTOCOL.md`, and merged by a curator (human or agent under human review). Open an issue or PR on the canon repo. Quests welcome — a well-posed open problem is a first-class contribution.

---

*Built on SIP — Starlight Intelligence Protocol. Substrate: starlightintelligence.org/protocol.*
