# Starlight narrative — the words we use

**Status:** editorial doctrine, 2026-09-21. Operational tier. Applies to every public surface (starlightintelligence.ai, .org, .academy) and to the Starlight register wherever it appears on frankx.ai and gencreator.ai. Outranked only by `CREATOR.md` and the pinned SIS brand pack.
**Companion:** `docs/strategy/2026-09-21-convergence-v2.md` (the receipt-first plan this language serves).

---

## 0. The sentence

> Starlight Intelligence builds the receipt layer for agent work. Every run leaves a signed receipt anyone can verify. A person keeps the veto.

Everything below is that sentence at different lengths. If a page cannot be traced back to it, the page is off narrative.

## 1. Category and claim

- **Category:** verifiable agent operations. Not "AI platform", not "agent framework", not "autonomous workforce".
- **Who it is for:** operators who already run agents (Claude Code, Codex, Grok, Cursor, Antigravity, Cowork) and still want the irreversible calls.
- **What they get:** a harness, memory, and a council they can inspect, and a signed receipt at the end of every run: what happened, what it cost, how long it took, who decided at each gate, which evidence remains.
- **Why it holds:** the receipt is a file they own, signed with a key they hold, verifiable by anyone without asking us. The protocol is open (SIP, MIT). The vault is plain text. Nothing here holds their work hostage.
- **What we are not:** a model, a wrapper around a model, a marketplace of prompts, a promise of autonomy.

## 2. Three words

| Word | Replaces | Why it wins |
|---|---|---|
| **Receipt** | trace, log, report, "transparency" | Concrete. Everyone knows what a receipt is for: proof of what was done and what it cost, kept by the person who paid. |
| **Key** | account, login, platform | The key is theirs. Signing with it is a statement they make, not one we make about them. "You keep the key" is literal. |
| **Veto** | human in the loop, oversight, alignment | A veto is a right, held by a named person, at a named gate. It is not a checkbox. |

Say these three often. Say the abstractions they replace rarely.

## 3. Vocabulary

Use the left column. The right column is not banned in private, but it does not ship.

| Use | Not | Reason |
|---|---|---|
| run receipt, receipt | audit trail, telemetry, observability layer | Receipts are held by the customer; the others are held by the vendor |
| verify, verified against key … | trusted, validated, certified | Verification names a key and a check; the others name nobody |
| operator | user, customer, member (in product copy) | The person is running something, not consuming it |
| council, seat, gate, ledger, vault, harness | swarm (public), hive, brain, workforce, employee | Institutional nouns describe authority; biological ones hide it |
| cost in euros, latency in seconds, tokens | efficiency, performance, optimized | Numbers with units or nothing |
| evidence, source, eval | insight, intelligence (as a noun for output) | Evidence can be checked; insight cannot |
| open protocol, MIT, forkable, exportable | ecosystem, community-driven, open-core | Say the licence and the file format |
| decision, approved by a person, deferred | human-in-the-loop, oversight, guardrails | Name the gate and the outcome |
| model lane, open weights, Token Factory | our AI, proprietary intelligence, secret sauce | We route models; we do not pretend to own them |
| agents that show their work | autonomous agents, AI employees, digital workers | Autonomy without a receipt is a liability we do not sell |

Refused outright on public surfaces: unlock, seamless, revolutionize, empower, elevate, supercharge, 10x, game-changing, next-generation, cutting-edge, AGI, superintelligence (as a claim), "trust us", "magic", any adjective without a receipt behind it.

Celestial nouns (Starlight, constellation, council, observatory) organise information. They never describe system state. "The constellation routes the run" is fine; "the constellation understands you" is not.

## 4. One line per surface

| Surface | The line | The proof it points at |
|---|---|---|
| starlightintelligence.ai (home) | Every run leaves a receipt. | `/verify`, the example receipt, `/start` |
| starlightintelligence.ai/receipts | A run receipt states what happened, what it cost, who decided, and what evidence remains. | the schema, the format links, the issue and verify commands |
| starlightintelligence.ai/verify | Paste the receipt and the key. The verifier trusts the key, not the words. | a verdict with reasons |
| starlightintelligence.org | The open protocol the receipt is built on. | SIP, the conformance receipt, the signing tools |
| starlightintelligence.academy | Learn to run agents that leave receipts. | exercises that end in a receipt |
| frankx.ai (Starlight register) | The AI Architect who builds systems that show their work. | research posts that cite receipts as proof objects |
| gencreator.ai (Starlight register) | One trusted source becomes a week of content that still sounds like you, with a receipt per artifact. | truth classes on every artifact, the approval receipt |

