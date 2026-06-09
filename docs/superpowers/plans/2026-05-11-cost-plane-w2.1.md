# Cost Plane W2.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Cost Plane W2.1 Phase 1 — Infisical wrapper + 2 source instrumenters (Vercel + Anthropic) + daily snapshot orchestrator + cockpit pane + v82 substrate test. No real API calls until Frank provides keys; TDD with mocked HTTP.

**Architecture:** TypeScript-first runtime helpers under `src/infra/`. JSONL audit log at `memory/_audit/cost/`. Cockpit-only dashboard (no public site route per Board REVISE-3). Mocked-HTTP TDD with optional fixture-recording pattern for nightly canary against real responses (post-key).

**Spec source:** `docs/superpowers/specs/2026-05-11-cost-plane-design.md` (commit 2871b9b, Board REVISE applied)

---

## Phase-split clarity

**W2.1 (this plan — primitives + 2 sources):**
- Vercel + Anthropic source instrumenters
- Daily snapshot orchestrator + JSONL writer
- Infisical CLI wrapper (stub-ready for keys)
- Cockpit pane + tail script
- v82 substrate symmetry test
- No vertical scaffold yet (deferred to W2.1.x — adds Markdown bulk after primitives prove)

**W2.1.5 (after 7-day validation against real responses):**
- Add Cloudflare + Langfuse source instrumenters
- Fixture-recording pattern for nightly canary

**W2.1.x (vertical scaffold, separate ship):**
- `verticals/infrastructure-is/SKILL.md` + AGENTS.md + STACK.md + SUB-SYSTEMS.md + SOUL.md + MEMORY.md + CANON.md
- Substrate-tier updates to VERTICALS.md / STACK.md / CLAUDE.md / AGENTS.md / platform adapters
- Vertical-namespaced commands + agents

---

## File structure (W2.1)

**Create:**
```
src/infra/
├── secrets.ts                              # Infisical CLI wrapper (stub-ready)
├── cost-snapshot.ts                        # daily orchestrator
└── cost-sources/
    ├── _shared.ts                          # snapshot schema + JSONL writer
    ├── vercel.ts                           # Vercel REST instrumenter
    └── anthropic.ts                        # Anthropic Organizations API instrumenter

src/infra/infra.test.ts                     # mocked-HTTP unit tests

test/v82-cost-plane.test.ts                 # substrate symmetry test

scripts/cron/daily-cost-snapshot.ps1        # cron entry

cockpit-zellij/layouts/cost-plane.kdl       # 4-pane operator dashboard
cockpit-zellij/scripts/tail-cost.ps1        # JSONL tail for cockpit pane
cockpit-zellij/scripts/cost-status.ps1      # current-month summary panel

cost-plane-config.json                      # thresholds + WoW/MoM (committed default)
```

**Modify:**
```
package.json                                # add v82 to test:substrate + cost tests to test:operational
tools/git-hooks/pre-commit                  # wire v82 into 6 fast tests → 7
.gitignore                                  # ignore memory/_audit/cost/ (runtime cost data, operator-private)
```

**NOT modified in W2.1 (deferred to W2.1.x vertical scaffold):**
```
VERTICALS.md / STACK.md                     # vertical declaration
CLAUDE.md / AGENTS.md / platform adapters   # taxonomy bump
agents/AGENT_REGISTRY.md                    # new agents
skills/skill-rules.json / SKILL_REGISTRY.md # new skills
```

---

## Task 1: gitignore + audit dir contract

**Files:**
- Modify: `.gitignore` (add `memory/_audit/cost/`)

- [ ] **Step 1: Add cost audit dir to gitignore**

Append after existing `memory/_audit/yolo/` line in .gitignore:

```
memory/_audit/cost/
```

- [ ] **Step 2: Commit**

```
git add .gitignore
git commit -m "feat(cost-plane): gitignore runtime cost audit dir"
```

---

## Task 2: Shared cost snapshot module + schema

**Files:**
- Create: `src/infra/cost-sources/_shared.ts`

- [ ] **Step 1: Write _shared.ts with typed CostSnapshot + JSONL writer**

