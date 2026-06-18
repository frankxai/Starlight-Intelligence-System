# /starlight-king Command

> *"Sovereign intent anchors, policy locks, value custody, and security boundaries."*

**Primary Agent:** None (Direct Policy Enforcement / Cryptographic Gate)
**Skills Activated:** core-guardrails, systems-thinking

---

## Subcommands

### /starlight-king --list

Lists all active policy locks, authority boundaries, spending caps, and security gates.

### /starlight-king --verify <lock-id>

Verifies if the current environment, workspace, or pending commit complies with the specified policy.

### /starlight-king <proposal-or-action>

Runs a local simulation to check if a proposed action (e.g., spending $150, running a script, or editing `SIP.md`) violates any active sovereign policy locks.

---

## Policies Configured

1. **`spending-cap-daily`**: Blocks auto-spending above $100 without manual interactive user signature.
2. **`branch-lock-master`**: Restricts direct pushes to `main`/`master` branches without passing Sentinel test suites.
3. **`privacy-the-veil`**: Scrubs PII and credentials from public vault exports.
4. **`licensing-gate`**: Rejects inclusion of restrictive libraries not matching the MIT spec.

---

## Rule Enforcement

```
Action Proposed
     │
     ├─ Check against King policy locks
     ├─ Trip detected? ──► VETO Action & Terminate YOLO loop
     └─ Clean? ──────────► Pass to Starlight Board / Specialist Swarm
```

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, policy-locks]
