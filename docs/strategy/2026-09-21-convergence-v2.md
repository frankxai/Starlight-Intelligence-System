# The great convergence v2 — receipt-first

**Status:** decision record and plan, 2026-09-21. Operational tier. Supersedes the foundation question left open in `2026-09-21-great-convergence.md`; that document's nine layers, runtime decisions, cost doctrine, seat table and appendices remain in force and are referenced, not repeated.
**Foundation chosen:** receipt-first. The signed run receipt is the product. Operator and memory are how receipts get produced and kept; they are consequences, not co-equals.
**Companions:** `narrative.md` (the words), `docs/receipts.md` (the format for users), `protocol/run-receipt.v1.schema.json` (the schema), `src/run-receipt.ts` (the issuer and verifier), `starlight-intelligence-web` (`/receipts`, `/verify`, the API and MCP tool on starlightintelligence.ai).

---

## 0. The decision

Receipt-first means one thing is true before anything else ships: **every run of any Starlight surface ends in a signed run receipt, and the receipt verifies anywhere with one public key.** The Desk, the constellation, the publish gate, the room, the estate commissioning, the cohort exercise: each is a receipt producer. The websites, the console, the cockpit, frankx.ai research proof, gencreator.ai truth classes: each is a receipt consumer. The Queen routes to produce receipts; the vault stores them; the Board gates changes to their format.

What this forecloses. Operator-first would have sold the Queen and the desk as the product and left proof as a feature; it scales fast and drifts from sovereignty as the hosted operator grows. Memory-first would have sold the vaults; strongest lock-in, weakest thing to show a stranger in ninety seconds. Both remain in the plan as production and retention mechanisms. Neither is the headline again.

What it costs. The receipt format now sits on the critical path of every surface. A change to it is substrate-class and goes through `/starlight-board` before tag (section 10). That is the price of making it the product.

## 1. The object

