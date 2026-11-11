# Starlight Teammates: Field Manual
### The Definitive Operator Guide for Deploying Autonomous Digital Workers, Isolated MicroVM Sandboxes, and Fail-Closed Governance

> *"Autonomous execution with sovereign memory and fail-closed governance."*  
> **Substrate Attestation:** Built on SIP (Starlight Intelligence Protocol) § 3 & § 5  
> **Target Audience:** Systems Architects, Fleet Operators, Sovereign Creators, Technical Founders

---

## 1. Executive Architecture & Mission

Traditional AI assistants operate as isolated chat sessions: their context evaporates when the window closes, their tools execute unsafely on host machines, and they lack coordination across different domains.

**Starlight Teammates** are persistent, sovereign digital workers engineered for autonomous production execution. Built atop the **Starlight Intelligence Protocol (SIP)**, each teammate is:

1. **Statefully Hydrated:** Anchored to 6 semantic memory vaults (Strategic, Technical, Creative, Operational, Wisdom, Horizon), allowing instant recall of past architectural decisions, voice guidelines, and operational patterns.
2. **Multi-Model Dynamic:** Dispatched across specialized frontier models (Claude Sonnet 5.5, Gemini 4 Argon, Claude Opus 5.5, GPT-6.1 Sol) matched precisely to task cognitive load and latency budgets.
3. **Sandbox-Isolated:** Contained within ephemeral Firecracker MicroVMs or guarded local sandboxes with kernel-level isolation, path traversal defense, and automatic process tree termination.
4. **Governed by Fail-Closed Invariants:** Built with immutable security gates. Financial mutations, live production merges, and destructive operations immediately suspend execution to await explicit human cryptographic signature.

```
                      +------------------------------------------+
                      |         Human Operator Cockpit           |
                      |        (/cockpit & /teammates)           |
                      +--------------------+---------------------+
                                           |
                                  [ The Veil ]
                       (PII Scrubbing & Credential Filter)
                                           |
                   +-----------------------v-----------------------+
                   |           Teammate Orchestration Router       |
                   |   - Intent Classifier   - Model Tier Router   |
                   +----+-----------------+--------------------+---+
                        |                 |                    |
            +-----------v----+    +-------v--------+   +-------v--------+
            |  Light Tier    |    | Standard Tier  |   | Frontier Tier  |
            | Gemini 4 Argon |    | Sonnet 5.5     |   | Claude Opus 5.5|
            | GPT-6.1 Sol    |    | GPT-6.1 Sol    |   | GPT-6 Astra    |
            +-----------+----+    +-------+--------+   +-------+--------+
                        |                 |                    |
                   +----v-----------------v--------------------v---+
                   |         Fail-Closed Governance Gates          |
                   |   - Financial Cap Check   - Production Merge  |
                   +----------------------+------------------------+
                                          |
                      +-------------------v-------------------+
                      |      Isolated MicroVM Execution       |
                      | (Firecracker / Local Sandbox Runner)  |
                      +-------------------+-------------------+
                                          |
                        +-----------------v-----------------+
                        |  6-Vault Memory Settlement Layer  |
                        | (Operational, Strategic, Wisdom)  |
                        +-----------------------------------+
```

---

## 2. Fleet Roster & Roles

The Starlight council provides out-of-the-box specialization across five primary operational nodes:

| Teammate | ID | Domain | Default Tier | Frontier Models | Active Memory Vaults | Primary Mission |
|---|---|---|---|---|---|---|
| **Starlight Queen** | `starlight-queen` | Orchestration | Standard | Claude Sonnet 5.5, Opus 5.5, Gemini 4 Argon | Operational, Wisdom, Strategic, Technical | Autonomous Ecosystem Operator & CIO. Sweeps estate, schedules tasks, directs swarms. |
| **Search Manager** | `search-manager` | Intelligence | Light | Gemini 4 Argon, GPT-6.1 Sol, GLM 5.3 | Strategic, Wisdom | Market & AI Lab Intelligence Analyst. Rapid citation, web discovery, competitive scans. |
| **GitHub Officer** | `github-officer` | Safety | Standard | Claude Sonnet 5.5, GPT-6.1 Sol | Technical, Operational | Code Quality, CI/CD & Sentinel Guardian. Branch audits, security diffs, lint enforcement. |
| **Community Lead** | `community-lead` | Relational | Light | Gemini 4 Argon, GLM 5.3 | Creative, Wisdom | Member Engagement & Signal Synthesizer. Discourse/Discord triage, newsletter pulse. |
| **Teammate Builder** | `teammate-builder` | Foundry | Frontier | Claude Opus 5.5, GPT-6 Astra, Sonnet 5.5 | Technical, Wisdom | Swarm Node & Skill Compiler Studio. Compiles new skills, packages agent profiles. |

