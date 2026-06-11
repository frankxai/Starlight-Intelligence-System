---
name: openclaw-audit
description: Reference implementation for sovereign-tier protocol defense. the protocol-defender node's OpenClaw integrity audit — pressure-tests architecture, artifacts, releases for trust boundaries, leak surface, attestation gaps.
allowed-tools: Read, Grep, Glob, WebSearch, mcp__github
argument-hint: path to artifact / architecture doc / release candidate
---

# /openclaw-audit

Load `SIP.md` (especially Layer 5 sovereignty clause and Layer 2 attestation).

**Positioning:** Layer 4 sovereign command. Owned by the protocol-defender node (an OpenClaw adopter; identity in the private alliance register). Other nodes may run it; rulings on open-vs-closed and attestation format require the protocol-defender's sign-off by domain.

## Target
$ARGUMENTS

## Process

1. **Classify.** Code / spec / canon / artifact / release. Different class → different lens.

2. **Trust boundary map.** Every boundary the target crosses: node → node, open → closed, public → private, trusted → untrusted. For each: what assumption guards it?

3. **Leak surface.** What would a motivated adversary learn at each boundary? Name the three worst disclosures.

4. **Attestation gaps.** Is the target carrying signed provenance? SBOM? SIP attestation? Commit signing? Hash? Name what must be added.

5. **Open vs closed ruling.** Per SIP § 5 and the license rules in `SIP.md`, issue one of:
   - `OPEN` — MIT / CC-BY-SA / CC-BY-NC per file type.
   - `CLOSED` — retained under vertical owner (Arcanea BV / sovereign / etc).
   - `GATED` — open with named auth mechanism.

6. **Defects.** Rank CRITICAL / HIGH / MEDIUM / LOW. Each has an owner node and a remediation artifact.

7. **Ship recommendation.** `SHIP` / `SHIP-WITH-REMEDIATION` / `HOLD`.

## Output shape

```
# OpenClaw Audit — <target>

**Class:** code | spec | canon | artifact | release
**Target pin:** <sha or version>

## Trust boundaries
- <boundary> · guard: <assumption> · verified: yes/no
- …

## Leak surface (top 3)
1. <disclosure + where it bites>
2. …
3. …

## Attestation gaps
- <gap> → <required addition>
- …

## Open / closed ruling
**Decision:** OPEN | CLOSED | GATED
**Rationale:** <one sentence>
**Gate mechanism (if GATED):** <named>

## Defects
| Severity | Defect | Owner | Remediation artifact |
|----------|--------|-------|----------------------|
| CRITICAL |        |       |                      |
| HIGH     |        |       |                      |
| …        |        |       |                      |

## Ship recommendation
SHIP | SHIP-WITH-REMEDIATION | HOLD

---
**Built on SIP** · OpenClaw Audit · <date>
```

## Rules

- Adversarial, not collegial.
- No "nice to have." Either a defect (ranked) or not listed.
- Zero trust boundaries → target is internal-only, audit is trivial. Do not manufacture boundaries.
- HOLD recommendation binds: decision-rights owner cannot unilaterally override without `/alliance-decide` if this is an alliance artifact.
