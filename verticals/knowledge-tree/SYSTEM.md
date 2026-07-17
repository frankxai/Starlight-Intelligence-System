# SYSTEM — Greater Architecture of the Starlight Knowledge Tree

The end-to-end system: how knowledge enters, earns trust, becomes canon, and reaches humans and agents. Read this before touching any layer.

---

## 1. The five layers

```
L5  SURFACE      starlightintelligence.org/knowledge-tree (+ /explore 2D/3D)
                 future: rooms, game layer, Skill DNA overlay (local-first)
        ▲ hydrates (read-only)
L4  CANON        data/graph.json  — versioned, schema-validated, CC-BY
                 mirrored to frankxai/starlight-knowledge-tree (public repo)
        ▲ merge gate (curator + schema + laws)
L3  VERIFICATION verify stage of RESEARCH_PROTOCOL.md — adversarial checks,
                 confidence assignment, provenance validation
        ▲ typed proposals
L2  RESEARCH     agent corps (AGENTS.md) — harvest, synthesize, pose quests
                 sources: open APIs + literature (INTEGRATIONS.md)
        ▲ tasking
L1  SUBSTRATE    SIS/SIP — attestation, governance (/starlight-board),
                 memory vaults, agent registry, harness portability
```

Invariants:
- Writes only move **upward through gates**. Nothing writes canon directly from research; nothing on the surface writes at all.
- Every layer is independently replaceable. The renderer swapped from 2D to 3D without touching data; the data source will swap from site-seed to canon without touching renderers. Keep it that way.

---

## 2. Canon data flow

```
open sources ──► Harvester agents ──► proposals/ (typed diffs + provenance)
                                          │
                              Verifier agents (adversarial, N-vote)
                                          │ pass
                              Curator (human / human-reviewed)
                                          │ merge
                              data/graph.json  (bump graph version)
                                          │
              ┌───────────────────────────┼─────────────────────────┐
              ▼                           ▼                         ▼
   site build-time loader     public canon repo mirror     third-party forks
   (Option A in site TODO)    (starlight-knowledge-tree)   (CC-BY, self-serve)
```

A **proposal** is a JSON patch against `graph.json` (nodes/edges added or amended) plus a provenance block per claim. Schema: `data/graph.schema.json` definitions apply to proposals identically — a proposal that wouldn't validate post-merge is rejected pre-review.

---

## 3. Graph versioning

- `meta.version` in `graph.json` is semver. **Patch**: copy edits, summary clarifications. **Minor**: nodes/edges added. **Major**: ontology change (new kind, new relation, changed semantics) — requires `/starlight-board` review because ontology is substrate-adjacent.
- Every merge appends one line to `meta.changelog` (`version — date — n nodes / n edges — one-line summary`).
- Renderers must tolerate unknown optional fields (forward compatibility) and must not require fields beyond the schema's `required` set (backward compatibility).

---

## 4. Identity and addressing

- Node IDs are stable slugs: `<domain-prefix>/<kind>/<short-slug>` (e.g. `phys/quest/quantum-gravity`). IDs are **never reused or renamed** once published in a tagged canon version; deprecation is a `status: "deprecated"` field plus a successor edge, not deletion.
- External anchoring: nodes carry `refs[]` — persistent identifiers (DOI, arXiv, Wikidata QID, ORCID, URL-as-last-resort). The Wikidata QID, when present, makes each node linked-data addressable; `ONTOLOGY.md` §5 defines the JSON-LD context.

---

## 5. The agent execution model

Any capable harness — Claude, Codex, Gemini CLI, Grok, Nous Hermes-class agents, or a human with a checklist — can run the corps, because the roles are defined in the open SKILL.md standard and the loop is deterministic:

1. **Task intake** — a quest, gap, or domain sweep is selected from `MEMORY.md` open tasking or a curator request.
2. **Harvest** — pull from the open APIs in `INTEGRATIONS.md`; never from memory alone (Karpathy hygiene: verify against real sources).
3. **Synthesize** — draft typed nodes/edges with provenance and proposed confidence.
4. **Verify** — independent adversarial pass per `RESEARCH_PROTOCOL.md` §4; majority-refute kills the claim.
5. **Propose** — schema-valid patch + provenance to the canon repo.
6. **Record** — write outcome to `MEMORY.md` (and SIS vaults when substrate-relevant) so future sessions compound instead of repeat.

Concurrency rule: one agent per domain-branch per session (mirrors the SIS parallel-agent worktree discipline) — merges are serialized through the curator gate, so contention resolves at proposal level, not in-file.

---

## 6. Surface architecture (today and staged)

- **Stage 1–2 (shipped):** static thesis page + 2D constellation + 3D cosmic explorer, all consuming the same `{nodes, edges}` shape. Reduced-motion and no-WebGL degrade to 2D; screen-reader fallback list included.
- **Stage 3 — Rooms:** domain clusters become navigable spaces; same data, spatial renderer.
- **Stage 4 — Game layer:** quests, XP over the progression loop, evidence linking. Progression state is **local-first** (browser storage / personal vault) — the public site never holds accounts or personal data.
- **Stage 5 — Skill DNA:** a person's private overlay (interests, abilities, proof artifacts, active quests) computed locally against the public canon.

---

## 7. Failure modes designed against

| Failure | Defense |
|---|---|
| Hallucinated knowledge entering canon | Provenance required at schema level; adversarial verification; human merge gate |
| Ontology sprawl | Kind/relation sets are closed; extension requires major version + board review |
| Vendor lock-in | Open standards only; canon is plain JSON; full fork is a supported path |
| Popularity bias (mapping what's cited, not what matters) | Quest-first tasking; curator review weighs leverage, not citation count alone |
| Private data leakage | Hard boundary at schema level — no person-typed nodes; local-first progression |
| Silent staleness | `last_verified` on evidence-class claims; Sentinel sweep (AGENTS.md) flags aging nodes |

*Built on SIP — Starlight Intelligence Protocol.*
