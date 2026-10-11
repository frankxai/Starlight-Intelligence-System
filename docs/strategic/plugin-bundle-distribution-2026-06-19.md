# Plugin Bundle Distribution Plan

Date: 2026-06-19
Owner: FrankX AI / Starlight Intelligence
Bundle registry: `C:\Users\frank\starlight\repos\Starlight-Intelligence-System\dist\plugins\starlight-plugin-bundles-2026-06-19.registry.json`
Builder: `C:\Users\frank\starlight\repos\Starlight-Intelligence-System\scripts\Build-PluginBundles.ps1`

This plan turns the plugin product doctrine into downloadable artifacts.

## Release Architecture

Use three distribution layers:

| Layer | Artifact | Public status | Job |
| --- | --- | --- | --- |
| Product kit | Six one-plugin ZIPs | Public-ready wrappers | Let a user install one clear capability |
| Public suite | Six public wrapper plugins | Public-ready wrapper suite | Give outsiders the coherent Starlight Intelligence Modules experience |
| Private suite | Full 52-plugin estate | Private-only | Preserve internal operating power without leaking private strategy |

The public wrapper plugins are intentionally not the private operating plugins. They are clean product-line modules designed for external users.

## Public Product Kits

| Kit | Artifact | SHA-256 | Status |
| --- | --- | --- | --- |
| Founder Command Kit | `starlight-founder-command-kit-2026-06-19.zip` | `D22002A6856CD43D1169B4156966FE6FFE5B5F954924ADC6BBE5C18235DD5FE3` | Public-ready wrapper |
| Revenue Engine Kit | `starlight-revenue-engine-kit-2026-06-19.zip` | `018B73298A8CF4D3674AF826F1D6F19A2FB96B4BC0858DB34AE1BD708B3EE8DE` | Public-ready wrapper |
| Starlight System Module | `starlight-system-module-2026-06-19.zip` | `DA7EE9F78A29A8B2CFA0B6624A932E1FA8684C6B6BA1DD13AABEB82FCD874914` | Public-ready wrapper |
| Arcanea World Engine | `arcanea-world-engine-kit-2026-06-19.zip` | `25683CD6A5D07CAEFA40FA91811CA985DA958BD76CE0B6570BECB89C0036D209` | Public wrapper after IP review |
| Enterprise AI Kit | `starlight-enterprise-ai-kit-2026-06-19.zip` | `DE911DA82A4E39A07979989B49DC5C27280F39BE94969489B1789FC3460B1838` | Public-ready wrapper |
| Creator Product Kit | `starlight-creator-product-kit-2026-06-19.zip` | `08F8DB92780608AFBB350EA451CCDB544BD680D8B01B24C0C1EAB31E02A06A03` | Public-ready wrapper |

## Public Suite

| Artifact | SHA-256 | Marketplace | Plugins |
| --- | --- | --- | --- |
| `starlight-intelligence-modules-public-suite-2026-06-19.zip` | `D37133C3CB60A32D578984E30EF34711FAA6B4F45456321F0127FBCA6804AD30` | `starlight-public-modules` | `founder-command-kit`, `revenue-engine-kit`, `starlight-system-module`, `arcanea-world-engine`, `enterprise-ai-kit`, `creator-product-kit` |

Install:

```bash
unzip starlight-intelligence-modules-public-suite-2026-06-19.zip
codex plugin marketplace add <path-to-extracted-bundle>
codex plugin add founder-command-kit@starlight-public-modules
codex plugin add revenue-engine-kit@starlight-public-modules
codex plugin add starlight-system-module@starlight-public-modules
codex plugin add arcanea-world-engine@starlight-public-modules
codex plugin add enterprise-ai-kit@starlight-public-modules
codex plugin add creator-product-kit@starlight-public-modules
```

## Private Suite

| Artifact | SHA-256 | Status |
| --- | --- | --- |
| `starlight-private-plugin-suite-2026-06-19-52.zip` | `60C9C39AD7ABB19D370A2F2AEDCA061139A864A96ED6A54FD47E7105579ACF34` | Private-only |

The private suite includes all 52 FrankX/Starlight personal plugins and must not be published as-is.

## Site Placement

| Site | Role |
| --- | --- |
| `starlightintelligence.org/download` | Primary technical download page for public modules and machine-readable manifests |
| `frankx.ai/downloads` | Founder, enterprise, and buyer-facing router into the relevant download or advisory path |
| GitHub Releases | Source of truth for versioned ZIPs, checksums, release notes, and archival assets |
| Arcanea public surfaces | Creative context for Arcanea World Engine after final IP review |

## Publication Gate

Public wrapper suite status: `clear-with-notes`.

Notes:

- Public wrappers exclude private operating plugins and private registries.
- Public staging scan found no `C:\Users\...` local path leakage.
- Arcanea World Engine is a public wrapper but should receive final IP/naming review before broad non-draft promotion.
- The 52-plugin suite remains private-only.

## GitHub Prerelease

Published prerelease:

`https://github.com/frankxai/Starlight-Intelligence-System/releases/tag/starlight-intelligence-modules-2026-06-19`

The prerelease includes the six product-kit ZIPs, the public suite ZIP, each checksum, and the public bundle registry. Keep `starlightintelligence.org/download#starlight-intelligence-modules` and `/download/plugins/latest.json` pointed at that tag.
