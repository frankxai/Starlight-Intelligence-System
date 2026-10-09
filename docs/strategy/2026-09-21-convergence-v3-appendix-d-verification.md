# Convergence v3 — appendix D: verification ledger (2026-09-21)

Read-only pass over `docs/strategy/convergence-map.html` (68 nodes), the Board records, the sibling repos and SIS internals. "Live" means the named path exists and contains the claimed mechanism. Every correction below was applied to `convergence-map.html` in the same commit.

## D.1 Map nodes that claimed live or partial

| Node | Claimed | Verified | Evidence | Corrected |
|---|---|---|---|---|
| frankx | live | live | `frankx.ai-vercel-website/package.json:101` `merge:gate` chain | no |
| gencreator | live | live | `gencreator.ai/lib/creator-pack-contract.ts:53` `creatorTruthClassSchema = z.enum([` | no |
| sio | live | live | `site/` exists; builds from `metrics/current.json` | no |
| sia | partial | unverifiable on disk then; now verified | `starlight-intelligence-web` cloned this session: `app/`, `lib/run-receipt.ts`, `app/verify`, `app/receipts` on branch `claude/starlightintelligence-integration-55taqs` | no |
| arcanea | live | live | `arcanea-ai-app/packages/design-system` | no |
| community, mobile, desk, constellation, publish, claws, learn, codex, antigravity, supabase, agentdb, liquid | partial | partial | paths exist as claimed (`gencreator-community/`, `gencreator.ai/app/manifest.ts:37`, `docs/hackathons/desk-prototype.html`, `creator-pack-contract.ts:1231`, `gencreator.ai/app/research/`, `CLAWS.md:1`, `commands/evolve.md:3`, `commands/dispatch.md`, `.antigravity/`, `gencreator.ai/lib/supabase/`, `frankx.ai-vercel-website/package.json:202`) | no |
| receipt | live | live | `protocol/sign.mjs:2`; now also `src/run-receipt.ts`, `sis.receipt.*` | no |
| roommode | partial | planned | proof cited "day plan §1b"; the hackathon doc exists, no route does | yes: planned, real path cited |
| frank | live | partial | "CLAUDE.md hard stops" is in `FrankX/CLAUDE.md`, not SIS; ADR-010 is `gencreator.ai/docs/strategy/2026-08-20-gencreator-companion-alpha.md` | yes: citations fixed, partial |
| queen | live | live | `tools/queen/driver.mjs:375` route-envelope, learn, ratify | no |
| board | live | live | `docs/boards/` 38 files; `CLAUDE.md:49` board-before-tag | no |
| council | partial | claim wrong | `agents/AGENT_REGISTRY.md:12`: the seven archetype seats are Elder Father, Elder Mother, Sage, Builder-Elder, Shadow Witness, Divine Neutral Witness, Future Self at 90; Orchestrator, Prime, Architect are the Leadership tier (`:68`), Navigator, Sentinel, Weaver the Specialist tier (`:69`), Sage Foundation (`:70`) | yes: text rewritten |
| hx | partial | no | zero hits for HX or AX director across `agents/` and `HARNESS.md` | yes: planned |
| console | live | live | `console/README.md:3` dual view; `cockpit/README.md:3` | no |
| spec | live | partial | typed envelope exists (`foundry/examples/`); no `/spec` command in `commands/` or `.claude/commands/` | yes: partial, citation fixed |
| route, prove, gate, mcp, agentsmd, claudemd, soul, skills, claudecode, router, vaults, palace, workgraph, claude, taste, gatepack | live | live | `tools/queen/driver.mjs:367`; `commands/prove.md` and `tools/proving-ground/`; web-excellence pack and `.github/workflows/`; three MCP servers in `src/`; `AGENTS.md` across repos; `SOUL.md:16`; `skills/` 17 domains; `commands/si.md`; `memory/vaults/`; `memory/palace/palace.json`; `src/work-graph.ts`; `STACK.md`; `frankx.ai-vercel-website/taste.md:30-37`; 14 skills in the pack | no |
| build | partial | partial, bad citation | `AGENTS.md` section is "Multi-Agent Systems & Agent Harnesses" | yes |
| ship | live | partial, bad citation | branch discipline lives in the web repos' README and CLAUDE.md, not SIS CLAUDE.md | yes |
| aisdk | partial | no (version wrong) | `gencreator.ai/package.json:39` `"ai": "^4.0.0"`, `:31` `@ai-sdk/anthropic ^1.0.0`; no openai-compatible provider | yes: planned |
| wdk | partial | unverifiable | `workflow-sdk` and `@vercel/sandbox` in no estate package.json | yes: planned |
| eve | live | partial | provider enum defined in `creator-pack-contract.ts:48-51`; runtime contract enforces at `agent-runtime-contract.ts:218`; only the fixture path executes | yes: partial, citation fixed |
| nebius, deepseek, nemotron, qwen | partial | external | model ids and base URL are external facts; no local config references them | note only |
| grok | partial | bad citation | `SIS/GROK.md` exists; `adapters/grok` is in agentic-creator-os, not SIS | yes |
| sqlitevec | partial | claim wrong | `src/embedding.ts:296` providers are hashing, transformer, auto; no hosted Qwen provider | yes |
| cost | partial | partial, bad citation | receipt side real (`protocol/run-receipt.v1.schema.json` totals); "day plan §5" is the hackathon doc §5 | yes |
| kernel | live | partial | `.starlight/design-contract.json` in four repos; `starlight-design-intelligence` not checked out here | note only |
| packs | live | partial | `brand-packs/` is in the kernel repo, not SIS; pinned by contract | yes |
| motion | partial | bad citation | `site/motion/*` exists; `design-motion` agent is FrankX's, not SIS | yes |
| design, harness | live | placeholder | empty proof and repo | yes: filled as layer nodes |
| railway | planned | confirmed | zero railway, fly, Dockerfile or compose configs at depth ≤ 3 | no |
| pinecone | no | confirmed | no dependency anywhere | no |

