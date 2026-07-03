# STATUS — what's working vs. planned

> Single-glance reality check for the Starlight Intelligence System. Answers the
> question external adopters and maintainers actually ask: **which headline
> capabilities are real and proven, which are partial, and which are aspirational?**
>
> Every "Working" row names the file or test that proves it. Counts are
> **derived from source**, not hand-typed — the harness guard
> (`npm run agents:harness-check`) and `test/v80-platform-prompts.test.ts` fail
> CI if any doc claim drifts from reality.
>
> Legend: ✅ Working (proven by test/build) · 🟡 Partial (works, thin coverage) ·
> 🔭 Planned (aspirational / external dependency)

---

## Build, lint, test

| Capability | State | Proof |
|---|---|---|
| TypeScript build | ✅ | `npm run build` (`tsc`) — zero errors |
| Type check / lint | ✅ | `npm run lint` (`tsc --noEmit`) — zero errors |
| Test suite (operational + substrate + v0.1 evals) | ✅ | `npm test` — all green |
| Self-consistency harness guard | ✅ | `npm run agents:harness-check` — derives counts, asserts docs match |
| Doc/version drift defense | ✅ | `test/v80-platform-prompts.test.ts` + harness self-check in CI |

## Operational layer (reference build)

| Capability | State | Proof |
|---|---|---|
| 6 JSONL semantic vaults | ✅ | `memory/vaults/`, `src/vault-memory.ts` |
| SQLite + FTS5 hybrid retrieval | ✅ | `src/retrieval.ts`, `test/core-regressions.test.ts` |
| Retrieval recall@k baseline (keyword/bm25) | ✅ | `test/retrieval-eval.test.ts`, `npm run eval:retrieval` |
| First-run vault seeding (`init --vaults` + MCP auto-seed) | ✅ | `src/seed.ts`, `test/smoke-quickstart.test.ts` |
| Temporal reasoning (confidence half-life) | ✅ | `src/temporal.ts`, `src/temporal.test.ts` |
| Contradiction detection | ✅ | `src/contradiction.ts` |
| Dreaming (background transcript processing) | ✅ | `src/dreaming.ts`, `test/dreaming-vault-md-support.test.ts` |
| Dreaming persistence (promotions → wisdom, insights → atoms, idempotent ledger) | ✅ | `scripts/dreaming-run.ts`, `test/v95-dreaming-persistence.test.ts` |
| Real LLM executor (cli/api backends, in-role agent prompts) | ✅ | `src/executors/claude-executor.ts`, `test/v94-executor.test.ts` |
| Swarm plan→run bridge (`starlight starlight-swarm run`, approval-gated) | ✅ | `src/swarm.ts`, `test/v96-swarm-bridge.test.ts` |
| Executable boards (`starlight board`, verdict JSON to `docs/boards/`) | ✅ | `src/board.ts`, `test/v97-board.test.ts` |
| Queen MEASURE/LEARN from real scorecard data + `queen verify` | ✅ | `tools/queen/driver.mjs`, `test/v98-queen.test.ts` |
| Memory integrity (canonical atom text, veil-on-write, store unification) | ✅ | `src/atom.ts`, `test/v93-memory-integrity.test.ts` |
| Agent quality ratchet (thin-scaffold ban, 81 rewritten, thin ledger at 0) | ✅ | `agents/AGENT_TEMPLATE.md`, `test/v92-agent-quality.test.ts` |
| Scheduled cloud autonomy (nightly metrics, weekly dreaming, registry drift) | ✅ | `.github/workflows/`, `docs/ops/cloud-autonomy.md` |
| Operational MCP server — 10 `sis_*` tools | ✅ | `src/mcp-server.ts`, `test/mcp-server-smoke.test.ts` (end-to-end JSON-RPC) |
| v0.1 MCP server — 13 `sis.*` tools | ✅ | `src/mcp-server-v01.ts`, `test/v01-mcp-tools.test.ts` |
| Platform adapters (Claude/Cursor/Codex/Gemini/OpenCode) | ✅ | `src/adapters/`, `test/v80-platform-prompts.test.ts` |
| Agents (count derived from `agents/*.md`) | ✅ | `agents/AGENT_REGISTRY.md`, `test/v76.test.ts` |
| Auto-activating skills (count derived from `skill-rules.json`) | ✅ | `skills/skill-rules.json`, `test/v77-skill-rules.test.ts`, `test/v78-skill-registry.test.ts` |
| Slash commands | ✅ | `.claude/commands/`, `commands/` |

## Substrate (SIP)

| Capability | State | Proof |
|---|---|---|
| SIP spec (six layers) | ✅ | `SIP.md`, `test/substrate.test.ts` |
| Substrate file-contract symmetry | ✅ | `test/v73`–`v80` symmetry suites |
| Attestation protocol (`/sip-attest`) | ✅ | `.claude/commands/sip-attest.md` |
| Alliance forging / vertical spawn commands | ✅ | `.claude/commands/`, `test/v73.test.ts` |
| Substrate MCP server | ✅ | `src/starlight-mcp.ts` — verified end-to-end via `test/starlight-substrate-mcp-smoke.test.ts` |

## Verticals / domain sub-stacks

| Capability | State | Proof |
|---|---|---|
| People IS · Sound IS · Music IS | ✅ | `verticals/`, `agents/`, `test/v79-vertical-coverage.test.ts` |
| Crypto Intelligence v0.1 (House of On-Chain) | 🟡 | `verticals/crypto-intelligence/` — proof-of-pattern, 5 sister Houses gated |
| Wealth IS v0.2 (composition-layer reference) | 🟡 | `STACK.md`, vertical commands — evolving |

## External surfaces (not provable from this repo)

| Capability | State | Note |
|---|---|---|
| npm package `@arcanea/starlight-intelligence-system` | 🔭 | Publish target; follow [`RELEASING.md`](RELEASING.md) and verify `npm view ... version` matches `package.json` before relying on it. Registry has lagged the repo before. |
| `starlightintelligence.org/protocol` mirror | 🔭 | Canonical-URL mirror of `SIP.md`; external host |
| Site / console (Next.js) builds | ✅ | `npm run build:site` / `build:console` — verified builds & eslint compile cleanly; gated in CI by `harness-check.yml` `web` job on every PR + push |
| Site deploy → `starlightintelligence.org` | ✅ | Vercel native Git integration (previews on PR, prod on `main`); no repo secrets — see [`DEPLOY.md`](DEPLOY.md) |

---

## How the counts stay honest

The agent count, skill count, and SIS version in `README.md`, `AGENTS.md`, and
`CLAUDE.md` are **not** maintained by hand-editing literals. They are:

1. **Derived** from source-of-truth — `agents/*.md` files, the `rules` array in
   `skills/skill-rules.json`, and `package.json::version`.
2. **Asserted** to match the docs by `npm run agents:harness-check` and
   `test/v80-platform-prompts.test.ts`.
3. **Gated in CI** by `.github/workflows/harness-check.yml`, so drift fails a PR
   instead of reaching a contributor's first command.

Bump a version or add an agent/skill, and the guard tells you exactly which doc
surface to update — or passes automatically once they agree.

---

**Built on SIP** · operational tier (status surface)
