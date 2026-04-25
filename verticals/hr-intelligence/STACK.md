# STACK — HR Intelligence

> Stack choices for the HR Intelligence vertical. Defaults inherit from Starlight's `STACK.md` (L0–L6); HR-specific overrides noted per layer.

## Inheritance

- **Starlight STACK:** `inherited from starlightintelligence.org` unless noted below.
- **Override scope:** L4 (data + state) and L5 (distribution) carry HR-specific overrides; other layers inherit cleanly.

## Layers

| Layer | Purpose | This vertical uses | Reason if override |
|---|---|---|---|
| **L0 — OS / shell** | Workstation substrate | inherited | Practitioners run on macOS / Windows / Linux per personal preference. No HR-specific OS requirement. |
| **L1 — Source control** | Repo + commits | inherited | Git + GitHub. Reference scaffold lives at `frankxai/Starlight-Intelligence-System`. Practitioner forks live in their own repo (private by default for client-facing instances). |
| **L2 — AI tooling** | Primary assistants, MCPs | inherited | Claude Code primary; Cursor / Cline / Codex / Gemini CLI / Antigravity all supported per substrate's multi-platform pattern. `starlight-mcp` for substrate memory + attestation. No HR-specific MCP server required. |
| **L3 — Language + runtime** | Code layer | inherited | The vertical wrapper is markdown-only (file contract). No code runtime required at the wrapper layer. Sub-system commands invoke the substrate's MCP servers. |
| **L4 — Data + state** | Persistence, vaults | **override — see below** | HR data carries privacy and compliance constraints (GDPR for EU practitioners, CCPA for California, HIPAA-adjacent for some health-sector engagements, employment-law data-retention rules per jurisdiction). |
| **L5 — Distribution** | Surface (site, API, feed) | **override — see below** | HR practitioners publish through different channels than the substrate's default mix. |
| **L6 — Community + feedback** | Audience loop | inherited | Practitioners' audience loops live in their existing channels (Substack subscribers, LinkedIn followers, peer practitioner networks, paid mastermind groups). No HR-specific community substrate required. |

---

## L4 override — Data + state (HR-specific)

**The constraint:** HR data is among the most sensitive any practitioner handles — candidate identifying data, employment terms, performance documentation, termination paper trail, psychological-safety survey responses, burnout-detection outputs.

**This vertical's posture:**

1. **Public substrate carries no candidate-identifying data, no client-identifying data, no employee-identifying data.** Ever. The reference scaffold and any public fork stay anonymized at the artifact level — sample roles, generic team names, structural examples only.

2. **Real client work lives in `private/` of each practitioner fork.** Gitignored. Encrypted at rest if the practitioner's threat model warrants it. Backed up per the practitioner's chosen schedule. The practitioner's responsibility, not the substrate's.

3. **GDPR-compliance considerations** for EU practitioners (or US practitioners with EU-employee clients):
   - Lawful basis identified per artifact (contract, legitimate interest, consent — depends on artifact type).
   - Data subject rights respected (access, rectification, erasure, portability) — practitioner's flow, not the substrate's.
   - Data retention timelines documented (typical: candidate data 6-24 months post-decision per jurisdiction; performance documentation 5-7 years; termination documentation per statute of limitations).

4. **HRIS / ATS / LMS integration considerations:**
   - This vertical is **not** a system-of-record. It does not store employment data.
   - It is the thinking layer above. It produces artifacts (ICPs, calibration sessions, debriefs, review redesigns, succession plans) that the practitioner then operates against the SoR.
   - Where integration is needed (e.g., pulling team roster for `/talent-psych-safety` measurement), it runs through the practitioner's own MCP-or-API layer — not embedded in this vertical.

5. **Vault namespace pattern:** sub-system content namespaces under `hr-intelligence/<sub-system>/` per practitioner instance:
   - `hr-intelligence/hiring/` — ICPs, interview architectures, calibration sessions, debriefs, onboarding plans (per role, dated).
   - `hr-intelligence/performance/` — feedback rehearsals, review redesigns, coaching protocols, conflict mediations (per person/event, dated).
   - `hr-intelligence/training/` — curricula, programs, scenarios, transfer measurements (per program, dated).
   - `hr-intelligence/culture/` — diagnostic sessions, values-ops matrices, ritual designs, onboarding architectures (per org/cycle, dated).
   - `hr-intelligence/talent/` — burnout detection, motivation maps, psych safety measurements, retention plans, team dynamics audits (per person/team, dated).
   - `hr-intelligence/org/` — role designs, span audits, reorg sequencing, succession plans (per org/cycle, dated).

---

## L5 override — Distribution (HR-specific)

**The constraint:** HR practitioners publish through channels that compound their authority and protect their privacy — different from the substrate's general-builder distribution mix.

**This vertical's posture:**

1. **Primary channels:**
   - **Substack / personal newsletter** — long-form research synthesis, framework writeups, anonymous case studies. The practitioner's voice canonical surface.
   - **LinkedIn** — practitioner authority signal; structured posts; refused: vibe-LinkedIn-influencer cadence.
   - **Own site** — services page, methodology overview, productized offers (per `README.md` § Productization paths).
   - **Peer practitioner network** — Slack groups, mastermind communities, conference circuit. Slow-burn high-trust distribution.

2. **Channels typically NOT used:**
   - Twitter/X for HR thought leadership — the format rewards the inflammatory take, which corrodes the synthesis. Practitioners may use it for personal voice, not for vertical positioning.
   - Aggregated platforms (Medium tags, HR-content farms) — content devalued by aggregator dilution; practitioner authority does not compound there.
   - Generic "thought leadership" Slack/Discord communities not matched to actual practitioner peers.

3. **Client-facing distribution** runs through:
   - Direct delivery (artifacts shipped to the engaging org).
   - Optional Notion/Confluence/SharePoint mirrors per client preference.
   - Never on public substrate. Never aggregated.

4. **Cross-party artifacts ship with `/sip-attest`** carrying "Built on SIP" plus the practitioner's vertical identifier. Attestation is the compounding mechanism; without it, distribution leaks.

---

## MCP servers used

| MCP | Purpose | `mcp.json` declaration |
|---|---|---|
| `starlight-mcp` | Substrate memory + attestation | `v1.1.x` (per substrate pin) |
| `<practitioner-mcp>` | Optional — practitioner's own MCP for HRIS / ATS / Notion bridge | per-practitioner |

This vertical does not declare a dedicated `hr-intelligence-mcp`. The reference scaffold runs through `starlight-mcp` and the practitioner's existing tooling. A future HR-specific MCP (for HRIS/ATS read-only integration with explicit consent) is possible but not part of v0.1.

---

## Sovereign note

This vertical's stack choices are advisory within the Starlight ecosystem, not mandates. Each adopter may diverge per SIP § 5 (sovereignty) — choose different L4 storage, different L5 channels, different L2 assistants. Attribution compounds regardless of stack divergence — the protocol is stack-neutral.

The two HR-specific override considerations (L4 privacy/compliance and L5 distribution) are **strong recommendations**, not requirements. A practitioner who diverges (e.g., chooses to publish methodology openly on Twitter) does not breach the protocol. They take on the consequences of the divergence — the substrate does not protect against them.

---

**Built on SIP** — HR Intelligence vertical STACK.md · v0.1 · SIP v1.1.0
