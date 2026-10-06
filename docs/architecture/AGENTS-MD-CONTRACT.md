# The AGENTS.md contract — where the agent contract lives

**Status:** proposed. Touches the SIP § 1 file-contract, so `/starlight-board` runs before tag or merge, per `CLAUDE.md` § substrate-tier governance gate.
**Date:** 2026-09-19
**Owner:** `agent:starlight-cto` (topology) with `agent:starlight-caio` (substrate)

---

## The question

*Should `AGENTS.md` live centrally in SIS, one per company, or one per repo?*

## The decision

**One `AGENTS.md` per repository. Never per company. Never one central copy.**
**A company is a registry row in SIS, not a file — and it is *projected into* every repo it owns.**

The three options are not equivalent, because `AGENTS.md` is not documentation. It is a **harness artifact**: the file an agent reads at session start because it landed in that working tree. A contract that is not in the tree is not read. Centralising it deletes it.

The opposite failure is equally real: 45 hand-maintained copies drift, and the drift is already measurable.

| Observed, 2026-09-19 | Count |
|---|---|
| Repos in the estate | 45 |
| With `AGENTS.md` | 29 |
| Without any agent contract | 16 |
| **T0/T1 repos without one** | **2** (`starlight-agent-skills`, `GenCreator-Studio`) |
| Divergent beyond repair by reading | `arcanea` — 8 lines of Cursor Cloud port notes; no DNA, no voice, no branch protocol, no canon gate |
| Corrupted | `Starlight-Intelligence-System` — BOM + 170 cp1252 double-encodings in the substrate's own contract *(repaired in this change)* |

Copies drift. Generation does not. So: **the file is per-repo; the *source* of most of it is not.**

---

## The three-band model

Every `AGENTS.md` has exactly three bands, in this order. Only one of them is hand-written.

### Band A — inherited (generated; never hand-edited)

Identical across the estate. Frank DNA, the five behavioural guardrails, decision discipline, branch/PR protocol, the multi-agent coordination rules, the attestation clause, the safety non-waivables.

Generated from SIS. Fenced with markers so the generator can replace it without touching anything else:

```markdown
<!-- STARLIGHT:BAND-A:BEGIN v1 sha=... — generated, do not hand-edit -->
...
<!-- STARLIGHT:BAND-A:END -->
```

Editing inside the fence is a lint failure. Change it upstream in SIS and regenerate.

### Band B — company projection (generated; never hand-edited)

This is where **"AGENTS.md per company"** actually lands. Not as a file per company — as a *projection* of one company row into each repo that company owns:

- which company owns this repo, and its stage
- which **legal entity** it routes through (name and role only — never jurisdiction, never terms)
- which **brand register** applies here, and the `COPY.md` pin that governs it
- which **executive seat** is accountable, and where this repo escalates
- the repo's **tier** (T0–T3) and what that implies about installing it

Source: `ontology/company-registry.json` + `ontology/repo-tiers.json`. Same fence, same rule.

### Band C — repo-local (hand-written; the generator never touches it)

Build and test commands. Ports. Local gotchas. Domain contracts that exist only here — the canon gate in `arcanea`, the fail-closed money rule in `payment-intelligence-system`, the homepage preservation contract in `frankx.ai-vercel-website`, the non-clinical boundary in the mind repos.

**Band C outranks Band A on any conflict inside its own repo**, and the generated preamble says so. A generated contract that can silently override a local safety gate is worse than no generated contract.

It does **not** outrank Band B, and the asymmetry is deliberate. Band A is behaviour, which a repo legitimately localizes — the canon gate in `arcanea`, fail-closed money in `payment-intelligence-system`, the non-clinical boundary in the mind repos. Band B is registry fact: owner, legal entity, accountable seat, brand pin, tier. A repo cannot localize a fact without becoming wrong, so a Band C line contradicting Band B is a defect to fix in `ontology/company-registry.json`, not a local override. Band B already subordinates itself where it should — the seat it names "is never able to overrule a gate."

An earlier draft of this document claimed Band C outranked both while the generated preamble bound only "this section", and the generator's `--init` stub claimed both as well: three statements of the rule, two of them disagreeing with the one that actually ships. A cross-family review on [`arcanea-ai-app#443`](https://github.com/frankxai/arcanea-ai-app/pull/443) caught it. All three now state the asymmetry.

---

## Standing against SIP Layer 1

This change was flagged substrate-tier because it touches the SIP § 1 file contract, and an earlier draft of this document never quoted the row it touches. SIP v1.1.1 § 1 says:

| File | Purpose | Required |
|------|---------|----------|
| `SKILL.md` | Behavior definition — what the AI adopts when this context is loaded | yes |
| `AGENTS.md` | Voices / agent definitions | yes if >1 agent |

Band A is behaviour, and it lands in `AGENTS.md`. Read strictly, the spec puts behaviour in `SKILL.md` and reserves `AGENTS.md` for voices. **The three-band model does not amend SIP § 1, and this is deliberate.**

Three reasons it does not need to:

1. **§ 1 constrains which files exist and which are required — not exhaustively what may be written inside one.** Bands A, B and C are a projection *into* a file the spec already requires; no new file, no changed requirement, no removed row.
2. **The two files answer different questions.** `SKILL.md` is the behaviour of a *capability* once loaded. `AGENTS.md` is the contract of a *working tree* — what an agent reads because it is sitting in this checkout. Measured across the twenty repos carrying both files, that is already how the estate uses it, and the `CLAUDE.md` vs `AGENTS.md` section below has the count.
3. **Amending the row is test-coupled and belongs in its own change.** `src/version.ts::getSipVersion()` parses SIP.md's `Version:` line as the single source, and `test/v80-platform-prompts.test.ts` reads that same line and fails any platform prompt claiming a different `SIP vX.Y.Z`. Changing the row's meaning without a version bump leaves two readers of "v1.1.1" seeing different specs; bumping it requires updating `SIP_VERSION_FALLBACK` and every `SIP v1.1.1` claim across the adapters and platform prompts in the same commit, or the drift detector goes red. That is a different change, with a different blast radius, and it gets its own board pass.

**Registered as a SIP amendment candidate, not taken here:** restate § 1's `AGENTS.md` row as the cross-harness working-tree contract, which is what nineteen of twenty repos already use it for. Minor bump — it relaxes rather than restricts, so no adopter file becomes invalid and the 90-day deprecation window for breaking changes does not apply. Cost is the version fan-out in the paragraph above.

**Separate finding, flagged not fixed:** eleven-plus `v1.1.1` strings are hardcoded in attestation blocks across `src/` instead of calling `getSipVersion()`. They are correct today by coincidence. The drift detector only guards platform prompts, not these.

## Board verdict — 2026-10-05

`/starlight-board` on this change, at head `91a642e`, projected into ten T0/T1 repos at band A `sha=b4a7e18fed75`.

**REVISE.** The ten-repo projection was found measured rather than asserted — band hash, idempotency and byte-identical Band C verified in all ten, two cross-family reviews absorbed. Two gaps were named, both landing on the T2 backfill rather than on the T0/T1 merge:

| # | Vector | Finding | Resolution |
|---|---|---|---|
| REVISE-1 | Harmonizer | The change never engaged with what SIP § 1 says `AGENTS.md` is for. | *Standing against SIP Layer 1*, above. Deferred explicitly, with the amendment registered and its cost priced. |
| REVISE-2 | Harmonizer | `agentic-ops-hub` is T2, inside the generator's default scope, and its `AGENTS.md` is the hand-edited source its own `sync-agent-rules.mjs` fans out — with `--check` in CI. The T2 backfill would have put two generators on one file. | `agents_md.owns_source` in `ontology/repo-tiers.json`, enforced in the generator and reported as a named SKIP. Declared in data, not hardcoded by name, so it generalises to the next repo that does this. |

Two further concerns were recorded without blocking the merge, because neither is falsified or fixed by it:

- **Seer:** at 45 repos, Band C — the only part carrying a real local gate — sits below ~100 identical generated lines. The repos most at risk are exactly the ones the model exists to protect: fail-closed money in `payment-intelligence-system`, the non-clinical boundary in the mind repos. Untested, and testable.
- **Verifier:** ten T0/T1 repos are verified; the other thirty-five are asserted. `--check` reports eighteen T2 repos stale, and nothing yet proves generator output is correct where Band C is absent or divergent — `arcanea` is eight lines of Cursor port notes. Extend the Band-C-byte-identity harness to T2 before flipping INV-6 to error.

## Direction of generation

```
ontology/agents-md/band-a.md   ─┐
ontology/company-registry.json  ├─→  scripts/agents-md-project.mjs  ─→  <repo>/AGENTS.md
ontology/repo-tiers.json       ─┘                                         bands A + B only
```

One way. SIS is the source; the repo is the destination. Nothing reads a repo's `AGENTS.md` back into SIS.

