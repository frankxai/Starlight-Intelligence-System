# Local document ingestion

Recovered and revised by Codex, 11 November 2026, revision 1. Original converter,
metadata and local folder prototype: Antigravity session
`8d454f2c-c201-4754-876a-d2e4198f499d`. Review state: focused tests and type checking;
independent review pending. Built on SIP, operational tier.

Convert a local HTML, plain-text or Markdown export into a reviewable Markdown
file. Stage a folder of local exports without changing the source or overwriting
existing intake files. This starts no service and makes no network request.

From an installed checkout:

```sh
node --import tsx tools/ingestion/gdoc-converter.ts source.html --out reviewed.md
node --import tsx tools/ingestion/drive-sync.ts --source ./document-drops --dry-run
node --import tsx tools/ingestion/drive-sync.ts --source ./document-drops
```

The folder command writes to `.intake/` under the current working directory.
The `syncDriveFolder` API also accepts an explicit `targetDir`. Source and target
must not overlap. Each input is limited to 16 MiB. `.gdoc` files are shortcuts,
so export their document content first. PDF and JSON can be retained as raw local
files; this tool does not extract their text. DOCX is unsupported.

Google lists a native `text/markdown` export for Google Docs in its
[supported export formats](https://developers.google.com/workspace/drive/api/guides/ref-export-formats).
Prefer that source when it preserves the document you need. The folder command
retains `.md` files as raw bytes. HTML conversion is a fallback for existing local
exports, with limited support for common elements. It does not reproduce CSS
classes, complex nested lists, images, equations, comments or full document layout.
Review the converted output against its source before promoting it.

Raw staging and conversion use one bounded input snapshot. The metadata includes
its SHA-256 and source path. `created_at` dates the conversion record, not the
original document. Author is omitted unless explicitly supplied through the API.
Vault classification is a keyword heuristic, not factual verification or permission
to write into a vault. Imported content is marked as untrusted input. It receives
no document attestation or automatic memory promotion.

Dry runs report `planned` items and zero transfers/conversions. Matching staged
raw input and an existing conversion are retained and reported as `skipped`;
this does not revalidate a prior conversion. Changed raw input or output-name
collisions report `failed` and leave existing files alone. CLI failures exit nonzero.
Exclusive creation prevents overwrite by a concurrent writer. A disk or I/O failure
can leave a newly created partial file or a retained raw copy; inspect it and choose
a fresh output path. The tool never deletes existing output to make a retry pass.

The converter's `--out` also refuses existing files. To preserve an existing
Markdown frontmatter block without adding another, use `--no-frontmatter`.
Code fences, Unicode joiners, source hashes, active-link rejection and CLI retry
behavior have focused regression coverage. This converter is not a general-purpose
Markdown sanitizer or a replacement for the receiving application's security checks.

```sh
node --import tsx --test --test-concurrency=1 test/gdoc-converter.test.ts test/drive-sync.test.ts
```

Source references: the original Antigravity files, the owning repository's
`AGENTS.md` and `CLAUDE.md`, and Google's export-format documentation inspected
on 11 November 2026. No Drive credentials, cloud mesh, research scheduler or
additional memory service is activated by this slice.
