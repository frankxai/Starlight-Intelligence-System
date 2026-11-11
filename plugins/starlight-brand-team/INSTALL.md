# Optional installation

Start with START-HERE.md for a normal chat. It requires no terminal. These routes are for people already using coding agents. File installation needs Node.js 18 or later; there are no npm dependencies. Keep the chosen host's own account and permissions configured separately.

## Copy the skill into one private project

Download or clone the source, then use the package folder as your working directory. Choose one host and a separate private workspace. The same commands work in a shell or PowerShell with Node available; quote paths containing spaces.

```sh
node install.mjs claude "/path/to/private-workspace"
node install.mjs codex "/path/to/private-workspace"
node install.mjs antigravity "/path/to/private-workspace"
node install.mjs opencode "/path/to/private-workspace"
```

Run only the command for the host you choose. Codex and Antigravity share the same .agents location; installing both into the same project is unnecessary and the second install is refused.

| Target | Project destination |
| --- | --- |
| Claude Code | .claude/skills/starlight-brand-team/ |
| Codex | .agents/skills/starlight-brand-team/ |
| Antigravity App, CLI and IDE | .agents/skills/starlight-brand-team/ |
| OpenCode | .opencode/skills/starlight-brand-team/ |

The installer copies only the contained skill and its references. Existing skill folders, global settings, AGENTS.md and CLAUDE.md are preserved. A repeated install refuses to overwrite. To upgrade, compare and back up the old skill yourself before replacing it. To remove, delete only this named skill folder after preserving any edits; no account service remains running.

Open that private project in the chosen host and start a new session. Ask: "Use starlight-brand-team. Run the fictional demo from its references, then show the claim review."

Verify that the host reports the skill and can read all its references. When it cannot, paste START-HERE.md's prompt instead. Merely opening this repository or connecting GitHub does not load the prompt.

## Claude Code plugin and marketplace

The package's .claude-plugin/plugin.json and skills/ folder are a Claude Code plugin. From the full repository root, the catalog is .claude-plugin/marketplace.json. The named catalog contains only this bounded starter; the full SIS runtime is not installed by the entry.

For an exact reviewed local checkout, run these commands in Claude Code's terminal:

```sh
claude plugin validate ./plugins/starlight-brand-team
claude plugin validate .
claude plugin marketplace add .
claude plugin install starlight-brand-team@starlight-starters
```

For a temporary local session, from outside this source repository:

```sh
claude --plugin-dir "/absolute/path/to/plugins/starlight-brand-team"
```

Then invoke `/starlight-brand-team:starlight-brand-team` with the fictional demo request. Do not also copy the skill into .claude/skills in the same workspace. The catalog supplies source metadata. Anthropic directory listing and approval remain unverified. A draft branch is not available from the default branch's marketplace until reviewed and merged. Use the pinned source checkout for this evaluation.

## Other plugin hosts

plugin.json follows Agent Plugins 1.0; .codex-plugin/plugin.json is a compatibility overlay. A local Codex catalog entry is supplied in .agents/plugins/marketplace.json. These files do not register a public listing. The project-copy route above is the bounded installation path; native Codex plugin installation remains unverified.

Antigravity and OpenCode receive the same skill instructions through their documented skill paths. This package does not supply an OpenCode JavaScript extension, Antigravity background runtime or hosted connector. Host discovery and behavior must be checked in the installed version.

## Maintainer checks

```sh
node scripts/build-first-use.mjs
node --test scripts/starter.test.mjs
```

Run from this package directory. These checks validate packaging and filesystem behavior. Model quality and the recipient's environment require separate checks.
