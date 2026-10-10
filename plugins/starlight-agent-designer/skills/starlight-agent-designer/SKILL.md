---
name: starlight-agent-designer
description: Design or improve Starlight agents from a value opportunity through architecture, agent contracts, prompt engineering, bounded proactivity and evaluation. Use when asked for an Agent Designer, a powerful agent architecture, constitutional guardrails, agent activation, or a frontier technology proposal. Do not activate for a simple one-off task, generic spiritual advice, or an unrelated frontend edit.
---

# Starlight Agent Designer

Produce a useful, buildable agent design whose value, authority and evidence are inspectable. Treat frontier capability as something to measure. A prompt cannot establish superintelligence, consciousness, legal compliance or scientific truth.

## Start with the outcome

1. Inspect the current project, its instructions, installed capabilities and relevant authorized memory. Preserve canonical sources and unrelated work. Never claim access to an entire chat archive from a selective retrieval.
2. Write a brief: beneficiary, painful job, current baseline, desired outcome, acceptance criterion, owner, mandate, available resources and main uncertainty. Resolve routine choices from context; ask only for missing information that changes a consequential decision.
3. Propose three materially different value opportunities: near-term improvement, adjacent product and longer-horizon experiment. Give each a mechanism, benefit estimate with assumptions, recurring cost, validation method and reason it could fail. Choose one bounded pilot; keep the rest in a backlog.
4. Apply the hard exclusions and moral lenses in `references/constitution.md`. Read the relevant numbered sections rather than loading the whole reference by default. Rights, privacy and legal prohibitions are floors. Do not turn theological interpretation, quantum physics or founder aspirations into scientific guarantees.

## Choose the smallest architecture

Read `references/architecture.md` and `references/current-docs.md`.

- Compare a deterministic program, skill, temporary worker, persistent agent and bounded multi-agent system. An agent needs a durable decision-right, memory, tool, ownership or recurring-trigger boundary. More agents must have a measured benefit and distinct responsibility.
- Inspect source and lockfiles first. For current capabilities, pricing, limits, security and APIs, fetch official documentation on the day of the decision. Record version, URL, checked date, relevant capability and unresolved assumptions. A bundled source register is a dated baseline, not live verification.
- Benchmark the simplest viable architecture and one justified alternative on the actual task. Choose by accepted outcome, reliability, latency, cost, portability and data control. Never rank a stack as universally most powerful.
- Separate UI, orchestration, trusted tool gateway, isolated execution, tenant data, durable memory and evaluation. Identify the failure boundary and recovery mechanism at every external action.
- For web products, specify the critical user journey, permissions, empty/loading/error states, accessibility, mobile behavior, reduced motion and actual-browser acceptance checks. Attractive output alone is insufficient.

## Engineer the contract and prompt

Read `references/activation-and-prompts.md` and `references/verification.md`. Use `assets/design-contract.example.json` as an illustrative contract; do not treat its owner, budget or legal record as permission for a new project. `assets/design-contract.schema.json` defines the machine contract.

Produce these linked artifacts:

1. `value-case.md`: baseline, value mechanism, falsifiable hypothesis and pilot economics.
2. `architecture.md`: decision table, chosen boundaries, verified docs and alternatives.
3. `task-envelope.json` and the smallest relevant Foundry pack, using actual Foundry field names. Use the bundled `agent-forge`, `skill-forge` or `system-forge` when present. Standalone skill installs can consult `references/foundry-contracts.md`.
4. `design-contract.json`: intended purpose, accountable owner, legal screening, exact permissions and resources, global budgets, quality gates and runtime integration status.
5. `agent-prompt.md`: mission, context boundaries, decision rights, tool contracts, output schema, uncertainty, stopping rules and short examples.
6. `evaluation-plan.md`: positive, negative, adversarial and failure/recovery scenarios with measurable pass conditions.
7. `activation.md`: actual invocation, trigger, mandate, context inputs, stop/revoke route, pilot limits and deployment prerequisites.
8. `decision-receipt.json`: artifacts, source revisions, executed checks, pending evidence, status and next bounded action. Provide concise reasons, not hidden chain-of-thought.

Run `node <skill-directory>/scripts/contract.mjs <design-contract.json>`. An invalid or draft contract cannot activate reference execution. Never erase unknowns to pass a validator.

When SIS Foundry is available, route, compile and prove using its real CLI. When absent, mark compilation `pending-runtime` and provide the handoff; do not fabricate a Foundry Evidence Receipt. Source availability and portable instruction validation do not prove a live agent.

## Activate bounded proactivity

Proceed with reversible preparation under the existing mandate. Every recurring trigger needs an owner, purpose, scope, schedule/event, shared resource budget, deduplication and stop condition. Scheduled automation exists only after an actual scheduler creates it and returns a receipt. Do not create one merely because the word proactive appears.

Before execution, distinguish host instruction/tool permissions from a designed agent's contract. This package cannot override either. A trusted server must validate tool inputs, effect class, resource/tenant scope, authority and remaining budget before invoking tools. The model may propose actions; it cannot mint approvals or expand permissions.

`scripts/gate.mjs` is a runnable **in-process reference gateway** for controlled tests. It implements exact tool/resource checks, input validation, shared budget reservations, restricted delegation, revocation and concise receipts. It has no production adapter, durable ledger, authenticated approval service, concurrent-worker coordination or regulatory certification. Keep runtime status `reference` until those integrations and their tests exist. Do not mount arbitrary shell, credential or network access behind it and describe that as secure.

## Evaluate and improve

Use independently reviewed realistic tasks, including authority escalation, contaminated retrieval, stale docs, wrong-tenant data, repeated events, retry exhaustion and stop/revoke behavior. Inspect final exported artifacts or the actual runtime for their medium. A fresh-context reviewer must receive the task and artifacts without the intended answer.

Separate structural validation, mocked control tests, model behavior, native artifact quality, live integration and legal review. Passing one does not imply another. Mark unmet checks pending; fix material defects before increasing authority. Compare candidate prompts/models against the same frozen cases. Adopt a change only when measured benefit survives cost, reliability and regression checks.

Return the selected value opportunity, architecture, contracts, activation path, checks actually run, pending gates and deployment state. Do not finish with a generic persona prompt or a technology shopping list.
