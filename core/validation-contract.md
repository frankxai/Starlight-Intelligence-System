# Cached-Belief Validation Contract

> Starlight cognitive architecture pattern — prevents AI from citing stale cached beliefs as current fact.

## Origin

Designed 2026-04-15 in Arcanea session. Starlight-Architect reviewed; 5 Guardians (Shinkami, Ismael, Aiyami, Lyria, Ino) ratified.

## The Protocol (loads every turn via CLAUDE.md)

Any claim about CURRENT state — versions, ship status, file paths, architecture, deployment, quantities — requires same-turn verification (Read/Bash) OR explicit prefix: "unverified, from [memory|prior-turn|claude.md] (date X):".

### Authority domains

| Source | Authoritative for | NOT authoritative for |
|---|---|---|
| Memory | intent, strategy, preferences, decision history | versions, ship status, file paths, architecture, deploy state |
| Disk (git, package.json, ls) | current state of code, files, versions | historical intent or "why" |
| Deploy API (Vercel, Supabase) | live deploy state | code state before deploy |

### Key rules

1. **Disk-first.** Read before citing.
2. **Memory-as-history.** Never authoritative for current state.
3. **Latency permission.** 3-5 seconds of disk reads beats instant stale answers.
4. **Vague claims are violations.** "X is mature" without provenance = violation.
5. **Disclaim or verify.** No middle ground.

## 5-Layer Architecture

| L | Layer | Purpose |
|---|---|---|
| L0 | Authority Registry | Fact-type to source-of-truth map |
| L1 | Memory Frontmatter | verified_on + authoritative_for scope |
| L2 | CLAUDE.md Protocol | Disk-first-or-disclaim rule |
| L3 | /verify-status Skill | Forceable verification routine |
| L4 | Stop-hook Audit | Post-response claim scanning (telemetry, not gate) |

## Integration with SIS

This contract is a cognitive architecture primitive. In Starlight terms:
- **Vault entries** (memories) are historical records, never live state
- **Session context** is ephemeral and decays within the session
- **Disk state** is the grounding layer — the reality check against all cognitive cache

Truth comes from observation, not recall.
