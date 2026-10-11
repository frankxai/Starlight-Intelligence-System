# Starlight Activation Router Operating Guide

This guide explains how to use the Codex Starlight Activation Router across fresh chats, mobile sessions, community work, and multi-agent execution.

## Command Surface

- `/si`: route the task to the best lane before acting.
- `/so`: create an orchestration packet, worker lanes, risk gates, and verification plan.
- `/acos`: route Agentic Creator Operating System work across content, creator, music, video, publishing, and implementation lanes.
- `si:`, `so:`, `acos:`: mobile-safe aliases when a surface does not expose local slash prompts.

## Default New Chat Pattern

Start a fresh chat with one of these:

```text
/si audit this repo and tell me the best lane
/so build the execution packet for this work
/acos plan tomorrow's creator/content output
si: from mobile, summarize current priorities and next lane
```

Use `/si` when you need direction. Use `/so` when work spans multiple repos, people, tools, or verification gates. Use `/acos` when the output is creator/content/media/publishing.

## High-Value Workflows

### Repo And Tool Routing

Use `/si` for:

- which agent or tool should handle a task;
- repo audits and test-plan selection;
- Codex vs Claude vs Grok vs Antigravity routing;
- deciding whether a task is single-lane or needs orchestration.

Expected output: intent, repo, lanes, read-only default, reason, and next command only when dispatch is explicit.

### Orchestrated Execution

Use `/so` for:

- Railway estate hardening;
- July launch coordination;
- Agentic Life OS packaging;
- Hermes pack-factory pilots;
- cross-agent loop OS hook gates;
- Starlight Communities pilot builds;
- explicit fanout, council, or worker-wave planning.

Loop:

```text
ROUTE -> PACKET -> DISPATCH -> VERIFY -> SYNTHESIZE -> LEDGER
```

Every worker needs input context, expected artifact, allowed tools, stop condition, verification evidence, and handoff format.

### Agentic Creator Operating System

Use `/acos` for:

- content calendars;
- scripts, captions, thumbnails, and publishing metadata;
- music/Suno/release planning;
- video and motion briefs;
- creator product packaging;
- analysis of content performance.

ACOS owns the creator lane. `/so` coordinates multi-agent worker waves when ACOS work becomes a larger program.

## Current Priority Routes

- Railway estate hardening: `/so`, Railway skill, work ledger, human approval for live mutations.
- July launch: `/so` for milestones and blockers, `/acos` for publishing cadence.
- Agentic Life OS: `/si` for lane choice, `/so` for offer and operator-kit packaging.
- Starlight Communities: `/so` for pilot coordination, `/acos` for creator-cell workflows, Starlight Swarm for explicit worker waves.
- Hermes pack factory: `/so` as coordinator, ACOS for content/social lanes, eval receipts before packaging.
- Cross-agent loop OS: `/so` plus agentic-ops, deterministic hook gates and scorecard receipts.
- Health/private ops: health-intelligence, dated evidence, private/public separation, clinician-human authority.

## Community Use

For community members, the value is not "more agents." The value is a repeatable thinking and execution loop:

1. Capture intent.
2. Route to the right lane.
3. Turn the task into a small packet.
4. Execute with evidence.
5. Review the result.
6. Save the handoff so the next chat can continue.

The best community-facing product is a guided creation cell: a small group starts from a goal, uses `/si` to choose the lane, `/so` to coordinate the week, and `/acos` to publish output. Keep the first pilot human-gated and evidence-backed before automating more.

## Safety Rules

- Hooks add context and guardrails; they do not spawn agents automatically.
- Fanout requires explicit wording such as `/so --fanout`, `dispatch`, `run fanout`, or `verify across lanes`.
- Railway, billing, DNS, secrets, public networking, and destructive commands need explicit approval.
- Default to read-only audits until the user asks for implementation.
- Never treat a generated plan as proof. Attach receipts, tests, diffs, preview URLs, or ledger updates.

## Fresh Chat Handoff

When continuing work in a new chat, include:

```text
/si continue from <receipt-or-ledger-path>. Summarize state, risks, next lane, and first command.
```

For larger work:

```text
/so continue <objective>. Use the latest ledger, previous receipt, changed files, risk gates, and verification evidence.
```

For creator/community output:

```text
/acos continue <campaign-or-cell>. Select the lane, output artifact, publishing target, and evidence path.
```