A **run receipt** (`starlight.run-receipt.v1`) is a JSON document with nine parts: `receiptId`, `issuer` (name, keyid), `run` (id, kind, host, start, end), `subject` (the artifact's name and sha256), `stages` (name, status, model, provider, tokens, euros, milliseconds), `totals`, `decisions` (gate, decided by human, agent or policy, actor, outcome, time), `evidence` (kind, ref, sha256), `verdict` (PASS, FAIL, PARTIAL). It is wrapped in an in-toto Statement v1 whose subject is the artifact digest, and signed as a DSSE v1 envelope with Ed25519. This is the same envelope the SIP conformance receipt already uses; one verifier handles both.

Rules that make it proof rather than a log:

- **Structural completeness is checked on both sides.** An incomplete receipt is neither signed nor shown as verified. Totals may exceed stage sums (overhead) and never fall short of them.
- **A FAIL is signable.** A signed record of a failed run is what the format exists to keep. (The conformance receipt refuses FAIL; the run receipt does not. Different question.)
- **The verifier trusts the key, not the words.** Verification names the keyid it succeeded against and whether that key came from the caller or from the Starlight registry. The registry starts empty and grows by pull request with an owner and a date.
- **A draft is not proof.** The issuer records unsigned drafts when no key is configured, marks them `draft`, and says so in the response.
- **Nothing leaves the machine to issue or verify.** Both are pure functions over `node:crypto`. The public verifier is a convenience and a reference, not a dependency.

Where it lives today: issued by `sis.receipt.issue`, verified by `sis.receipt.verify`, listed by `sis.receipt.list` in the SIS v0.1 MCP server; appended to `memory/_audit/receipts.jsonl`; verified publicly at `starlightintelligence.ai/verify`, `POST /api/v1/receipts/verify`, and the MCP tool `verify_run_receipt` on the same host; schema served at `/schemas/starlight.run_receipt.v1.json`.

Unification path. Three older receipt shapes exist: the SIP conformance receipt (`protocol/`), the private queen-session receipt (`src/queen-session.ts`), and the work-graph proof-gated completion (`src/work-graph.ts`). They converge as predicates under the same DSSE envelope: the conformance receipt already is; the queen-session receipt becomes a private run receipt with `run.kind: "queen.session"`; the work-graph completion event carries the receiptId of the run receipt that proved it. No rewrite; three adapters, October.

## 2. The product spine, restated as receipts

| Stage | Produces | Receipt kind | Human gate recorded |
|---|---|---|---|
| Desk | a cited brief | `desk.brief` | none required; `publish` when it leaves the desk |
| Constellation | typed artifacts from one brief | `constellation.artifact` (one per artifact) | none; truth classes on each artifact |
| Renderers | image, clip, track behind adapters | `render.<adapter>` | `spend` when a paid renderer runs |
| Publish | a live page, schema, llms.txt, RSS | `publish` | `publish` by a named person (ADR-010 holds) |
| Room mode | a shared vault for a cohort | `room.session` | `share` by the host |
| Estate commissioning | a client's operator | `estate.provision` | `provision` by the client's sovereign |

The demo on 23 September is the first row producing a real receipt on stage. Every number on the screen is read from the receipt, never typed into the slide.

## 3. Twenty-one dimensions, receipt-first

The nine layers from v1 and the twelve dimensions added on 21 September. Each row: what receipt-first changes, the item that ships, when, and the gate.

| # | Dimension | Receipt-first consequence | Ships | When | Gate |
|---|---|---|---|---|---|
| 1 | Surfaces | Every brand site can verify a receipt; .ai is the reference verifier | `/receipts`, `/verify`, API, MCP tool on .ai; verify widget for .org, gencreator, frankx later | now; Q4 | web-release-gate, editorial CI |
| 2 | Product spine | Each stage issues a receipt (section 2) | Desk issues `desk.brief` on stage | 23 Sept | day plan quality bar |
| 3 | Operator | Queen route receipts and Board verdicts become run receipts | `run.kind: queen.route`, `board.verdict` adapters | October | Board (touches route receipt schema) |
| 4 | ADLC | Prove and Ship gates require a receipt; Learn reads receipts, not chat | `/prove` emits a run receipt; PR template asks for a receiptId | week after | CI |
| 5 | Runtime | AI SDK usage records map to `stages`; WDK step I/O maps to `evidence` | `toRunReceipt()` helper for AI SDK 6 usage objects | October | unit tests |
| 6 | Harness | Every host that runs the harness can call `sis.receipt.issue` | receipt step in the open harness prompt on `/start` | week after | smoke test |
| 7 | Memory | Receipts are a seventh ledger beside the six vaults, not a vault | `memory/_audit/receipts.jsonl`; palace index shows receipts as rooms | now; Q4 | Board only if vault taxonomy is touched (it is not) |
| 8 | Models | Every model lane must return usage; a lane without usage cannot be in a signed receipt | lane conformance check in the cognition router | October | route receipt schema |
| 9 | Design | The printed receipt is the one liquid object every surface shares | `RunReceiptCard` on .ai; the same object in the Desk prototype | now | design contract CI |
| 10 | Economics | Price by receipts produced and verified, never by seats alone | pricing page draft with three scales (section 7) | October | Frank |
| 11 | Trust and provenance | Receipt subject digest is the C2PA-style mark for the whole run; EU AI Act Art. 50 posture | provenance sidecar links to receiptId | Q4 | legal review |
| 12 | Regulation and residency | EU-hosted inference and local issuance; the verifier stores nothing | privacy note on `/verify` (counts only, no payload retention) | now | privacy page |
| 13 | Compute sovereignty | A receipt names the provider; on-device lanes are first-class | Nemotron Nano local lane recorded as `provider: local` | Q4 | eval |
| 14 | Data flywheel and consent | Receipts are the training-data ledger: what a LoRA was trained on is a list of receiptIds | LoRA job emits `train.lora` receipt with evidence = source receipts | Q4 | consent record |
| 15 | Interop standards | Receipt predicate type is public; A2A and AP2 messages can carry a receiptId | predicate type published on .ai; SIP graph extension proposal | October | Board (SIP extension) |
| 16 | Distribution through agents | MCP clients verify receipts without visiting the site | `verify_run_receipt` tool; Codex and ChatGPT connector via the cloud plugin | now; October | plugin release gate |
| 17 | Voice, video, spatial | Rendered media carries the receipt as a sidecar and a visible mark | `render.*` receipts with subject = media digest | October | provenance sidecar |
| 18 | Physical estate as verticals | Every estate commissioned issues receipts to its own key | `estate.provision` receipt; client key in their own registry | standing | Board per estate |
| 19 | Education and community | Every academy exercise ends in a receipt the learner signs | Academy exercise loop emits a receipt; `/learn` on .ai exports one | Q4 | academy release |
| 20 | Observability and cost | The receipt is the cost control; dashboards read receipts | Console lane board reads `receipts.jsonl` | week after | Console honesty rule |
| 21 | Portfolio, attention, risk | Weekly review reads receipt counts by surface; risk register cites receiptIds | Sunday loop reads `sis.receipt.list` | week after | operating rhythm |

## 4. Three contracts

**Metrics.** Six receipt-native numbers (`narrative.md` section 9): receipts issued, receipts verified by others, cost per artifact, human decisions per hundred runs, external keys in the registry, surfaces reading the same receipt. Nothing else is a headline metric. Vanity counts (agents, skills, commands) stay in `metrics/current.json` as inventory.

**Operating rhythm.** Daily: the Desk runs; receipts append. Weekly (Sunday): `sis.receipt.list` by run kind; cost per artifact; decisions logged; one drift check against `SOUL.md`. Monthly: registry review (keys added, keys to add), Board docket for any format change, pricing check against cost per artifact. Quarterly: predicate unification progress, external verifier count.

**Capital narrative.** What an investor buys: the open format (moat by adoption), the registry (moat by trust, earned key by key), the operator that produces receipts at volume (revenue), and the memory that makes the second run cheaper than the first (retention). Three numbers to show, all from receipts: cost per artifact falling, human decisions per hundred runs stable (governance holds while volume grows), verifications by keys that are not ours rising. The ask is sized to the horizon table in section 8 and stated separately, never in this document.

## 5. Platform and MCP capability map

| Surface | Today | Now (this PR set) | Next |
|---|---|---|---|
| SIS local MCP (`src/mcp-server-v01.ts`) | 21 `sis.*` tools: memory, context, decisions, events, artifacts, graph, work packets, council, vault loop, packs, modules | +3: `sis.receipt.issue`, `sis.receipt.verify`, `sis.receipt.list`; receipts ledger | `sis.receipt.search` (by run kind, subject, keyid); receipt attached to `sis.workpacket.complete`; SSE transport on Railway |
| starlightintelligence.ai MCP (`/mcp`) | 4 read-only department tools | +1: `verify_run_receipt`; discover text and server info updated | key registry lookup tool; receipt schema resource; rate limits per key |
| starlightintelligence.ai HTTP | departments, recommend, install-plan | `POST /api/v1/receipts/verify`, `GET /schemas/starlight.run_receipt.v1.json` | `GET /api/v1/keys` (registry), `GET /api/v1/receipts/example` |
| Cloud plugin (`plugins/starlight-intelligence`) | command center, decision ledger, execution, knowledge; Cloudflare Worker | unchanged | `verify_run_receipt` and `issue_run_receipt` (issue only with a caller-held key, never a hosted key) |
| Cockpit continuity MCP | 8 tools | unchanged | lane board reads receipts |
| Authority boundary | read-only public; local issue with the operator's key | same | hosted signing is never offered; the registry lists public keys only |

## 6. starlightintelligence.ai

**Shipped in this PR set.** Homepage rewritten on the receipt sentence with the printed receipt beside the hero and a three-verb proof section (issue, verify, keep). `/receipts` explains the object. `/verify` verifies one against a pasted key and the registry. The API, schema, MCP tool, `agent.json`, `llms.txt` and `agents.md` all name receipts. "Receipts" enters primary navigation; "Images" moves to the map.

**Next pages.** `/desk` (23 September, the hackathon build, issuing a real receipt); `/ledger` (public receipts feed for runs the operator chooses to publish, each verifiable in place); `/keys` (the registry, human-readable, with the PR that added each key). `/start` gains a receipt step in the harness prompt.

**Information architecture.** Primary: Start, Departments, Council, Teams, Receipts. Map: Verify, Images, Configure, Learn, Partnerships, Workflows, Graph, Foundation, Workshops, Path, Notes, Developers.

**Design.** Tokens unchanged (ink, paper, ivory, gold, cyan, Instrument Sans and Serif, IBM Plex Mono). The receipt card is the one object with material: paper on ink, perforated edge, a lift on hover under `prefers-reduced-motion: no-preference` only. Evidence: before and after screenshots at 375, 768 and 1440 in `docs/design/evidence/2026-09-21-receipts/`.

## 7. Euros at three scales (illustrative, formula given)

All figures are examples derived from list prices already flagged for re-verification in v1 appendix B. Replace with receipt medians once ten real runs exist.

| Scale | Formula | Example |
|---|---|---|
| Per artifact | sum of stage costs on the receipt | Desk brief: retrieval €0.004 + extraction €0.0008 + synthesis €0.0031 + judge €0.0012 ≈ €0.009 |
| Per creator month | artifacts per week × 4 × per-artifact + renderer spend (receipted separately) | 5 briefs + 30 constellation artifacts per week ≈ €1.6 in text inference; renderers dominate, and each is a `spend` decision on a receipt |
| Per estate | monthly run volume × per-artifact + steward retainer | inference is a rounding error; the retainer is the price, and its receipts are the invoice |

The point of the table is not the numbers; it is that each row is a query over receipts, so pricing never needs a spreadsheet the customer cannot audit.

## 8. Horizons v2

| When | Ships | Where | Gate |
|---|---|---|---|
| **Now** | Receipt format, issuer, verifier, tests; .ai home, `/receipts`, `/verify`, API, MCP tool; narrative doctrine | SIS PR, starlight-intelligence-web PR | tsc, tests, typecheck, build, screenshots |
| **23 Sept** | Desk stage one issuing a signed `desk.brief` receipt on stage; verify it live on `/verify` | starlightintelligence.ai preview, hackathon PR | day plan quality bar |
| **Week after** | `/prove` emits receipts; harness prompt gains the receipt step; Console reads the ledger; Sunday loop reads `sis.receipt.list`; publish adapter to gencreator behind an approval receipt | SIS, .ai, gencreator.ai | CI, Console honesty rule, ADR-010 |
| **October** | Predicate unification adapters; AI SDK usage → stages helper; lane conformance in the router; SIP graph extension proposal for the predicate type; pricing page draft; Codex and ChatGPT connector | SIS, .ai, plugin | Board (SIP extension, route receipt schema) |
| **Q4** | Verify widget on .org, gencreator, frankx; `/ledger` and `/keys`; LoRA receipts; academy exercise receipts; local lane receipts; palace rooms for receipts | four brand repos, academy | web-release-gate, homepage preservation contract on frankx |
| **Standing** | Every estate commissioned issues to its own key | estate-provision | Board per estate |

## 9. Drift ledger v2

Items 1 to 10 from v1 appendix A.2 stand. Added:

| # | Action | Repo | Horizon | Gate |
|---|---|---|---|---|
| 11 | Ratify `starlight.run-receipt.v1` and its predicate type as a SIP graph extension | SIS | October | `/starlight-board` |
| 12 | Add the first registry key (Frank's Desk key) by PR with owner and date | starlight-intelligence-web | 23 Sept | PR review |
| 13 | Adapt queen-session and work-graph receipts to the DSSE envelope | SIS | October | tests |
| 14 | Make the gencreator approval receipt a run receipt (`publish` kind) | gencreator.ai | week after | ADR |
| 15 | frankx.ai research hub cites receiptIds as proof objects | frankx.ai-vercel-website | Q4 | homepage contract, PR |
| 16 | Install the web-excellence pack into starlight-intelligence-web | starlight-intelligence-web | week after | install.sh |

## 10. What this document does not do

It does not change the substrate. `SIP.md`, the sovereignty clause, the file contract and the vault taxonomy are untouched. The run receipt ships at the operational tier with its schema marked as a proposal for Board ratification (drift item 11); until ratified, the predicate type is stable but not yet part of SIP. It does not host keys, sign on anyone's behalf, or store receipts on the public verifier. It does not promise numbers: every euro figure above is labelled illustrative and the six metrics start at zero.

---

Built on SIP.
