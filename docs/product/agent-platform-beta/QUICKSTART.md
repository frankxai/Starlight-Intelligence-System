# Agent platform beta — local quickstart

Requires Node.js and the SIS package. These commands are offline and repository-scoped; run them from the repository where you want the projection. The existing `starlight init` and `starlight doctor` commands remain separate SIS features.

```sh
starlight team doctor
starlight team plan
starlight team verify
```

`verify` is a no-spend deterministic fixture. It does not launch Claude Code, invoke a provider, or prove a live agent result. Inspect the planned source, destination, tools, and gates before any install. If the plan says `ready-to-install`, an opt-in Claude Code projection is available:

```sh
starlight team install --yes --accept-hash <contentHash-from-plan>
starlight team verify
starlight team rollback --yes
```

Installation creates only `.claude/agents/starlight-team-guide.md` and `.starlight/team-install.v1.json` in the current repository. The reviewed content hash must match at apply time. It refuses an existing target and does not overwrite global configuration, copy credentials, run post-install code, or invoke an agent. Rollback removes only the installed file when its hash still matches; if it changed, the command stops to preserve your work. Empty directories remain.

Use `--root PATH` to name a different repository directory, `--json` for machine-readable output, and `--host codex` to see the preview-only verdict. This beta does not yet install a Codex or cloud adapter. A claimed `installed-not-host-verified` state means the file exists; it does not claim that the host enforced the read-only tool list. Run a separate live host-enforcement test before using it on sensitive work.

TypeScript/ESM consumers can import `@arcanea/starlight-intelligence-system/foundry` for scanner, composer, router, and team-plan APIs. The API exposes source hashes and decision reasons; it does not grant execution authority.
