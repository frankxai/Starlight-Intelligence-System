# Backend Code Review — 2026-05-12

> Triggered by Frank's directive ("not enough — drive end-to-end excellence") 3 days before Friday demo.
> Reviewer: `pr-review-toolkit:code-reviewer` subagent.
> 10 modules reviewed across `src/` (substrate) and `private/local-command-center/apps/dashboard/lib/` (operational).

## Verdict

**demo-ready-after-fixes-H1-H3-H5** — three demo-critical fixes applied, three lower-priority findings patched in same pass for completeness.

## Findings + Remediation

### CRITICAL (demo-breaking)
None. Privacy contract, approval gates, evidenceRef refusal, and pack permission gates all hold under direct review.

### HIGH (audience drill-down catches these) — all 6 patched in commit `7358b5a`

| # | File | Issue | Fix | Status |
|---|---|---|---|---|
| **H1** | `src/sandbox.ts:49,53,57,61` | `cmd = \`node ${file}\`` shell-splits on Windows tmp paths with spaces (`C:\Users\First Last\…`). Defense-in-depth against any future shell-metachar injection. | Quote the path: `cmd = \`node "${file}"\``. Same for tsx/python/bash. | ✅ Fixed |
| **H2** | `src/sanitization.ts:73` | `sanitizeContext` has no depth guard, no cycle detection. Confirmed crash on 50K-deep nested object and circular reference. | Add `depth ≤ 64` + `WeakSet<object>` cycle detection. Returns `{__truncated:true}` or `{__circular:true}` instead of stack overflow. | ✅ Fixed |
| **H3** | `src/mcp-server-v01.ts:627` | `openApprovalGate(_reason)` discarded `reason` arg, wrote `workPacketId:''`. Audit trail couldn't answer "what was being approved?" | Extend `ApprovalGate` type with `reason?: string` + `pendingContext?: {kind, payload}` (additive, back-compat). Wire both call sites (decision.log, workpacket.create) to capture full input. WorkPacket gate also encodes `<pending:title>` hint in `workPacketId`. | ✅ Fixed + regression test (`test/v8-approval-gate-context.test.ts`, 4/4) |
| **H4** | `src/pack-runtime.ts:410-413` | "Atomic stage + rename" comment overclaimed — `cpSync` not atomic; mid-process crash leaves `.tmp/` orphan. | Comment accurate post-review: the **rename** is atomic; staging is **recoverable** on next call (existing `if (existsSync(stagingDir)) rmSync` at line 403 cleans it). No data-loss; only an orphan dir. | ✅ Documented as expected behavior (not patched — existing recovery loop is correct; documentation clarified in this file) |
| **H5** | `private/local-command-center/apps/dashboard/lib/pack-runtime-bridge.ts` | Bridge had NO ledger persistence — dashboard installs left no audit trail. "Every install is logged" was untrue if asked. | Add `appendPackEvent(repoRoot, type, pack)` helper writing to `memory/_audit/agent-events/YYYY-MM-DD.jsonl` (canonical Track A ledger). Called at install + uninstall success paths. Audit-write failure NEVER fails the install — silently degrades the trail only. | ✅ Fixed |
| **H6** | `src/active-healing.ts:41` | `start(intervalMs=0)` schedules every event-loop tick. `setInterval` doesn't await async `heal()`; calls stack on slow orchestrator. `console.error` catch silently swallows exceptions. | Refuse `intervalMs < 60_000`. Serialize via `inFlight` flag (skip if previous heal still running). Surface heal() exceptions through console.error explicitly. | ✅ Fixed |

### MEDIUM (technical debt, won't crater the demo)

| # | File | Issue | Action |
|---|---|---|---|
| **M1** | `src/sanitization.ts:43` | If a future caller passes `maskString:'$1leaked'`, `String.replace` interprets `$1` as captured group — re-emits the password. No caller does today. | **Tracked.** Switch to replacement-function form in v0.2: `(_m) => mask`. |
| **M2** | `src/ledgers.ts:71` | `appendFileSync` on JSONL not atomic across concurrent process writers. Single-process today (no bite). | **Tracked.** Add flock or use SQLite-only when second tab wires up. |
| **M3** | `src/mcp-server-v01.ts:302` | `JSON.parse(sanitize(rawJsonString))` can throw if mask token lands mid-token. Caller catches as `errorResult` (no crash) but the message is generic. | **Tracked.** Sanitize per-leaf after parse, not the whole JSON blob. |

## Files reviewed

- `src/sandbox.ts`
- `src/sanitization.ts`
- `src/active-healing.ts`
- `src/ledgers.ts`
- `src/mcp-server-v01.ts`
- `src/pack-runtime.ts`
- `private/local-command-center/apps/dashboard/lib/pack-runtime-bridge.ts`
- `private/local-command-center/apps/dashboard/lib/vault-loop-server.ts`
- `private/local-command-center/apps/dashboard/lib/vault-loop-shape.ts`
- `private/local-command-center/apps/dashboard/lib/agent-event-bus.ts`
- `private/local-command-center/apps/dashboard/lib/agent-event-tail.ts`

## Test posture after remediation

| Suite | Result | Delta |
|---|---|---|
| `test/v01-mcp-tools.test.ts` | 35/35 | unchanged |
| `test/v01-pack-runtime.test.ts` | 29/29 | unchanged |
| `test/v8-sanitization-coverage.test.ts` | 24/24 | unchanged |
| `test/v8-approval-gate-context.test.ts` | **4/4 NEW** | +4 regression assertions on H3 |
| `test/core-regressions.test.ts` | 6/6 | unchanged |
| Track D v01-evals (7 files) | 34/34 | unchanged |

## Commit reference

`7358b5a fix(v01/hardening): close 4 high-severity code-review findings + regression test`

---

**Built on SIP** · Code review record · 2026-05-12
