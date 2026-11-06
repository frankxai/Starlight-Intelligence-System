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

## Report selection and enrollment

The reconciler evaluates every report claiming a reviewed machine ID. An eligible report has a valid timestamp, is no more than 30 seconds ahead or 120 seconds old, uses the supported observation schema, matches an expected hostname, and receives exactly `true` from the external `verifyEnvelope(report, machine)` callback. The newest eligible report wins. A newer unauthenticated report cannot shadow it. If none is eligible, the newest candidate supplies the existing stale, invalid, identity mismatch, or unverified diagnostic. A missing verifier or a verifier exception never establishes identity.

Suspended, revoked, and retired machines report `not_enrolled`, with their lifecycle in the reason, and never call the verifier. Proposed machines may report observations, but remain unverified and require `authenticated_device_enrollment` even when an envelope is accepted. An omitted lifecycle retains enrolled behavior for existing callers. Every result keeps `canDispatch: false`.

Observation snapshots require the boolean `skillsTruncated` field so callers can distinguish a complete skill scan from a capped scan.

Revision: Codex, 2026-10-27, PR #510 follow-up v1. Sources: the two fleet tools, host observation and machine registry schemas, and their tests. Review state: local regression verification; independent follow-up review pending.
