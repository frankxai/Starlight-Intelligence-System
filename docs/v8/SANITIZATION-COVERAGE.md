# SanitizationGateway — Coverage Contract

> **Trust scope:** What `SanitizationGateway` from `src/sanitization.ts` will and will not scrub.
> If a pattern is not in the "Covered" list, do not assume it is masked.
> Board verdict 2026-05-11 (REVISE-A.1) requires this document to ship with the v8.0 wave.

**Version:** modular core candidate 0.1.0
**Last reviewed:** 2026-10-10 (local implementation/tests; independent review pending)
**Revisit cadence:** quarterly + on every new secret format that lands in the wild

---

## Covered patterns

These regex families are masked when `scrubSecrets: true` (default) or `scrubPII: true` (default) is set.

### Secrets (`scrubSecrets: true`)

| Pattern | Example matched | Notes |
|---|---|---|
| OpenAI-style keys | `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | 48+ character tail, including project-key separators |
| Slack tokens | `xoxb-…`, `xoxp-…`, `xoxa-…`, `xoxr-…`, `xoxs-…` | 10–48 char tail |
| GitHub tokens | `ghp_…`, `github_pat_…` | 36+ character tail; full suffix masked |
| Google API keys | `AIza…` | 35-char fixed |
| JWTs | `eyJ…header.eyJ…payload.signature` | Three-segment base64 |
| Bearer tokens | `Bearer <opaque>` | Case-insensitive |
| JSON password fields | `"password": "…"` | Within JSON object |
| JSON private_key fields | `"private_key": "…"` | Within JSON object |

### PII (`scrubPII: true`)

| Pattern | Example matched | Notes |
|---|---|---|
| Emails | `user@example.com` | Standard RFC-loose form |
| Phone numbers | `+31 6 12 34 56 78`, `(415) 555-1234` | US + intl basic shapes |
| US SSN | `123-45-6789` | Exact triplet pattern |

---

## Known-NOT-covered patterns (DO NOT assume safety)

The following remain outside the current configured coverage. Anyone piping these through the gateway will receive an *unmasked* string back. Plan upstream redaction if your input may contain them.

| Category | Examples |
|---|---|
| **Stripe public keys** | Public key identifiers are not secret credentials |
| **AWS other data** | Unstructured secret access keys/session tokens without a recognized context field; IAM role ARNs |
| **GCP service-account JSON** | full SA JSON blobs, `client_email`, `private_key_id` |
| **Azure** | `DefaultEndpointsProtocol=…`, connection strings, SAS tokens, account keys |
| **Cloudflare** | API tokens (no standard prefix), R2 keys |
| **PGP private keys** | `-----BEGIN PGP PRIVATE KEY BLOCK-----` blocks |
| **Bank account / IBAN** | `NL91 ABNA 0417 1643 00`, US routing+account combos |
| **Credit card numbers** | 13–19 digit PAN with Luhn validity |
| **Crypto private keys / mnemonics** | hex 64-char strings, 12/24-word BIP-39 phrases |
| **Government ID numbers (non-US-SSN)** | Dutch BSN, EU national IDs, passport numbers |
| **Physical addresses** | street + city + postcode combos |
| **Names** | personal names of any kind |
| **Dates of birth** | structured or unstructured |
| **Healthcare identifiers** | medical record numbers, insurance IDs |

---

## Known false positives (regex side-effects)

Because the gateway is regex-based, some patterns are *incidentally* scrubbed even though they aren't deliberately covered. These are NOT a feature; they are a known limitation of pattern matching.

| Side-effect | Trigger |
|---|---|
| Any 10-digit run inside a longer alphanumeric string | Matched by the phone-number regex. Example: an API key containing `0123456789` will get its tail masked. |
| Embedded `user:pw@host.tld` substrings (e.g. credentialed DB URIs) | Matched by the email regex (`pw@host.tld` is shaped like an email). |
| `Bearer` prefix in a non-auth context | Matched by the bearer-token regex regardless of intent. |

If your input intentionally contains a 10-digit run or `user@host` substring, expect part of it to be masked. This is acceptable for a defense-in-depth prepass but is not a substitute for upstream redaction discipline.

---

## What this gateway IS for

A best-effort prepass to scrub *common, structured* secrets before string content enters Starlight Memory or is transmitted to a cloud LLM API. It is **defense-in-depth**, not the only line.

## What this gateway is NOT

- Not a compliance-grade DLP (data-loss prevention) system.
- Not a substitute for keeping production secrets out of LLM-facing surfaces in the first place.
- Not a guarantee — regex pattern matching is provably incomplete for arbitrary natural-language input.

## How to extend coverage

1. Add a new regex pattern to `SECRET_PATTERNS` or `PII_PATTERNS` in `packages/core/src/veil.ts` (re-exported by `src/sanitization.ts`).
2. Add a matching test case to `test/v8-sanitization-coverage.test.ts` under "Covered."
3. Remove the corresponding row from the Known-NOT-covered table here.
4. Bump this doc's `Last reviewed` date.

## Remaining work

- Independent review of the new patterns and context-field handling.
- Provider-specific opaque credentials require host-side policy or named-field redaction.
- Semantic PII, banking identifiers and PGP blocks require separate coverage before use.
- This change does not establish compliance or prompt-injection resistance.

Mask strings are inserted literally; replacement syntax cannot reinsert matched secrets.
Context data keys cannot invoke inherited prototype setters. Existing recursion and
cycle bounds remain. Inputs outside these documented shapes still need upstream controls.

---

**Built on SIP** · SanitizationGateway coverage contract · 2026-05-11
