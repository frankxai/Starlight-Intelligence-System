# RESEARCH PROTOCOL — The Verifiable Research Loop

The deterministic loop every research agent (any harness) and every human contributor follows to grow the tree. Designed on one assumption: **hallucination is the default behavior of the substrate** — so the workflow, not the model's confidence, produces the truth.

---

## 0. Task selection

Work comes from three queues, in priority order:
1. **Quest deepening** — an existing `quest` node needs its prerequisite lattice, constraining evidence, or current state-of-attack mapped.
2. **Gap fill** — a Cartographer sweep or curator request flags a missing foundation concept, a dangling `requires` edge, or a domain with thin cross-links.
3. **Frontier watch** — new landmark results (papers, replications, retractions) that change confidence levels or resolve quests.

One agent per domain-branch per session. Claim the task in `MEMORY.md` open-tasking before starting.

## 1. Frame

Write, before touching any source: the claim(s) to be established, the node/edge shape expected, and what evidence would *refute* the framing. If the task can't be framed falsifiably, return it to the curator with the ambiguity named — do not improvise scope.

## 2. Harvest

- Query the open APIs (INTEGRATIONS.md): OpenAlex/Semantic Scholar for literature and citation context, arXiv/PubMed/NASA ADS for primary sources, Wikidata for identifiers and structured facts, Crossref for DOI resolution.
- **Primary sources outrank surveys; surveys outrank tertiary summaries; model memory ranks nowhere.** Every fact used must trace to a fetched source, not recall.
- Record every source consulted (including dead ends) — the harvest log rides with the proposal.

## 3. Synthesize

Draft the typed proposal:
- Nodes with `summary` (one to two sentences, plain language, no jargon a smart newcomer can't parse), proposed `confidence`, `refs[]`.
- Edges using the **weakest true relation** (ONTOLOGY.md §4); cross-domain edges explicitly hunted for.
- For quests: success criteria, the `requires` lattice, and the best current constraining `evidence` nodes.
- Validate locally against `data/graph.schema.json`. A proposal that fails schema does not proceed to verification.

## 4. Verify (adversarial)

An independent verifier — different instance/session/human than the synthesizer — attempts to **refute** each claim:
- Does the cited source actually say this? (Fetch and check; citation drift is the most common failure.)
- Is the confidence level honest per LAW-4? Try to find the contradicting literature.
- Are the edges real? (A plausible-sounding `requires` that experts would reject is worse than a missing edge.)
- Default to *refuted* when uncertain.

For `established`-confidence claims and all quest framings, use three verifier votes with distinct lenses (source-fidelity, confidence-honesty, edge-validity); majority refute kills or downgrades the claim. Single-vote verification is acceptable for `speculative`/`contested` labels and copy-level edits.

## 5. Propose

Submit to the canon repo: schema-valid JSON patch + provenance blocks + harvest log + verification record. Title format: `kt(<domain>): <n> nodes / <m> edges — <one-line>`. One domain-branch per proposal.

## 6. Merge (curator)

The curator — human, or agent with batched human review per LAW-3 — checks laws compliance (cite by number on rejection), leverage (does this serve capability or just coverage?), and dedup against `aliases`. Merge bumps `meta.version` and appends the changelog line.

## 7. Record

Write the outcome to `MEMORY.md`: task closed, follow-ups spawned, patterns noticed (e.g., "domain X's quest lattice is thin"). Substrate-relevant lessons go to SIS vaults. Future sessions compound on this — skipping the record step is how swarms repeat work.

---

## Failure handling

- **Source unavailable / API down:** note it, use an alternate open source; never substitute memory.
- **Contradictory sources:** that *is* the finding — propose `contested` with both sides cited.
- **Scope creep mid-task:** stop, log the discovered scope in MEMORY.md as a new task, finish the framed one.
- **Verifier and synthesizer deadlock:** escalate to curator with both records; curator may down-scope to `speculative` or reject.

*Built on SIP — Starlight Intelligence Protocol.*
