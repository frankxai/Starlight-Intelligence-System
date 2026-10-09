# Changelog

All notable releases. Dates in ISO 8601. Substrate (SIP) version tracked separately from package version.

## Merged on main - 2026-05-30 to 2026-10-08

Each line is a merged pull request or commit on `main`, dated by its merge date and cited by number or short SHA.

### October 2026

- 2026-10-08 - `sis_search` supports scope filtering (#314).
- 2026-10-08 - Scoped recall behavior restored (#311).
- 2026-10-08 - Shared creative draft kernel and three branded lab projections (#309).
- 2026-10-06 - Workspace sessions can be imported, and their scope is reported (#291).
- 2026-10-06 - Reality Architect registered as an external SIP vertical (#280).
- 2026-10-06 - Portable Starlight plugin repaired and connected to capability workflows (#277).
- 2026-10-05 - Trusted session-continuity import, status and owner reconciliation (#273).
- 2026-10-05 - Production design canary after each production deploy (#284), extended with sitemap coverage plus capitals, touch, contrast and focus checks (#287), and set to fail on all six checks (#290).
- 2026-10-04 to 2026-10-05 - Site accessibility and layout fixes: WCAG AA contrast for secondary text and touch targets (#289); 320px overflow fixes (#271, #282, #283); /queen phone overflow (#281); sentence-case labels (#275, #278, #279, #288).
- 2026-10-01 - Audit pass on site build, lockfiles, frontmatter, encoding and stale counts (#254).

### September 2026

- 2026-09-28 - Vault path traversal fixed in the MCP server, and the `sis_*` tools brought to the quality bar (#215).
- 2026-09-24 - Portable agent ontology and governed compiler (#194).
- 2026-09-19 - /verify page for SIS's own signed SIP receipt (#173); SIP schemas served at their type and `$id` URLs (#174); SIS's own SIP graph profile attested on every push to main (#170).
- 2026-09-19 - Proposed SIP layer 7: evidence graph with signed, re-checkable receipts (#166).
- 2026-09-19 - Next.js upgraded to 16.3.5 in site and console as a security fix (#168).
- 2026-09-14 - Reviewed loop kernel integrated and hardened (#156).
- 2026-09-09 - Remembering a memory no longer executes code inside it (#135).
- 2026-09-06 - SIS contracts consolidated, and the community creation loop added (#133).
- 2026-09-02 - Vault pages stay available when GitHub content requests time out or hang (#127, #130).
- 2026-09-01 - Cinematic deep-field visual system for the site (#118).

### August 2026

- 2026-08-29 - Agent discovery entry point (#110).
- 2026-08-27 - Vault count on the public site corrected (#105), following the public vault count fix of 2026-08-18 (#92).
- 2026-08-24 - Vercel deploy page (#103, #104).
- 2026-08-15 - Homepage calls to action describe source-only distribution (#83).
- 2026-08-12 - Starlight Accord and cross-lab perspective published (#80).
- 2026-08-05 - Constellation star maps and encyclopedia wave on /cosmos (#37).

### July 2026

- 2026-07-27 - Homepage repositioned as a multi-agent architecture surface (#59), with release-integrity follow-ups (#60).
- 2026-07-25 - Public install instructions repaired (#51).
- 2026-07-06 - Dead calls to action, private-repo links and internal-note copy repaired on production pages (#31).

### June 2026

- 2026-06-24 - Knowledge Tree explorer: 3D hero, 2D fallback and graph data model (#29).
- 2026-06-12 - v8.3.0 release finalized (48a1cdc).
- 2026-06-11 - SIS Memory Gateway v0.1 (fd0dc2d).
- 2026-06-11 - Memory Engine v0.2: pluggable embedding provider and RRF hybrid search (4c41ec1).
- 2026-06-11 - /cosmos and /asteroids pages (f5da2b1).
- 2026-06-08 - /knowledge-tree page (#18).

### May 2026

- 2026-05-31 - v8.2.0: first-run hardening, vault seeding, retrieval labeling and measured recall (#15).
- 2026-05-30 - Harness drift guard, CI, STATUS and MCP smoke test (#14).
## Unreleased — 2026-09-19

- **Attestation is earned, not blanket.** The "Built on SIP" block is emitted only on artifacts that compose a SIP element, and is described as a declared label; verifiable claims use signed receipts (`protocol/sign.mjs`). Supersedes the v7.4 ambient-attestation stance (see `ATTESTATIONS.md`).
- Agent profiles no longer describe the SIP block as cryptographic.

## v8.1.0 — 2026-05-17

**Substrate doctrine evolution — Composition Layer primitive declared. Crypto IS v0.1 proof-of-pattern. Wealth IS evolved to first composition-layer reference instance.**

- **Composition Layer (new substrate primitive, STACK.md doctrine):** Any universal IS may compose over its Domain Sub-Stacks via commands and rules at the IS-itself. Pattern opt-in for Self / Family / Business / Creator / Brand IS. 10-IS taxonomy NOT touched (invariant preserved); Wealth IS stays row #2.
- **Wealth IS v0.2 (first composition-layer reference):** DPI ledger + Thesis engine + Gate ladder discipline preserved as Wealth IS's own commands with explicit lineage. Cross-asset commands declared: `/wealth-portfolio-fit`, `/wealth-sovereignty-design`, `/wealth-cycle-thesis`. Wealth IS daily-5 declared per People IS v7.4.1 cognitive-load discipline.
- **Crypto Intelligence v0.1 proof-of-pattern (third reference Domain Sub-Stack):** `verticals/crypto-intelligence/` scaffolded with **Houses-as-sub-systems** primitive (6 archetypal stances: On-Chain · Macro · DeFi · Sovereignty · Research · Allocation). House of On-Chain shipped — agent + skill + knowledge + 5 commands (`/crypto-onchain-flow-snapshot`, `wallet-trace`, `mev-audit`, `validator-econ`, `contract-interaction`). 5 sister Houses gated on 2026-05-24 v0.1-proof-pass. Investment IS held until same proof-pass.
- **R5 non-advisory clause:** Universal inline in every Crypto IS House command output. Non-waivable per Crypto IS SOUL.md.
- **Sibling-repo export hook landed (Board (c) close-out):** `verticals/crypto-intelligence/ATTESTATIONS.md` (vertical-local ledger) + MCP-shape declaration in `SKILL.md`. v0.2+ extraction target: `github.com/frankxai/crypto-intelligence-system`.
- **Genius prerequisite gate closed (Path A in-repo corpus excavation):** `genius/profile-frankx.md` (14 frameworks at ≥3 occurrences, synthesis edge named, 7 voice samples cited) + `genius/freedom-path-frankx.md` (KEEP/DELEGATE/AUTOMATE/KILL all populated).
- **Governance gates passed:** `/starlight-board` REVISE → 5 items closed same-session (R1 + R3 Frank-acked via AskUserQuestion; R2 + R4 + R5 + (c) operational close-outs). `/openclaw-audit` SHIP-WITH-REMEDIATION (no CRITICAL/HIGH defects; 1 MEDIUM pre-existing substrate-command-design issue; 2 LOW SHA back-fills closed in `ea75c8a`). Pre-commit substrate symmetry: 90/90 green (v76+v77+v78+v79+v80+v84+v85).
- **Skill registry:** 69 → 71 auto-activating rules across 13 → 14 domains (+ crypto-intelligence). Platform-prompt symmetry updated across CLAUDE.md, AGENTS.md, .cursor/rules/, .clinerules/, .gemini/.
- **Chronicle infrastructure initialized:** `docs/chronicle/blessings.jsonl` + `docs/chronicle/weekly/` per /bless skill design. First W20 chronicle entry shipped.
- **Falsifier (2026-05-24):** if House of On-Chain cannot ship 4-5 named artifacts in 1 week of actual practice, Houses-as-sub-systems primitive failed for crypto → fall back to functional sub-systems matching People IS shape; re-iterate `verticals/crypto-intelligence/PROPOSAL.md`.

Verdict ledgers: `docs/boards/2026-05-17-crypto-investment-spawn.md` (Board) · `docs/boards/openclaw-2026-05-17-audit.md` (OpenClaw integrity audit) · `docs/chronicle/weekly/2026-W20.md` (week chronicle).

Commits: `23cace2` (substrate landing) · `ea75c8a` (audit close-out).

## v8.0.0 — 2026-05-07

- v01 Friday-demo bundle: 13 schemas + SQLite-shadowed JSONL ledgers + WorkPacket CLI, Council 7-archetype doctrine, VaultLoopEntry record type, /trace SSE.
- Day-of excellence sprint: v80 platform-prompt symmetry harness, tsconfig strictness, AEO raw-md endpoints, dreaming cron.
- Operational: end-to-end excellence audit, sitemap + robots + llms.txt + JSON-LD, pre-commit hook wired, dist/ ungated for site.

## v7.9.x — 2026-05-02 to 2026-05-06

- v7.9.1: GHA Vercel CLI pin bump 39.4.0 -> 42.2.0; content-drift-check workflow.
- v7.9.2: /process-inbox slash command; /starlight-board canonical (Luminor preserved as Arcanea-canonical variant); naming reconciliation.

## v7.8 — 2026-05-02

- Per-vertical SSG pages on the site (/verticals/people-intelligence, /sound-intelligence, /music-is). lib/verticals.ts + lib/accents.ts source-of-truth modules. Skip link a11y fix.

## v7.7 — 2026-05-02

- Site refresh shipped: 9-IS framing, /verticals, /cockpit, /explainer with full markdown render, 10-IS /architecture.

## v7.6.0 — 2026-04-28

- People Intelligence rename (HR Intelligence -> People Intelligence) across 91 files. First ship under the board-before-tag invariant.

## v7.5.x — 2026-04-26 to 2026-05-01

- v7.5: 10-IS reconciliation, Path A authorless, auto-deploy restored via GHA, v75 conformance harness.
- v7.5.2: Sound Intelligence vertical (second reference Domain Sub-Stack Tier).
- v7.5.3: Pluggable multi-tier cognition router, multi-CLI dispatchers, LCC Phase 0+1+2 (Zellij cockpit, Windows-native PowerShell, dashboard, browser autonomy, brain viz, cognition CLI, phone PWA). Dispatch CLI + orb executor backend. Mirror Foundation visual layer.

## v7.4 — 2026-04-25

- Genius Intelligence System alpha: Excavation Tier agent + /discover-genius, /reclaim-knowledge, /train-executor, /creator-pipeline. /arcanea-canon. Ambient SIP attestation.
- v7.4.1: Domain Sub-Stack Tier first reference (People Intelligence — 6 agents, 28 commands, 6 skills); /spawn-domain-stack meta-command. MS Copilot + Custom GPT exports.

## v7.3.x — 2026-04-24

- v7.3: Newcomer front door — /welcome, /intake, /sovereign-spawn + Concierge + Envoy + idea-triage + creator-path + vertical-starter templates.
- v7.3.1: 19-assertion eval harness + ecosystem-integration hub + /sip-export (5 targets) + attested-modalities scaffold.

## v7.2 — 2026-04 to 2026-04-23

- 3 public repos live (substrate + adoption kit + vibe-os-substrate). Badge route + test harness + Console dual-view.

## v7.1 — 2026-04 (mid)

- File contract closed, starlight-mcp v1.1, Console v8 foundation. Adoption kit + Vibe OS staged.

## v7.0 — 2026-04 (early)

- Two-layer SIS architecture: SIP substrate + reference operational layer in one repo.

## v3.0.0 - v6.x — 2026-03 and earlier

- Pre-SIP iterations. See git tags for full history. Substrate-naming and 10-IS taxonomy were not yet locked.

---

## Protocol versions (SIP)

| SIP version | Tagged in | Notes |
|---|---|---|
| v1.1.1 | commit 97c7edc, 2026-05-06 | Section 5 encoded-self amendment: forks inherit pattern not person. |
| v1.1.0 | v7.x line | Initial sovereignty clause + attestation grammar. |

---

## Tier-5 OSS-readiness pass — 2026-05-11

- .gitignore hardened: .env/.pem/.key, OS shell-junk, log files, .playwright-mcp, repo-root *.png screenshots.
- package.json: repository + bugs + homepage fields added for npm metadata.
- fork-ux: npm run build chained into test:v01-evals so fresh-clone npm test passes end-to-end.
- OSS docs: SECURITY.md (responsible disclosure), CONTRIBUTING.md (two-tier contribution model), CODE_OF_CONDUCT.md (Contributor Covenant 2.1 by reference).
- NOTICE: SIP attestation version pinned to v1.1.1 (post-encoded-self amendment).
- README: SETUP.md link surfaced for operators; version drift v7.6.0 -> v8.0.0 fixed; CHANGELOG cross-link added.
- CHANGELOG.md: this file.

---

**Built on SIP** · `CHANGELOG.md` v1.0 · MIT
