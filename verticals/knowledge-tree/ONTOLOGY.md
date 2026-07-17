# ONTOLOGY — Starlight Knowledge Tree

The formal vocabulary of the graph. Everything in `data/graph.json` is expressible in — and only in — the terms defined here. The site page links "Read the Ontology" to this document's public mirror.

---

## 1. Design principles

1. **Small closed core, open periphery.** Seven node kinds, four relations. Extending the core is a major-version, board-gated event. Optional metadata fields are the pressure valve — add fields, not kinds.
2. **Progression-typed, not topic-typed.** The kind axis encodes *where a unit sits on the capability loop*, not its subject. Subject lives in `domainId` + free-text; capability structure lives in the type system.
3. **Mappable to open vocabularies.** Every core term has a documented mapping to schema.org / SKOS / W3C PROV (§5) so the graph participates in the linked-data web without adopting RDF as its working format.

---

## 2. Node kinds (closed set)

| Kind | Meaning | Test for membership |
|---|---|---|
| `concept` | Abstract understanding — the what and why | Can be stated, taught, and examined; cites at least one canonical source |
| `skill` | Executable capability | A person either can or cannot demonstrably do it |
| `practice` | Repeated, habitual application | Has cadence; degrades without repetition |
| `artifact` | Produced output | Exists independently of its maker; can be inspected |
| `evidence` | Verified result constraining what is true | Carries measurement/replication provenance and `last_verified` |
| `contribution` | Public value others can build on | Licensed, published, citable |
| `quest` | Open problem / active frontier | Well-posed; success criteria statable; currently unsolved |

The loop `concept → skill → practice → artifact → evidence → contribution` is the human progression; `quest` is where the loop points. A solved quest is retyped (usually to `evidence`) with a successor edge preserving history.

### 2.1 Foundational-science conventions

The five foundation domains (mathematics, physics-cosmos, life-mind, computation-intelligence, energy-matter) use the same kinds with these conventions:
- **Laws and theories** (thermodynamics, evolution, general relativity) are `concept` nodes — with confidence `established` only after the replication bar of `LAWS.md` §4.
- **Landmark results** (LIGO GW150914, AlphaFold CASP14, fusion ignition at NIF) are `evidence` nodes anchored by DOI.
- **Open problems** (Riemann hypothesis, origin of life, quantum gravity, P vs NP) are `quest` nodes — each MUST link `requires` edges to the concepts a serious attempt presupposes.

---

## 3. Node fields

Required (renderer-compatible core, matches the site schema):
`id`, `label`, `kind`, `domainId`, `summary`.

Optional (canon-only; renderers ignore unknown fields):

| Field | Type | Purpose |
|---|---|---|
| `confidence` | `established \| supported \| contested \| speculative \| unknown` | Epistemic status per `LAWS.md` §4 |
| `refs` | array of `{type, id, note?}` | Provenance anchors; `type ∈ doi, arxiv, wikidata, orcid, isbn, url` |
| `last_verified` | ISO date | Required on `evidence` nodes |
| `status` | `active \| deprecated` | Lifecycle; deprecated nodes keep their ID forever |
| `aliases` | string[] | Alternate names for search/dedup |
| `difficulty` | 1–5 | Path-planning hint, foundations relative to domain entry |

Node ID grammar: `<domain-prefix>/<kind>/<slug>` — lowercase, hyphenated, ASCII. Domain prefixes are registered in `data/graph.json` `meta.domainPrefixes`.

---

## 4. Edge relations (closed set)

| Relation | Direction semantics | Example |
|---|---|---|
| `unlocks` | Mastery of source makes target tractable | linear-algebra → transformers |
| `requires` | Target presupposes source (hard prerequisite) | quantum-gravity ← general-relativity |
| `part-of` | Source is a component of target | mitochondrial-biology part-of cell-biology |
| `contributes-to` | Source advances target (quest or larger program) | alphafold-evidence contributes-to protein-folding-quest |

Edges: `{ source, target, relation, note? }`. `unlocks` vs `requires`: `requires` is the strict form (you cannot meaningfully attempt the target without it); `unlocks` is the generative form (the source opens the target up). Use the weakest true relation.

Cross-domain edges are first-class and deliberately cultivated — they are where the tree earns its keep (thermodynamics→origin-of-life, information-theory→neural-coding, group-theory→standard-model).

---

## 5. Open-standard mappings

Working format is JSON validated by `data/graph.schema.json`. For linked-data consumers, the canonical mappings:

| KT term | schema.org | SKOS / PROV |
|---|---|---|
| `concept` node | `DefinedTerm` | `skos:Concept` |
| `skill` / `practice` | `DefinedTerm` (in a skills `DefinedTermSet`) | `skos:Concept` |
| `artifact` / `contribution` | `CreativeWork` | `prov:Entity` |
| `evidence` | `Claim` + `ScholarlyArticle` refs | `prov:Entity` with `prov:wasDerivedFrom` |
| `quest` | `Question` | `skos:Concept` (frontier collection) |
| `refs[]` entry | `citation` | `prov:wasDerivedFrom` |
| `requires` edge | — | `skos:broader`-analog (documented, not literal) |
| `part-of` edge | `isPartOf` | `skos:broader` |

A JSON-LD `@context` file will ship alongside the canon when the first external consumer needs it (`ROADMAP.md` Phase 3) — mappings above are normative now so nothing is modeled in a way that can't be lifted.

---

## 6. Domains

A domain is a curatorial branch, not an ontological one — it groups nodes for navigation and accent color, nothing more. Two tiers by convention:
- **Foundation domains** (trunk): mathematics, physics-cosmos, life-mind, computation-intelligence, energy-matter.
- **Path domains** (branches): AI Architect, Space Builder, Bio/Human Intelligence, Creator-Founder — and community forks.

Domain fields: `id`, `name`, `accent` (site token: violet/cyan/fuchsia/emerald/amber/rose), `blurb`, optional `tier: foundation | path`.

*Built on SIP — Starlight Intelligence Protocol.*