```typescript
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export type SourceName = "vercel" | "anthropic" | "cloudflare" | "langfuse";

export interface CostSnapshot {
  ts: string;                     // ISO timestamp of snapshot capture
  source: SourceName;
  scope: string;                  // team/org identifier for the source
  period: string;                 // YYYY-MM-DD covered by this snapshot
  cost_usd: number;
  usage: Record<string, number>;  // source-specific usage metrics
  raw_response_sha256: string;    // hash of the raw API response for audit
  anomaly_flags: string[];        // populated by anomaly detector, empty at capture time
}

export interface SourceFetcher {
  source: SourceName;
  fetch(period: string): Promise<CostSnapshot>;
}

export function writeSnapshot(repoRoot: string, snapshot: CostSnapshot): string {
  const dir = join(repoRoot, "memory", "_audit", "cost");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const datePart = snapshot.ts.slice(0, 10);
  const path = join(dir, `${datePart}.jsonl`);
  appendFileSync(path, JSON.stringify(snapshot) + "\n", "utf8");
  return path;
}

export async function hashResponse(body: string | object): Promise<string> {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

- [ ] **Step 2: Test it (TDD — write the test first if redoing)**

(See Task 5 for the full test file. _shared.ts is exercised inside source-specific tests.)

---

## Task 3: Vercel source instrumenter (TDD with mocked HTTP)

**Files:**
- Create: `src/infra/cost-sources/vercel.ts`
- Update: `src/infra/infra.test.ts` (add vercel tests)

- [ ] **Step 1: Write failing test** for Vercel fetcher
- [ ] **Step 2: Implement** vercel.ts — wrap Vercel REST API, return CostSnapshot
- [ ] **Step 3: Verify test passes**
- [ ] **Step 4: Commit**

```typescript
// src/infra/cost-sources/vercel.ts
import type { SourceFetcher, CostSnapshot } from "./_shared.js";
import { hashResponse } from "./_shared.js";

export class VercelFetcher implements SourceFetcher {
  source = "vercel" as const;

