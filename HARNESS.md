# Harness — Starlight-Intelligence-System (SIS)

**Profile:** A — MCP Server (+ B — substrate skills/agents)
**Stack installed:** L1 ☑ (existing) · L2 ☑ (existing, extensive) · L3 ☑ (v01-evals) · L4 ☐ · L5 ☐
**Last verified:** 2026-06-03 (v8.0.0, on branch `docs/drift-fixes-2026-05-26`)

> SIS already ships a substantial harness — this file *verifies* it rather than adding one.
> No harness branch/PR was opened: the repo has heavy active WIP (58 dirty files) and
> substrate-tier governance (board-before-tag). Verification was read-only + test runs.

## Claimed vs verified

| Claim | Reality (verified) | Verdict |
|---|---|---|
| README: MCP v2 "ships ten `sis_*` tools over JSON-RPC 2.0 stdio" | Server boots; `tools/list` returns **exactly 10**: `sis_vault_search, sis_recent_entries, sis_stats, sis_append_entry, sis_entry_types, sis_search, sis_confirm, sis_invalidate, sis_contradict, sis_stale` | ✅ Accurate |
| (plan said "31 tools") | Stale figure from an old chat — README itself says ten | n/a — plan corrected |
| Substrate MCP tools work | `test/v01-mcp-tools.test.ts`: **37/37 pass** (sis.pack.install, council.review, vault.record, memory.search, workpacket lifecycle, memory.rebuild, module.list) | ✅ Verified |
| Three MCP bins (`starlight-mcp`, `starlight-substrate-mcp`, CLI) | Present in package.json; v2 server confirmed booting | ✅ |
| `tsc` build clean | **RED** — 2 errors in `src/cli.ts:323,325` (`execSync().trim()` on `string \| Buffer`) | ⚠️ build broken on this WIP branch |

## Verified behavior

- **MCP boot + handshake** — `node dist/mcp-server.js` completes `initialize` + `tools/list` (10 tools).
- **Existing test suite** — `test/v01-mcp-tools.test.ts` = 37 pass / 0 fail. The broader
  `npm test` spans v73–v86 + sis-forge substrate suites (not all re-run tonight).

## The one fix that unblocks the build

`src/cli.ts:323,325` — `execSync(...)` returns `string | Buffer`; add `{ encoding: "utf8" }`
or wrap in `String(...)` before `.trim()`. Two lines. Left to Frank (active WIP branch; do not
disturb mid-edit). Until fixed, `npm run build` / `lint` (`tsc --noEmit`) are red.

## Run it

```bash
npm install && npm run build      # currently red — see fix above (dist still emits)
node --import tsx --test test/v01-mcp-tools.test.ts   # 37/37
# boot the MCP server:
node dist/mcp-server.js   # JSON-RPC 2.0 over stdio, 10 sis_* tools
```

## Status: **SELLABLE (with one build fix)**

The MCP servers are real, tool claims are accurate, and there is genuine, extensive test
coverage — this is the most mature repo in the ecosystem. The only blocker to a clean
"green" is the 2-line `cli.ts` type error on the current WIP branch.

## Grok 4.3 harness integration (2026-06-12 update — post Memory Gateway v0.1 + Starlight Queen)

Grok harness (TUI + subagents + gstack + imagine + excellence gates + MCP github/notion + harness-integration skill) is first-class for SIS:

- **Memory:** Registers TUI sessions with SIS Memory Gateway (src/gateway/*) per-harness namespace for unified SessionStore + vault search across all harnesses (Claude/Grok/Antigravity/etc.). VaultMemory + RRF hybrid + session loopback fully available. Use Grok's memory tools + repo-mastery for cross-repo recall.
- **/si (/starlight):** Master command enhanced for Grok — health checks run excellence-review + gstack + subagent swarm (parallel agents/skills/vault scan). Visual outputs (status dashboards, routing maps) via image_gen.
- **/starlight-queen (Queen role in orchestrator):** Best harness for driving the continuous loop. Grok subagents (explore/plan/best-of-n/check-work) execute parallel MEASURE (gstack for proving-ground/arena/cost on harness + site; real-time search for grounding), LEARN (synthesis + table re-derive), LEDGER (github issues or vault). Image gen for visual Queen artifacts (heatmaps, palace cards). Strong for deep-reasoning + interactive-agentic classes. See agents/starlight-orchestrator.md (Grok section), tools/proving-ground/ROUTING-DOCTRINE.md, routing-table.json.
- **Palace / MemPalace:** /curate-recall + mempalace-obsidian-bridge skill work natively. Grok adds visual layer (generated palace cards / 3D memory viz concepts via imagine + three/hyperframes skills). Weekly Palace Review (docs/chronicle/) benefits from Grok visual + chronicle synthesis.
- **Excellence:** All Queen/memory work under Grok runs mandatory excellence-review + gstack verification + repo-mastery. Multi-harness-orchestrator skill delegates substrate vs operational cleanly.
- **MCP/Adapters:** Gateway + existing 10+ sis_* MCP tools + src/adapters/grok.ts surface make Grok a full peer (generate GROK.md surface on demand).

Grok is the high-parallelism, visual, real-time, subagent-native driver that makes the Queen "continuous" promise more executable than manual doctrine alone. Update routing-table with Grok-specific arena receipts when available. See also .antigravity/ (swarm peer) and core/orchestrator/harnesses/.

Last verified with gateway + queen: 2026-06-12 (Grok sync).
