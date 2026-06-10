# RELEASING — keeping npm in sync with the repo

> Why this file exists: the npm registry once served
> `@arcanea/starlight-intelligence-system@6.0.1` while this repo was at `8.1.0`.
> Anyone following the README install path got a build two majors stale — wrong
> MCP tools, wrong counts. A release is not done until the registry version
> matches the repo version. This checklist makes that the default.

## Source of truth

- **Package version:** `package.json::version` (mirrored in `package-lock.json`).
- **Doc surfaces that must match it:** README version badge + footer,
  `CLAUDE.md` footer, `AGENTS.md` footer. These are guarded — drift fails CI:
  - `npm run agents:harness-check` (asserts `CLAUDE.md` carries the package version)
  - `test/v80-platform-prompts.test.ts` (asserts every `*Starlight Intelligence
    System vX.Y.Z` footer equals `package.json::version`)

## Cutting a release

1. **Land all changes** on a branch and open a PR. Ensure green:
   ```bash
   npm run lint
   npm test
   npm run build
   npm run agents:harness-check
   ```
2. **Bump the version** (semver — additive features = minor, fixes = patch):
   ```bash
   npm version <patch|minor|major> --no-git-tag-version
   ```
   Then reconcile the doc footers to the new version (the guards above tell you
   exactly which file drifted if you miss one):
   - README badge (`img.shields.io/badge/version-X.Y.Z`) + README footer line
   - `CLAUDE.md` footer (`*Starlight Intelligence System vX.Y.Z*`)
   - `AGENTS.md` footer + `@arcanea/starlight-intelligence-system vX.Y.Z` line
3. **Add a `CHANGELOG.md` entry** at the top (`## vX.Y.Z — <ISO date>`).
4. **Re-run the guards** so the bump is internally consistent:
   ```bash
   npm run agents:harness-check && npm test
   ```
5. **Merge**, then publish from a clean checkout of `main`:
   ```bash
   npm ci
   npm run build
   npm publish --access public
   ```
   `prepublishOnly` (`npm run build && npm run test:substrate`) runs
   automatically as a final gate.
6. **Verify the registry matches the repo:**
   ```bash
   npm view @arcanea/starlight-intelligence-system version   # == package.json::version
   ```
7. **Tag the release** on GitHub (`vX.Y.Z`) so the README badge link resolves.

## Drift guard

Keep registry and repo from silently diverging again:

```bash
# Compare the published version against this checkout. Non-zero on drift.
test "$(npm view @arcanea/starlight-intelligence-system version)" \
  = "$(node -p "require('./package.json').version")" \
  && echo "in sync" || echo "DRIFT: registry != repo"
```

This is intentionally a manual/release-time check rather than a blocking CI job:
it needs network access to the registry and a published release can legitimately
lag an unreleased `main`. Run it as step 6 of every release, and any time you
suspect drift.

**Built on SIP** · operational tier (release discipline)
