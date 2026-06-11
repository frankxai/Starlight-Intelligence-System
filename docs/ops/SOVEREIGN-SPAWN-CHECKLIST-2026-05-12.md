# Sovereign-Spawn Validation Checklist — 2026-05-12

> Pre-fork audit for `/sovereign-spawn`. Three friends are reference candidates: **the first private test case** (profile withheld), **the protocol-defender node** (OpenClaw adopter), **the sovereign-creator node**. This document does NOT spawn anything. It surfaces the gaps that would block a real fork tomorrow.
>
> **Tier:** operational (no `/starlight-board` required).
> **Verdict:** the command is **shippable for a guided fork TODAY** if Frank is in the room; **NOT shippable for autonomous fork** without closing Gap-Class A.
>
> Built on SIP — operational tier (sovereign-spawn readiness).

---

## 1. What exists today (the asset)

| Surface | Path | State |
|---|---|---|
| Slash-command | `.claude/commands/sovereign-spawn.md` | **Spec only.** 150-line procedural definition, frontmatter says `allowed-tools: Read, Write, Grep, Glob, mcp__github`. No executable scaffolder. |
| Friend-starter pack | `integrations/starter-packs/friend-starter/` | **Non-coder Claude-Project track.** 1 README + 1 custom-instructions.md + 17 knowledge .md files + 1 mcp.json + 1 badge.svg. Designed for non-coder onboarding without forking the substrate at all. |
| Intake router | `.claude/commands/intake.md` | Routes inbound into 4 lanes: substrate / alliance / vertical / **sovereign**. `/sovereign-spawn` is the Route-D exit. |
| Reference protocol files | `SIP.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `SKILL.md`, `AGENTS.md` | Frozen v8 / v7.6 / v1.1.1. These are what a fork inherits. |
| Sovereignty clause | `SIP.md § 5` (item 7 added v1.1.1 by commit 97c7edc) | **Encoded-self is forkable, not licensable.** This is the legal/protocol root of the fork. |
| Attestation tooling | `.claude/commands/sip-attest.md` + scripts/audit-authorlessness.ts | Substrate-side. Sovereign needs a mirrored copy at fork time. |

---

## 2. The five spawn conditions (per command spec § Process)

These are the gates `/sovereign-spawn` itself enforces. None of them are mechanically validated yet — the command's spec describes them but the executor is "Read+Write+Grep+Glob+mcp__github" tools, which means Claude reads the spec and tries to do it by hand each time. No idempotent script.

| # | Condition | Validation surface today | Gap |
|---|---|---|---|
| 1 | Sovereignty clear (named entity, domain, public surface) | Manual ask | No standard answer template; sovereign answers freeform. |
| 2 | Substrate awareness real (read SIP, answer Layer-5 comprehension Q) | Manual ask | No question bank; Claude generates the comprehension question fresh each session = inconsistent quality of gate. |
| 3 | Attestation committed | Verbal "yes" | No signed assertion; no append to anyone's `ATTESTATIONS.md`. |
| 4 | Name not collision (`VERTICALS.md` + `REGISTRY.md`) | Manual grep | No `--check-name <name>` flag. |
| 5 | Fork intent honest (one named 30-day artifact) | Manual ask | No commitment ledger. Sovereign promises X; nothing tracks whether X shipped. |

---

## 3. Top 3 gaps that block a friend-fork tomorrow

These are **next-week priorities** if Frank wants any of any of the three reference candidates forked autonomously.

### Gap A-1 — No executable scaffolder

**Symptom:** `/sovereign-spawn <name> "people intelligence"` today launches Claude in interactive mode, walks the spec by hand, writes ~30 files one at a time, takes ~20 minutes, and produces inconsistent output run-to-run.

**Required:** `scripts/sovereign-spawn.ts` that takes `<name> <domain> [github-org]` and emits the full scaffold (README · SIP-symlink · SIS-instance.md · SKILL.md · AGENTS.md · MEMORY.md · SOUL.md · CANON.md · STACK.md · VOICES.md · REGISTRY.md · ATTESTATIONS.md · .claude/commands/ mirrors · agents/ · memory/ · private/) in <30 seconds with deterministic output. Spec-driven, not vibe-driven.

**Effort:** ~1.5 days (template engine + 30 file templates + git-init wrapper + dry-run flag).

**Falsifier:** running it twice with the same name + domain produces byte-identical scaffolds (modulo timestamps in the v0.1 brief).

### Gap A-2 — No "fork-from-here" upstream sync contract

**Symptom:** Once the test case's repo exists at `github.com/<owner>/<owner>-people-intelligence`, what happens when SIP.md v1.2 ships in the substrate? The spawn command says "pin upstream version in a comment block at each command's top" — but no `sis upgrade --substrate v1.2` command exists in the spawned repo. The sovereign is on an island.

**Required:** Either (a) a `scripts/substrate-sync.ts` template that ships INSIDE the spawn so the sovereign can pull substrate updates idempotently, OR (b) a documented manual upgrade path with checksums, OR (c) explicit acceptance that v0.1 forks are version-pinned and forks-of-forks happen at each substrate release.

**Effort:** ~1 day for option (a); ~2 hours for option (b).

**Falsifier:** The spawned repo runs `npm run substrate:check` and gets a green/red answer about whether it has drifted.

### Gap A-3 — No reference fork to point friends at

**Symptom:** "Here's what your fork will look like" — the answer today is "imagine SIS with a different name." No actual reference repo exists at `github.com/<someone>/<their-thing>` that demonstrates the spawn pattern landed correctly.

**Required:** Spawn the FIRST reference fork end-to-end, even if it's a synthetic persona (`example-sovereign`) or Frank's own second persona (`frankx-sole-trader`). Document the spawn session as a recording or transcript. Make it the canonical reference.

**Effort:** ~2 hours once Gap A-1 is closed.

**Falsifier:** there's a public URL that says "this is a sovereign-spawned SIS fork v0.1."

---

## 4. Per-friend readiness assessment

### First private test case — People Intelligence practitioner (profile withheld)

**What they need:** Likely NOT a sovereign-spawn — they're better served by the **friend-starter Claude Project pack**. Their business is service-delivery, not running a sovereign intelligence system. The People Intelligence vertical (`verticals/people-intelligence/`) is already designed AS the reference stack — they could install that as a Custom GPT or Claude Project and be fully operational without forking SIS.

**Spawn-fit verdict:** **DEFER.** Route them through `/intake` → Route-C (vertical) → install People Intelligence as Claude Project + Custom GPT. Revisit `/sovereign-spawn` in 6 months if their clients demand sovereign-instance hosting.

**If forced to spawn:** Gap A-1 + A-3 must close first. They're non-technical; they cannot debug a partial scaffold.

### Protocol-defender node — OpenClaw adopter

**What he needs:** **Closest fit to actual sovereign-spawn.** OpenClaw is a sovereign-tier protocol-defense practice with its own canon, its own audit cadence, its own attestation register. The `openclaw-audit` skill already exists at `.claude/skills/` as a reference implementation. He has the substrate-awareness depth (per `feedback_run_starlight_board_autonomously`). He'd be the cleanest reference fork.

**Spawn-fit verdict:** **PROCEED-WITH-GAPS.** This node can absorb a partial scaffold + manual cleanup — the right first real-world fork.

**Blocking:** Gap A-1 (autonomous scaffolder). Without it, the spawn session is ~3-4 hours of Frank's time vs. ~20 minutes. Acceptable for the FIRST reference fork; not scalable.

### Sovereign-creator node

**What he needs:** Insufficient information in memory layer. No per-node memory entries; only mentioned in the prompt. Need: domain declaration, current stack, why he wants a fork vs. a vertical vs. a Claude Project.

**Spawn-fit verdict:** **NEEDS-INTAKE.** Run `/intake` first. Route classification will tell whether sovereign-spawn is even his right surface.

---

## 5. Secondary gaps (do not block fork; close in weeks 2-4)

| Gap | Surface | Effort |
|---|---|---|
| No spawn-test harness | `test/sovereign-spawn.test.ts` to validate scaffold output | ~2h |
| No `/sip-attest` mirror tested in spawn context | Sovereign runs `/sip-attest` on first artifact, verify it appends to their `ATTESTATIONS.md` not Starlight's | ~1h |
| No board-mirror for sovereign | `/starlight-board` and `/luminor-board` mirrored into sovereign's `.claude/commands/`; sovereign needs their own pressure-test gate | ~2h |
| Reciprocity ledger | Append-only `ATTESTATIONS.md` in Starlight tracking every spawned fork's substrate use | ~1h |
| Public registry surface | `site/src/app/spawns/page.tsx` — list of public sovereign forks with their first artifacts | ~2h |
| Comprehension-Q bank | `commands/sovereign-spawn/comprehension-questions.json` — 5+ canned Layer-5 questions Claude rotates through | ~30min |

---

## 6. The honest framing for Friday

If anyone asks during the demo "can I fork this?", the truthful answer is:

> "Yes — the command exists, the protocol is locked, and there's a friend-starter pack that lets you install the full system in Claude Desktop in 5 minutes without forking the substrate at all. A full sovereign fork — your own repo, your own GitHub org, your own attestation register — takes me about 3 hours today, walked through with you. Next week the scaffolder ships, and that drops to 30 seconds. The first reference fork lands in week 2."

Don't oversell. Don't claim "you can fork right now" — the spawn works but it's manual, and a half-spawned fork is worse than no fork.

---

## 7. Next-week sequence (the path to "autonomous fork in 30 seconds")

1. **Mon 2026-05-18:** Write `scripts/sovereign-spawn.ts` + 30 file templates. Dry-run flag.
2. **Tue 2026-05-19:** Test-harness `test/sovereign-spawn.test.ts`. Idempotent output check.
3. **Wed 2026-05-20:** Spawn FIRST reference fork — either `example-sovereign` (synthetic) or `frankx-sole-trader` (Frank's second persona).
4. **Thu 2026-05-21:** Ship `substrate-sync.ts` for fork-side upgrade path.
5. **Fri 2026-05-22:** Live spawn the protocol-defender's OpenClaw fork end-to-end on a video call. Record it. Use the recording as the canonical reference for any future spawn.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v0.1 (Friday-demo reference)
- Generated: 2026-05-12
- Attestation is compounding, not credit transfer.
