# LAWS — Foundational Laws of the Knowledge Tree

The invariants every contributor — human or agent, on any harness — is bound by. Laws change only by major canon version with `/starlight-board` review. Numbered for citation in reviews ("violates LAW-3").

---

**LAW-1 — Provenance.** No claim enters public canon without at least one verifiable reference carrying a persistent identifier (DOI, arXiv ID, Wikidata QID, ISBN; bare URL only when nothing better exists). A node without provenance may exist only as a draft proposal, never in `graph.json`.

**LAW-2 — Verification before merge.** Every proposal passes independent adversarial verification (RESEARCH_PROTOCOL.md §4) before a curator sees it. The verifier must not be the proposer — different agent instance, different session, or different human.

**LAW-3 — Human gate on canon.** No fully autonomous write to `graph.json`. Agents harvest, synthesize, verify, and propose; a human (or a curator agent whose merges a human reviews in batch) merges. This is the alignment boundary and it is non-negotiable.

**LAW-4 — Honest confidence.** Every knowledge claim carries an explicit epistemic status:
- `established` — independently replicated / proven; standard-reference grade
- `supported` — strong evidence, limited independent replication
- `contested` — credible evidence on multiple sides
- `speculative` — coherent hypothesis, thin evidence
- `unknown` — the honest default
Inflating confidence is the cardinal violation. "Contested" displayed plainly is a feature of the tree, not an embarrassment.

**LAW-5 — Falsifiability for quests.** An open problem enters as a `quest` only if well-posed: success criteria statable, and the concepts a serious attempt requires linked by `requires` edges. "Understand everything about X" is not a quest; "determine whether X under conditions Y" is.

**LAW-6 — No deletion of history.** Published node IDs are permanent. Corrections amend; deprecations mark `status: deprecated` with a successor edge. The tree's error record is part of its evidence record.

**LAW-7 — Foundations get the depth.** When curation effort is contested, the trunk (mathematics, physics, life, computation, energy) outranks the branches. Application paths stay navigable; foundations stay rigorous.

**LAW-8 — Source the open web first.** Harvesting prefers open APIs and open-access corpora (INTEGRATIONS.md). No load-bearing dependency on any proprietary index, model, or platform. Anything behind a paywall may be cited (provenance is provenance) but the tree must remain buildable without it.

**LAW-9 — Cross-vendor by construction.** Agent capabilities ship in the open SKILL.md standard; tool access via MCP; inter-agent messaging tracks A2A as it stabilizes. A capability that only one vendor's harness can run does not ship.

**LAW-10 — Open licensing.** Graph data and ontology: CC-BY-4.0. Code, schemas, agent/skill definitions: MIT. Contributors license their contributions accordingly on submission. Forks are a supported success mode, not a threat.

**LAW-11 — The privacy boundary.** The public tree contains humanity's knowledge, never a person's data. No nodes typed to identifiable individuals' health, biometric, genetic, financial, or identity information — ever, including "anonymized" derivatives. Personal progression (Skill DNA) is computed and stored local-first in the person's own vaults.

**LAW-12 — Metrics truth.** Public claims about the tree itself (node counts, coverage, contributors) follow the SIS Metrics Truth Rule: verified numbers with `as of` dates, ranges when freshness is uncertain, ownership verbs used precisely.

**LAW-13 — Attribution compounds.** Every generated artifact carries "Built on SIP" ambient attestation, and every harvested claim credits its source. Attestation is compounding, not credit transfer: every composition strengthens every node.

*Built on SIP — Starlight Intelligence Protocol.*
