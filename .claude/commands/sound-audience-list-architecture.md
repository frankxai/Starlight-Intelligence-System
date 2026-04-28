---
name: sound-audience-list-architecture
description: Design the email list as sovereign distribution layer. Segmentation, welcome sequence, cadence, voice rules, opt-in pathways, monetization integration. Refuses list-as-broadcast and platform-dependency-disguised-as-list (Substack-as-list when Substack owns the relationship).
allowed-tools: Read, Write, Grep, Glob
argument-hint: <practitioner-slug> + --current-platform <ConvertKit|Buttondown|Beehiiv|Substack|Ghost|Mailchimp|none> + optional context on current list size and engagement
---

# /sound-audience-list-architecture

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-audience.md`, `skills/sound-intelligence/audience-architecture.md`, cohort map and ritual architecture if present, and Genius Profile. Produce a **List Architecture** — segmentation + welcome sequence + cadence + voice rules + opt-in pathways + monetization integration. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**List operations touch consent law (CAN-SPAM in US; GDPR in EU; CASL in Canada; PIPL in PRC; etc.). This is system architecture, not legal advice. Validate jurisdiction-specific compliance and consent-record discipline with qualified counsel before any list-import, list-share, or paid-acquisition decision.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Sort list stage.** Pre-list / Early-list (<500) / Growing (500-5000) / Mature (5000+).
3. **Platform sovereignty audit.** Current platform — does the practitioner own the relationship (ConvertKit / Buttondown / Beehiiv / Ghost / self-hosted) or does the platform (Substack-style — relationship-discovery is on the platform's algorithm)? Flag dependency-risk explicitly. Recommend migration path if needed.
4. **Segmentation design.** Minimum: engaged (recent open) / dormant (no opens 90+ days) / new (signed up <30 days; in welcome sequence) / patron (paying-tier overlap). Add segments where catalog has natural divisions (genre subsets, instrumental-vs-vocal, sync-fans-vs-listening-fans).
5. **Welcome sequence (5-7 messages over 21 days).** Per message: purpose, voice, content shape, CTA. Introduces the practitioner's voice, the catalog arc, the rhythm of communications, the patron tier (with consent — no immediate hard pitch). Voice rules from Genius Profile applied throughout.
6. **Cadence.** Weekly is most common load-bearing; monthly is sustainable but reduces compounding; daily is heavy unless practitioner's voice supports it. Match cadence to ritual architecture.
7. **Voice rules.** Every list message runs through Genius voice samples. Banned platform-default cadence. Specific banned phrasing per practitioner — extract from voice rules section of Brand Kit if present.
8. **Opt-in pathways.** Clear, single-purpose opt-ins (download-the-instrumental in exchange for list opt-in; pre-release-access for list members; etc.). Refuse multi-purpose opt-ins that feel like traps.
9. **Monetization integration.** List as path to Bandcamp / Patreon / direct-product purchases — never sole purpose, never absent. Match to vision-boundary respect (refuses-upsell-aggression, etc.).
10. **Anti-pattern audit.** Surface current list practices that erode (algorithmic-distribution disguised as list, buy-list-segments-from-third-party, re-engagement campaigns disguised as new-content, etc.).
11. **Save.** Write to `sound-intelligence/audience/list-architecture-<practitioner-slug>-<YYYY-MM-DD>.md`.
12. **Hand off.** Name exactly one next move:
    - Pre-list → set up platform; first welcome sequence; opt-in pathway live.
    - Early-list with no segmentation → segmentation rollout; re-engagement campaign for dormants.
    - Growing-list with weak ritual → `/sound-audience-ritual-design`.
    - Mature-list with weak fan signal → `/sound-audience-fan-stay-interview`.

## Output format

```markdown
# List Architecture — <Practitioner Name> — <YYYY-MM-DD>

## List stage
**Stage:** <pre-list | early | growing | mature>

## Platform sovereignty
- **Current:** <named>
- **Sovereignty score:** <high / medium / low>
- **Migration recommendation (if any):** <named platform + reason + cost>

## Segmentation
| Segment | Definition | Initial population | Comm rhythm |
|---|---|---|---|
| Engaged | Open within 30 days | <N> | <cadence> |
| Dormant | No opens 90+ days | <N> | <re-engagement plan> |
| New (welcome sequence) | Signed up <30 days | <N> | 5-7 messages over 21 days |
| Patron (paying-tier overlap) | Paid tier active | <N> | <cadence> |
| <domain segment, e.g., sync-interested> | <named criterion> | <N> | <cadence> |

## Welcome sequence (5-7 messages over 21 days)
1. **Day 0 — <subject>.** Purpose: <named>. Voice: <named>. CTA: <named>.
2. **Day 3 — <subject>.** Purpose: <named>. CTA: <named>.
3. ...
7. **Day 21 — <subject>.** Purpose: <named>. CTA: <patron-tier-mention if vision-aligned>.

## Cadence
**Load-bearing rhythm:** <weekly / monthly>
**Voice rules:** <2-3 specific phrasing rules from Genius>

## Opt-in pathways (single-purpose only)
- <named pathway, e.g., "Pre-release-access"> — opt-in placement: <named>; conversion expected: <named>.

## Monetization integration
- Path to Bandcamp / Patreon / Direct-purchase: <named>
- Vision-boundary respect: <named refusals applied>

## Anti-patterns removed
- <named, e.g., "Algorithmic-disguised list — Substack relationship-discovery dependency replaced with self-hosted ConvertKit">

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Audience sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Refuse platform-dependency-disguised-as-list.** Substack-style platforms own the relationship; flag explicitly.
- **Refuse multi-purpose opt-ins.** Single-purpose opt-ins only. Multi-purpose opt-ins feel like traps and reduce trust.
- **Voice rules non-optional.** Every list message runs through Genius voice samples. Platform-default cadence is refused.
- **Segmentation required at >500 subscribers.** Below that, segmentation overhead exceeds benefit; engaged-vs-new is enough.
- **Welcome sequence is the highest-leverage list asset.** First 21 days predict long-term engagement.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
