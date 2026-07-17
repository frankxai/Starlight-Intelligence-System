# Contributing to the Starlight Knowledge Tree

Anyone — human or agent, on any harness — can grow the tree. Every contribution enters through the same gate, and that gate is what keeps the canon trustworthy: **typed, provenance-carrying, adversarially verified, human-merged.**

Read `LAWS.md` and `ONTOLOGY.md` first. Everything below is how they operate in practice.

---

## The one-paragraph version

Find a gap or a frontier. Pull real sources (never model memory). Draft typed nodes/edges with provenance and honest confidence. Have someone (or some agent instance) other than the author try to refute it. Submit a schema-valid proposal. A curator merges under human review. Record what you learned so the next contributor compounds instead of repeats.

---

## For humans

1. **Open a proposal** using the issue forms — *Knowledge Tree — node / edge proposal* or *Knowledge Tree — quest*. The forms enforce the load-bearing fields (provenance, confidence, prerequisite lattice).
2. Or **open a PR** editing `verticals/knowledge-tree/data/graph.json` directly. Before pushing, run the validator:
   ```bash
   node verticals/knowledge-tree/data/validate.mjs
   ```
   It must exit clean (warnings about un-sourced draft nodes are fine; errors are not). CI runs the same check on every PR touching the canon.
3. A curator reviews against the Laws (cited by number on any rejection) and merges.

## For agents

Run the seven-role loop in `RESEARCH_PROTOCOL.md`. The short form:

| Step | Role | Rule |
|---|---|---|
| Select a task | Cartographer / Questwright | Claim it in `MEMORY.md` first |
| Pull sources | Harvester | Open APIs in `INTEGRATIONS.md`; every fact traces to a fetched source (LAW-1) |
| Draft typed nodes/edges | Synthesizer | Weakest true relation; lowest defensible confidence (LAW-4) |
| Refute it | Verifier | Must be a different instance/session than the synthesizer (LAW-2); default *refuted* when unsure |
| Submit | — | Schema-valid patch + provenance + harvest log |
| Merge | Curator | Human-review lane required (LAW-3) |
| Record | — | Outcome + patterns to `MEMORY.md` |

Agent capabilities ship in the open SKILL.md standard (`SKILL.md`, `AGENTS.md`), so this loop runs on Claude, Codex, Gemini, Grok, or any SKILL.md-compatible harness — no single-vendor dependency (LAW-9).

---

## What gets a proposal rejected

- **No provenance** (LAW-1) — the fastest rejection. A claim without a verifiable source is a draft, not knowledge.
- **Inflated confidence** (LAW-4) — calling something `established` that is merely `supported`.
- **Invented edges** — a plausible-sounding `requires` that a domain expert would reject is worse than a missing edge.
- **Ontology drift** — inventing a node kind or relation outside the closed sets. Those change only by major version + `/starlight-board` review.
- **Private data** (LAW-11) — anything person-scoped. The public tree holds humanity's knowledge, never a human's data.
- **Vague quests** (LAW-5) — no statable success criteria, or no prerequisite lattice.

---

## Licensing

By contributing you license graph data and ontology content under **CC-BY-4.0** and any code under **MIT** (LAW-10). Forks are a supported success mode — the whole tree is meant to be grown, copied, and grown again.

*Built on SIP — Starlight Intelligence Protocol.*
