# Starlight Project Board Specification: Sovereign GTM & Modular Expansion

> Declarative project board schema for the Starlight Intelligence System (SIS) ecosystem.
> Built on SIP — Substrate Governance.

---

## 1. Overview & Board Identity

- **Board Title:** `Starlight Intelligence System — Sovereign GTM & Modular Expansion`
- **Owner:** `frankxai`
- **Target Repository:** `frankxai/Starlight-Intelligence-System`
- **Associated Epics:**
  - [#348: Sovereign Vault Durability (Local, Cloud, Blockchain)](https://github.com/frankxai/Starlight-Intelligence-System/issues/348)
  - [#349: Robot Fleet Continuity (Actuator Bridge & Spatial Memory)](https://github.com/frankxai/Starlight-Intelligence-System/issues/349)
  - [#350: Starlight Queen Orchestration (Single-Operator Fleet Loop)](https://github.com/frankxai/Starlight-Intelligence-System/issues/350)
  - [#351: Starlight Sovereign Marketplace (Curated Community Packs & Skills)](https://github.com/frankxai/Starlight-Intelligence-System/issues/351)
  - [#352: Subscription-Facing Modular Packs (Enterprise Durability & Fleet Mesh)](https://github.com/frankxai/Starlight-Intelligence-System/issues/352)

---

## 2. Board Columns & Workflow States

```
[ Backlog / Triage ] ──► [ Spec & Architecture ] ──► [ In Progress (Open-Core & Packs) ] ──► [ Human Gate / Attestation ] ──► [ Done / Shipped ]
```

### Columns Definition

1. **Backlog / Triage (`status:backlog`)**:
   - Unscheduled features, community proposals, external adapter suggestions.
   - Initial review filter: SOUL Invariant 1 (Sovereignty before convenience) and SOUL Invariant 4 (Sovereignty clause non-waivable).
2. **Spec & Architecture (`status:spec`)**:
   - RFCs, interface types, charter definitions, and empirical proved patterns.
   - Requires zero speculative abstraction before code.
3. **In Progress — Open-Core & Packs (`status:in-progress`)**:
   - Substrate code (MIT) in `src/`.
   - Subscription packs in `packs/available/`.
   - Test suites in `test/`.
4. **Human Gate / Attestation (`status:human-gate`)**:
   - Irreversible actions, external credentials, money movement, deployment promotions.
   - Fails closed until explicit human signature/receipt.
5. **Done / Shipped (`status:done`)**:
   - Attested with `Built on SIP`.
   - Passes all test suites (`npm test`, `npm run verify`).
   - Logged in Operational Vault with execution receipt.

---

## 3. Human Gate & Automation Instructions

To instantiate this board directly into GitHub Projects when authorized:

```bash
# Human Gate: Refresh GitHub CLI token scope with project permissions
gh auth refresh -s project,read:project

# Create the project board under the frankxai organization/user account
gh project create --owner frankxai --title "Starlight Intelligence System — Sovereign GTM & Modular Expansion"

# Link issues 348 through 352
gh project item-add <PROJECT_NUMBER> --owner frankxai --url "https://github.com/frankxai/Starlight-Intelligence-System/issues/348"
gh project item-add <PROJECT_NUMBER> --owner frankxai --url "https://github.com/frankxai/Starlight-Intelligence-System/issues/349"
gh project item-add <PROJECT_NUMBER> --owner frankxai --url "https://github.com/frankxai/Starlight-Intelligence-System/issues/350"
gh project item-add <PROJECT_NUMBER> --owner frankxai --url "https://github.com/frankxai/Starlight-Intelligence-System/issues/351"
gh project item-add <PROJECT_NUMBER> --owner frankxai --url "https://github.com/frankxai/Starlight-Intelligence-System/issues/352"
```

---

*Attested: Built on SIP · 2026-10-10*
