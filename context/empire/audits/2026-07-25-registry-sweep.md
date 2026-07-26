# Portfolio skills/agents/commands registry sweep — 2026-07-25

> Source: system-wide upgrade audit, agent sweep of 18 repos. All counts verified by file enumeration, not README claims.

## Master table

| Repo | Type | Skills | Agents | Commands | Manifest | Last commit |
|---|---|---|---|---|---|---|
| agentic-creator-os (.claude/) | full OS reference build | **179** | **147** | **173** | skill-rules.json | 2026-07-20 |
| Starlight-Intelligence-System | substrate | **84** | **144** | **25** | AGENT_REGISTRY.md, SKILL_REGISTRY.md, skill-rules.json | 2026-07-17 |
| claude-skills-library | public MIT skills library | 111 | 0 | 0 | docs/CATALOG.md | 2026-07-16 |
| agentic-creator-skills | plugin marketplace pack | 31 | 0 | 0 | plugin install | 2026-07-17 |
| starlight-agent-skills | Starlight skills pack | 27 | 3 | 0 | skill-rules.json | 2026-07-14 |
| mind-palace-agent-skills | memory-palace skills | 14 | 0 | 6 | skill-rules.json | 2026-07-06 |
| marine-agent-skills | domain sub-stack | 6 | 0 | 0 | skill-rules.json | 2026-06-15 |
| agentic-mind-os | lived OS reference | 4 | 4 | 4 | mindpack.yaml | 2026-07-06 |
| starlight-cosmos-engine | code-runtime engine | 9 (code) | 9 (code) | 0 | pipelines/ | 2026-07-17 |
| second-brain-os | substrate skill + tool | 1 (+4 adapter) | 0 | 0 | mcp.json | 2026-07-11 |
| starlight-evals | eval harness | 0 | 0 | 0 | routing-table.json | 2026-07-08 |
| starlight-swarm | swarm runtime app | 0 | 0 | 0 | — | 2026-06-22 |
| human-mind-intelligence-system | schemas | 0 | 0 | 0 | schemas/ (16) | 2026-07-08 |
| mind-intelligence-systems | canon umbrella | 0 | 0 | 0 | repo-mesh.yaml | 2026-06-19 |
| starlight-mind-os-pro | distribution only | 0 | 0 | 0 | starlight-pro.yaml | 2026-06-19 |
| awesome-mind-agent-skills | discovery list | 0 | 0 | 0 | — | 2026-06-19 |
| awesome-music-agent-skills | discovery list | 0 | 0 | 0 | — | 2026-07-17 |
| awesome-manifestation-skills | discovery list | 0 | 0 | 0 | — | 2026-07-17 |

**Totals: ~457 raw skill files → ~357 unique skill names (≈22% duplication) · 300+ agent definitions · 200+ commands.**

## Duplication clusters (name-level)

1. **claude-skills-library ↔ agentic-creator-os: 54 shared names** — public MIT mirror/subset of ACOS. Relationship exists only in README prose, not machine-readable.
2. **agentic-creator-skills ↔ agentic-creator-os: 19 shared** — plugin-marketplace packaging of same content.
3. **starlight-agent-skills ↔ agentic-creator-os: 7 shared** — the entire space vertical exists in both.
4. SIS, mind-palace-agent-skills, marine-agent-skills: **zero overlap** with anything — genuinely distinct namespaces.

## Documentation drift caught

- agentic-creator-os CLAUDE.md advertises "75+/67/35+" against actual **179/147/173** — undercounts by >2x.
- claude-skills-library README badge says 107 vs actual 111.
- SIS is the only repo whose stated counts (84/144/25) match the filesystem exactly.

## Canonical registry-of-registries: SIS. What's missing:

1. **A cross-repo portfolio manifest** (`portfolio-mesh.yaml` patterned on mind-intelligence-systems/repo-mesh.yaml) listing every repo's skills/agents/commands + counts.
2. **`canonical_source` per skill** so the ACOS ↔ claude-skills-library ↔ agentic-creator-skills triangle resolves to one authored copy per skill.
3. **A drift check** that verifies doc claims against filesystem counts (the exact failures above would have been caught).
4. **Generated awesome-lists** — the three awesome-* repos are hand-maintained link maps that should be generated from the registry.

## Capability gaps (no skill coverage anywhere)

- Legal/compliance: 7 starlight-legal-* agents exist with **zero** backing skills.
- Crypto: 5 agents, 1 skill.
- Space: 7 SIS agents but all skills live in 3 other repos — no single source.
- No testing/QA skill beyond webapp-testing (no unit-test-gen, coverage, mutation).
- No data-engineering/ETL skill.
- No incident-response/postmortem/SLO skill.
- No general i18n/localization skill.
- **No skills-of-skills governance** — nothing audits the 457 skill files for quality/duplication/staleness portfolio-wide.
