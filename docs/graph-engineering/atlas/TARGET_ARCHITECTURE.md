# Starlight target graph architecture

## Executive decision

Starlight should not build another agent framework. It should build the control plane that makes existing harnesses behave like one governed, inspectable, value-producing system.

The unit of scale is not the agent. It is the verified route:

`demand → admission → deterministic pre-pass → route → bounded execution → code reduction → independent verification → human gate when required → receipt → measured value`

Agents, skills, brands, repositories, and tools are addressable resources on that graph. They do not each receive their own scheduler or private truth.

## Evidence boundary and current implementation

The public atlas is an authored architecture. It does not expose a private operator's inventory or report live runtime health. The August census was a filename heuristic that missed hidden instruction paths and conflated directories with repositories; its figures must not be used as verified portfolio totals.

The adoption kit now inventories immediate Git roots and tracked instruction filenames, emits explicit skipped/dirty classifications, checks selected source hashes and byte budgets, and exports a declared graph as Mermaid. The private snapshot must be regenerated in the operator's own environment. A present manifest is not a passed check; a passed local check is not a shipped workflow.

The operating pattern follows one Queen/control owner, domain stewards, cross-domain craft review and temporary swarm leads. More hosts may drain the same admitted queue; they do not gain independent authority. No standing cron is created for a temporary lead.

Current code records caller-supplied loop receipts, checks graph structure and binds local instruction files. Durable resume, semantic instruction compilation, trusted identity, remote adapters and outcome measurement remain target work. A host must resolve artifact bytes and authenticate receipt issuers before using events to authorize real actions.

## The six control-plane capabilities

### 1. Portfolio admission

Every proposed job declares:

- beneficiary and demand signal;
- value hypothesis and measurement window;
- done condition and kill condition;
- effort class, token/cost budget, time budget, RAM/storage/CI requirements;
- risk class and actions that require a human;
- writer, reader, verifier, and receipt destination.

Admission ranks work by expected value, confidence, urgency, risk retired, and scarce capacity. An empty queue and an overloaded queue are both observable failures.

### 2. Instruction compiler

The current estate asks harnesses to repeatedly read broad files. The target compiler turns instruction sources into versioned atoms with:

- authority: host system/developer/user roles; repository scope never overrides that hierarchy;
- provenance: source path, owner, version, generated/source status;
- scope: repository, domain, medium, tool, risk, brand;
- precedence and conflicts;
- token mass and reuse frequency;
- examples, schemas, and required proof.

At task admission, the compiler selects the minimum sufficient atoms, includes pointers instead of copied doctrine, renders a harness-native pack, and records the exact pack hash on the work receipt. Token efficiency becomes a topology property, not a plea for shorter prompts.

### 3. Work graph runtime

The SIS runtime owns four executable shapes:

- Chain — ordered work with typed handoffs.
- Diamond — independent evidence lanes, an AND join, and a deterministic code reducer.
- Router — facts choose one active branch; no matching route fails closed.
- Converge — repeat a bounded search until K empty rounds or another brake fires.

Compilation rejects missing nodes, duplicate edges, contract drift, unreachable nodes, invalid terminals, invalid routers, and agent-based reducers. Execution rejects out-of-plan nodes, releases diamond joins only after all active predecessors complete, enforces actor identity, and permits completion only through an independent terminal verifier.

Long-running customer, money, and partner workflows should eventually run on a durable execution backend such as Temporal. That is an execution substrate choice, not a new Starlight scheduler.

### 4. Harness adapter plane

Claude, Codex, Hermes, Antigravity, Gemini, browser automation, and cloud agents implement the same adapter contract:

```text
capabilities + trust boundary + capacity → accept(job contract)
execution → events + artifacts + gists + cost + final receipt
interrupt/approval → checkpoint + typed pending request
resume → correlation id + checkpoint id
```

The Queen leases a correlation ID to one execution owner. Other harnesses may serve as tools or independent checker lanes, but cannot concurrently own the same job.

### 5. Proof and observability plane

Every run emits stable spans and events for admission, routing, model/tool activity, artifacts, joins, verification, approvals, completion, and outcome measurement. The vocabulary should align with OpenTelemetry GenAI conventions while redacting prompts, tool arguments, and results by default.

Two graph views are required:

- Aggregated architecture — repeated steps collapse into cycles and counters.
- Expanded execution — every call appears in an ordered per-run DAG.

Evaluation datasets are harvested from real traces. Regressions test the route, output contract, policy behavior, cost, latency, and value metric—not just final prose.

### 6. Operator and value surface

One surface shows only what deserves human attention:

