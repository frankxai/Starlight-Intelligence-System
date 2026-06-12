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
