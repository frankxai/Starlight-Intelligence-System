# Convergence v4 — appendix F: verification ledger (2026-09-21)

Every "live", "partial" or "absent" claim in `2026-09-21-convergence-v4.md` was checked in this session against a file, a registry or a live API. "Verified" means the named path exists on the named branch and contains the claimed mechanism. Where a claim could not be checked it says unverified. Sections 1 to 4 are file facts; section 5 records the checks run on this PR's own deliverables; section 6 lists what this document asserts without a file.

## F.1 Starlight-Intelligence-System (branch `claude/starlightintelligence-integration-55taqs` at 04bb1b0, the head of PR 189, on which this PR is stacked)

| Claim in v4 | Verified | Evidence |
|---|---|---|
| Zero signed run receipts exist | yes | `memory/_audit/receipts.jsonl` does not exist in the checkout; `ls` returns "No such file" |
| The v0.1 MCP server has 24 `sis.*` tools, including `sis.receipt.issue`, `verify`, `list` | yes | `grep -oE "name: '(sis\.[a-z_.]+)'" src/mcp-server-v01.ts | sort -u | wc -l` = 24; receipt tools at lines 1204, 1288, 1318 |
| `STATUS.md` says the v0.1 server has 13 tools | yes, stale | `STATUS.md:39` |
| Run receipt issuer and schema exist | yes | `src/run-receipt.ts` (21,322 bytes), `protocol/run-receipt.v1.schema.json` (6,884 bytes); `run.kind`, `run.host`, `decisions[].decidedBy` enum `human | agent | policy` |
| The receipt for v3 was an unsigned draft | yes | PR 189 body: "Unsigned draft (no signing key on the authoring machine): rcpt_1790029005980_c3acc4d3" |
| Queen routing table has no class with `autoApply` true; `rounds: 1` | **no (corrected 26 September)** | The 21 September check read `codegen` and `grounding-extraction` (`autoApply: false`, `rounds: 1`) and generalised. At 04bb1b0 six of fourteen classes are `autoApply: true`: `constrained-output` and `interactive-agentic` at `rounds: 3`; `visual-synthesis` at 2; `parallel-harness-measure` at 3; `memory-consolidation-queen` and `palace-visual-recall` at 1 with `confidence: high`, which A2 forbids. Unchanged on `main` at 515e6c0. See F.7 |
| Route ledger exists | yes | `tools/queen/ledger.jsonl`, `tools/queen/state.json`, `tools/queen/driver.mjs` |
| Task envelope carries budget, autonomy, evidence policy | yes | `foundry/examples/research-brief.task-envelope.json`: `constraints.budget.maxCostUsd: 5`, `autonomy.approvalRequiredBefore`, `evidencePolicy.requiredLanes` |
| Work graph has ten event kinds | yes | `src/work-graph.ts:97-108`: `intent.captured` … `work.completed` |
| Primary memory substrate is append-only JSONL since 2026-05-24 | yes | `docs/boards/2026-05-23-substrate-migration-sovereign.md` sections 3 and 4; `BENCHMARKS.md` "Substrate latency" |
| The six vaults are hand-maintained markdown in the repo | yes | `memory/vaults/*.md`; `CLAUDE.md` memory protocol; the 2026-05-20 Board record: "Vault canon is preserved as `memory/vaults/*.md` markdown files" |
| `AGENTS.md` describes the vaults as event-sourced JSONL | yes | `AGENTS.md`: "Event-sourced JSONL truth, SQLite FTS5 hybrid index" and "Event-Driven Concurrency … append-only event logs" |
| Palace is a companion view | yes | `CLAUDE.md` "Spatial index (pilot)": the palace is a companion view and "the vaults remain authoritative" |
| Embedding providers are hashing and local transformer only | yes | `src/embedding.ts:101` `hashing-tf`, `:232` `transformer:<model>`; no hosted provider |
| `sqlite-vec`, `mem0`, `agentdb`, `workflow`, `@vercel/sandbox` absent from SIS dependencies | yes | `package.json` (root) has none of them |
| Graph contract's promotion rule has six conditions | yes | `docs/graph-engineering/CONTRACT.md` "Promotion into layer B" |
| Contradiction detection is word-trigram Jaccard | yes | `src/contradiction.ts:3` |
| Sigstore keyless attestation of the profile on push to main | yes | `.github/workflows/sip-self-receipt.yml`: `actions/attest` with `predicate-type https://starlightintelligence.org/protocol/receipt/v0.1.0`, on push to main touching `protocol/**` |
| Conformance suite exists for the graph profile | yes | `protocol/conform.mjs`, `protocol/README.md` (rules G, C1, P1 to P5; 45 tests per the 2026-09-19 Board record) |
| Editorial and design contract CI are pinned reusable workflows from the kernel | yes | `.github/workflows/starlight-editorial-contract.yml` at `50ae34c7…`; `starlight-design-contract.yml` at `80830c60…`; the editorial audit scans `app, components, content, data, lib, pages, src` and excludes `docs/`, so this PR's files are not scanned by CI and were audited by hand (F.5) |
| Cost plane has a template with daily caps and a snapshot cron | yes | `cost-plane-config.template.json`: Vercel $5, Anthropic $20 daily caps; `src/infra/cost-snapshot.ts` |
| Durable-output-sink law; three routines abandoned; registry drift 7 vs about 21 | yes | `docs/ops/AGENT-OPERATIONS-CONTRACT-2026-08-29.md` lines 120 to 139 |
| The Blessing Protocol | not found | zero hits for "blessing" in SIS docs; zero in the frankx repo's `.claude` and `docs`; zero in gencreator.ai and the six read-only siblings |
| `/friday-loop` exists | yes, in the frankx repo | `frankx.ai-vercel-website/.claude/commands/friday-loop.md` (learn stage: performance, insight distillation, next-week seed) |
| Seven `/sip-export` targets | yes, in SIS | `AGENTS.md` "SIP export": claude-project, chatgpt-project, gemini-gem, cursor, cowork, microsoft-copilot, custom-gpt |
| `metrics/current.json` counts | yes | registered agents 144 (2026-07-27), skill rules 88 (2026-07-28), horizon letters 15; last updated 2026-08-17 |
| The v1 map says "AI SDK 6" in three nodes | yes | `grep -o "AI SDK [0-9]" docs/strategy/convergence-map.html`: 3 × "AI SDK 6"; the v3 map has one "AI SDK 7" and one historical "AI SDK 6" |
| Explorer tokens on the site | yes | `site/src/app/globals.css:4` `--background: #060609`; Newsreader and Inter named at line 1158 |
| `site/` routes include `verify` and `palace`; no `desk` route yet | yes at 04bb1b0; superseded (F.7) | `ls site/src/app`: `verify`, `palace`, `queen`, `cockpit` present; no `desk` |
| Estate commands exist | yes | `.claude/commands/`: `estate-blueprint.md`, `estate-provision.md`, `estate-steward.md`, `estate-army-deploy.md` |
| The 2026-06-16 Board's six REVISE items are not recorded as closed | not found | no closure record in `docs/boards/2026-06-16-estate-factory-web4-positioning-verdict.md` or a later board file; the estate factory execution summary of the same date predates the verdict's deadlines |