- blocked work and broken loops;
- money, external-send, legal/IP, identity, destructive, credential, and production actions;
- low-confidence or high-risk proposals;
- stale writers without readers and readers without fresh inputs;
- cost/quality/cycle-time deltas;
- portfolio promotion, tuning, pause, and retirement decisions.

Human attention is a budget. The system should batch related decisions and suppress repeated alerts until state changes.

## Domain route packs

All routes reuse the canonical work graph. A route pack supplies domain-specific contracts and verifiers.

| Route | Maker lanes | Deterministic reducer | Independent proof |
| --- | --- | --- | --- |
| Software engineering | explorer, implementer, reviewer | tests, types, diff, dependency/security scan | review actor + build/deploy evidence |
| Design and web | page spec, composition, implementation, motion | asset manifest, CSS/design lint, screenshot matrix | desktop/mobile visual QA, accessibility, performance |
| Brand content | research, angle, draft, channel adaptation | source ledger, claims table, channel matrix | brand voice, factuality, rights, posting gate |
| Research | source discovery, counter-hypothesis, synthesis | citation normalization, dedupe, evidence ranking | primary-source coverage, recency, uncertainty |
| Revenue | demand research, offer, asset, funnel | CRM/checkout analytics and experiment table | real money-path probe and human external-action gate |
| Estate operations | census, health, queue, cleanup plan | deterministic inventory and diff | liveness, ownership, rollback, cleanup receipt |

Brand is a pack inside a domain route, not a forked operating system. FrankX, Arcanea, Starline, GenCreator, Energetic Income, and Akamoto contribute voice, audience, offers, visual territory, rights, and channel rules to the shared content/design/revenue routes.

## Graph economics

The most expensive architecture is an unbounded fan-out followed by an agent summarizing other agents. The target economics are:

1. deterministic pre-pass before model work;
2. one agent for simple known-path work;
3. two to four independent lanes for comparisons;
4. five to eight only for high-value, decomposable complexity;
5. code reducers before synthesis;
6. cached evidence packets and gist write-backs between lanes;
7. a verifier that receives artifacts and expectations, not the full conversational transcript;
8. explicit brakes for turns, cost, empty rounds, silence actions, RAM, storage, CI, and human attention.

Anthropic reports that multi-agent research can use roughly fifteen times the tokens of chat and is strongest on valuable, parallelizable tasks. Starlight should turn that fact into admission policy: swarm only where independent evidence changes a decision enough to repay the cost.

## Memory architecture

Keep three scopes distinct:

- Run state — checkpointed workflow state for resume, time travel, and fault recovery.
- Durable receipts — append-only events, artifacts, approvals, costs, and outcomes.
- Derived knowledge — semantic, episodic, temporal, and graph indexes built from approved receipts and sources.

Graphiti can provide temporal context and GraphRAG can synthesize large corpora. Neither should accept fleet work state directly or become authoritative over repositories, queues, approvals, or financial records.

## Moat

The market sells agent frameworks, coding agents, workflow canvases, observability, or memory products separately. Starlight can lead by productizing the seams:

- cross-harness job and receipt contracts;
- provenance-compiled instruction packs;
- proof-carrying graph edges;
- brand/domain route packs with measurable outcomes;
- customer-owned runtime, BYOK, and explicit trust boundaries;
- an outcome benchmark that measures quality per token, per minute, and per human decision.

This is harder to copy than a large agent catalog because every verified run improves route selection, context compilation, evaluation data, and portfolio economics.

## Delivery sequence

### 0–2 weeks — make truth executable

- Merge the hardened loop compiler and engine tests.
- Keep the estate snapshot reproducible and classify the 113 manifest gaps.
- Adopt one receipt schema and stable span vocabulary.
- Register writer/reader pairs and outcome metrics for the highest-value live loops.

### 2–6 weeks — compile context

- Build instruction provenance and semantic dedupe indexes.
- Emit task-specific context packs for Codex, Claude, Hermes, and Gemini.
- Run contradiction, omission, token-mass, and outcome regression evals.
- Produce a deletion/redirect queue; do not bulk-delete without review.

### 6–12 weeks — close domain routes

- Wire software, design, content, research, revenue, and estate route packs.
- Connect trace-to-eval datasets and portfolio admission.
- Add checkpoint/resume for long-lived workflows.
- Build the operator surface around exceptions and outcomes.

### 12+ weeks — productize

- Expose portable agent cards and proof receipts.
- Publish verified route packs through package/skill registries.
- Offer a customer-owned Starlight control plane rather than a hosted black box.
- Benchmark competitors on verified outcome per unit cost and human attention.
