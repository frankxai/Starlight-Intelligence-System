# SOUL — how an agent's identity is composed

`kernel/KERNEL.md` is the posture every agent shares. This file is the composition contract: the
fixed order in which the estate's identity layers are stacked into one agent's SOUL, where each
layer is read from, and what a compiled SOUL must carry so it can be trusted. The code is
`tools/agent-compile.mjs` (`composeSoul`); this page exists so a human can check the code against
the intent, not the other way round.

## Why compose instead of write

The estate holds three identity models that cannot see each other: the Luminor kernel (Arcanea,
voice-rich, no authority model), the Agent Card (`identity/mind/will/body`, the only one a schema
validates), and the five constitutions (`starlight-agent-config/agent-constitution/`, operating
discipline, thin on persona). A hand-written SOUL picks one and silently drops the other two. A
composed SOUL reads all three from their owning files, in a fixed order, and stamps each layer with
the file and hash it came from. Change the source and every compiled agent changes with it; nothing
is copied into a second place to drift.

## The seven layers, in order

| # | Layer | Source (read, never copied) | Required | Host role |
|---|---|---|---|---|
| 1 | Kernel posture | `kernel/KERNEL.md` install block | yes | system |
| 2 | Brand DNA | Starlight/FrankX: Frank DNA in SIS `CLAUDE.md` · Arcanea: Luminor kernel IDENTITY/NATURE/VOICE + `CANON_LOCKED.md` pointer | no (dropped first under budget) | user |
| 3 | Substrate invariants | SIS `SOUL.md` six invariants (Starlight-branded agents only) | no | user |
| 4 | Constitution | one of the five by role: creative → Arcanea, engineering → Codex execution, content/media → Content media, research/verify → Research verification, else FrankX; Role section inline, full file by pointer | yes | user |
| 5 | Agent identity | the agent's own record: display name, tagline, mission, voice, values, boundaries, read-first, skills | yes | developer |
| 6 | Authority | tools allowlist (the enforcement, never widened by prose), denied tools, human gates = the five kernel gates ∪ the agent's own, handoffs | yes | system |
| 7 | Verification | named verifier that is never this agent; cross-provider per `CROSS-MODEL-GATE.md`; the three-line receipt | yes | system |

Order is meaning. Posture before persona so the persona cannot argue the posture away. Authority
and verification last so they are the freshest thing in the model's context when it acts.

## What a compiled SOUL must carry

- A provenance footer naming the source record, its content hash, the layers selected, the layers
  excluded and why, and a `sourceDigest` over the selected layers. Two SOULs with the same digest
  are the same identity; a changed digest is an audit trail, not a mystery.
- A token estimate per layer. Layers 2 and 3 are the ones a budget drops; layers 1, 4, 5, 6, 7
  survive any budget. A SOUL that had to drop a layer says so in the footer.
- The five kernel gates verbatim: push, publish, send, delete, money. An agent's own gates add to
  these; nothing removes them.

## What must not happen

- **No SOUL forked into a runtime.** Hermes profiles, OpenClaw `SOUL.md`, Agent Card `soul_md`, and
  the Claude subagent body are projections of one record. Edit the record or the layer source;
  never the projection. (The Agent Card doctrine says the same: "Identity is this Agent Card; do
  not fork soul into SDKs.")
- **No volatile facts.** Counts, pass rates, free GiB rot inside an identity file and then lie. Name
  the command that produces the number instead (`AGENT-FACTORY.md` rule 2).
- **No self-verification.** A SOUL that names its own agent as checker fails the forge gate and the
  compiler mirror of it.
- **No brand register leak.** The Luminor register is licensed inside Arcanea canon only
  (`TRUTH.md` §1); Starlight and FrankX agents compose Frank DNA, never the mythic register.

## Compile

```
node tools/agent-compile.mjs <agent> --target soul            # the SOUL alone
node tools/agent-compile.mjs <agent> --target claude-code     # .claude/agents/<name>.md, forge-gated
node tools/agent-compile.mjs <agent> --target context-pack    # SIS instruction-compiler atoms
node tools/agent-compile.mjs <agent> --target all --budget 900
```

Outputs land under `scratch/agent-compile/<target>/` until a lane owner promotes them; the
compiler never writes into `~/.claude`, `starlight-agent-config`, or a product repo on its own.
