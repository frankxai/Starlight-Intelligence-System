# Security Policy — Starlight Intelligence System

> Reporting a vulnerability? Don't open a public issue. Use one of the
> private channels below — we'll respond within 72 hours.

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

## Reporting channels (in order of preference)

### 1. GitHub Security Advisories (recommended)

Open a private advisory at:
**https://github.com/frankxai/Starlight-Intelligence-System/security/advisories/new**

This is the preferred channel because it:
- Stays private until you and we agree to publish
- Lets us coordinate a fix branch privately
- Issues CVE numbers automatically if assigned

### 2. Email

If GitHub Advisories isn't an option:
**security@starlightintelligence.org** (PGP-friendly — request the public
key in your initial message if you want to encrypt).

Backup: open a GitHub issue titled `Security report — please contact me`
without disclosing the vulnerability; we'll reach out via the email on
your GitHub profile.

---

## What to include in your report

Make our response fast:

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

## Our response commitment

- **72 hours**: initial acknowledgement (often much faster).
- **7 days**: triage verdict — confirmed / not-reproducible /
  duplicate / out-of-scope, with rationale.
- **30 days**: fix shipped for confirmed issues, OR a detailed update on
  why it's taking longer.
- **90 days**: default coordinated-disclosure timeline. We'll work with
  you on shorter (if actively exploited) or longer (if a complex fix is
  in progress) timelines.

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