**Band A is an authored file, not a scrape.** This diagram previously named `VOICES.md` and `CLAUDE.md` as the Band A source. The generator instead reads one authored template, `ontology/agents-md/band-a.md`, distilled by hand from the DNA in `CLAUDE.md` and the registers in `VOICES.md`. Regex-lifting sections out of a 331-line prose file that is edited for other reasons would put 45 repos one careless heading change away from a silently wrong contract. `VOICES.md` remains voice authority; Band A does not restate it.

**Prior art already in the estate:** `agentic-ops-hub` runs exactly this pattern — `AGENTS.md` is the single source and `node scripts/sync-agent-rules.mjs` fans it out to every tool-specific format, with `--check` in CI. The generator generalises that from one repo to the estate; it does not invent it.

### `CLAUDE.md` vs `AGENTS.md`

Unchanged and orthogonal. `AGENTS.md` is the cross-harness contract (Codex, Cursor, Cline, Gemini, Grok, OpenCode). `CLAUDE.md` is the Claude-specific deepening on top of it.

**Which of the two wins is per repo, and no generated band decides it.** An earlier draft of this document asserted that `CLAUDE.md` always wins. Twenty repos in the estate carry both files at root. Read against all twenty on 2026-09-29, that rule is stated by five and contradicted by seven:

| Precedence, as the repo itself states it | n | Repos |
|---|---|---|
| `AGENTS.md` first, or named the shared contract | 7 | `FrankX`, `agentic-mind-os`, `agentic-ops-hub`, `arcanea-ai-app`, `frankx.ai-vercel-website`, `gencreator-community`, `starlight-mind-os-pro` |
| `CLAUDE.md` wins, or read first | 5 | `GenCreator-Studio`, `Starlight-Intelligence-System`, `agentic-creator-os`, `agentic-income-template` (UI paths only), `payment-intelligence-system` |
| Parity — same doctrine, one file per harness | 1 | `human-mind-intelligence-system` |
| Contradictory — each file names the other as "read first" | 1 | `gencreator.ai`, since `266aa2b` |
| Silent — neither file ranks the other | 6 | `agenticincome`, `agenticpassiveincome`, `arcanea`, `blue-life-commons`, `realityarchitect`, `starlight-swarm` |

`agentic-ops-hub` is the sharpest counter-example, and it is the prior art named above: its `AGENTS.md` is headed *Single Source of Truth*, and its `CLAUDE.md` is `@AGENTS.md` plus a Claude-only delta that `scripts/sync-agent-rules.mjs` generates. An estate-wide "`CLAUDE.md` wins" would invert that repo's own contract.

So this axis belongs in **Band C**, stated by each repo in its own words. Band A says nothing about `CLAUDE.md`, deliberately: it ranks Band C above Bands A and B *within `AGENTS.md`*, which is a different question. A generated band ruling on cross-file precedence would be the exact failure the three-band model exists to prevent — a projected contract silently overriding a local one.

The `gencreator.ai` row is drift, not a design. `266aa2b` gave its `CLAUDE.md` a "read `@AGENTS.md` first" line while its `AGENTS.md` still said "read `CLAUDE.md` first", so each file now sends the reader to the other. One line in either file resolves it, in that repo, as Band C.

---

## What this makes enforceable

`scripts/estate-graph.mjs` exits non-zero on the following. **It is not yet a CI
gate** — no workflow in `.github/workflows/` runs `estate:check` or
`agents:project:check`, so today these are checks a session runs, not a build that
fails. Wiring them is step 7 below, and it has to wait for the baseline to clear:
turned on now, `estate:check` would make every PR red on 23 errors it did not
cause. An earlier version of this section said "fails the build", which was a
claim about enforcement the repo does not have.

- **INV-6** — a T0 or T1 repo whose `AGENTS.md` is absent or divergent. Measured on 2026-10-06, after `starlight-agent-skills#27` and `GenCreator-Studio#7` merged: **0 errors** and **5 warnings** (T0/T1 repos still fully hand-written: SIS, `frankx.ai-vercel-website`, `FrankX`, `gencreator.ai`, `gencreator-community`). `arcanea-ai-app`, `agentic-creator-os` and `claude-skills-library` were three more until #443, #64 and #31 merged; the two errors were `starlight-agent-skills` and `GenCreator-Studio`, cleared by #27 and #7. A previous version of this line said "3 errors" by counting the hand-written category as an error; it is a warning until step 6 flips it.
- **INV-1** — a repo owned by zero or two companies.
- **INV-7** — money, jurisdiction, or credentials leaking into a public projection.