## F.2 starlight-intelligence-web

| Claim | Verified | Evidence |
|---|---|---|
| Registry is empty | yes | branch `claude/starlightintelligence-integration-55taqs` (FETCH_HEAD 4b73528): `lib/trusted-keys.ts` `STARLIGHT_TRUSTED_KEYS = []` |
| `/verify?r=`, QR on the card, share link exist on the branch | yes | commit 4b73528 "feat(receipts): phone verify — /verify?r=, QR on the printed receipt, share link; review fixes"; `app/verify/page.tsx`, `lib/receipt-share.ts` (`b64u:` envelopes and bare ids, 16,384-byte cap), `components/receipts/QrSvg.tsx`, `RunReceiptCard.tsx` |
| A bare receipt id resolves only to the example until a ledger exists | yes | `app/verify/page.tsx`: "until a public ledger exists (drift item 25) the only id that resolves is the published example's" |
| The verifier copy is on a branch and absent from main | yes | `main` (1ebe8f6) has no `lib/run-receipt.ts`, `app/verify`, `app/receipts` or `lib/trusted-keys.ts`; all are on the branch only |
| `agents.md`, `llms.txt`, `schemas`, `mcp` routes exist on main | yes | `ls app`: `agents.md`, `llms.txt`, `schemas`, `mcp`, `privacy`, `start` |
| Receipt tests exist | yes | `package.json` `test:receipts`: `run-receipt.test.mjs`, `receipt-share.test.mjs`, `qrcodegen.test.mjs` |

