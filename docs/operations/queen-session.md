# Queen sessions

Status: operational implementation; local process evidence. No hosted worker activation.

`runQueenSession()` turns an authorized, bounded mission into one maker run and one checker run. It composes the existing `runSwarm()` process pool and instruction compiler. The host supplies both runners, admits each operation, and persists a private receipt before the next effect.

The Queen can proceed under documented reversible assumptions. Missing material evidence stops the session. A maker or checker may dissent; dissent is retained and prevents promotion. A successful checker must name the exact artifact SHA-256 and return a supported verdict with specific evidence for every acceptance criterion. This accepts a text artifact; it does not establish deployment, repository-change correctness, or model competence.

## Run the local process proof

After installing this repository's development dependencies:

```bash
node --import tsx --test test/queen-session.test.ts
node --import tsx tools/queen/session-demo.ts
```

The demo starts two fixed Node processes, passes the current coordination skill through the context compiler, produces a handoff document, checks its contents, and writes receipts under `private/queen-sessions/`. It has no model API calls. Its identities and admission are explicitly marked as fixtures; the result cannot support a claim of cloud deployment or model evaluation. The controlled processes report no provider billing information, so usage remains `unknown`.

## Integrate an admitted host

Import `runQueenSession`, `createQueenProcessRunner`, and the interfaces from `src/queen-session.ts` (or the corresponding built module). Supply:

| Input | Host responsibility |
| --- | --- |
| Mission | Objective, unique acceptance criteria, scoped capabilities, ambiguity dispositions, finite dollar/time/output/prompt ceilings |
| Maker and checker | Existing registry role, distinct authenticated execution identity, identity evidence, actual runner, explicit per-call cost ceiling |
| Context | Existing skill/instruction atoms with source hashes and token estimates; exact source bytes; actor ACLs resolved before admission |
| `admit(request)` | Enforce current authority, reserve cost/capacity, bind the receipt to mission, identity, prompt hash and context digest; deny missing/revoked authority |
| `record(receipt)` | Append to the host's private durable ledger; a storage error stops the next call |

Use current identities such as `starlight-architect`, `starlight-sentinel`, and the capabilities in `skills/skill-rules.json`. A role label alone grants no tools. Source bytes are hash-checked; denied source ACLs and unresolved compiler conflicts stop before execution. Context is supplied explicitly, so the runner does not scan or forward ambient private vaults.

`createQueenProcessRunner()` launches a fixed absolute executable with an argv array, fixed cwd, explicit environment allowlist, bounded output, and abort handling. It sends the session JSON on stdin and expects JSON on stdout. Wrap a provider CLI or SDK using its documented input/output protocol. The checker response contains `artifactSha256`, `decisions: [{criterion, verdict, evidence}]`, and `dissent: []`. The maker response contains `artifact` and `dissent: []`. Do not use a fixture adapter for a live identity.

This process adapter is **not a sandbox**. The host remains responsible for tool grants, isolated worktrees, filesystem access, child process trees, egress and secret access. The session function trusts its in-process host callbacks; it is not an authentication server and must not be exposed directly to untrusted JSON requests. The declared cost ceilings must be enforced by the host/provider adapter; they are not inferred from text or CLI subscription usage.

Distinct executions permit independent review but do not guarantee provider diversity. `providerDiversity` states whether the host-bound provider labels differ. The component does not manufacture consensus or attribute feelings/consciousness to a role. A chronicle is derived from private execution receipts; keep the narrative of a persona separate from proof that a worker ran.

## Recovery boundary

There are two calls at most and no automatic retries. A local deadline returns `unresolved`, even when a supplied runner ignores cancellation. It preserves the reservation and does not claim provider cancellation. The host must reconcile the remote reference and actual usage before releasing capacity or retrying. A crash before/after dispatch is likewise a host reconciliation concern.

Keep Temporal/Queen durable mission authority and the existing admission work in `frankxai/starlight-swarm#15`. AO owns local worktree/process lifecycle. This component is a one-shot subordinate session, not another scheduler. Command Center may project the receipt status; its proposal intake does not become authority by calling this function.

## Evidence from this change

Fifteen focused cases pass, including a controlled two-process execution using repository skill content, absence of ambient default runners, self-review rejection, unresolved ambiguity, budget over-allocation, altered context bytes, ACL denial, token ceiling, operation-time admission denial, ignored cancellation, forged artifact hash, incomplete review, dissent, output bounds and failed private persistence. The focused strict TypeScript check passes. These results establish the local execution contract, not an authenticated provider pilot or 24/7 service.

Built on SIP — operational reference implementation.
