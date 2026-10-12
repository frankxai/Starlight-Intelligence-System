# Starlight Agent Designer

Version 0.1.0 · 2026-10-09 · Operational Foundry extension · Skills-only plugin

Starlight Agent Designer helps builders turn a useful human job into an architecture, prompt, bounded authority contract, evaluation plan and activation workflow. It composes existing Foundry workflows and a public engineering projection of the Starlight constitution v1.1. It does not deploy an agent runtime or confer legal approval.

The designer itself is a reusable skill. It creates an agent only when an enduring decision-right, memory, constrained-tool, ownership or recurring-trigger boundary justifies one. A single task or ambitious persona usually needs a skill or temporary worker.

## Foundations that change engineering

Human agency requires mandate, intervention and revocation. Truthfulness requires source lineage and accurate completion receipts. Excellence requires testing the actual user job and native artifact. Dignity and justice require restraint, relevant impact evaluations and correction paths. Privacy requires tenant boundaries and purpose-bound memory. Accountability requires an owner and recoverable state. Stewardship requires absolute resource measurements as well as cost per accepted outcome. Creative integrity requires authorship and provenance. Courage and humility require falsifiable experiments and honest uncertainty.

Wonder, generativity, beauty and transcendence through contribution add a positive creative horizon. The constitution examines selected philosophical and religious foundations without treating every tradition as identical. Its quantum/science section preserves scientific claims and imaginative meaning as distinct forms of knowledge. The public projection omits private conversation excerpts and does not claim an exhaustive audit of the founder's archive.

## Three value opportunities

| Opportunity | Value mechanism | Pilot evidence | Main failure risk |
| --- | --- | --- | --- |
| Research-to-build scout | Current official docs become relevant architecture proposals and small tested patches | Useful changes accepted; engineering hours saved; false-positive rate; total review and inference cost | Trend collection without changes worth adopting |
| Agent commissioning workbench | A repeated intake produces consistent contracts, prompts, evals and integration plans | Shorter design/review cycle; fewer permission and purpose ambiguities; pilot reliability | Attractive specifications without working integrations |
| Product quality steward | Exact-revision tests and artifact inspection reveal release regressions | Defects caught before release; lower correction burden; measured customer journey quality | Excessive review cost or evaluation detached from user value |

These are proposals, not revenue results. Choose one pilot at a time. Baseline the current workflow, set a falsifiable outcome and measure net value after review, operations and maintenance. The designer requires three materially different options before selecting a bounded pilot.

## Source ownership and activation

- New skill: `foundry/designer/skill/`.
- Existing canonical supporting skills: `skills/foundry/{skill-forge,agent-forge,system-forge,taste-engine}`.
- Deterministic plugin projection: `plugins/starlight-agent-designer/`.
- Sync/check: `node scripts/sync-agent-designer-plugin.mjs [--check]`.
- Control tests: `node --test test/agent-designer.test.mjs`.
- Contract check: `node foundry/designer/skill/scripts/contract.mjs <contract.json>`.

The five packaged skills are not a second authoring surface. This portable plugin is separate from the SIS global skill-rule registry; its presence does not add an agent, change the source-counted estate or imply an active recurring worker. Install/attach it through the host's supported plugin flow.

Example activation:

> @Starlight Agent Designer, design a research-to-build agent for our engineering team. Inspect the existing project, propose three value opportunities, choose a bounded pilot, verify current official docs and produce architecture, contracts, prompts, activation and evaluation gates. Prepare changes for review under the existing mandate.

Coding-client activation: `Use $starlight-agent-designer to design an agent for [job and beneficiary].`

The source register was checked on 2026-10-09 and covers current OpenAI runtime choices, AI SDK 7, LangGraph, Next.js data security, Supabase keys, MCP authorization and EU AI obligations. Reopen official docs and inspect lockfiles for each implementation; the package does not hardcode a permanent latest model or best stack.

## Runnable controls and their boundary

The reference contract and gateway validate exact tool/resource scope and immutable inputs. A shared in-process root reserves maximum tool costs and call counts before dispatch. Delegates narrow permissions and share the same budget. Duplicate request IDs cannot repeat an effect. Failed tool attempts remain charged. Owner revocation propagates through an AbortSignal; deadlines signal cancellation and block later requests. Tools must cooperate with cancellation; this module cannot forcibly terminate an arbitrary process or reverse an effect already committed.

The gateway is a controlled reference for read/preparation tools. Model calls and every other cost-bearing operation must also pass through the same root accounting in a real integration. It has no durable ledger, authenticated principal binding, restart-safe deduplication, distributed-worker coordination, approval service or production tool adapters. Private fields protect this object from accidental caller mutation; they do not form a security boundary against code running in the same process. Deploy the policy service outside an untrusted agent environment.

Production work needs trusted effect metadata, typed tool adapters, tenant checks, atomic persistent reservations, exact-input approval binding where applicable, an isolated execution environment, real cancellation/recovery, observability and evidence for the intended legal use. Contract fields and preliminary legal screening are operator assertions; they cannot prove compliance.

## Foundry example

`foundry/designer/examples/` contains a research Agent Pack and Task Envelope with an operator-owned recurring mandate proposed, no publishing authority, and actual registered source-retrieval/reasoning capabilities. It compiles through the existing Foundry CLI. The scheduler and behavioral/integration evidence remain pending.

```bash
node tools/foundry/cli.mjs forge \
  --envelope foundry/designer/examples/research-agent.task-envelope.json \
  --pack foundry/designer/examples/research-agent.agent-pack.json \
  --out /tmp/starlight-designer-research-pilot
node tools/foundry/cli.mjs prove /tmp/starlight-designer-research-pilot
```

Proof is **experimental** while manual behavioral and runtime-security checks are pending. Compiling an agent policy file does not start an agent or enforce that policy in an arbitrary harness.