## 5. The pitch at three lengths

**Ten seconds.** Every agent run leaves a signed receipt. Anyone can verify it. You keep the veto.

**Sixty seconds.** Companies are moving from chat to agents to fleets. The scarce thing is no longer the agent; it is proof of what the agent did, what it cost, and who allowed it. Starlight is the receipt layer: an open protocol, a local memory and council your agent runs inside, and a signed receipt at the end of every run that verifies with one key, here or anywhere. The thinking runs on open weights so the cost prints in euros. The receipts are files you own. The irreversible calls stay with a named person.

**Three minutes.** The sixty seconds, then: the product spine (a founder question becomes a cited brief, a brief becomes a constellation of typed artifacts, artifacts publish behind an approval receipt), the surfaces that consume the same receipts (four brands, every MCP client), the cost doctrine (cascade by work type, batch what is not real-time, print the cost), the moat (the receipt format is open, the key registry is earned, the memory is the customer's), and the ask.

**For a judge on 23 September.** We built the receipt, not the demo. Every number on the screen came off a receipt the model signed for. Here is the key. Verify it.

**For an investor.** Agents are becoming infrastructure. Infrastructure gets audited. We sell the audit object and the operator that produces it, on an open protocol, and we make money where the receipts are produced at volume: estates, cohorts, and verticals.

## 6. Why now

1. Every serious operator already runs several agents across several hosts. The instruction files are converging (AGENTS.md is read by four harnesses). Proof has not converged.
2. Regulation is arriving at provenance, not at models. EU AI Act Article 50 asks for machine-readable marks on generated content. A receipt with a subject digest and a signature is that mark, extended to the whole run.
3. Open weights on EU-hosted inference make cost a printable number per artifact. A receipt that says "€0.0071" is only possible when the model lane is not a black box.
4. Buyers of agent work (founders, teams, institutions) are learning to ask "who decided, and what did it cost", the two questions a chat log cannot answer.

## 7. The proof rule

Every adjective gets a receipt or gets cut.

- A claim about a number needs a source with a date or a receipt id.
- A claim about a capability needs a route that exercises it today, or the word "planned".
- A claim about a customer needs their permission and a receipt they issued.
- Illustrative numbers are labelled "example" in the same line, never in a footnote.
- "Current truth" callouts stay on every page that describes something not yet shipped.

What we can say today, with the source in brackets: the open protocol exists and is MIT (`SIP.md`); receipts sign and verify with Ed25519 and DSSE (`protocol/`, `src/run-receipt.ts`); the local MCP server issues and verifies run receipts (`sis.receipt.*`); the public verifier runs at starlightintelligence.ai (`/verify`, `/api/v1/receipts/verify`); the key registry is empty and keys are added by pull request (`lib/trusted-keys.ts`). What we cannot say yet: any customer count, any verified-receipt count, any cost figure that is not labelled example.

## 8. Voice tests

Before a sentence ships, check it against five questions.

1. Could a competitor say it word for word? Then it is not ours. Add the receipt.
2. Does it name who decides? If a human should, name the gate.
3. Is there a number without a unit? Add the unit or remove the number.
4. Would Frank say it across a table? Consulting cadence, marketing cadence, and generated cadence all fail this.
5. Does the celestial noun carry information or decoration? Decoration goes.

## 9. What "the best AI startup" means here

Not the most agents, the most verifiable runs. The metrics that prove the narrative are receipt-native:

| Metric | Definition | Where it is read |
|---|---|---|
| Receipts issued | Signed run receipts per week, by run kind | the ledger, `sis.receipt.list` |
| Receipts verified by others | Verifications at `/verify` and the API where the key is not ours | verifier logs (counts only, never payloads) |
| Cost per artifact | `totals.costEur` median by run kind | receipts |
| Human decisions logged | Decisions with `decidedBy: human` per hundred runs | receipts |
| External keys in the registry | Public keys added by PR, with owners | `lib/trusted-keys.ts` |
| Surfaces reading the same receipt | Brand sites and MCP clients that consume a receipt issued elsewhere | integration receipts |

When these move, the sentence in section 0 is true. Until then it is a plan, and we say so.

---

Built on SIP.
