# Starlight Jules Conductor v2.2

> One Node process sends Jules sessions it owns and records the pull request Jules opens.
> `autoMerge`, `autoDispatch`, and remote-session adoption are off.
> A tick does not sweep the estate, undraft a pull request, or merge.
> frankx.ai production stays protected. Built on SIP v1.1.1.

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
   - **Land gate** records the owned pull request. Merge needs `autoMerge`, `accept`, one live green check, and `CLEAN`. Those switches are off.

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
                  │              Review, then land               │
                  │   - Record the pull request. Leave drafts    │
                  │   - Merge only after accept and live checks  │
                  │   - frankx.ai production stays protected     │
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

### Pattern 1: One bounded bugfix
- **Trigger**: One named issue, enqueued on purpose.
- **Flow**: Jules opens one pull request. The conductor records it. A person accepts it before any land.

### Pattern 2: One step of a spec
- **Trigger**: One atomic step, not the whole spec.
- **Flow**: Finish and review that pull request before anyone enqueues the next step.

### Pattern 3: One repo at a time
- **Trigger**: A named repository and a file boundary.
- **Flow**: The cap is 3 owned sessions. The conductor does not fan out across the estate.

### Pattern 4: Review an existing pull request
- **Trigger**: A pull request number.
- **Flow**: Use the Hermes watcher role `reviewer`. It comments. It does not push or merge.

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

# One scan. Does not merge while autoMerge is false
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
