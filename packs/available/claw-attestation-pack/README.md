# Claw Attestation Pack

> SIP attestation verification. Scan any artifact (file, directory, repo) and produce a verdict on whether it carries the "Built on SIP" attestation per the SIP v1.1.1 file contract.

## What's inside

- `content/verify.ts` — pure verifier. Takes a path, returns `{ attested, evidence_refs, missing_clauses, verdict }`.
- `content/patterns.json` — the attestation-pattern table (8 patterns × 4 contexts = 32 valid attestation forms per SIP § 4).
- `content/cli.ts` — CLI entry: `node verify.ts <path>` and `node verify.ts --self-check`.
- `content/README.md` — how to integrate as a pre-commit gate or CI step.

## Permissions

Declared in `manifest.json`:

- `fs:read:repo` — to read repo files for scanning. **Read only**. No writes, no network, no execution outside the verifier.

The pack-runtime gates install on `permissions_acked:true` because even a `fs:read` permission needs to be acknowledged — a malicious read-only claw could still exfiltrate repo content into its own JSONL audit. (This pack does not; the verifier writes only to stdout. But the gate is structural, not discretionary.)

## What "attested" means here

A file or artifact is SIP-attested when one of the following appears in its body:

- The string `Built on SIP` (canonical form)
- An HTML comment `<!-- Built on SIP -->` (for embeddable / RSS contexts)
- A YAML frontmatter line `sip_attested: true`
- A JSON manifest field `"attestation": "sip-attested"`

This pack ships the canonical pattern table at `content/patterns.json`. See `scripts/audit-authorlessness.ts` for the substrate-level audit that uses the same table.

## Output shape

```jsonc
{
  "target": "C:/some/path",
  "attested": true,
  "patterns_matched": ["canonical-text", "json-manifest"],
  "evidence_refs": ["README.md:42", "manifest.json:7"],
  "missing_clauses": [],
  "verdict": "PASS"
}
```

If `verdict` is `FAIL`, the `missing_clauses` array names the patterns that should have been present given the file kind (e.g. a `manifest.json` without `"attestation"` is flagged regardless of whether the README has the canonical text).

## License

MIT.

Built on SIP.