## F.3 Sibling repos (read-only clones; survey file `survey-siblings.md` in the session scratchpad, every row with `path:line`)

| Claim | Verified | Evidence |
|---|---|---|
| `ai` SDK spread: gencreator `^4.0.0`, arcanea web `^6.0.185`, frankx `^6.0.190`; React 19.3.0 / 19.2.8 / 18.3.1; Next 16.3.5 everywhere | yes | package.json lines 39, 77, 203 respectively |
| No Dockerfile, railway.json or fly.toml in any of the eight repos | yes | survey section 1 |
| `agentdb` declared only in frankx.ai-vercel-website (`3.0.0-alpha.20`), used through a dynamic import gated by a merge-gate test | yes | `package.json:202`; `lib/acos/memory/agentdb.mjs:45`; `scripts/tests/agentdb-runtime.test.mjs` |
| gencreator truth classes (five) and provider enum (two: `deterministic_fixture`, `vercel_eve`) | yes | `lib/creator-pack-contract.ts:53-58`, `:48-50` |
| gencreator agent-runtime contract enforces budget reservation, approval checkpoints, usage receipts with a reconciliation invariant and a sha256 digest | yes | `lib/agent-runtime-contract.ts:82-99`, `:224-263`, `:275-324`, `:352-406` |
| gencreator offer-truth gate | yes | `lib/offer-truth.ts:1-20` ("Pricing not published", "By application", "Free") |
| gencreator has two ADR-010 entries | yes | `docs/DECISIONS.md:143` and `:273` |
| gencreator `design.md` retires the blue, cyan, green triad; `taste.md` still mandates it | yes | `design.md:35-36`; `taste.md:21` |
| frankx `CLAUDE.md` describes `design.md` as a full token spec; `design.md` carries colours only and defers to a Windows path | yes | `CLAUDE.md:45`; `design.md:3`, `:30` |
| arcanea `DESIGN.md` has the same unreachable path; `TASTE.md` "AI-lab premium. Never fantasy-game." with a seven-site reference bar; `@arcanea/design-system` 0.3.0 | yes | `DESIGN.md:3`; `TASTE.md:11`, `:159-171`; `packages/design-system/package.json:3` |
| `anime-legends` skills are not in git | yes | arcanea `docs/skills/INDEX.md:32` "NOT IN GIT" |
| ACOS circuit breaker thresholds 3 / 5 / 8; six IAM profiles; JSONL cost tracker; no cost dashboard; no promptfoo config | yes | `.claude/hooks/circuit-breaker.sh:29-31`; `tools/observatory/public/catalog.json:4468-4557`; `hooks/cost-tracker.js:1-6` |
| ACOS higgsfield-operator and suno skills | yes | `.claude/skills/higgsfield-operator/SKILL.md`, `suno-prompt-architect/SKILL.md`, `suno-ai-mastery/SKILL.md` |
| payment-intelligence-system: Ed25519 AP2 mandates, spend caps, audit-before-decision, fail-closed, never moves money, 43 tests, x402 out of scope | yes | `mcp/src/mandate.ts`, `spend-cap.ts`, `audit.ts`; `MEMORY.md:16`, `:35`; five test files |
| agentic-intelligence-system emitter has three generators; "seven export targets" not there | yes | `packages/emit/src/emitter.ts:41`, `:72`, `:79` |
| starlight-evals: promptfoo configured; nine lanes; payments red-blue lane; README banner stale since 2026-07-10; no Horizon dataset | yes | `promptfooconfig.yaml`, `providers/claude-cli.mjs`, `lanes.json:69`, `README.md:35`; zero hits for a Horizon dataset |
| web-excellence pack: 14 skills, three hooks, 22 hook tests, CI lint exits 1 only on ERROR | yes | `packs/web-excellence/README.md:9-15`, `:69-79`; `ci/web-guidelines-lint.mjs:13` |
| OpenTelemetry has no dependency or SDK init in any estate repo | yes | survey section 10: 33 frankx matches all prose or research data; gencreator's two are transitive lockfile entries |
| `retreat-os`, `aurevia`, `solarcarport`, `rova` appear in no surveyed repo; `property-intelligence` only in frankx downloads | yes | survey section 10 (precise patterns; the naive "rova" count was `approval`) |

