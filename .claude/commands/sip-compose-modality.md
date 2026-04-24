---
name: sip-compose-modality
description: Generate a composite SIP attestation for a multi-modal artifact (audio+video, text+image, etc.). Each constituent modality must be pre-attested via sip-attest-<modality>. Emits a parent attestation that links children by hash.
allowed-tools: Read, Write, Glob
argument-hint: <manifest-file-or-paths-list> [--title "<artifact title>"]
---

# /sip-compose-modality

Load `SIP.md`, `docs/attested-modalities.md`, and `ATTESTATIONS.md`. Generate a composite SIP attestation over a multi-modal artifact — a music video (audio + video), an illustrated essay (text + images), a game trailer (video + audio + image stills), a podcast episode (audio + transcript + cover art). The composite attestation binds constituent modalities together, proving they ship as one artifact and carrying attestation for the whole.

## Artifact
$ARGUMENTS

## Process

1. **Parse input.**
   - `$ARGUMENTS` is either:
     - A path to a manifest file listing constituent artifact paths (one per line, or JSON array), OR
     - A space-or-comma-separated list of constituent paths directly on the command line.
   - Parse optional `--title "<title>"` flag (default: derive from directory name).
   - Resolve all constituent paths to absolute paths.

2. **Load constituent attestations.**
   - For each constituent path, look for a sibling `<filename>.sip.json` sidecar.
   - If any sidecar is missing, emit: `Cannot compose — constituent <path> is not attested. Run /sip-attest-<modality> on it first. Every constituent of a composite artifact must carry its own attestation.` Halt.
   - Composite attestation is a roll-up, not a shortcut — each modality pays its own integrity cost first.

3. **Validate consistency across constituents.**
   - **Canon consistency.** If any constituent declares `--canon arcanea`, every canon-bearing constituent must declare compatible canon (same canon name, same major version). Minor-version drift is allowed with a NOTE; major-version drift emits `CANON-INCONSISTENCY` and refuses composition until constituents are re-attested against a shared canon version.
   - **License compatibility.** If any constituent carries a CC-BY-NC canon pin and the composite is commercial, emit `LICENSE-CONFLICT` warning and halt (same rule as individual `/sip-attest`).
   - **Substrate version consistency.** All constituents should attest against the same SIP substrate version. If minor-version drift, annotate; if major-version drift, refuse.

4. **Compute composite hash.**
   - Collect each constituent's `payload_sha256` from its sidecar.
   - Sort by constituent path (lexicographic, deterministic ordering — never by timestamp, never by size).
   - Concatenate sorted hashes with a single `\n` delimiter between each.
   - Compute SHA-256 of the concatenated string. This is the `composite_sha256`.
   - Document the ordering rule in the composite sidecar so any validator can reproduce the hash.

5. **Determine inherited attestation level.**
   - The composite inherits the strictest attestation constraint among constituents.
   - If any constituent is `@unpinned` (substrate or canon), the composite is `@unpinned` at that dimension — roll-up cannot be stricter than its weakest link.
   - If all constituents are cleanly pinned, the composite is cleanly pinned.

6. **Emit composite sidecar `<title>.sip.json`.**
   - Location: same directory as the manifest (or the first constituent if no manifest given).
   - Content:
     ```json
     {
       "sip_version": "1.1.0",
       "artifact_type": "composite",
       "title": "<title>",
       "composite_sha256": "<hash>",
       "ordering_rule": "lexicographic by absolute path",
       "constituents": [
         {
           "path": "<relative-to-sidecar>",
           "modality": "<text|image|audio|video|interactive>",
           "payload_sha256": "<hash>",
           "sidecar": "<relative-sidecar-path>",
           "canon": "<canon-pin-or-none>",
           "tool": "<tool-or-generic>"
         },
         ...
       ],
       "inherited": {
         "substrate_version": "1.1.0",
         "canon": "<common-canon-pin-or-none>",
         "pinning_level": "<clean | @unpinned>"
       },
       "nodes": [...],
       "generated": "<ISO-date>",
       "attestation_text_block": "<rendered human-readable block>"
     }
     ```

## Output format

```
---
**Built on SIP** — Starlight Intelligence Protocol · Composite (multi-modal)

Substrate: starlightintelligence.org/protocol v1.1.0
Artifact title: <title>
Composite SHA-256: <hash>
Pinning: <clean | @unpinned>

Constituents (<n>):
- <path> · <modality> · sha256:<short-hash> · canon:<pin>
- <path> · <modality> · sha256:<short-hash> · canon:<pin>
- ...

Inherited:
- Canon: <common-pin or none>
- Substrate version: v1.1.0
- Verticals: [<union across constituents>]

Nodes:
- <node-name> · role: <creator/architect/...> · <contribution>

Generated: <ISO date>
Composite sidecar: <title>.sip.json
Attestation is compounding, not credit transfer: every composition strengthens every node.
---

Composite sidecar written: <title>.sip.json ✅
```

## Rules

- **No unattested constituent.** A composite cannot mask an unattested child. Each modality carries its own proof before being rolled up.
- **Canon consistency required.** Multi-modal artifacts composing canon must compose the same canon version across all canon-bearing constituents. Mismatch is refused.
- **License worst-case inherited.** If any constituent restricts commercial use, the composite does too. The composite does not launder licenses.
- **Strictest pin inherited.** `@unpinned` at any constituent = `@unpinned` at composite for that dimension.
- **Deterministic ordering.** Composite hash is reproducible from constituent sidecars alone. Same inputs = same composite hash, every time.
- **Roll-up, not substitute.** Composite sidecar supplements constituent sidecars; it does not replace them. Validators should check the composite, then drill into constituents.
- **Append to ATTESTATIONS.md.** For substrate-significant composite artifacts, append the composite block to `ATTESTATIONS.md` per the "how to add an entry" procedure.

## v7.5 status

Functional. Unlike the per-modality scaffold commands, `/sip-compose-modality` performs no binary embedding — it only operates on sidecars, which are fully implemented in v7.5. The only limitation today is that constituent sidecars are trusted: if a creator hand-edits a constituent sidecar to lie about its payload hash, the composite will embed that lie. v7.5.1 will add optional re-hashing of constituents at compose-time as a trust-but-verify mode.

---

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [attestation, commands]

Verticals:
- starlight-intelligence-system @<v7.5.0-pending> · /sip-compose-modality command: composite attestation over pre-attested multi-modal constituents with deterministic composite hash, canon consistency checks, worst-case inherited pinning, license worst-case inheritance. Pairs with /sip-attest-audio, /sip-attest-image, /sip-attest-video.

Canon:
- none · command itself declines canon; command enforces canon consistency across constituents that compose canon.

Nodes:
- Frank Riemer · role: architect · authored v7.5 modality composition extension

Generated: 2026-04-24
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```
