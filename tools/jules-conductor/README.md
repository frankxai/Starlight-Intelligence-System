# Starlight Jules Autonomous Conductor v2.0

> 24/7 Autonomous Multi-Agent Engineering Swarm coordinating Google Jules, Starlight Specialist Council, and Zero-Touch GitHub Auto-Merge across the FrankX ecosystem.
> Built on the Starlight Intelligence Protocol (SIP v1.1.1).

---

## 1. Architectural Philosophy: Cloud Muscle + Sovereign Council Mind

Google Jules executes inside Google's cloud sandboxes. To make Jules autonomous, reliable, and production-safe across dozens of repositories without human intervention, we decouple the system into three tight loops:

1. **Pre-Flight Council Framing (The Mind)**:
   - **Architect** checks scope, enforces repo invariants, and vetoes destructive refactors.
   - **Sage** queries past operational/technical memory vaults to inject past learnings into the prompt card.
2. **Cloud Sandbox Execution (The Muscle)**:
   - Jules runs remotely on GitHub repositories (`frankxai/*`) with asynchronous branch isolation.
3. **Post-Flight Sentinel Ratification (The Gate)**:
   - **Sentinel** audits the patch for secrets, malicious dependencies, and workflow tampering.
   - **Weaver** audits code taste, preventing AI slop and ensuring conventional commit conventions.
   - **Auto-Merge Engine** verifies CI checks and merges with `gh pr merge --squash --delete-branch --auto`.

```
                  ┌──────────────────────────────────────────────┐
                  │          Starlight Specialist Council        │
                  │   - Architect: Invariants & Scope Boundaries │
                  │   - Sage: Past Vault Memory Retrieval        │
                  │   - Prompt Synthesizer: Frontier Card Gen    │
                  └──────────────────────┬───────────────────────┘
                                         │
                    Engineered Working Card (SIP Invariants)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │                 Google Jules                 │
                  │   - Cloud Sandbox Autonomous Execution       │
                  │   - Zero Local CPU / Zero Local RAM Burden   │
                  └──────────────────────┬───────────────────────┘
                                         │
                         Session Completed (Patch / PR)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             Specialist Ratification          │
                  │   - Sentinel: Secrets / Supply Chain Gate    │
                  │   - Weaver: Taste / Anti-Slop Audit          │
                  │   - Quality Gate: Test / Lint Assertions     │
                  └──────────────────────┬───────────────────────┘
                                         │
                             Council Ratified (100% Green)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │         Autonomous Auto-Merge & Vault        │
                  │   - gh pr merge --squash --delete-branch     │
                  │   - Close GitHub Issue with Attestation      │
                  │   - Append Receipt to Starlight Vault        │
                  └──────────────────────────────────────────────┘
```

---

## 2. Low-RAM Architecture (<40 MB Resident Footprint)

Running a 24/7 daemon on a developer workstation must never degrade gaming, production builds, or local agent workflows.

- **Direct Binary Spawning**: Bypasses heavy PowerShell profile loading (saving ~200MB of RAM and 5+ seconds of CPU churn per command).
- **Sub-Second Execution**: Spawns directly via Node (`spawnSync` with `windowsHide: true`).
- **Memory Capping**: Monitors process RSS and Heap usage. Automatically prunes old completed sessions to `state/archive.jsonl` when the active ledger exceeds 50 items.
- **Measured Footprint**: Steady-state RAM is **37 MB – 40 MB** flat.

---

## 3. Four Core Operational Swarm Patterns

### Pattern 1: Autonomous Bugfix & Dependabot Healer
- **Trigger**: Sentry alerts, Dependabot PRs, or open GitHub bug issues.
- **Flow**: Jules diagnoses, patches dependencies, and verifies tests. Conductor verifies diff boundaries and merges automatically.

### Pattern 2: Multi-Step Spec Decomposition (Top-Down)
- **Trigger**: New feature specs in `docs/specs/*.md` or Starlight Goal sessions (`starlight goal`).
- **Flow**: Architect breaks the spec into atomic steps. Conductor feeds each step sequentially to Jules, verifying and merging each PR before initiating the next step.

### Pattern 3: Cross-Repo Consistency Swarm (Parallel)
- **Trigger**: Ecosystem-wide updates (e.g. updating AGENTS.md conventions, brand assets, or shared MCP tool contracts).
- **Flow**: Conductor fans out parallel sessions across all 8 monitored repos (`jules new --parallel`), tracks all sessions concurrently, and merges the fleet.

### Pattern 4: Overflow Testing & QA Engine
- **Trigger**: New pull request opened by Frank or another local agent.
- **Flow**: Jules writes exhaustive integration and edge-case unit tests against the branch. Conductor ratifies and commits tests directly to the PR branch.

---

## 4. Repo Profiles (`config.json`)

Each repo has its own tailored quality gates and lead agent:

| Repo | Type | Lead Agent | Quality Gate | Target Branch |
|------|------|------------|--------------|---------------|
| `Starlight-Intelligence-System` | `substrate-core` | `starlight-architect` | `npm run lint` | `main` |
| `arcanea-ai-app` | `fullstack-nextjs` | `starlight-weaver` | `npm run lint && npm run build` | `main` |
| `gencreator.ai` | `fullstack-nextjs` | `starlight-weaver` | `npm run lint` | `main` |
| `frankx.ai-vercel-website` | `fullstack-nextjs` | `starlight-weaver` | `npm run lint` | `main` |
| `vibeclubs` | `community-platform` | `starlight-weaver` | `npm test` | `main` |
| `agentic-ops` | `agent-runtime` | `starlight-architect` | `npm test` | `main` |
| `agentic-creator-os` | `creator-os` | `starlight-navigator` | `npm test` | `main` |

---

## 5. CLI Commands

```powershell
# Check live status, active memory footprint, and metrics
npm run jules:status

# Run a single council-gated autonomous verification & merge pass
npm run jules:tick

# Run 24/7 background loop in low-RAM mode
npm run jules:daemon

# Dispatch a direct high-intellect task with Council invariants
node tools/jules-conductor/conductor.mjs dispatch frankxai/arcanea-ai-app "Fix mobile navigation drawer layout shift" bugfix

# Run automated test suite
node --test tools/jules-conductor/tests/conductor.test.mjs
```

---

*Built on SIP — Starlight Intelligence Protocol v1.1.1*