## F.4 Vercel

| Claim | Verified | Evidence |
|---|---|---|
| The team holds 59 projects | yes | `list_projects` on team `starlight-intelligence` (`team_q6LNT6rnFRlqlcjBJ2Wxz6PE`), pagination count 59, 2026-09-21 |
| `retreat-os`, `rova-resort`, `property-intelligence`, `aurevia-solar`, `solarcarport-tech` exist as projects | yes | project ids `prj_uIww9JdE…`, `prj_xkcmj8kW…`, `prj_4BkA3lqt…`, `prj_vHNHK126…`, `prj_a4uDLsOl…` |
| `aiarchitectacademy`, `starlight-intelligence-academy`, `arcanea-academy`, `vibeclubs-web`, `gencreator-community`, `frankx-community-hub` exist | yes | same listing |
| `starlightintelligence-ai`, `site`, `gencreator-ai`, `frankx-ai-vercel-website`, `arcanea-ai-app` exist | yes | same listing |

## F.5 Checks run on this PR's deliverables (2026-09-21, this session)

| Check | Result |
|---|---|
| `node --check` on the inline script of `convergence-map-v4.html`, `memory-log-prototype.html`, `ledger-countersign-prototype.html` | all three pass |
| Editorial audit with the pinned kernel policy (`skills/frank-brand-editor/scripts/editorial-audit.mjs` and `editorial/language-policy.json` at `50ae34c7…`) over the four markdown files and three HTML files of this PR | hard-fail rules: 0 (seven rhetorical-contrast findings were rewritten before this count); review rules: 40, all `slash-label` (27, table cells such as "official snippet / third party" and "on demand / preemptible") and `comma-contrast` (13, of which most are quoted facts such as "not deferred" and "not GA"); no `canned-wording`, no `em-dash-density` |
| Chromium (Playwright 1.56.1, Chromium 1194) at 1440×1000 and 375×812, and 375 with `prefers-reduced-motion: reduce`, on all three pages, with one interaction each (map: open the trust row's chosen card; memory log: append, issue, tombstone, rebuild; ledger: verify then countersign) | zero page errors on every run; `scrollWidth` equals `clientWidth` at 375 on every page (no horizontal scroll); focusable controls 71 / 6 / 9; the only console entries are the sandbox proxy refusing Google Fonts and the GSAP CDN (`ERR_CERT_AUTHORITY_INVALID`, `ERR_TUNNEL_CONNECTION_FAILED`), so the renders below use fallback fonts and the memory prototype's reduced path; raw results in `evidence/convergence-v4/checks.json` |
| Screenshots | `evidence/convergence-v4/<page>-1440.jpg` and `<page>-375.jpg` for the three pages, full page, JPEG quality 78 |
| `strategy.plan` run receipt for the plan | unsigned draft issued with `src/run-receipt.ts` (`node --experimental-strip-types`); no signing key on the authoring machine; receipt id and subject sha256 in the PR body and in `evidence/convergence-v4/receipt-draft.json`; `receiptProblems()` returned none |

## F.7 Re-verification, 26 September (SIS `main` 515e6c0, PR 189 head 910c7ed)

| Claim | Holds | Evidence |
|---|---|---|
| Zero signed run receipts in a ledger | yes | `git ls-tree -r origin/main memory/_audit/` and the same on 910c7ed: no `receipts.jsonl` |
| The key registry exists with no key | narrower | `lib/trusted-keys.ts` is absent from the web repo's `main` (4ad9a34); it exists only on draft PR 54; issue 55 is open |
| The Desk is code | yes, new | `site/src/app/desk/{page,DeskConsole,RoomQr}.tsx`, `site/src/app/api/desk/run/route.ts`, `site/src/lib/desk/cascade.ts`; tests `cascade`, `edge-meter`, `pricing`, `vault` |
| The Desk writes an append-only vault keyed by receipt | yes, new | `site/src/lib/desk/vault.ts`: `VaultAtom { kind: "belief", claim, quote, url, confidence, receiptId, at }`, `appendFile` only |
| One command signs, verifies and prints a receipt | yes, new | `scripts/receipts/issue-and-share.mts`; compact `z:` link in `src/receipt-share.ts`, vector pinned in `test/receipt-share.test.ts` |
| Routing table auto-applies classes | yes (this corrects F.1) | `tools/proving-ground/routing-table.json` on `main`: six `autoApply: true`, two at `rounds: 1`; `ROUTING-DOCTRINE.md` A2: no high confidence with auto-apply before two concordant rounds |
| `deep-reasoning` class | unchanged route, new evidence | `main` 2b94523..515e6c0 records the R5 lane run of 2026-08-28 as void-equivalent (saturated card); `autoApply: false`, `rounds: 0` |
| `STATUS.md` says 13 `sis.*` tools; the file has 24 | yes, still stale | `STATUS.md:39` on `main`; 24 names in `src/mcp-server-v01.ts` on 910c7ed (drift item 51) |
| PRs 189 (SIS), 54 (web) and 192 (SIS) are drafts, unmerged | yes | GitHub, 26 September |
| The map and both prototypes pass an accessibility audit | yes, after fixes | axe-core 4 at 1440, 768, 375 and 375 with reduced motion: 0 violations on all three pages (`evidence/convergence-v4/checks.json`). Fixed on 26 September: muted text raised from `#64748b` (4.25:1) to `#7c8aa0` (5.8:1), a `main` landmark and skip link, ledger rows as buttons inside list items, a keyboard-scrollable event log, and on narrow screens the map's detail panel now opens under the tapped row with the selection in the URL hash |

## F.6 Asserted without a file (say so)

- The Blessing Protocol (not found in any checked-out repo).
- The "Horizon dataset" (not in `starlight-evals`; the public Horizon vault mirror has fifteen letters).
- Higgsfield's C2PA trust list (third party); OpenArt's and ElevenLabs's C2PA status (unknown).
- Nebius per-token fine-tuning price and dedicated-endpoint price (login-walled).
- A mobile WebCrypto Ed25519 verify benchmark (none published; the rehearsal measures it).
- Retreat group sizes (no listing states them).
- Any current-truth statement about `starlightintelligence.ai` in production: the receipt surfaces are on an unmerged branch; production was not fetched this session.

Built on SIP.