### Expanding the Fleet
To register a new autonomous teammate, declare a markdown profile in `agents/starlight-<name>.md` and register the node in `skills/skill-rules.json` and the frontend catalog. Teammates inherit the SIP memory protocol without requiring application code changes.

---

## 3. Dynamic Frontier Model Engine Architecture

Teammates do not hardcode a single LLM. Instead, tasks are dynamically routed to optimize reasoning depth, inference cost, and response speed.

### Model Tier Matrix

```
[ Lightweight / Rapid Scan ]  --> Gemini 4 Argon / GPT-6.1 Sol (Light Tier)
      Latency: 150-400ms | Context: 1M tokens | Best for: Search, JSON parsing, Heartbeat sweeps

[ Core Production Workhorse ] --> Claude Sonnet 5.5 / GPT-6.1 Sol (Standard Tier)
      Latency: 600-1200ms | Context: 200k tokens | Best for: Full-stack code, PR reviews, Tool chains

[ Deep Council & System Proofs] --> Claude Opus 5.5 / GPT-6 Astra (Frontier Tier)
      Latency: 1800-4000ms | Context: 200k tokens | Best for: Architecture blueprints, Cross-repo refactors
```

1. **Light Tier (Gemini 4 Argon & GPT-6.1 Sol):**
   - High-throughput scanning, semantic deduplication, and initial prompt classification.
   - Low token-cost processing of long document sets (up to 1M+ tokens in Gemini 4 Argon).
   - Real-time heartbeat telemetry and background autonomic daemon cycles.

2. **Standard Tier (Claude Sonnet 5.5):**
   - Daily driver for autonomous coding, refactoring, and tool execution.
   - High precision tool invocation (MCP servers, Bash execution, REST APIs).
   - Git branch synthesis and documentation updates.

3. **Frontier Tier (Claude Opus 5.5 & GPT-6 Astra):**
   - Structural design decisions, kernel contract updates, multi-agent council consensus.
   - Complex algorithmic verification and multi-repo dependency topology resolution.

---

## 4. MicroVM & Sandbox Security Architecture

Executing untrusted or autonomous code requires airtight containment. Starlight implements a defense-in-depth isolation harness:

### 4.1 The Veil (Sanitization Gateway)
Before any prompt or memory record reaches an external model provider or runner:
- High-entropy strings matching API keys (Stripe, GitHub, OpenAI, Anthropic, AWS, GCP, Vercel) are redacted into opaque markers (`[REDACTED_SECRET:KEY_HASH]`).
- Personal Identifiable Information (PII) including emails, phone numbers, and private paths are masked.
- Substrate-private directories (`private/`, `memory/_audit/`, `memory/mempalace/`) are dropped from outward exports.

### 4.2 Sandboxed Execution Providers
The sandbox router supports three execution backends:

```
                      +------------------------------+
                      |    Sandbox Router Request    |
                      +--------------+---------------+
                                     |
               +---------------------+---------------------+
               |                     |                     |
     +---------v----------+  +-------v--------+  +---------v----------+
     | Firecracker MicroVM|  | Local Sandbox  |  | Edge V8 Sandbox    |
     | Kernel isolation   |  | Tempdir jail   |  | Sub-millisecond    |
     | Ephemeral rootfs   |  | Process timeout|  | Pure JS logic      |
     +--------------------+  +----------------+  +--------------------+
```

1. **Firecracker MicroVM (Isolated):**
   - Minimal Linux kernel boot in <15ms.
   - Ephemeral copy-on-write root filesystem destroyed immediately upon script termination.
   - Dedicated cgroup memory and CPU limits (default 512MB RAM, 1 vCPU).

2. **Empirical Local Sandbox:**
   - Isolated ephemeral directory created via `mkdtempSync(join(tmpdir(), "starlight-sandbox-"))`.
   - Process executed with strict child process isolation, stdio piping, and hard timeouts.
   - Guaranteed `finally` cleanup: temporary directories and intermediate binaries are wiped recursively.

3. **Edge V8 Worker Sandbox:**
   - Lightweight isolates for pure JavaScript/TypeScript data transformations and JSON formatting.

### 4.3 Process Tree-Killing & Timeout Defenses
Long-running scripts or malicious forks can spawn orphan processes. The Starlight sandbox enforces:
- Strict execution timeouts (configurable default: 10,000ms; maximum: 15,000ms).
- On timeout expiration, recursive process tree termination (`SIGKILL` tree signal) halts both parent and child processes.
- Unlink handlers ensure file locks are released and temp disks are unmounted cleanly.

