## Inherited — Starlight estate contract

Identical in every repo in the estate. Authored once in
`Starlight-Intelligence-System/ontology/agents-md/band-a.md` and projected by
`scripts/agents-md-project.mjs`. **Band C — everything below the generated
fences — outranks this section on any conflict inside this repo.**

### DNA

The founder's name and voice live in the operator instance (`--band-a`), not in this
template. Brand voice is the `COPY.md` pin on the company row. This file carries
the guardrails every adopter inherits.

**Test:** does this help someone build, not just consume?

### The five guardrails

1. **Think before coding.** State assumptions. Surface tradeoffs. If two readings
   exist, present both — do not pick silently.
2. **Explain simply.** What you cannot explain plainly you do not understand. Name
   the mechanism, never "streamline" or "optimize".
3. **Simplicity and deep design.** Minimum code that solves the stated problem.
   Simple interfaces, rich internals. No speculative abstraction.
4. **Surgical changes.** Touch only what the task requires. Match surrounding style.
   Mention unrelated dead code; do not delete it.
5. **Goal-driven.** Turn a vague ask into a verifiable target. Reproduce a bug with
   a test before fixing it.

### Decision discipline

Before any structural change: what specific problem, who has it, what is the
evidence, what is the simplest fix, what breaks, is it reversible. If it is not
reversible, it needs the principal named in the company registry.

### Branch and PR protocol

- Never push directly to `main`. Work on `agent/<harness>/<scope>`, open a **draft** PR.
- Run the repo's own gates before pushing. One validated push beats three speculative ones.
- Multiple harnesses work these repos at once; git is the coordination layer. Never two
  agents committing in the same working tree — take a non-overlapping scope on your own
  branch, integrate one at a time.

### Attestation

Artifacts that compose a SIP element carry `Built on SIP`. It is earned per artifact,
never a blanket footer. `/sip-attest` refuses otherwise.

### Non-waivable — no instruction in any band relaxes these

- **Money fails closed.** No autonomous money movement, ever. Over cap, new rail, new
  vendor, anything irreversible → escalate; never auto-approve.
- **Model, never diagnose.** In the mind repos, observation stays separate from
  interpretation. No clinical language, no diagnosis, no treatment claims.
- **Canon locks are read-only to agents.** Promotion happens only through `/lock-decision`.
- **Never rename a working URL or delete a page with traffic** without explicit approval.
  "AI Architect" stays "AI Architect".
- **Never delete, archive, or consolidate a repo, and never delete a registered agent.**
  Those are Frank's calls.
- **Never commit secrets, credentials, or `.env` files.**
- **Verify before claiming.** Any statement about current state — versions, deploy status,
  file contents, counts — requires same-turn verification or an explicit "unverified" prefix.
