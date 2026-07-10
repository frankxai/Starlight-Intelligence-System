# Activation Router Manifest Compatibility

Date: 2026-07-10

## Decision

- Keep `Starlight-Intelligence-System/plugins/starlight-activation-router` as the canonical Git-backed source.
- Remove the unsupported top-level `plugin.json.hooks` field and the obsolete hook declaration.
- Keep `/si`, `/so`, and `/acos` activation in bundled skills and prompt templates.
- Keep `scripts/install-codex-prompts.ps1` as the explicit slash-prompt installer.
- Keep `scripts/route-prompt.mjs` as an explicit diagnostic evaluator; it is not an automatic lifecycle hook or permission boundary.

Source version: `0.1.0+codex.20260710101637`.

## Validation

- Official `plugin-creator/scripts/validate_plugin.py`: passed.
- `skill-creator/scripts/quick_validate.py`: passed for `starlight-si`, `starlight-so`, and `acos-router`.
- `node --check scripts/route-prompt.mjs`: passed.
- Route fixtures: `/si`, `/so`, `/acos`, mobile `si:`, and destructive-command policy decision passed.
- Isolated prompt installer smoke: copied `si.md`, `so.md`, and `acos.md` into a temporary Codex home.
- Manifest assertions: no `hooks` field, no obsolete hook declaration, and exactly three default prompts.

## Pickup Boundary

After source validation and a cachebuster update, reinstall `starlight-activation-router@starlight-local`
through the Codex plugin command and start a new task. Do not edit the installed cache or marketplace
JSON by hand.
