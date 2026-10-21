# STARLIGHT NEXUS — Architecture & R&D Dossier

Status: **PROPOSED — not ratified, not deployed** · 2026-10-21
Owner: Starlight Intelligence · Review authority: founder / canonical Notion decision process

## Intent
Portable, open-core capability intelligence plane for API/service inventory, agent identity, governed execution, cost evidence, temporal dependencies and shareable blueprints. Initial wedge: read-only GitHub + Vercel discovery to actionable findings.

## Existing authorities
- [Portfolio Command Center](https://app.notion.com/p/a1842771313b473fbeb0e4db07d165c2)
- [Shared Operating Systems Backplane](https://app.notion.com/p/6164f9b682784acdaad1a4389c905e08)
- [Historical Ground Truth Architecture](https://app.notion.com/p/34726ac2b7f6819bae0eddc21448e9dc) (archived; reconcile, do not automatically adopt as current)
- SIS `AGENTS.md`, `CLAUDE.md`, `agents/AGENT_REGISTRY.md`; read before modifying runtime.
- [AI Ops / LiteLLM architecture](https://github.com/frankxai/ai-ops/blob/8b29195e6d984c35b388c1e90257e6705d861d76/docs/ARCHITECTURE.md)
- [Arcanea AI Gateway implementation](https://github.com/frankxai/arcanea/blob/7da9e78d1cb9bcd4dabdb0ed771ebcfdf2d0ec34/arcanea.ai/lib/ai/providers.ts)

## Proposed ADR-001 — Authority separation
Notion owns strategic intent, product decision and approvals; GitHub owns versioned implementation, contracts, ADR/ARD and technical evidence; Supabase relational DB owns verified operational records and ACLs; Graphiti/Cognee (only if benchmarked) are rebuildable knowledge projections; workflow storage owns execution state. No independent competing master registry.

## Proposed ADR-002 — Platform and security
Use existing Vercel UI/deployment when an audited repository link confirms ownership. Vercel AI Gateway is primary LLM adapter, not universal API gateway. Infisical or existing dedicated vault under comparison, using scoped workload identity/OIDC. Never put secret values in Notion, GitHub, prompts or normal DB columns. BYOK spend requires separate accounting/policy. Kong deferred; LiteLLM optional patched isolated evaluation.

## R&D experiments (gated)
1. Graphiti temporal dependency/point-in-time retrieval versus SQL baseline.
2. Cognee source-grounded code/document reasoning versus pgvector/FTS baseline.
3. Vercel WorkflowAgent and Sandbox vs existing SIS orchestrators: checkpoint/retry/approval/cost/quality.
4. Infisical vs Vercel Connect/KMS/native secret handling: identity, rotation, access, portability and cost.
Each experiment records dataset, metrics, per-run cost, reproducibility, citations and adoption/hold/reject decision.

## Proposed ARD — bounded contexts
- Catalog and evidence: provider, account, project, deployment, runtime, model, agent, credential reference, contract, billing observation, provenance and sync-run.
- Graph projection: relationship episodes with observed_at/valid_from/valid_to, confidence, source ids, tenant id; rebuildable.
- Policy/broker: machine identity, tenant scope, permission, expiry, request budget, approval, audit and enforcement.
- Workflows: connector ingestion, drift reconciliation, cost review and approved actions with idempotency/cancellation.
- Experience: Command, Constellation, Vault metadata, Spend, agent registry, Blueprint export.
- Community: metadata-only local scan, sanitized export, composable SDK and connector contracts.

## Delivery order and gates
P0 audit and trace existing code, deployments, Notion/Linear records; P1 read-only GitHub+Vercel ingestion with provenance and one verified actionable finding; P2 interactive graph, scoped identity, spend observations; P3 R&D and community packaging. No new paid systems or live secret rotation without approval. Apply repo AGENTS.md draft PR discipline, no direct main push, no autonomous money movement. Release only after CI/security/RLS/real browser E2E checks.

## Multi-agent coordination contract
Agents (Codex, Claude, Gemini, Vercel eve, Railway, Notion) must discover this ARD through the existing SIS registry/project context; no claim of automatic fleet-wide notification. Consult current Notion decision before rewriting architecture. One agent per worktree and scoped task. Use status vocabulary: proposed / approved / implemented / merged / deployed / operating / customer validated. Report exact URLs and evidence.

## Current verified observations
- Vercel team previously returned 63 projects; do not assume all actively operating.
- Vercel `starlight-intelligence` project exists, configured Vite, with a READY historical production deployment but API reports `live:false`; it is **not** yet a verified Nexus deployment.
- Vercel environment variable listings earlier returned permission errors; do not claim full secret or cost coverage.

## R&D to implementation handoff
Codex should read this dossier and linked Notion decision, inspect actual canonical product repository and repo-specific instructions, then write narrower ADRs before code. New capabilities are added only when experimentally justified; no speculative platform rebuild.