### 4.4 Path Traversal & Injection Shields
- Scripts are confined strictly to their ephemeral sandbox root.
- Path traversal sequences (`../`, `..\`, `/etc`, `C:\Windows`) are rejected at the argument boundary.
- Environment variables are scrubbed: host credentials and system secrets are not inherited by sandboxed child processes.

---

## 5. Fail-Closed Governance Invariants (SIP § 5)

Autonomy without boundaries is a liability. Starlight enforces three non-negotiable, non-waivable governance invariants:

### Invariant 1: Financial Mutations Fail Closed
- **Trigger:** Any action or prompt attempting to move funds, issue payments, adjust credit limits, modify billing subscriptions, or generate unapproved invoices.
- **Behavior:** Execution halts instantly. The teammate status flips to `waiting_approval`.
- **Operator Card:** A cryptographic approval request is dispatched to the human operator Cockpit (`/cockpit` and `/teammates`). No funds move without explicit human signature.

### Invariant 2: Production Deployments & Main Merges Fail Closed
- **Trigger:** Commands targeting `git push origin main`, direct merges, or production deployment triggers (e.g. Vercel / Cloudflare production workers).
- **Behavior:** The action is isolated to a feature branch (`agent/<harness>/<scope>`). Staged diffs and Sentinel security audit results are submitted as an Approval Card. Merging requires human verification.

### Invariant 3: Canon & Substrate Immutability
- **Trigger:** Attempts to delete registered agents, wipe vaults, or bypass SIP attestation contracts.
- **Behavior:** The request is rejected at the protocol layer.

```json
// Example Approval Card Emitted to Cockpit
{
  "id": "gate-1718019482000",
  "type": "FINANCIAL",
  "title": "Authorize Budget Allocation / Payment",
  "description": "Approve $450 API provider credit replenishment",
  "consequences": "Transfers funds from connected account. Non-reversible without manual refund.",
  "status": "pending",
  "receipt": "sip:receipt:1718019482000:gate-1718019482000"
}
```

---

## 6. Sovereign Memory Hydration & Settlement

Every teammate action begins and ends in the **6 Starlight Semantic Memory Vaults**:

1. **Hydration (Pre-Run):** The intent router extracts relevant domain context from:
   - **Strategic Vault (◆):** Precedent decisions, business boundaries, target outcomes.
   - **Technical Vault (⬡):** Empirically verified code patterns, library contracts.
   - **Creative Vault (✦):** Brand guidelines, voice signatures, UI aesthetics.
   - **Operational Vault (▸):** Prior workflow traces, error recovery histories.
   - **Wisdom Vault (◎):** Core philosophy and cross-cutting principles.
   - **Horizon Vault (↗):** Vision ledger and quarterly objectives.

2. **Settlement (Post-Run):**
   - Execution traces, durations, model versions, and outputs are indexed into the Operational Vault via `sis_append_entry`.
   - New validated technical patterns are committed to the Technical Vault.
   - Attestation stamps (`Built on SIP`) are attached to all artifacts.

---

## 7. Command Line & Autonomic Daemon Operations

### CLI Quick Reference

```bash
# List all active teammates and their status
starlight teammates list

# Dispatch a goal prompt to a specific teammate
starlight teammates dispatch --teammate=starlight-queen --prompt="Audit all open PRs" --tier=standard

# Run with light model tier (Gemini 4 Argon)
starlight teammates dispatch --teammate=search-manager --prompt="Find latest arXiv multi-agent papers" --tier=light

# Inspect pending governance approvals
starlight teammates approvals

# Approve a pending gate with cryptographic receipt
starlight teammates approve --request-id=gate-1718019482000 --action=approve

# Stream real-time execution trace
starlight teammates stream --teammate=starlight-queen
```

### Autonomic Heartbeat Telemetry
The cockpit monitors teammate health through the autonomic heartbeat API:
```bash
curl -X GET http://localhost:3000/api/teammates/heartbeat
```
Returns 1-second pulse intervals, active workflow states, sandbox pressure, and governance queue depth.

---

## 8. Summary Checklist for Fleet Operators

- [ ] All teammates registered with explicit domain, voice, and model tiers.
- [ ] Ephemeral sandbox path permissions locked down; process timeout set to <=15s.
- [ ] The Veil enabled for automated secret redacting on all outward streams.
- [ ] Financial and git merge governance gates confirmed active (`/api/teammates/approve`).
- [ ] Vault sync daemon configured to settle execution receipts every 60 seconds.

Built on SIP — Starlight Intelligence Protocol v8.3. Canon: Sovereign.