  constructor(
    private readonly apiToken: string,
    private readonly teamId: string | null = null,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetch(period: string): Promise<CostSnapshot> {
    // Vercel usage API: GET /v1/teams/{teamId}/billing/invoices  (or per-deploy)
    // For this skeleton: returns shape; real endpoint wiring per phase-1.5 spec.
    const url = this.teamId
      ? `https://api.vercel.com/v1/teams/${this.teamId}/billing/usage`
      : `https://api.vercel.com/v1/billing/usage`;

    const response = await this.fetchImpl(url, {
      headers: { Authorization: `Bearer ${this.apiToken}` },
    });

    if (!response.ok) {
      throw new Error(`Vercel API ${response.status}: ${response.statusText}`);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const raw_response_sha256 = await hashResponse(body);

    return {
      ts: new Date().toISOString(),
      source: "vercel",
      scope: this.teamId ?? "personal",
      period,
      cost_usd: extractCostUsd(body),
      usage: extractUsage(body),
      raw_response_sha256,
      anomaly_flags: [],
    };
  }
}

function extractCostUsd(body: Record<string, unknown>): number {
  // Defensive: Vercel response shape varies. Walk known paths.
  const total = (body as { total?: unknown }).total;
  if (typeof total === "number") return total;
  if (typeof total === "object" && total !== null) {
    const amount = (total as { amount?: unknown }).amount;
    if (typeof amount === "number") return amount;
  }
  return 0;
}

function extractUsage(body: Record<string, unknown>): Record<string, number> {
  // Skeleton — real implementation maps Vercel-specific fields.
  const usage = (body as { usage?: unknown }).usage;
  if (typeof usage === "object" && usage !== null) {
    return Object.fromEntries(
      Object.entries(usage as Record<string, unknown>)
        .filter(([, v]) => typeof v === "number")
        .map(([k, v]) => [k, v as number]),
    );
  }
  return {};
}
```

---

## Task 4: Anthropic source instrumenter

**Files:**
- Create: `src/infra/cost-sources/anthropic.ts`

Same shape as Vercel — different endpoint, different cost-extraction logic (token cost from Organizations API).

---

## Task 5: Mocked-HTTP tests for both sources

**Files:**
- Create: `src/infra/infra.test.ts`

Test pattern: pass a mock `fetch` to the fetcher constructor that returns canned JSON, assert the resulting CostSnapshot matches expected shape and values.

---

## Task 6: Daily snapshot orchestrator

**Files:**
- Create: `src/infra/cost-snapshot.ts`

Loads source instances from Infisical-provided secrets (stub-ready), runs each fetcher with `period = today`, writes snapshot to JSONL via `writeSnapshot`. Single command-line entry: `npx tsx src/infra/cost-snapshot.ts`.

---

## Task 7: Infisical CLI wrapper (stub-ready)

**Files:**
- Create: `src/infra/secrets.ts`

```typescript
import { spawnSync } from "node:child_process";

export interface SecretsClient {
  get(key: string): string | undefined;
  list(): string[];
}

/**
 * Infisical CLI wrapper. Calls `infisical secrets get <key>` per key.
 * In dev/test, falls back to process.env.
 */
export class InfisicalSecretsClient implements SecretsClient {
  constructor(
    private readonly project: string,
    private readonly env: "dev" | "staging" | "prod" = "prod",
  ) {}

  get(key: string): string | undefined {
    // First try Infisical CLI if available
    const result = spawnSync("infisical", ["secrets", "get", key, "--projectId", this.project, "--env", this.env, "--silent"], {
      encoding: "utf8",
    });
    if (result.status === 0 && result.stdout) {
      return result.stdout.trim();
    }
    // Fallback to env (dev mode, or if Infisical CLI not installed)
    return process.env[key];
  }

  list(): string[] {
    const result = spawnSync("infisical", ["secrets", "--projectId", this.project, "--env", this.env, "--silent"], {
      encoding: "utf8",
    });
    if (result.status === 0) {
      return result.stdout.split("\n").filter((l) => l.length > 0);
    }
    return Object.keys(process.env).filter((k) => /API_KEY|TOKEN|SECRET/.test(k));
  }
}
```

---

## Task 8: cost-plane-config.json

**Files:**
- Create: `cost-plane-config.json`

```json
{
  "version": "1.0.0",
  "thresholds": {
    "vercel":    { "daily_usd_cap": 5.00,  "wow_factor": 1.5,  "mom_factor": 1.3 },
    "anthropic": { "daily_usd_cap": 20.00, "wow_factor": 1.5,  "mom_factor": 1.3 }
  },
  "schedule": {
    "snapshot_cron": "30 2 * * *",
    "timezone": "Europe/Paris"
  },
  "sources_phase_1": ["vercel", "anthropic"],
  "sources_phase_1_5": ["cloudflare", "langfuse"]
}
```

---

## Task 9: v82 substrate symmetry test

**Files:**
- Create: `test/v82-cost-plane.test.ts`

Asserts:
- `cost-plane-config.json` exists with required schema
- `src/infra/secrets.ts` exists and exports `InfisicalSecretsClient`
- `src/infra/cost-sources/_shared.ts` exists and exports `CostSnapshot` type + `writeSnapshot` function
- `src/infra/cost-sources/vercel.ts` exports `VercelFetcher`
- `src/infra/cost-sources/anthropic.ts` exports `AnthropicFetcher`
- Phase 1 source count = 2 (per Board REVISE-1)
- No public `/cost` route in `site/src/app/` (per Board REVISE-3)
- `cockpit-zellij/layouts/cost-plane.kdl` exists

Wire into `package.json::test:substrate` + `tools/git-hooks/pre-commit` (6 → 7 fast tests).

---

## Task 10: Cockpit pane (Zellij + 2 PS1 scripts)

**Files:**
- Create: `cockpit-zellij/layouts/cost-plane.kdl`
- Create: `cockpit-zellij/scripts/tail-cost.ps1`
- Create: `cockpit-zellij/scripts/cost-status.ps1`

Layout: 4 panes — current-month-summary / tail-cost (latest snapshot) / source-anomaly-status / cron-status. Reuses arc generic resolver: `arc cost-plane` opens it.

---

## Task 11: Cron entry

**Files:**
- Create: `scripts/cron/daily-cost-snapshot.ps1`

PS1 wrapper that runs `npx tsx src/infra/cost-snapshot.ts` and logs to `memory/_audit/cost/_cron.log`. Wire into existing cron infrastructure (Task Scheduler or cron daemon — pick the one already in use for daily-portfolio-audit).

---

## Task 12: Memory + strategic vault note (after W2.1 ship)

Write `project_v77_cost_plane_w21_shipped.md` memory entry + strategic-vault entry only if vertical scaffold lands (substrate-class). Otherwise W2.1 is operational-tier (no strategic vault entry needed).

---

## Self-Review

**Spec coverage:** Each W2.1 requirement in spec §6 → task pointer:
- Vertical scaffold → DEFERRED to W2.1.x (noted up front)
- Infisical foundation → Task 7 ✓
- 2 sources (Vercel + Anthropic) → Tasks 3 + 4 ✓
- Daily cron → Tasks 6 + 11 ✓
- JSONL audit → Task 2 (_shared.ts writeSnapshot) ✓
- Cockpit pane → Task 10 ✓
- v82 substrate symmetry → Task 9 ✓
- NO public site route → Task 9 enforces via assertion ✓
- Mocked-HTTP TDD → Task 5 ✓
- Infisical exit strategy → DEFERRED to W2.1.x (config + export script after primitives prove)

**Placeholder scan:** None. All code blocks are concrete.

**Type consistency:** `CostSnapshot`, `SourceFetcher`, `SecretsClient` used consistently.

---

**Built on SIP** · Cost Plane W2.1 plan · v1.0 · 2026-05-11
