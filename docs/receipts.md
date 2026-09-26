# Run receipts

A run receipt is the unit of proof for agent work. It states what a run did, what it cost, how long it took, who decided at each gate, and which evidence remains. It is issued locally by the SIS v0.1 MCP server and can be checked by anyone who holds the issuer's public key.

The format is a DSSE v1 envelope around an in-toto Statement v1, signed with Ed25519. This is the same profile as the SIP conformance receipt, so one verifier handles both. Schema: [`protocol/run-receipt.v1.schema.json`](../protocol/run-receipt.v1.schema.json). Predicate type: `https://starlightintelligence.ai/protocol/run-receipt/v1`.

## Fields

| Field | What it holds |
|---|---|
| `schema` | Always `starlight.run-receipt.v1`. |
| `receiptId`, `issuedAt` | Set by the issuer (`rcpt_…`, ISO date-time). |
| `issuer` | `name`, plus `keyid` (sha256 of the signing public key's SPKI DER) once signed. |
| `run` | `id`, `kind` (e.g. `desk.brief`, `publish`), `host` (e.g. `claude-code`), `startedAt`, `endedAt`, optional `correlationId`. |
| `subject` | The artifact the run produced: `name` and `digest.sha256`. The digest is what the signature names. |
| `stages` | Ordered list of `{ name, status, model?, provider?, inputTokens?, outputTokens?, costEur?, latencyMs?, note? }`. At least one. |
| `totals` | `costEur`, `latencyMs`, `tokens.input`, `tokens.output`. May exceed the stage sums (overhead), never fall below them. |
| `decisions` | Gates crossed: `{ gate, decidedBy: human\|agent\|policy, actorId, outcome: approved\|rejected\|deferred, at }`. Empty list allowed. |
| `evidence` | `{ kind, ref, sha256? }` a verifier can go and look at. Empty list allowed. |
| `verdict` | `PASS`, `FAIL`, or `PARTIAL`. A `FAIL` receipt is signable; a signed record of a failed run is still proof. |

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

The link is the compact form, `https://starlightintelligence.ai/verify?r=z:…`: deflate-raw over the envelope with its statement stored decoded, base64url, about 1.3k characters for a four-stage receipt. The plain form, `r=b64u:<base64url of the envelope JSON>`, is about 3.8k characters, past what a QR holds (2953 bytes). Both restore the envelope byte for byte, so the signature check is the same. `src/receipt-share.ts` produces and parses both; the site parses both.

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
                    "outcome": "approved", "at": "2026-09-21T09:59:05Z" }],
    "evidence": [{ "kind": "ledger", "ref": "memory/_audit/agent-events/2026-09-21.jsonl" }]
  }
}
```

`subject` takes either `{ name, digest: { sha256 } }` or `{ name, content }`; with `content` the server computes the sha256. `totals` defaults to the stage sums and `verdict` to the stage statuses (all ok → `PASS`, all failed → `FAIL`, mixed → `PARTIAL`). Both can be passed explicitly.

The result is `{ ok, status: "signed", receiptId, keyid, receipt, envelope }` when a key resolved, or `{ ok, status: "draft", receiptId, receipt, note }` when none did. Either way one line is appended to `memory/_audit/receipts.jsonl`. An incomplete receipt returns `{ ok: false, error }` and nothing is written.

`sis.receipt.list` returns recent receipts, newest first, with `receiptId`, `kind`, `keyid`, `verdict`, `runKind`, `issuedAt`, `costEur`, and `subjectName`.

## Verify

Locally, over MCP:

```json
{ "name": "sis.receipt.verify",
  "arguments": { "envelope": { "...": "the envelope from issue" }, "public_key_path": ".starlight/keys/sip-signing.pub" } }
```

With `trust_ledger: true` the server also trusts every `*.pub` file under `SIS_TRUSTED_KEYS_DIR`. The result is `{ ok: true, verified, keyid, reasons, receipt }`; `verified: false` is a completed check, not an error. In code, `verifyRunReceipt(envelope, [publicKeyPem])` from `src/run-receipt.ts` does the same with no I/O.

Publicly, paste the envelope and the public key at https://starlightintelligence.ai/verify, or:

```bash
curl -X POST https://starlightintelligence.ai/api/v1/receipts/verify \
  -H 'content-type: application/json' \
  -d '{ "envelope": { "...": "..." }, "publicKeys": ["-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"] }'
```

## The rule

A draft is not proof. It is a receipt the issuer wrote down and nobody signed.

A signature is a statement by the key holder that this is what happened. It binds the receipt to the subject digest and to a key; it does not make the contents true.

The verifier trusts the key, not the words. Decide which public keys you trust, verify against those, and read the receipt only after it verifies.

Built on SIP.
