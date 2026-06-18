---
name: starlight-king
description: Query, list, and verify King sovereign intent anchors, policy locks, value custody spending ceilings, and authority boundaries. Non-waivable sovereign security gate.
allowed-tools: Read, WebSearch
argument-hint: <policy-lock-name | --list | --verify>
---

# /starlight-king

List, query, or verify the non-negotiable policy locks and value constraints defined by the Sovereign user (King). These are hard rules that cannot be overwritten by any agent, even in YOLO mode.

## Usage

- `/starlight-king --list` : List all active policy locks, spending caps, and security boundaries.
- `/starlight-king --verify <lock-id>` : Check if the current environment or pending commit complies with the specified policy.
- `/starlight-king <proposal-or-action>` : Test if a proposed action (e.g., spending $150 or pushing to master) violates any King intent anchor.

## Active Sovereign Policy Locks (Scaffold)

- **`spending-cap-daily`**: Maximum $100 auto-spend budget across all agents. Higher amounts require manual interactive user signature.
- **`branch-lock-master`**: Direct pushes to `main` or `master` are blocked. All code must pass the pre-commit checks and Sentinel review.
- **`privacy-the-veil`**: Personal identification information (PII), secret tokens, and password keys are filtered by the Sanitization Gateway and cannot be written to public vaults.
- **`licensing-gate`**: Substrate code must maintain the MIT License. External libraries with restrictive licenses are rejected.

## Rule Enforcement

- Any YOLO session (/yolo) immediately halts if a King lock is tripped.
- The Sentinel daemon automatically rolls back git commits if a code injection trips the `branch-lock-master` policy.
- If a Model Council or Starlight Board recommendation contradicts a King policy lock, the King lock takes precedence and the recommendation is vetoed.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty, policy-locks]
