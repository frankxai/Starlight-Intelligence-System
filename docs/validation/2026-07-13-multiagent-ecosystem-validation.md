# Starlight Ecosystem — Multi-Agent Validation Report

**Date:** 2026-07-13 · **Method:** 8-agent validation swarm (7 parallel domain validators + 1 completeness critic), ~934k tokens, 207 tool calls · **Branch:** `claude/starlight-multiagent-validation-gxd3bp`
**Scope:** Starlight-Intelligence-System, starlight-swarm, starlight-agent-skills, starlight-cosmos-engine, starlight-evals, the npm registry surface, the fresh-adopter journey, and the 42-repo cross-reference graph.

Every claim below is backed by a command that actually ran in this session. Per the Metrics Truth Rule, unverifiable claims are labeled as such.

---

## 1. Executive verdict

**The substrate is real. The edges leak credibility.**

| Repo | Verdict | Evidence |
|---|---|---|
| **Starlight-Intelligence-System** | ✅ Substantially honest | 144 agents counted exactly (137 + 7 council). 84 skills = 31 dir + 53 flat, all rules resolve. 6 vaults present, palace.json valid. `npm run build` exit 0, **1,142 tests / 0 failures**. site/ + console/ both build. All 29 README links resolve. Both MCP bins pass a live JSON-RPC handshake (see §2). |
| **starlight-swarm** | ✅ Real code, one broken script | typecheck/build/41 tests/dry-run all pass. Queens, workers, escalation classifier, fail-closed payments adapter exist as tested TypeScript. `npm run lint` was broken (no ESLint config — fixed in this PR). |
| **starlight-agent-skills** | ✅ Cleanest repo in the family | 26/26 skills validate, `make check` exits 0 end-to-end, adapters/templates/agents all resolve. |
| **starlight-cosmos-engine** | ⚠️ Honest scaffold, vacuous green | All 5 root scripts exit 0, but 38 of 40 workspaces are 2-line stubs. The 9 "MCP servers" have **no MCP protocol wiring** (no SDK, no handshake, process exits immediately). Pipelines contain no DAG definitions. |
| **starlight-evals** | ⚠️ Real data, self-violating contract | Rounds contain genuine per-task eval data; 4-PASS payments scorecard reproduced live. But the staleness banner said "🟢 current" 3 days past its own due date, and `npm run probe` overwrote the committed receipt in place (both fixed in this PR). |
| **npm registry** | 🔴 The critical gap | Of 22 ecosystem package names queried, **only 2 are published**: `@arcanea/starlight-intelligence-system` at **6.0.1** (local: 8.3.0) and `arcanea` at 3.4.0. The README quickstart silently delivered a two-major-versions-stale product to every newcomer (README fixed in this PR; republish is a human decision, see §5). |
| **Cross-repo graph** | ⚠️ Real hub, frayed edges | 210 doc-level edges across 42 local repos. SIS is the hub (~24 inbound referrers). 37 referenced repo names have no local clone (35 unverifiable from this sandbox — session-403, **not** proven nonexistent). Three "canonical" ecosystem maps contradict each other. Income family missing "Built on SIP" attestation. |

## 2. MCP servers — live handshake (new evidence, closes the critic's gap)

Both hand-rolled SIS MCP bins were started and driven over stdio JSON-RPC (initialize → initialized → tools/list), 2026-07-12:

| Bin | serverInfo | Protocol | Tools |
|---|---|---|---|
| `dist/mcp-server.js` | `starlight-sis` 8.3.0 | 2024-11-05 | **13** `sis_*` tools (`sis_vault_search`, `sis_recent_entries`, `sis_stats`, `sis_append_entry`, `sis_entry_types`, `sis_search`, `sis_confirm`, `sis_invalidate`, `sis_contradict`, `sis_stale`, `sis_goal_status`, `sis_goal_update`, `sis_goal_log`) |
| `dist/starlight-mcp.js` | `starlight-substrate-mcp` 1.1.1 | 2024-11-05 | 4 substrate tools (`starlight_registry_query`, `starlight_verticals_list`, `starlight_attestation_verify`, `starlight_alliance_status`) |

The 1,548 lines of hand-rolled protocol code speak real MCP. README previously undersold this ("ten tools") — corrected to 13.

## 3. Fixes shipped in this branch

| # | Repo | Fix | Why |
|---|---|---|---|
| 1 | SIS | README quickstart: npx → git-clone path, with an explicit stale-registry note; tool counts 10→13; command counts corrected (9 substrate among 121 total) | The npx path silently installed 6.0.1 with exit 0 — the verified first wall for every adopter |
| 2 | SIS | `package.json` files: removed `context/` from the publish set (kept `public-vault/` — required by `src/seed.ts` at runtime) | One authorized `npm publish` would have shipped cross-repo operational state snapshots to the public registry |
| 3 | SIS | CLAUDE.md commands table: added the 11 undocumented commands (King/Queen/Swarm tier, Estate Factory, routing shorthands, authoring tier) + authoritative index pointer; deleted zero-byte `$null` artifact | Agents reading the contract underestimated the operational command surface |
| 4 | starlight-evals | Staleness banner → 🔴 STALE; harness writes to gitignored `out/` instead of over the committed receipt; CI now parses the *committed* scorecard before the harness runs and asserts `git diff --exit-code scorecards/` after | A repo whose pitch is "staleness is shown, never hidden" was violating its own contract; one careless commit could destroy published 4-PASS evidence |
| 5 | starlight-swarm | Removed broken `lint` script (no ESLint config/dependency existed; it dropped into an interactive prompt and hangs CI) | Check surface now matches reality; re-adding eslint-config-next is a separate deliberate change |

