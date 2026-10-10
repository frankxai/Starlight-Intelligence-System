# Context continuity and revision reviews

Built on SIP. Experimental local runtime components; no resident service or scheduler is installed.

This implementation extends the existing `./runtime-bridge` package surface. The
host retains admission, provider identity, credentials, scheduling, repository
ownership, and release authority. It creates no new MCP endpoint or portfolio
memory authority.

## Context capture

`ContextBridge` ingests an explicitly selected source into a private task journal.
Supported inputs are normalized event JSONL, Codex rollout JSONL, Claude session
JSONL, and OpenCode JSON exports. Native messages become observations only. Tool
arguments, tool output, reasoning parts, and system messages are excluded.
OpenCode export capture excludes unfinished assistant messages and binds the
export's session ID to the host-supplied session ID.

Use OpenCode's supported `opencode export <sessionID> --sanitize --pure` command.
Do not copy, synchronize, or mutate `opencode.db`. The installed CLI's export
shape was inspected locally; the official command reference is
https://opencode.ai/docs/cli/#export.

From a checkout with its existing development dependencies:

```powershell
node --import tsx tools/poly-bridge.mjs --journal <private-task-path>/context.jsonl --input <selected-export.json> --source opencode-export-1 --format opencode-export --task task-1 --harness opencode --session <session-id> --repo github.com/frankxai/Starlight-Intelligence-System
node --import tsx tools/poly-bridge.mjs --journal <private-task-path>/context.jsonl --packet task-1
```

For normalized events, provide `id`, `taskId`, `harness`, `sessionId`, `kind`,
`text`, `repo`, `revision`, `evidence`, and `privacy` on each complete JSON line.
Kinds: observation, decision, artifact, verification, blocker, checkpoint.
Evidence: observed, proposed, accepted, verified. These are source-declared
labels, never authenticated authority. Every returned record and packet carries
`authority: untrusted-data`. No captured record grants tool or write permission.

For a resume, the host supplies a canonical repository identifier and a full
40- or 64-character revision to `bridge.handoff(taskId, repo, revision)`.
The bridge selects only that scope, starting at its latest checkpoint. Missing
checkpoints and oversized continuations fail closed; a resume never silently
truncates its checkpoint. `excluded` counts other repositories/revisions and
`omitted` counts earlier scoped records. The unscoped `packet()` remains a
diagnostic read. Neither method authenticates source claims or checks Git HEAD.
The host must verify the checkout and permissions before executing any work.

```powershell
node --import tsx tools/poly-bridge.mjs --journal <private-task-path>/context.jsonl --packet task-1 --repo github.com/frankxai/Starlight-Intelligence-System --revision <full-commit-sha>
```

Native transcripts supply observations, not trusted checkpoints. A host must
append an explicit normalized checkpoint after verifying its task scope; an
export alone cannot establish resume readiness.

Private-class records are refused. Known secret/PII patterns are scrubbed and
unknown fields are dropped. Pattern scrubbing cannot establish public safety;
journals and exports stay private and never enter the repository or cloud
review inputs. Captured text is limited to 16,384 characters per message. Native
long messages are truncated; full content remains in the native source.

Source ID, source position, and raw-record digest preserve provenance. Positions
are byte offsets for JSONL and message ordinals for OpenCode exports. Source
lookup remains with the host's task record. Select inputs explicitly; there is
no home-directory crawler or access to unseen conversations.

The source cursor and records commit together through an owned lock and atomic
file replacement. Duplicate event IDs with identical normalized content are
idempotent; conflicting IDs are rejected without replacing earlier evidence.
Partial final lines remain unread. UTF-8, BOM, and CRLF byte boundaries are
tested. JSONL source replacement, truncation, and modifications to its consumed
prefix are refused. OpenCode snapshots can grow; complete message IDs provide
deduplication. Invalid/private/conflicting records increment the rejection count
without persisting their raw content.

