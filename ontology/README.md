# Estate ontology

**Status:** proposed — `/starlight-board` before tag.

The accountability layer the agent fleet did not have. Four files, one builder, nine invariants.

| File | What it is |
|---|---|
| `starlight-estate.ontology.v1.json` | The **vocabulary**. Node kinds, edge relations, invariants. No instances. |
| `company-registry.json` | **Fixture.** One synthetic company so the graph runs. An operator's portfolio is passed with `--registry` and is not committed here. |
| `repo-tiers.json` | **Fixture.** The three T0 product repos. An operator's T1–T3 list is passed with `--tiers`. |
| `estate-graph.json` | **Generated.** Do not hand-edit — `node scripts/estate-graph.mjs` rebuilds it. |

```bash
node scripts/estate-graph.mjs                  # build + validate + write
node scripts/estate-graph.mjs --check          # validate only, CI mode
node scripts/estate-graph.mjs --tree ..        # also cross-check against sibling checkouts
```

Non-zero exit on any error-severity invariant. That is the point: it fails today, on real defects.

---

## What problem this solves

The fleet has ~150 agent cards, 88 skill rules, and 45 repos across 8 companies. All of it described in prose. Prose cannot answer:

- Which company owns this repo? *(INV-1)*
- Who is accountable when it fails? *(INV-2)*
- Where does this agent escalate, and does that chain terminate at a human? *(INV-3)*
- What number is this seat answerable for? *(INV-4)*
- Which irreversible decisions have no human gate? *(INV-5)*
- Which cards claim a capability they do not carry? *(INV-10 — currently 61 of 151)*
- Which adaptations name an upstream nobody tracks? *(INV-11 — currently 7)*

`foundry/contracts/capability-graph.schema.json` already models `skill` and `agent` with `activates` / `depends-on` / `default-for`. It has no word for **accountability** — no company, no decision right, no metric, no escalation. This ontology adds exactly that dimension and reuses the capability-graph relations unchanged where they already fit.

## What this is not

Per `docs/graph-engineering/CONTRACT.md`, which this composes with rather than amends:

- **Not a fifth graph.** A projection over sources that already exist: agent frontmatter, the company registry, the tier map.
- **Not a graph per agent** (hard-forbid #1) — one graph holds every agent.
- **Not a graph per domain** (hard-forbid #3).
- **Not a second orchestrator** (hard-forbid #7) — it holds no schedule and no lease.
- **Not memory.** Layer B stays the six vaults.
- **Not a store for anything in `private/`.** INV-7 fails the build if money, jurisdiction, or a credential appears.

## Invariants

| ID | Rule | Severity |
|---|---|---|
| INV-1 | Every repo has exactly one owning company | error |
| INV-2 | Every company has exactly one executive-tier accountable seat | error |
| INV-3 | `escalates-to` is a DAG terminating at a human | error |
| INV-4 | Every executive seat owns ≥ 1 metric — a seat with none is decoration | error |
| INV-5 | Every irreversible decision right names a human gate | error |
| INV-6 | T0/T1 repos have a working agent contract | error |
| INV-7 | No money, jurisdiction, or credential in a public file | error |
| INV-8 | Every brand names its `COPY.md` pin | warn |
| INV-9 | Every agent card appears in the graph | warn |
| INV-10 | No two agent cards are ≥85% identical — a card must carry distinguishing knowledge, not substituted nouns | error |
| INV-11 | An adapter card naming an external system has that system in `context/empire/upstreams.json` | error |

## Adding a company

Add it to the operator instance, not to the fixture.

1. Add the row to the instance registry — including `accountable_exec_seat`, which must be an `executive`-tier agent (INV-2), and `principal`.
2. Assign its repos in the instance tier file.
3. `node scripts/estate-graph.mjs --registry <instance> --tiers <tiers> --out <instance>/estate-graph.json`
4. Substrate-tier change: `/starlight-board` before tag.

Built on SIP.
