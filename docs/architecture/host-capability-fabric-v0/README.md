# Starlight Universal Host Capability Fabric — v0 prototype

**Source-tested, read-only pilot.** Not installed on either user's machine, connected to ChatGPT, enrolled, deployed, or authorized to execute work.

This package extends the Starlight Intelligence System agent lifecycle and the existing private Ops machine-bus authority without inventing a new scheduler or replacing SIS #398.

## Run locally (Node.js 22+)

```powershell
node tools/fleet/host-scout.mjs --machine-id yogabook --project-root C:\path\to\my-project > .\\host-observation.private.json
node tools/fleet/host-scout.mjs --machine-id c940 --project-root C:\path\to\my-project > .\\host-observation.private.json
node --test test/host-scout.test.mjs test/reconcile-hosts.test.mjs
```

The first command must be run on the **actual Yoga Book**, the second on the **actual C940**. Do not run both on one host to simulate two real machine receipts. `--machine-id` is only a claimed label; it is not proof of physical identity. Be careful where private machine reports are saved or shared.

## What this establishes

- Static installation evidence for named CLIs on PATH, without executing them.
- Skill manifest presence and hashes in commonly used Claude/Codex/OpenCode/AGENTS paths.
- Names of configured MCP servers, not credentials or claimed connectivity.
- User Claude plugin registrations, project npm dependency declarations and resource headroom.
- An integrity checksum of the locally generated report (not a digital signature).
- Deterministic reconciliation against a reviewed allowlist; no invented current runtime state or remote dispatch rights.

## What it intentionally does not do

- Does not claim that credentials are authenticated, models funded, gateways running, MCPs connected, skills loaded, or cloud sessions visible.
- Does not discover process/session state (existing SIS Queen lifecycle inspector owns this).
- Does not create, stop, cancel, or resume a CLI or cloud job.
- Does not connect ChatGPT to local processes. That requires an enrolled outbound node agent, an authenticated broker and OAuth-backed MCP plugin.
- Does not mirror Syncthing state or publish local inventory to GitHub.

See `docs/architecture/HOST-CAPABILITY-FABRIC.md` for architecture, placement model, real execution boundaries, security, future API tool contracts and staged acceptance.
