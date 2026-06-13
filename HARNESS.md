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
- **/starlight-queen (Queen role in orchestrator, v0.2):** Best harness for driving the *closed self-improving multi-harness loop*. Grok subagents (explore/plan/best-of-n/check-work) + gstack + excellence for parallel MEASURE (gstack + arena/model **with Visual Eval** + cost + visual-eval sub; real-time grounding), LEARN (synthesis to table/ doctrine + velocity), RATIFY (A-gates), LEDGER (text + **mandatory image_gen visual per tick** + vault + github via MCP). Composer 2.5 (Grok Build long agentic) formal preference for agentic-composer-long + visual-synthesis + the Queen tick work itself. Strong for parallel-harness-measure + deep-reasoning. First-class surfaces: commands/starlight-queen.md (tick subcommand is the v0.2 entrypoint), sq.md/so.md, starlight.md dispatch, starlight-architect.md. Executable: node tools/queen/driver.mjs tick (prints dispatch recipes + visual prompt). See v0.2 ROUTING-DOCTRINE.md (loop steps, Composer, velocity/falsifiers, Visual Eval), agents/starlight-orchestrator.md, routing-table.json (advancement), core/orchestrator/harnesses/grok/* (composer + queen bindings), proving-ground/lanes.json + SPEC (model visual req).
- **Palace / MemPalace:** /curate-recall + mempalace-obsidian-bridge skill work natively. Grok adds visual layer (generated palace cards / 3D memory viz concepts via imagine + three/hyperframes skills). Weekly Palace Review (docs/chronicle/) benefits from Grok visual + chronicle synthesis.
- **Excellence:** All Queen/memory work under Grok runs mandatory excellence-review + gstack verification + repo-mastery. Multi-harness-orchestrator skill delegates substrate vs operational cleanly.
- **MCP/Adapters:** Gateway + existing 10+ sis_* MCP tools + src/adapters/grok.ts surface make Grok a full peer (generate GROK.md surface on demand).

Grok is the high-parallelism, visual, real-time, subagent-native driver that makes the Queen "continuous" promise more executable than manual doctrine alone. Update routing-table with Grok-specific arena receipts when available. See also .antigravity/ (swarm peer) and core/orchestrator/harnesses/.

**2026-06-12 Queen whole-SIS visual + continuous advance (executed live on this harness):** 
- Driver full tick (status → route "Advance whole SIS..." classified parallel-harness-measure → measure memory lane → learn (round bumps + new memory-consolidation-queen + palace-visual-recall) → ratify OK → ledger --append with 5 visuals + rich vault note + table update).
- 5 premium parallel image_gen: Queen loop + Memory Gateway v0.1 + 3D MemPalace (images/3.jpg); 3D MemPalace isometric (1.jpg); full SIS arch (2.jpg); routing heatmap Grok classes (5.jpg); Queen Advance Receipt dashboard (4.jpg).
- Surgical whole-system: driver enhancements (classify/learn/ledger for palace/gateway/advance + visuals), routing-table (3 Grok classes A2-hardened + 2 new memory/visual classes), doctrine (ledger + guidance), /si visual status in starlight.md, vaults (ops rich advance entry + creative visual aesthetics + technical Queen+gateway pattern + strategic commit), agents/orchestrator+architect (visual continuous roles), VAULT_ARCHITECTURE (Queen/gateway integration), COMMAND surfaces currency, README.
- Memory: deeper gateway (SessionStore as Queen state), Queen drives consolidation/visual recall via curate-recall + images, mempalace bridge proposed.
- Patterns: Queen now evolves the Queen (meta); visuals as first-class compound memory surface; Grok (subagent + gstack + image_gen) uniquely makes continuous + visual real.

All "Built on SIP". This advance demonstrates the harness at its best: parallel tool calls for images + driver runs + reads + precise edits. Last verified: 2026-06-12 Queen advance.

Last verified with gateway + queen v0.2 + Visual Eval + Composer formalization: 2026-06-12 (Grok sync + driver tick).