Bounds: 256 KiB per JSONL capture, 16 MiB source, 2 MiB OpenCode export, 8 MiB
journal, and up to 200 records per packet. Packet omission counts are explicit.
The optional CLI polling interval is one second with a five-minute maximum;
default execution is one capture. An unchanged source does not rewrite state.

Capacity exhaustion and corrupt journals fail closed. File data is flushed before
rename; machine power-loss durability of directory metadata is not certified.
A process crash can leave a lock or temporary file. Existing locks are never
deleted by age. The owning supervisor must reconcile orphan evidence before
recovery; the bridge does not remove another writer's files or locks.

## Review queue

`ReviewQueue` persists jobs keyed by repository, exact head SHA, and policy
version. Maker and checker providers must differ. Provider identity is supplied
by the trusted host; the queue cannot independently authenticate the actual
model served by a transport.

New heads supersede queued jobs under the same repo/policy. Running reviews keep
their original identity. Running or unresolved work reserves the single queue
execution slot across restarts. Failed reviews have a bounded retry budget.
`reconcileStopped(id, evidenceRef)` appends an explicit host-confirmed termination
receipt before unresolved capacity can be reused; it never infers termination
from elapsed time.

`queue.run(id, admittedRuntimeBridge, { agent, provider }, signal)` invokes the existing
runtime bridge. The checker returns JSON containing `verdict` and a receipt with
`revision`, `commands`, `findings`, and `limitations`. A pass requires matching
revision and nonempty reported execution evidence. Malformed results, timeouts,
and uncertain transport failures remain unresolved. Receipt contents are
source claims; actual command execution, authentication, sandbox enforcement,
and cryptographic signing require host evidence and are not certified by JSON.
The host binding must match the queued checker provider before dispatch or a
state change. This guards accidental provider selection; the binding remains
a host declaration, not transport attestation. Callers of the earlier string
agent argument must migrate to the binding object.

No PR watcher, recurring job, auto-merge, deployment, provider subscription,
model download, or tournament is enabled by these modules. Bind them to the
existing host only after its admission and review gates pass.

## Verification and rollout

Tests cover restart/deduplication, partial source writes, source edits, malformed
records, privacy filtering, two-instance serialization, native adapter shapes,
queue supersession, retry ceilings, unresolved execution, and owned lock release.
Existing gateway, privacy, session-store, and runtime-bridge tests provide
compatibility coverage.

The continuity acceptance tests launch separate CLI processes to capture,
restart, select a scoped checkpoint and replay without duplicate records. They
also exercise an interrupted source write, rejected private/malformed inputs,
wrong scope, packet exhaustion and source-instruction taint. These are synthetic
task records and actual local CLI executions; they do not establish a live
second-provider task completion or a sandbox review.

`.github/workflows/context-continuity.yml` runs the targeted suite on Linux and
Windows with one matrix job at a time. It covers PRs targeting both `main` and
the current integration base, `codex/consolidate`, with a read-only token and
pinned actions. Workflow conventions follow the
[GitHub Actions syntax reference](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

One sanitized existing OpenCode session export supplied 101 observations;
replaying that same export captured zero duplicates. This proves that adapter
and replay case, not universal transcript coverage or synthesis quality.

Remaining rollout gates:

- Independent provider review of the exact final revision.
- Host-bound live review with verifiable command and sandbox evidence.
- Supported source-format versioning and broader native session fixtures.
- Explicit orphan-lock recovery exercised with the owning supervisor.
- Shared memory-provider integration: the inspected live backend still reports
  lexical-only retrieval and zero vectors. SIS embedding code does not establish
  active semantic retrieval in that backend.
- Estate lane helper repair remains tracked in starlight-command issue 4; this
  slice repairs SIS gateway locking, not the estate control-plane source.
- Privacy/scope and lifecycle integration required by SIS issue 49 remain open;
  local capture does not ratify or promote memory into canonical vaults.

The implementation worktree starts from existing SIS revision
`b6bfebb4efb1a5565df3c657857218b125562492` to preserve the inspected runtime bridge.
It is an isolated change, not a claim that every base-branch change is merged.