## D.2 Board vectors and vocabulary

- Command: `.claude/commands/starlight-board.md` (no `commands/starlight-board.md`). Vectors: Sovereign, Seer, Harmonizer, Strategist, Verifier; Overseer synthesises. "Not personas — challenge angles."
- Declared vocabulary: PROCEED, REVISE, STOP. Practice across 38 records: PROCEED-WITH-REVISE in 10, REVISE in 7, PROCEED in 2 (one conditional), STOP in none. Drift: the modal verdict is not in the command file. Drift item 29 in v3 section 8.
- Record format: title, date, variant, advisors, HEAD, posture; one paragraph per vector with an action implication; Overseer; `## Recommendation:` (or `## Verdict:` in newer files); REVISE items with vector, issue, effort, priority.
- Rules carried: board-before-tag is structural (`CLAUDE.md:49`); two STOP votes cap at REVISE; advisory to the sovereign per SIP § 5; Board output needs no `/sip-attest`, the decision does.

## D.3 Sibling repo claims

| Claim | Verdict | Evidence |
|---|---|---|
| gencreator.ai truth classes | confirmed | five classes at `lib/creator-pack-contract.ts:53` |
| gencreator.ai runtime providers | confirmed with caveat | enum lives in `creator-pack-contract.ts:48-51`; `agent-runtime-contract.ts` imports and enforces it |
| gencreator.ai `ai` major | 4, not 6 | `package.json:39` |
| frankx.ai-vercel-website design.md and taste.md | confirmed | `taste.md:30` reference bar: Vercel, Linear, Stripe, Apple Pro pages, Anthropic, Ableton Live |
| arcanea-ai-app DESIGN.md and TASTE.md | confirmed | `TASTE.md`: "AI-lab premium. Never fantasy-game."; `DESIGN.md:3` carries a stale Windows-absolute link |
| agentic-creator-os renderer skills | confirmed | `.claude/skills/higgsfield-operator`, `suno-prompt-architect`, `suno-ai-mastery` |
| claude-skills-library web-excellence | confirmed | 14 skills; `install.sh` executable |
| starlight-intelligence-web receipt surfaces | confirmed | `lib/run-receipt.ts:12` byte-identical note; `app/verify/`, `app/receipts/`; branch unmerged |
| starlight-swarm, starlight-evals, second-brain-os | one line each | queen-worker runtime for governed income streams; whole-system evals and payments red-blue lane; persistent memory and cross-session knowledge layer |

## D.4 SIS internals and counts

- Receipt tools live: `src/mcp-server-v01.ts:20-21`, issue fails closed (`:1246`).
- `src/embedding.ts` providers: hashing, transformer, auto (`:296`, default hashing `:318`).
- `src/contradiction.ts:3`: word-trigram Jaccard across vaults.
- Cloud plugin: stateless Cloudflare `createMcpHandler()` at `/mcp`, MCP SDK v2, tenant-scoped Supabase store, Cloudflare Access JWT plus allowlist, ten tools, four skills; "the local SIS vaults are not exposed". Not SSE.
- `src/gateway/*`: loopback-only, token-authenticated, spawn-on-demand memory gateway v0.1.
- No Railway, Fly, Dockerfile or compose config anywhere (depth ≤ 3).
- `metrics/current.json` last updated 2026-08-17: registered agents 144 (disk 144), skill rules 88 (disk 88), directory skills 35 (disk 35), flat skills 53 (disk 53). Commands are not in the ledger: `commands/` 29, `.claude/commands/` 121, partial overlap (`si.md` in both; `prove`, `evolve`, `dispatch` only in `commands/`; `starlight-board` only in `.claude/commands/`). Drift item 30.

Built on SIP.
