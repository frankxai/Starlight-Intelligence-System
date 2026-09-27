# Security policy — Starlight Intelligence System

> Do not open a public issue for a suspected vulnerability. Use GitHub's
> private vulnerability reporting form so report details stay private.

---

## Why this repo needs a security policy

SIS is the substrate + reference operational layer for the Starlight
Intelligence Protocol. The code in this repo handles:

- **Secrets at rest** — Infisical workspace tokens, AI provider API keys
  (Vercel, Anthropic, Stripe), cloud account credentials. Per the privacy
  split (Tier 1 cleanup, 2026-05-11), real secrets live in operator-local
  `private/` (gitignored) — but the loaders, attestation flows, and key
  rotation paths are public surface.
- **Financial state** — `private/business-registry.json` carries cash
  positions, runway calculations, and per-entity P&L. The `src/finance/`
  reference build composes these into `/yolo` session-open payloads.
- **Cross-system orchestration** — `/yolo` Hive sessions drive multi-repo
  git operations under operator authority. A compromised orchestrator
  can ship to production, push to remote, or merge alliance-touched
  repos against sovereignty rules.
- **SIP attestation** — `Built on SIP` attestations are non-trivial to
  forge but not impossible. Misuse could undermine the social-layer
  contract that the protocol depends on.

We treat security issues here as substrate-class — same seriousness as
sovereignty-clause violations.

---

## Report a vulnerability

Submit a report through the repository's
[private vulnerability reporting form](https://github.com/frankxai/Starlight-Intelligence-System/security/advisories/new).
GitHub sends the report privately to the repository maintainers and supports
private discussion while the report is assessed.

Do not include vulnerability details, secrets, private data, or proof-of-concept
payloads in a public issue or discussion. There is no verified public fallback
channel at this time.

---

## What to include in your report

Include:

1. **Affected versions / commit SHAs** — the closer to a specific tag the
   better.
2. **Impact** — what an attacker can do (read secrets, escalate to remote
   code execution, bypass attestation, etc.).
3. **Reproduction** — minimal steps. If a PoC requires a payload or
   crafted file, attach it (or describe it textually).
4. **Suggested fix** — optional, but appreciated.
5. **Disclosure preferences** — coordinated disclosure timeline, whether
   you want credit, whether you want a CVE.

---

## In-scope

Issues we want to hear about:

- Secret leakage paths — committed files exposing `.env` content, tokens,
  cash positions, or operator-private state.
- Privilege escalation in the MCP server, `/yolo` Hive conductor, or
  `/starlight-board` substrate gate.
- Path traversal, command injection, or unsafe deserialization in the
  reference operational layer.
- Bypasses of the sovereignty clause (`alliance_touched: true` repos
  being operated on by `/yolo` despite the exclusion rule).
- Forged or stripped `Built on SIP` attestations.
- Supply-chain risks — typosquatting, dependency confusion, lockfile
  tampering vectors against `@arcanea/starlight-intelligence-system`.
- Privacy-split leaks — operator-private `private/` state reaching
  committed surface.

---

## Out-of-scope

We'll respond politely but won't treat these as security issues:

- Bugs that require operator-level access to begin with (the operator can
  already do anything they want on their own machine).
- Social-engineering of the operator outside of the protocol surface
  (we can't fix non-protocol attacks).
- Issues in **forks** of this repo — please report those to the fork
  maintainer.
- Issues in **Arcanea canon content** (Guardian names, archetypes) —
  those live in `frankxai/arcanea-ecosystem` under CC-BY-NC.
- Theoretical attacks without a working proof-of-concept.
- Missing-best-practice findings without a concrete exploitation path
  (e.g., "you don't use [feature X]"). File those as a regular issue or
  PR with a discussion.

---

## Hall of fame

We credit researchers in our `CHANGELOG.md` and in the relevant fix
commit's `Co-Authored-By:` trailer (with your consent). If you'd rather
stay anonymous, we honor that too.

---

**Built on SIP** · `SECURITY.md` v1.0 · MIT
