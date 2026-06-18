# Starlight distribution doctrine

The public Intelligence System Module is open core.

## Source of truth

- GitHub Releases host the downloadable artifacts and checksums.
- `https://starlightintelligence.org/download` is the canonical human download and validation guide.
- `https://frankx.ai` is the business adoption layer for services, operator guides, consulting, and premium bundles.

Do not duplicate release binaries across sites unless there is a specific outage or mirror policy. Link to the GitHub Release assets and publish checksums beside them.

## First public package

The first package is `starlight-sip-starter-vX.Y.Z`.

It contains the portable SIP Core starter:

- `AGENTS.md`
- `SKILL.md`
- `MEMORY.md`
- `SOUL.md`
- `STACK.md`
- `CANON.md`
- `SIP.md`
- `SIP-QUICKSTART.md`
- `public-vault/`
- `mcp.json.example`
- `starlight-module.json`
- `install.sh` and `install.ps1`
- `validate-sip-starter.mjs`
- onboarding, release notes, validation, excellence, and upgrade docs

This is intentionally not the full Starlight operational runtime. The starter gives adopters the sovereign file contract first; the runtime remains the upgrade path through `@arcanea/starlight-intelligence-system`.

## Release standard

Every public module release must include:

- ZIP and TAR.GZ archives.
- SHA256 checksum file.
- `release-manifest.json`.
- Installers for Unix/macOS/Linux and Windows PowerShell.
- A local validator that can run after installation.
- GitHub Release notes pointing to the canonical download page.
- A passing `npm run verify`.
- A passing `npm run package:sip-starter:check`.

## Site posture

The core starter download stays ungated. Lead capture belongs around added-value materials: operator guides, implementation reviews, workshops, and business packages. This preserves open protocol trust while giving FrankX a clean commercial path.

Automation should use `https://starlightintelligence.org/download/latest.json` as the stable release index, then fetch binaries from GitHub Releases.

Built on SIP - Starlight Intelligence Protocol.
