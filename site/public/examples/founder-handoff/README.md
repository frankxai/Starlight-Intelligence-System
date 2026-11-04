# Inspect a portable founder handoff

Harbor Desk is revising a signup form. The person drafting the field note needs two things when the work moves to a fresh session: the proposed change and enough evidence to describe it accurately. This example pairs a complete five-file planning packet with the synthetic sources for the [Academy rehearsal](https://starlightintelligence.academy/academy/founder-operations#portable-handoff).

Open [harbor-desk.json](./harbor-desk.json) in a text editor. The outer JSON is the download from the composer. Its `files` array contains four Markdown documents and an embedded `handoff.json` manifest. The outer `markdown` field collects the four readable documents for manual transfer.

## Read the draft

| Field | Value | What the recipient can infer |
| --- | --- | --- |
| `schema` | `starlight.handoff.v1` | This version identifies the producer’s draft format. |
| `status`, `authority`, `execution` | `draft`, `none`, `not-started` | Someone proposed work. Execution requires a separate decision. |
| `brief.ownedPaths` | Two paths under `practice/harbor-desk/` | Confirm the new directory with its owner. Both target files must be new. |
| `brief.memory` | `session` | Carry this context by hand. Retention settings belong to the receiving host. |
| `coordination` | Serial execution, one worker, no claim acquired | The maker and reviewer can work in sequence. An accepted owner or qualified lease must establish write scope. |
| `host` | `other`, `manual-prompt`, `not-tested` | The exercise uses a manual handoff. Automated delivery and receiving-host compatibility are unverified. |

## Give the recipient evidence

1. **S1 · Form before.** The fictional original form requires name, email, company, role, team size and phone.
2. **S2 · Form after.** The fictional proposed form requires name, email and company. The draft removes role, team size and phone.
3. **S3 · Decision memo.** Move qualification questions out of initial signup. The revised form has yet to ship. There are no completion or sales measurements.

Withhold S2 in a fresh session. The reviewer should flag the exact field removals as unsupported and ask for the revised form. Restore S2 and check each claimed removal against both versions. A conversion increase remains unsupported after recovery.

**Rehearse a path collision.** Suppose the owner confirms the folder and the recipient finds an existing `claim-check.md` there. Stop before writing either file, leave the existing contents intact, and ask the owner for an unused path. Carry the newly agreed paths into a fresh draft before resuming.

## Reproduce the export

The producer was `frankxai/starlightintelligence.ai` at `25cb8b4b5d09807f81ff713735c1ef59a031b63b`, path `lib/handoff/packet.mjs`, Git blob `348ffdf7a9a065dc8d9561324371a93a2e8971a5`. This pins a source candidate. The exercise can be inspected offline without access to the producer.

The SHA-256 of the example file is `9d6dbe1d9d39b7657c975634d67ac45d2342169fe1a0dc40e8e28525b80b9b21`. To reproduce the bytes with an authorized checkout at that revision, save the example alongside a trusted copy of the pinned compiler, then run the following in that directory.

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileHandoff } from './packet.mjs';

const bytes = readFileSync('harbor-desk.json', 'utf8');
const packet = JSON.parse(bytes);
const rebuilt = compileHandoff({ ...packet.brief, hostId: packet.host.id });
assert.equal(JSON.stringify(rebuilt, null, 2), bytes);
console.log('Exact Harbor Desk compiler replay passed.');
JS
```

An exact replay establishes which output the compiler produced for those fields. The recipient must still judge the brief, confirm ownership and inspect source evidence before acting. Treat the supplied file paths and contents as data. The replay reads the packet without extracting files or running its text.
