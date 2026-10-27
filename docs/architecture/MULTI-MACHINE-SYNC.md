# Multi-machine sync policy

Status: decided 2026-10-27 by Claude on Frank's delegation. Frank can overrule any line. Tooling: `tools/sync-doctor/`.

## Why this exists

An audit on 2026-10-27 found three problems on the main machine.

1. The vault's `.git` folder lives inside OneDrive. Files On-Demand left parts of it as cloud placeholders: `git fsck` and `git bundle` fail with `mmap failed`, and copying `.git` fails with Windows error 362 (cloud file provider not running). The repository still reads for everyday commands, which hides the damage.
2. The nightly reflect commits locally and never pushes. One commit existed only on this machine.
3. Syncthing is configured (one folder, the swarm bus, shared with the Yoga Book over Tailscale) but is not running, and has not synced since 14 October.

Also found: every commit uses one author identity, two tracked files (`.obsidian/graph.json`, `_meta/reflect-cron.log`) change on every run, and a 16 MB derived export (`.starlight/graphiti_episodes.jsonl`) sits untracked in the vault.

## The rule: one owner per kind of data

| Data | Owner (source of truth) | Moves by | Never moves by |
| --- | --- | --- | --- |
| Curated notes | The vault git repo (`frankxai/second-brain-vault`, private) | `git pull` and `git push` | OneDrive, Syncthing, copy |
| Atlas index (`atlas.sql`, SQLite, D1) | Derived from the vault | Rebuilt on each machine from its own clone | Copying a database file |
| Heartbeats, claims, small messages between machines | The swarm bus folder | Syncthing over Tailscale | Git |
| Raw private captures (`private/`, `oracle-work/`) | The machine that captured them | Encrypted backup only | Any sync, any other machine |
| Secrets | Infisical | Its own CLI | Vault, bus, git |
| Derived exports (Graphiti episodes, embeddings, `.smart-env/`) | Regenerated | Not synced | Git, OneDrive |

A database or a git directory must never sit in a folder that a file-sync tool watches.

## Where the vault lives

Target: a plain clone outside OneDrive (`C:\Users\frank\vault\second-brain` on Windows), with git as the only way machines exchange notes. Interim (done 2026-10-27): a healthy clone at `~/.starlight/vault-mirror/second-brain-vault`, used for all pushes while the OneDrive copy stays read-only history. Do not run `git push` from a repository `sync-doctor` reports as unreadable.

Moving the live vault is gated on one fact: whether any other machine opens the vault through OneDrive. If one does, deleting `.git` here makes OneDrive delete it there. Confirm first, then move, then keep the old folder read-only for two weeks.

## Who writes what

- Each machine writes only to its own zone: `_inbox/<machine>/`, plus the agent write-zones in the vault's `CLAUDE.md`. Nobody edits the same note on two machines.
- One machine is the curator (today: c940). Only the curator runs the nightly reflect and merges inboxes into `patterns/`, `people/`, and `_meta/`.
- Agents commit as `claude@<machine>`; humans commit as themselves. A commit's author says which machine and which kind of writer produced it.
- Before the nightly run: `git pull --ff-only`. After: push to `nightly/<machine>`, never directly to `main`. A human (or the merge steward after a different-family review) fast-forwards `main`.
- Machine noise is never tracked: `.obsidian/graph.json`, `.obsidian/workspace*.json`, `.smart-env/`, `*.log`, `.starlight/`.

## The other laptop

Default-deny. Until Frank confirms who manages it, it receives a sparse checkout that excludes `oracle-work/`, `private/` and `A Home/`, and it holds no vault write access to `main`. It contributes through its own branch `machine/<name>` and `_inbox/<name>/`.

## Tailscale

- Use it as the private network between Frank's own machines: the swarm bus address, `tailscale serve` for a loopback-only Atlas MCP, and (when Frank enables it) Tailscale SSH to reach a machine that has no open remote shell.
- Tag machines (`tag:agent-host`) and give the tags the narrowest ACL that works. Enabling SSH or changing ACLs is Frank's click.
- Cloudflare Access stays the path for the community and phones; Tailscale is for Frank's own machines. Do not use one to replace the other.

## Syncthing

- Scope: the swarm bus only. Receive-only on machines that should not write; file versioning on; ignore `.git`, `node_modules`, `*.db`, `*.sqlite`.
- Starting it again is a decision, not a fix: check what is in the bus first (`block-smb-tailscale.ps1`, `claims/`, `control-mirror/`), and that the Yoga Book is awake.

## Graphiti

Not now. It adds a graph database and an LLM extraction call per episode to a vault of a few hundred notes. A first export exists (`graphiti_episodes.jsonl`, 2026-06-30) and stays derived. Revisit when one of these is true: the vault passes about 5,000 notes; Atlas serves several users with separate vaults; `atlas eval` shows temporal or entity questions failing on keyword search. If adopted, it is a read-side index rebuilt from the vault, never the source of truth.

## Backups

The vault repo is private on GitHub (the off-machine copy) plus the mirror clone. `sync-doctor` warns when no backup is under 7 days old. Raw captures in `private/` and `oracle-work/` are not on GitHub and need an encrypted backup of their own (not set up).

## Checks

`node tools/sync-doctor/sync-doctor.mjs` is read-only. It reports Tailscale peers (dark over 48 h), Syncthing state, vault git health (cloud-folder `.git`, unreadable repo, unpushed or behind commits, noise files, single author, stale nightly) and backup age. Exit 1 on any failure; `--strict` also fails on warnings; `--json` for machines.

## Open for Frank

1. Does any other machine open the vault through OneDrive?
2. Is the other laptop managed by an employer?
3. May the merge steward fast-forward `nightly/<machine>` into `main`, or do you do it?
4. What is the `arcanea` Linux node, and should it join the mesh?