---

## Migration, in order

1. **Repair what is broken.** SIS `AGENTS.md` BOM + mojibake — *done*.
2. **Write Band C where it is missing.** 16 repos as observed on 2026-09-19, hand-written, one per repo. No generator can invent local build commands. *The two T0/T1 cases are done: `starlight-agent-skills#27` and `GenCreator-Studio#7` both merged 2026-10-06, which is what took INV-6 to zero errors. The remaining 14 are T2/T3 and belong to step 5.*
3. **Ship the generator.** `scripts/agents-md-project.mjs`, with a `--check` mode suitable for CI — *done*. `npm run agents:project` / `agents:project:check`. Shipping the mode is not wiring it; see step 7.
4. **Backfill T0/T1** — *projected*, ten repos at band A `sha=b4a7e18fed75`, each verified for byte-identical Band C against a pre-regeneration snapshot. **In production: five.** See *Production state* below — a projection sitting on a branch is not a contract any session reads.
5. **Backfill T2** — eighteen repos still report stale. **Not mechanical**, per the Board's Verifier finding: extend the Band-C-byte-identity harness to T2 and run it there first. `arcanea` is eight lines of Cursor port notes with no Band C to preserve, and a repo in that state needs Band C written before it is projected into, not after. `agentic-ops-hub` is permanently out of scope by `owns_source`.
6. **Flip INV-6 to error** for handwritten T0/T1 once step 5 completes and the T2 harness is green.
7. **Wire both checks into CI.** `estate:check` and `agents:project:check` run only by hand today. They go into a workflow once steps 5 and 6 bring the baseline to zero — a gate that is red for reasons the PR did not cause gets ignored, then disabled.

Step 2 is the real work and it does not parallelise well — 16 repos of genuine local knowledge, of which the two that were failing INV-6 are now done and 14 T2/T3 remain. Step 4 is projected and measured, and five of the ten are in `main` — see *Production state*. Step 5 is where the remaining risk sits: ten repos are verified, the other thirty-five are asserted, and calling that stretch "mechanical" is what the Board pushed back on.

### The generator, as built

```bash
npm run agents:project              # write bands A+B into every sibling checkout
npm run agents:project:check        # verify only; non-zero if any is stale
node scripts/agents-md-project.mjs --tree .. --repo <name>     # one repo
node scripts/agents-md-project.mjs --tree .. --tier T0,T1      # tier subset
node scripts/agents-md-project.mjs --tree .. --init            # also create absent files
```

Four properties it holds, each verified against the live tree rather than asserted:

- **Band C survives byte-for-byte.** The generator strips the fences, keeps the remainder exactly, and re-emits A + B + C in that order. Measured on SIS's own 21,039-byte contract: identical before and after.
- **Idempotent.** A second run writes nothing. `--check` can therefore distinguish a stale file from a fresh one, the same property `sourcesDigest` gives the estate graph.
- **Hand-edits inside a fence are caught.** Each fence carries the `sha256` prefix of the body the generator wrote. A body that no longer hashes to its own declared `sha` was edited in place; `--check` warns by name and says to change it upstream instead.
- **INV-7 is enforced before the write, not after.** The projection is scanned for money, jurisdiction, and credential patterns using the *same* regex as `scripts/estate-graph.mjs` — one definition of the invariant, so the generator and the validator cannot disagree about what a leak is.

A repo with no `AGENTS.md` is skipped with a warning, not invented. Band C is local knowledge; `--init` writes an explicitly marked `TODO` stub and nothing more.

**Observed on 2026-10-06**, `--tree .. --tier T0,T1,T2 --check`: the ten T0/T1 repos report up to date, eighteen T2 repos report stale, `agentic-ops-hub` reports a named SKIP for `owns_source`, and 0 would leak. That is the size of step 5.

---

## Production state — 2026-10-06

A band projection only becomes a contract when it is on the branch a session clones. Ten repos
carry the projection on `claude/agent-docs-structure-roles-k0fv2d`; **five are in `main`.**

