# The Starlight Interconnection Mesh

> How every repo — yours, the community's, any dev's — stays discoverable and
> updated across every AI harness. One registry, one append-only log, one write
> contract. No service to run, no lock-in. Built on SIP.

---

## The problem it solves

AI coding harnesses (Claude, Codex, Cursor, Gemini, Antigravity) each keep their
own local memory. Work done in one is invisible to the others, and a new repo is
invisible to all of them. At estate scale (this account: 185+ repos) the result
is drift: parallel builds nobody's system knows about. The mesh makes GitHub —
the one surface every harness already touches — the shared nervous system.

## The three primitives

| Primitive | File | Who writes it |
|---|---|---|
| **Registry** | `context/repo-registry.json` | the poller (auto) |
| **Bus** | `memory/bus/atoms.jsonl` | the poller + every harness |
| **Write contract** | `.mesh.json` + `scripts/mesh-atom.mjs` | every session on wrap |

Two motions keep it live:
- **Discover** — `scripts/org-poller.mjs` polls GitHub, finds new/updated repos, writes `repo.discovered` / `repo.updated` atoms.
- **Update** — `scripts/mesh-atom.mjs` writes a `session.end` atom + a `MEMORY.md` line whenever any harness finishes work.

## Join in one command (adopters / community / other devs)

From inside the repo you want to wire in:

```bash
node /path/to/Starlight-Intelligence-System/scripts/install-mesh.mjs
```

That writes `.mesh.json`, ensures a local bus, and prints the snippet to add to
your `AGENTS.md` / `CLAUDE.md`. Done — your repo now reports into the digest.

## Run the discovery poller

On any host with a GitHub token (a cloud routine, a CI job, your laptop):

```bash
GITHUB_TOKEN=ghp_… node scripts/org-poller.mjs           # live
GITHUB_TOKEN=ghp_… node scripts/org-poller.mjs --dry-run # report only
```

It refreshes the registry snapshot and prints a digest of what changed — the
same digest the scheduled routine relays.

## Write a session atom (any harness, on wrap)

```bash
node scripts/mesh-atom.mjs \
  --harness claude \
  --summary "one plain line — no hype" \
  --next "what the next session should pick up"
```

Repo, branch, and recent commits are inferred from git. It appends to the bus
and updates `MEMORY.md`, which stays authoritative per repo — the bus only
indexes across repos.

## Design rules

- **Append-only bus.** Consolidation summarizes into the vaults; it never mutates atoms.
- **No secrets in atoms.** Summaries and identifiers only — never tokens, keys, or file contents.
- **`MEMORY.md` is per-repo truth.** The mesh is an index over it, not a replacement.
- **Convention over service.** A JSONL file and a JSON registry in git. Anyone can read, append, or fork it.

## Status

Layer 0 (registry) and the Layer 1 poller ship in this repo. See
`docs/architecture/interconnection-mesh.md` for the full 6-layer plan and the
create/install/wire checklist.

---

Built on SIP. Built by [Frank Riemer](https://frankx.ai). For builders, not consumers.
