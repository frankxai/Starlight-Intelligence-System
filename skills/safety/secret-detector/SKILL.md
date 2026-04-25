# Secret Detector

> Nothing sensitive exits the local machine without explicit human awareness.

## When This Skill Activates

- Any content is about to be written outside `~/.starlight/` to an external destination
- Any vault export is generated for a platform adapter
- Any content is passed to an external MCP server
- Keywords: "export", "publish", "send", "upload", "share", "transmit"
- Default for: Starlight Sentinel

## What This Skill Does

Scans content for credential patterns, personal identifiers, and sensitive data before it leaves the local machine. Blocks export if secrets are found. Never auto-redacts — always surfaces findings to the user for an explicit decision.

## Procedures

### Procedure 1: Pre-Export Scan

1. Receive content blob pending export
2. Run pattern detection against the full content:

   | Pattern | Example | Action on match |
   |---------|---------|----------------|
   | API keys | `sk-...`, `pk_...`, `ghp_...`, `xoxb-...` | BLOCK + report |
   | Private keys | `-----BEGIN PRIVATE KEY-----` | BLOCK + report |
   | Passwords in config | `password=`, `passwd=`, `secret=` | BLOCK + report |
   | Email addresses | `user@domain.com` in unexpected context | WARN + report |
   | Phone numbers | `+1-555-...`, formatted phone patterns | WARN + report |
   | Credit card patterns | 16-digit sequences with separators | BLOCK + report |
   | Government IDs | SSN patterns, national ID formats | BLOCK + report |

3. If BLOCK patterns found: halt export, generate SECRET_SCAN_REPORT.md, present to user
4. If WARN patterns found: present to user with option to proceed or redact
5. If clean: return APPROVED for export

### Procedure 2: Scan Report Generation

1. Create `/security/SECRET_SCAN_REPORT.md`
2. Include: content source, patterns detected, line references (not the secrets themselves)
3. Present options: [redact and retry] / [cancel export] / [I confirm this is safe, proceed]
4. Log the decision with user action

### Procedure 3: False Positive Handling

1. User declares a detected pattern is not sensitive
2. Record the declaration with timestamp + user confirmation
3. Add to local allowlist for this session (not persisted globally)
4. Proceed with export

## Integration Points

- **Vaults:** No vault access needed — operates purely on content in transit
- **Agents:** Starlight Sentinel
- **Skills:** Composes with `private-public-split` for structural classification; `permission-gate` for the approval flow
- **Claws:** Called by every Claw that generates exports (Memory, Creator, Attestation, Reclamation)

## Quality Criteria

- Zero false negatives on common credential patterns
- False positives surface clearly as warnings, not blocks (where safe)
- User is always in control — no silent redaction or silent pass
- Scan report is human-readable, not a raw regex dump