| Repo | PR | In `main`? | Band B `sha` | Band C lines |
|---|---|---|---|---|
| `arcanea-ai-app` | [#443](https://github.com/frankxai/arcanea-ai-app/pull/443) | **yes** — squash `add2fca` | `8821700dff0c` | 179 |
| `Starlight-Intelligence-System` | #175 | no — open | `668830d0f25b` | 332 |
| `claude-skills-library` | [#31](https://github.com/frankxai/claude-skills-library/pull/31) | **yes** — squash `2b41506` | `4307d160ea40` | 42 |
| `frankx.ai-vercel-website` | #742 | no — open | `f6fcf460d4ff` | 175 |
| `FrankX` | #232 | no — open | `6c4506aaaf9b` | 315 |
| `gencreator.ai` | #92 | no — label-blocked | `829e8a10457f` | 103 |
| `gencreator-community` | #9 | no — label-blocked | `9d4533d72545` | 45 |
| `agentic-creator-os` | [#64](https://github.com/frankxai/agentic-creator-os/pull/64) | **yes** — squash `71191a0` | `5c35a8ecb312` | 31 |
| `starlight-agent-skills` | [#27](https://github.com/frankxai/starlight-agent-skills/pull/27) | **yes** — squash `a214296` | `76f817d3cca1` | 91 — newly written, was absent |
| `GenCreator-Studio` | [#7](https://github.com/frankxai/GenCreator-Studio/pull/7) | **yes** — squash `cd27e1d` | `58f6cb510b69` | 79 — newly written, was absent |

Band A is `b4a7e18fed75` in all ten — that is the point of Band A. Band B differs per repo because
it projects that repo's company row. Band C line counts are the measured region below the fences,
which is the hand-written file plus the generator's blank separator.

`gencreator.ai#92` and `gencreator-community#9` are held by the `governance` locked surface in
`scripts/governance/surface-guard.mjs`, which requires Frank's `surface-approved` label. That is
the gate working as designed: both PRs change the Surface Guard workflow itself, and a gate a PR
can edit is not a gate. Neither can be unblocked by an agent, and neither should be.

**Both merges touched exactly one file.** `add2fca` added 106 lines to `arcanea-ai-app`'s existing
`AGENTS.md` and nothing else, verified against its parent `04933ad`; the 38-file delta between that
PR head and the merge commit is base drift from PRs that landed on `main` in the meantime (#528,
#445, #464, #524), not scope that rode in with the bands. `a214296` added `AGENTS.md` to
`starlight-agent-skills` at 194 lines, verified against `0dfeaef`, and `cd27e1d` added
`GenCreator-Studio`'s at 182, verified against `0dc637f` — both new files, because neither repo
had an agent contract at all.

Bookkeeping each merge requires, and which this change carries: `ontology/repo-tiers.json` moves
the merged repo to `state: "generated"`, and `ontology/estate-graph.json` is rebuilt so
`sourcesDigest` is not stale (INV-0 fires on exactly that). The estate run has moved
**23 errors / 12 warnings → 23 / 11 → 22 / 11 → 21 / 11 → 21 / 10 → 21 / 9**. `arcanea-ai-app`,
`agentic-creator-os` and `claude-skills-library` each cleared an INV-6 *warning*, because all three
already had a hand-written contract. `starlight-agent-skills` and
`GenCreator-Studio` each cleared an INV-6 **error**, because neither had one — and with those two
merged, **INV-6 reports zero errors for the first time**. That is the whole point of step 2: a
projected band is worth little on a repo with no local band to project into. The remaining 21
errors are the documented INV-10 and INV-11 baseline (14 near-identical agent-card clusters, 7
agents claiming an untracked upstream), which this model neither caused nor addresses.

**`mergeable_state: "clean"` does not mean up to date.** GitHub reports `behind` only where the
repo carries a require-branches-up-to-date rule. `FrankX` carries none, so #232 read `clean` while
sitting 22 commits behind `main` — its one green check had been measured against a stale base across
several check-ins before anyone looked. Corrected by merging `main` forward (`a3cbac5`); none of the
22 commits touch `AGENTS.md`, so both fences survived byte for byte (A `b4a7e18fed75`,
B `6c4506aaaf9b`). The per-repo check that means anything is the explicit behind-count, never the
state field.

`observed_at` stays `2026-09-19`: moving it would assert a fresh reading of all 45 repos that was
not taken. The newer date lives in the rows it describes, with the prior observation kept in a
`was` field rather than deleted.

---

## What this deliberately does not do

- Does not create a fifth graph. The estate graph is a projection over existing sources, per `docs/graph-engineering/CONTRACT.md` hard-forbid #1 and #3.
- Does not touch `SIP.md`, `SIS.md`, or the sovereignty clause.
- Does not archive, rename, or consolidate any repo. T3 is a **proposal** to Frank; an agent never archives a repo.
- Does not centralise voice. `VOICES.md` and the brand `COPY.md` pins remain authority; Band B only names which pin applies.

Built on SIP.
