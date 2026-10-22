# Run receipts

A run receipt is the unit of proof for agent work. It states what a run did, what it cost, how long it took, who decided at each gate, and which evidence remains. It is issued locally by the SIS v0.1 MCP server and can be checked by anyone who holds the issuer's public key.

The format is a DSSE v1 envelope around an in-toto Statement v1, signed with Ed25519. This is the same profile as the SIP conformance receipt, so one verifier handles both. Schema: `protocol/run-receipt.v1.schema.json`, proposed as a SIP graph extension; it is substrate tier, so it lands in its own pull request after the Board rules on #193. Predicate type: `https://starlightintelligence.ai/protocol/run-receipt/v1`.

## Fields

| Field | What it holds |
|---|---|
| `schema` | Always `starlight.run-receipt.v1`. |
| `receiptId`, `issuedAt` | Set by the issuer (`rcpt_…`, ISO date-time). |
| `issuer` | `name`, plus `keyid` (sha256 of the signing public key's SPKI DER) once signed. The verifier refuses a receipt whose `keyid` names a key other than the one that signed it. |
| `run` | `id`, `kind` (e.g. `desk.brief`, `publish`), `host` (e.g. `claude-code`), `startedAt`, `endedAt`, optional `correlationId`. `endedAt` is not before `startedAt`, and `issuedAt` is not before `endedAt`. |
| `subject` | The artifact the run produced: `name` and `digest.sha256`. The digest is what the signature names. |
| `stages` | Ordered list of `{ name, status, model?, provider?, inputTokens?, outputTokens?, costEur?, latencyMs?, note? }`. At least one. |
| `totals` | `costEur`, `latencyMs`, `tokens.input`, `tokens.output`. Cost and tokens may exceed the stage sums (overhead), never fall below them; cost is compared allowing only for rounding, 0.00005 EUR per priced stage plus one for the total. `latencyMs` is wall time: stages can overlap, so it is never below the longest stage. Token counts are whole numbers. |
| `decisions` | Gates crossed: `{ gate, decidedBy: human\|agent\|policy, actorId, outcome: approved\|rejected\|deferred, at }`. `decidedBy: human` requires actor-bound proof (`signature`, `mandateId`, `approvalRef`, `evidenceRef`, or `proof`). `at` is not after `issuedAt`. Empty list allowed. |
| `evidence` | `{ kind, ref, sha256 }` a verifier can go and look at. `sha256` binds the referenced content. Empty list allowed. |
| `verdict` | `PASS`, `FAIL`, or `PARTIAL`. `PASS` is refused when any stage failed. A `FAIL` receipt is signable; a signed record of a failed run is still proof. |

`receiptProblems()` in `src/run-receipt.ts` checks all of this on both sides. A receipt with any problem is neither signed nor shown as verified.

## Generate a key

```bash
node protocol/sign.mjs keygen .starlight/keys
```

This writes `.starlight/keys/sip-signing.key` (private, mode 0600, gitignored) and `sip-signing.pub` (public, publish it next to your receipts). It refuses to overwrite an existing key.

Point the MCP server at the private key with `SIS_SIGNING_KEY_PATH=.starlight/keys/sip-signing.key`, or pass `signing_key_path` per call. `SIS_SIGNING_KEY` (PEM content) also works. Resolution order: `signing_key_pem` → `signing_key_path` → `SIS_SIGNING_KEY_PATH` → `SIS_SIGNING_KEY`.

## Issue from the command line, print, scan

One command signs a receipt, self-verifies it, and writes what the phone path needs:

```bash
node --experimental-strip-types scripts/receipts/issue-and-share.mts scripts/receipts/examples/desk-brief.draft.json \
  --key .starlight/keys/sip-signing.key --ledger
```

The draft carries `run`, `subject` (`path` to the produced file; its sha256 becomes the digest), `stages`, and optionally `issuer`, `decisions`, `evidence`, `totals`, `verdict`. The script writes `.starlight/receipts/<receiptId>.envelope.json`, `.share.txt` (the link) and `.card.html` (an A5 card with a 64 mm QR; open it and print), and with `--ledger` appends the signed envelope to `memory/_audit/receipts.jsonl`, as `sis.receipt.issue` does.

The link is the compact form, `https://starlightintelligence.ai/verify?r=z:…`: deflate-raw over the envelope with its statement stored decoded, base64url, about 1.3k characters for a four-stage receipt. The plain form, `r=b64u:<base64url of the envelope JSON>`, is about 3.8k characters, past what a QR holds (2953 bytes). Both restore the envelope byte for byte, so the signature check is the same. `src/receipt-share.ts` produces both and `parseShareParam` restores the envelope from either. The site's `/verify` page does not read run receipts yet; today it checks only SIS's own SIP receipt.

## Issue a receipt over MCP

```json
{
  "name": "sis.receipt.issue",
  "arguments": {
    "run": { "id": "run_2026-09-21_001", "kind": "desk.brief", "host": "claude-code",
             "startedAt": "2026-09-21T09:58:00Z", "endedAt": "2026-09-21T09:59:10Z" },
    "subject": { "name": "briefs/2026-09-21.md", "content": "<the file body>" },
    "stages": [
      { "name": "retrieve", "status": "ok", "provider": "local", "latencyMs": 120 },
      { "name": "synthesize", "status": "ok", "model": "deepseek-ai/DeepSeek-V4-Flash",
        "provider": "nebius", "inputTokens": 4100, "outputTokens": 900, "costEur": 0.004, "latencyMs": 6200 }
    ],
    "decisions": [{ "gate": "publish", "decidedBy": "human", "actorId": "frank",
                    "outcome": "approved", "approvalRef": "mandate:frank:publish", "at": "2026-09-21T09:59:05Z" }],
    "evidence": [{ "kind": "ledger", "ref": "memory/_audit/agent-events/2026-09-21.jsonl", "sha256": "4a7112001e4a30e8cb55ec3fc6522c061596700c50ca6f63459e87517c2be585" }]
  }
}
```

`subject` takes either `{ name, digest: { sha256 } }` or `{ name, content }`; with `content` the server computes the sha256. `totals` defaults to the stage sums and `verdict` to the stage statuses (all ok → `PASS`, all failed → `FAIL`, mixed → `PARTIAL`). Both can be passed explicitly.

The result is `{ ok, status: "signed", receiptId, keyid, receipt, envelope }` when a key resolved, or `{ ok, status: "draft", receiptId, receipt, note }` when none did. Either way one line is appended to `memory/_audit/receipts.jsonl`. An incomplete receipt returns `{ ok: false, error }` and nothing is written.

`sis.receipt.list` returns recent receipts, newest first, with `receiptId`, `kind`, `keyid`, `verdict`, `runKind`, `issuedAt`, `costEur`, and `subjectName`.

## Verifying a receipt

To verify a receipt standalone from the command line:

```bash
npx tsx src/verify-receipt.ts <file.json> --public-key <public-key.pem>
# or
starlight verify-receipt <file.json> --public-key <public-key.pem>
```

Exit codes:
- `0`: Verified. The DSSE envelope is valid, a trusted key's signature verifies, the receipt names that key as its issuer, and `receiptProblems` found no structural issues. The only other case that exits `0` is `--help` or `-h` as the entire command line (also through `starlight verify-receipt`), which prints usage and checks nothing. `--help` together with any other argument exits `2`, so help never reads as a verification.
- `1`: Rejection. Verification failed due to a signature mismatch, untrusted key, tampered envelope/payload, structural defects in the receipt payload, an encoding the verifier will not forgive (below), or a trusted key it refuses (below).
- `2`: Invalid input. Missing, unreadable or oversized input file or public key file, malformed JSON, or malformed CLI arguments (unknown flag, missing `--public-key`, more than one envelope).

Exit `1` also covers a key file that is readable but is not a usable Ed25519 public key. The command only reads files; it never writes or signs. The keys you pass with `--public-key` are the whole trust root: a receipt is accepted only when one of them produced a verifying signature and the receipt names that key as its issuer.

Guards the command adds on top of `verifyRunReceipt`:
- **Strict encodings.** `payload` and every `sig` must be a string in standard base64 (padding required) or base64url (padding optional), with no stray characters, no mixed alphabets and no non-zero trailing bits. Node's decoder forgives all of those, so the command checks first. A `sig` that is an array or a number is rejected, not coerced.
- **Size limit.** The envelope and each key file must be a regular file of at most 1 MiB (1048576 bytes). The file is opened once and read at most 1 MiB plus one byte. A larger file, a directory, or a device or pipe exits `2`.
- **Signature entries.** Every entry in `signatures` must be an object with a string `keyid` and a strict-base64 string `sig`. One bad entry is a rejection (exit `1`) even when another entry carries a valid signature.
- **Small-order keys.** A trusted key that is a small-order Ed25519 point (the identity and the other seven canonical points, plus their sign-bit and non-canonical aliases) is refused with exit `1`, because signatures under such a key can be forged for any message.

What the verifier does NOT check:
- Maker differs from checker: whether the actor that accepted the work is the same harness that made it (`decisions` against `run.host`). A receipt can verify and still record a maker approving its own work. That is a policy check for the caller.
- Real provider cost: it checks that `totals.costEur` is not below the stage sum, not that any figure matches a provider bill.
- Genuine checker output: it checks signature, structure and that evidence entries carry a sha256. It does not fetch the evidence or confirm the hash matches it.
- Who the key belongs to: a valid signature proves a trusted key signed these bytes, not that the contents are true (see "The rule").

Known limits:
- `src/run-receipt.ts` (`verifyRunReceipt`, the MCP `sis.receipt.verify` path and `trust_ledger`) still accepts a small-order public key as a trusted key. Depending on the Node and OpenSSL build, a trivial signature under the identity key then verifies for any edit (it does on Node 22.23 with OpenSSL 3.5.8, and not on Node 24.21). Only `starlight verify-receipt` refuses such keys. Fixing the shared code is a separate protocol PR.
- The command trusts exactly the keys you give it and does not check who they belong to.

The fixtures in `test/fixtures/run-receipt/` come from `node --import tsx tools/gen-run-receipt-fixtures.mjs [--out <dir>]`. They use fixed TEST KEYS that protect nothing; only the public halves are committed. The test regenerates into a temp directory and compares, so running it never changes the checkout.

Locally, over MCP:

```json
{ "name": "sis.receipt.verify",
  "arguments": { "envelope": { "...": "the envelope from issue" }, "public_key_path": ".starlight/keys/sip-signing.pub" } }
```

With `trust_ledger: true` the server also trusts every `*.pub` file under `SIS_TRUSTED_KEYS_DIR`. The result is `{ ok: true, verified, keyid, reasons, receipt }`; `verified: false` means the check ran and the receipt failed it; errors are reported separately. In code, `verifyRunReceipt(envelope, [publicKeyPem])` from `src/run-receipt.ts` does the same with no I/O.

There is no public verifier for run receipts yet. `https://starlightintelligence.ai/verify` checks only SIS's own SIP receipt, and `/api/v1/receipts/verify` does not exist. Until a public verifier ships, verify with `starlight verify-receipt` or `sis.receipt.verify` or `verifyRunReceipt` and the issuer's public key.

## The rule

A draft is not proof. It is a receipt the issuer wrote down and nobody signed.

A signature is a statement by the key holder that this is what happened. It binds the receipt to the subject digest and to a key; it does not make the contents true.

The verifier trusts only the keys you give it. Decide which public keys you trust, verify against those, and read the receipt only after it verifies.

Built on SIP.
