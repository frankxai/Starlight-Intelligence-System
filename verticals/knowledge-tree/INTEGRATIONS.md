# INTEGRATIONS — External APIs, Datasets, and Open Standards

The registry of what the Knowledge Tree connects to. Open-first per LAW-8: every load-bearing source is openly accessible; proprietary services may enrich but never gate the build.

---

## 1. Harvest sources (literature & structured knowledge)

| Source | What it provides | Access | Use for |
|---|---|---|---|
| **OpenAlex** | Open catalog of scholarly works, authors, venues, concepts | Free API, no key (polite pool via email header) | Primary literature discovery, citation context, concept linkage |
| **Wikidata** | Structured facts + persistent QIDs | Free SPARQL + REST | Identifier anchoring, cross-referencing, alias harvesting |
| **arXiv** | Preprints: physics, math, CS, q-bio | Free API + OAI-PMH | Primary sources for foundation domains |
| **Crossref** | DOI registry + metadata | Free API | DOI resolution, retraction watch (with Retraction Watch data) |
| **Semantic Scholar** | Paper graph, TLDRs, influence metrics | Free API (key for higher limits) | Citation-graph context, influential-paper detection |
| **PubMed / Europe PMC** | Biomedical literature | Free API | Life & Mind domain harvesting |
| **NASA ADS** | Astronomy/astrophysics literature | Free API (key) | Physics & Cosmos domain |
| **OpenCitations** | Open citation graph | Free API | Independent citation verification |
| **Papers with Code** | ML results + benchmark tables | Free API | Computation & Intelligence evidence nodes |
| **Zenodo / OSF / Dryad** | Open datasets + preregistrations | Free APIs | Evidence provenance, replication records |
| **ORCID** | Researcher identifiers | Free API | Contributor attribution |
| **DBpedia / Wikipedia API** | Encyclopedic summaries | Free | Newcomer-facing summary calibration only — never a primary source |

Rate-limit discipline: identify with a contact email where supported, cache aggressively, batch queries. Harvest logs record source + query + timestamp for every fact.

## 2. Open standards adopted

| Standard | Where it binds |
|---|---|
| **SKILL.md open standard** (agent skills, cross-vendor) | `SKILL.md`, `AGENTS.md` role definitions — runnable by 30+ tools |
| **MCP** (Model Context Protocol) | All tool access from agent harnesses |
| **A2A** (Agent2Agent, Linux Foundation) | Inter-agent messaging as the corps distributes across harnesses; tracked, adopted as it stabilizes |
| **JSON Schema** (draft 2020-12) | `data/graph.schema.json` validates all canon and proposals |
| **JSON-LD / schema.org / SKOS / W3C PROV** | Documented mappings in `ONTOLOGY.md` §5; `@context` ships Phase 3 |
| **Persistent identifiers** (DOI, arXiv, QID, ORCID, ISBN) | `refs[]` on every sourced claim (LAW-1) |
| **SPDX license expressions** | License fields in canon metadata |
| **CC-BY-4.0 / MIT** | Data / code licensing (LAW-10) |
| **C2PA** | Content credentials on generated media artifacts (site visuals, explainers) as tooling matures — EU AI Act Art. 50 alignment |
| **Semver** | Canon versioning (SYSTEM §3) |

## 3. Ecosystem interop targets

| System | Relationship |
|---|---|
| **SIS substrate** | Governance, attestation, vaults, agent registry — this vertical's host |
| **ACOS** | Creator adapter: quests → build logs, explainers, visual atlases |
| **claude-skills-library** | Distribution of KT skill/agents in open format |
| **Nous Hermes-class agents / open-weight harnesses** | First-class corps runners via SKILL.md + MCP — no Claude dependency |
| **Obsidian / personal vaults** | Local-first Skill DNA overlay; wikilinked recall of tree positions |
| **GitHub** | Proposal + merge workflow (issues/PRs on the canon repo); the contribution front door |

## 4. Explicitly not dependencies

- Proprietary knowledge APIs as load-bearing sources (enrichment only).
- Any single LLM vendor: the corps must run on at least two unrelated harnesses at all times.
- Accounts/auth on the public surface: the site renders canon without login; progression is local-first.

*Built on SIP — Starlight Intelligence Protocol.*