All evals fixes verified live: `npm run validate` 6/6, harness run wrote `out/income-payments-safety-2026-07-13.json`, `git diff scorecards/` clean.

## 4. Findings that need decisions (not code)

1. **Publish 8.3.0 to npm — or don't, deliberately.** `prepublishOnly` exists and works; `files` is now safe. This is a one-command human decision that resolves the single worst adopter experience in the ecosystem.
2. **`affiliate-agent-skills` (23 references, the declared L4 income engine)** has no local clone and is not session-accessible. *Unverifiable from this sandbox* — verify `gh api repos/frankxai/affiliate-agent-skills` from an unrestricted machine. If it doesn't exist, the income family's documented architecture rests on a phantom.
3. **Three contradictory "canonical" ecosystem maps.** ECOSYSTEM_ARCHITECTURE.md (48 agents/71 skills, v2.0 2026-06-10) vs CLAUDE.md/README (144/84, v8.3.0) vs repos-manifest.json. The hard count says 144/84 is correct **today**; ECOSYSTEM_ARCHITECTURE.md needs a v3 revision or a "historical snapshot" banner, per the Metrics Truth Rule.
4. **"Built on SIP" attestation is absent from the entire income + payment-skills family** while mind/marine/mesh manifests validate cleanly. Either the attestation is ambient-by-doctrine (then the docs saying so are wrong) or the rollout stalled.
5. **cosmos-engine's 9 MCP servers need either implementation or renaming.** They are module manifests, not servers. The pattern that works is already in-repo at SIS `src/mcp-server.ts` — port it or rename the directory to `modules/`.
6. **Domain posture:** `starlightintelligence.org` responds; `starlight-intelligence.org` is NXDOMAIN. Whether it is *available to register* was not verified from this sandbox (RDAP check needed). Repos consistently reference the former; keep it canonical.

## 5. Forward blueprint — Starlight Intelligence Lab buildout

Grounded next moves, in dependency order. Each is a verifiable target, not a vibe.

**Layer 0 — Truth (this PR + decisions above).** One canonical metrics source (`metrics/current.json`) feeding README/CLAUDE/ECOSYSTEM counts; CI check that greps for hardcoded agent/skill counts outside it. Kill the three-way map contradiction.

**Layer 1 — Distribution.** Republish `@arcanea/starlight-intelligence-system@8.3.0` (files field now safe). Then the quickstart flips back to `npx` and the 60-second start becomes true again. Candidate second package: extract `starlight-substrate-mcp` as a tiny standalone (`npx starlight-substrate-mcp`) — the 4-tool substrate server is the lowest-friction "try SIP in 30 seconds" surface that exists today.

**Layer 2 — Proof.** starlight-evals is the credibility engine: wire the staleness banner to be *derived* from the newest scorecard's `nextRunDue` in CI (this PR made it honest manually; automation makes it stay honest). Publish the eval methodology as the public artifact — open, reproducible scorecards are the rarest asset in the agent-framework space and the strongest differentiator vs. every closed "we have 100 agents" claim.

**Layer 3 — Swarm consolidation.** starlight-swarm's Queens/workers/escalation-classifier is real, tested code — it is the reference swarm construct. cosmos-engine should consume it rather than parallel-scaffold. One swarm kernel, many domain deployments (the 144-agent registry is the roster; the swarm kernel is the runtime; keep them decoupled exactly as they are now).

**Layer 4 — Preservation surfaces (the mission layer).** The knowledge-preservation ambition (science, wisdom, poetry, language, cultures) already has its substrate primitives: the six vaults + JSONL truth + SIP attestation + the horizon vault. The credible v1 is not a blockchain — it is: (a) a public, versioned, attested corpus repo per domain using the existing vault schema; (b) Hugging Face dataset mirrors of those corpora (HF gives DOI-like citability, download stats, and community reach for zero infra); (c) content-addressing (sha256 in the attestation block, already supported by `starlight_attestation_verify`) so any mirror can be verified. On-chain anchoring of attestation hashes is a cheap later add (single merkle root per release, any chain) — do it after two corpora exist, not before.

**Layer 5 — Adoption loop.** The adopter journey that *already passes* is git-clone → npm install → 1,142 green tests → MCP config → 13 tools live. Make that the demo. Every README in the family gets the same three-block structure (what this is / 60-second verified start / what "Built on SIP" means), and `starlight-agent-skills` (the cleanest repo) becomes the template for the other satellite repos' CI gates (`make check` pattern).

---

*Validated by an 8-agent swarm under the Starlight Intelligence Lab. All checks reproducible from the commands cited in the swarm journal.*

**Built on SIP** — Starlight Intelligence Protocol.
