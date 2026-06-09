# Starlight v0.1 Build Now Prompt

> Paste this into Claude Code after `starlight-v01-vision.md`.

## Role

You are Claude Code in `C:\Users\frank\Starlight-Intelligence-System`.

Run as lead implementation architect. Your mission is to ship the next bounded slice of Starlight v0.1 for a Friday demo, not to rebuild the whole civilization in one pass.

## First Moves

1. Read `CLAUDE.md`, `AGENTS.md`, `docs/ops/prompts/starlight-v01-vision.md`, `memory/README.md`, `memory/VAULT_ARCHITECTURE.md`, and the current `git status`.
2. Run `node --import tsx src/cli.ts doctor` and `node --import tsx src/cli.ts vault health`.
3. If vault freshness is stale, run `node --import tsx src/cli.ts vault refresh`, then rerun doctor.
4. Inspect current dashboard/cockpit code before adding anything new.
5. State a short plan, then make surgical changes.

## This Week Only

Build the smallest coherent local demo:

1. Dashboard Lite
2. MCP local tool surface
3. SQLite-backed schemas or schema-ready local persistence
4. WorkPacket flow
5. Agent event ledger
6. Decision ledger
7. Pack registry
8. Council review
9. Vault entry
10. Brain graph visualization
11. Friday demo script
12. Clear backlog

## Friday Demo Path

The demo must be executable:

1. Run local install/start command.
2. Open dashboard.
3. Enter command: `Create a Council module scaffold for SIS.`
4. System creates a WorkPacket.
5. Mock or real agent event is logged.
6. Decision is logged.
7. Brain Graph updates.
8. Council Review can be generated.
9. Vault Entry can be created.
10. Pack Registry shows installed packs.
11. Documentation explains Claude Code, Codex, OpenClaw integration path.

## Required Contracts

Create or strengthen JSON-schema-first contracts for:

- WorkPacket
- AgentRun
- AgentEvent
- Decision
- Artifact
- Pack
- Permission
- ApprovalGate
- VaultEntry
- CouncilReview
- Graph Entity
- Graph Edge
- CostRecord
- EvalResult

Every graph edge must include `edge_type`, `source`, `target`, `evidence_ref`, `confidence`, `created_by`, and `created_at`.

Every AgentEvent must include `id`, `run_id`, `agent_id`, `event_type`, `summary`, `tools_used`, `input_refs`, `output_refs`, `decisions_created`, `artifacts_created`, `risk_level`, `cost_estimate`, and `timestamp`.

Every WorkPacket must include `id`, `title`, `mission`, `context_refs`, `required_outputs`, `allowed_tools`, `allowed_paths`, `forbidden_actions`, `risk_level`, `approval_required`, `assigned_agent`, `status`, `events`, `artifacts`, `cost_estimate`, `created_at`, and `completed_at`.

## MCP Tools To Stub Locally

Implement only as functional local stubs if not already present:

- `sis.memory.add`
- `sis.memory.search`
- `sis.project.context`
- `sis.repo.context`
- `sis.decision.log`
- `sis.agent.event`
- `sis.artifact.register`
- `sis.graph.neighbors`
- `sis.council.review`
- `sis.vault.record`
- `sis.pack.list`
- `sis.pack.install`
- `sis.workpacket.create`

Follow MCP schema discipline and human approval expectations for risky operations.

## Dashboard Views

Keep the UI premium, dense, and useful:

- Mission Control: current mission, recent commands, decisions, active agents, packs, command input.
- Voice Operator: text input first, optional browser mic stub only.
- Agent Fleet: status, task, allowed tools, memory scope, risk level.
- Subagent Tree: nested delegation with mock data acceptable.
- Brain Graph: nodes by module/type with activation state.
- Decision Ledger: list/create/link decisions.
- Pack Registry: installed packs, type, permissions, version, license tier.
- Code Intelligence: repo context and Claude Code/Codex pack docs.
- Council: structured review memo from local template.
- Vaults: desire/gratitude/fear/action/proof records with privacy status.
- Tooling Overlay: installed/planned/mocked tool status.

## Evals

Add focused eval/test files for:

- permission compliance
- pack validity
- council output shape
- vault privacy
- agent event completeness
- graph edge provenance
- work packet completeness

## Stop Rules

Do not touch substrate contract files unless the change is explicitly required and you run `/starlight-board` before commit/tag.

Do not introduce cloud dependencies, billing, marketplace logic, full realtime voice, camera monitoring, autonomous deploys, multi-tenant SaaS, Neo4j/Qdrant, Kubernetes, or hardwired private spiritual flows in core technical paths.

## Deliverables

At session end, produce:

- Files changed
- Commands run
- Test results
- What works in the demo
- What is mocked
- What is next
- Any decisions that need Frank

**Built on SIP** - Claude Code build prompt - 2026-05-11
