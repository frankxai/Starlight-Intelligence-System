# ROADMAP — Knowledge Tree Build-Out

Phased, each phase closing with a verifiable milestone. Dates are targets, not claims (LAW-12); the changelog in `data/graph.json` is the ground truth of progress.

---

## Phase 0 — Surface + seed ✅ (shipped)

- Thesis page at starlightintelligence.org/knowledge-tree; 2D constellation + 3D cosmic explorer at `/knowledge-tree/explore` (same data shape, reduced-motion/no-WebGL fallbacks).
- Hand-authored seed: 4 path domains, ~44 nodes, ~48 edges in the site bundle.

## Phase 1 — Canon layer (this phase)

- ✅ Vertical file contract: SOUL, SYSTEM, ONTOLOGY, LAWS, RESEARCH_PROTOCOL, AGENTS, SKILL, INTEGRATIONS, MEMORY.
- ✅ `data/graph.json` as canonical source: seed superset + 5 foundation domains (mathematics, physics-cosmos, life-mind, computation-intelligence, energy-matter) with laws-as-concepts, landmark evidence, and well-posed quests.
- ✅ `data/graph.schema.json` validation.
- **Exit test:** schema validates canon clean; every foundation quest has a `requires` lattice; every evidence node carries a DOI-class ref.

## Phase 2 — Site hydration + canon mirror

- Build-time loader: site reads `graph.json` (Option A in the site's `TODO(knowledge-tree-data)`); delete-or-demote the TS seed.
- Mirror canon + ontology + laws to the public `frankxai/starlight-knowledge-tree` repo; "Read the Ontology" and "Contribute" links point at real, populated targets.
- Contribution templates: node/edge proposal issue forms enforcing provenance fields.
- **Exit test:** a change merged to canon appears on the live explorer on next deploy with no code edits; an outside contributor can submit a valid proposal from the templates alone.

## Phase 3 — Research corps at scale

- Run the seven-role corps (AGENTS.md) on ≥2 unrelated harnesses against real tasking: one full domain sweep per foundation domain via open-API harvesting (INTEGRATIONS.md).
- Provenance completeness: 100% of non-draft nodes carry refs; Sentinel cadence live (staleness + retraction watch).
- JSON-LD `@context` published; first external linked-data consumer.
- **Target scale:** foundation trunk at ~150–250 rigorously verified nodes — depth over count.
- **Exit test:** an end-to-end proposal (harvest → 3-lens verify → curator merge) completed by agents with human batch review, laws-clean.

## Phase 4 — Rooms + game layer (site Stages 3–4)

- Domain clusters as navigable spaces; quest board surfaced as the explorer's call-to-action.
- Progression loop as game mechanics (XP over concept→contribution), **local-first only** — no accounts, no server-side personal state.
- **Exit test:** a visitor can walk a foundation domain, pick a quest, and see exactly which concepts they need — in one session, on a phone.

## Phase 5 — Skill DNA + community paths

- Local-first personal overlay: interests, abilities, proof artifacts, active quests — computed against public canon in the browser / personal vault (LAW-11 enforced by architecture, not policy).
- Community-forked path domains with the same schema; federation pattern for independent trees that cross-link canons.
- **Exit test:** two independent forks exchange nodes via proposals without either losing provenance or version integrity.

---

## Standing cadences (from Phase 3)

- **Weekly:** Sentinel integrity sweep; Questwright frontier watch.
- **Monthly:** Cartographer coverage report; canon minor release.
- **Quarterly:** ontology review (only forum where kind/relation changes may be raised); board-gated.

*Built on SIP — Starlight Intelligence Protocol.*
