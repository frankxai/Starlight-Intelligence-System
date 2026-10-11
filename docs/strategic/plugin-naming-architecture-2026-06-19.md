# Plugin Naming Architecture

Date: 2026-06-19
Owner: FrankX AI / Starlight Intelligence
Registry: `C:\Users\frank\plugins\plugin-naming.registry.json`
Product system doctrine: `C:\Users\frank\starlight\repos\Starlight-Intelligence-System\docs\strategic\plugin-product-system-doctrine-2026-06-19.md`

This naming pass upgrades the plugin portfolio from internal work labels to a product-grade intelligence system.

## Naming Doctrine

Use two layers:

1. Stable slug: the installed plugin ID. Keep it stable unless the benefit of a breaking migration clearly exceeds the support cost.
2. Product name: the display name, short description, long description, and category users actually see. Elevate this immediately.

Reserve `Ops` for cases where operations is the actual product promise. Do not use it as a default suffix.

At portfolio scale, use the broader product doctrine:

- Public plugins are Starlight Intelligence Modules.
- Skills are plain-language methods inside modules.
- Bundles are Kits or Suites.
- FrankX names should stay founder/business-facing.
- Starlight names should stay infrastructure, intelligence, memory, proof, release, and orchestration-facing.
- Arcanea names should stay magical-world, canon, lore, worldbuilding, media, and creator-studio-facing.
- Arcanea language should not leak into professional, enterprise, checkout, revenue, or founder-command modules unless the public surface is explicitly an Arcanea bridge.

## Word System

| Word | Use for |
| --- | --- |
| Command | Founder, estate, and mission-control systems |
| Engine | Repeatable production and conversion systems |
| Forge | Creation, packaging, and transformation systems |
| Lab | Experimental, eval, prompt, audio, or research systems |
| Graph | Relationship maps, repo/domain/business intelligence |
| Registry | Inventory, ownership, domains, and canonical source maps |
| Memory | Long-lived context, recall, and evidence |
| Shield / Veil | Protection, privacy, IP, and public/private boundaries |
| Studio | Creative production systems |
| Marketplace | Product catalog, drops, and monetized distribution |

## Applied Upgrades

The portfolio now has 52 personal plugins. Of those, 35 legacy/internal plugins received elevated product-facing names and descriptions, six clean public wrapper plugins were added as product-line modules, and `agentic-music-os` was discovered as an existing product-grade plugin.

| Stable slug | Product name | Future slug candidate |
| --- | --- | --- |
| `pricing-packaging-ops` | Offer Architecture | `offer-architecture` |
| `checkout-revenue-ops` | Checkout Engine | `checkout-engine` |
| `ai-agent-marketplace-ops` | Agent Marketplace | `agent-marketplace` |
| `analytics-growth-ops` | Growth Analytics | `growth-analytics` |
| `arcanea-genesis-flow-ops` | Arcanea Genesis | `arcanea-genesis` |
| `arcanea-world-repo-ops` | Arcanea World Repos | `arcanea-world-repos` |
| `arcanea-claw-media-ops` | ArcaneaClaw Media | `arcanea-claw-media` |
| `arcanea-creator-forge-ops` | Arcanea Creator Forge | `arcanea-creator-forge` |
| `arcanea-marketplace-ops` | Arcanea Marketplace | `arcanea-marketplace` |
| `arcanea-studio-ops` | Arcanea Studio | `arcanea-studio` |
| `business-data-room-ops` | Business Data Room | `business-data-room` |
| `domain-registry-ops` | Domain Registry | `domain-registry` |
| `ecosystem-graph-ops` | Ecosystem Graph | `ecosystem-graph` |
| `enterprise-ai-coe-ops` | Enterprise AI CoE | `enterprise-ai-coe` |
| `frankx-business-command` | FrankX Command | `frankx-command` |
| `frankx-repo-harness` | Repo Harness | `repo-harness` |
| `health-intelligence-ops` | Health Intelligence | `health-intelligence` |
| `ip-shield-ops` | IP Shield | `ip-shield` |
| `oracle-migration-ops` | Oracle Migration | `oracle-migration` |
| `partner-licensing-ops` | Partner Licensing | `partner-licensing` |
| `partner-portal-ops` | Partner Portal | `partner-portal` |
| `release-site-ops` | Release Sites | `release-sites` |
| `site-download-page-ops` | Download Pages | `download-pages` |
| `starlight-memory-ops` | Starlight Memory | `starlight-memory` |
| `starlight-swarm-ops` | Starlight Swarm | `starlight-swarm` |
| `suno-release-ops` | Suno Release Engine | `suno-release-engine` |
| `support-knowledge-base-ops` | Support Knowledge Base | `support-knowledge-base` |
| `visual-intelligence-ops` | Visual Intelligence | `visual-intelligence` |
| `vibe-os-frequency-lab` | Vibe Frequency Lab | `vibe-frequency-lab` |
| `prompt-eval-lab` | Prompt Evaluation Lab | `prompt-evaluation-lab` |
| `skill-to-plugin-forge` | Plugin Forge | `plugin-forge` |

## Public Wrapper Plugins

These plugins use clean slugs immediately because they were created as public product modules rather than migrations of existing internal operating plugins.

| Plugin slug | Product name | Product line |
| --- | --- | --- |
| `founder-command-kit` | Founder Command Kit | Founder Command |
| `revenue-engine-kit` | Revenue Engine Kit | Revenue Engine |
| `starlight-system-module` | Starlight System Module | Starlight Intelligence System |
| `arcanea-world-engine` | Arcanea World Engine | Arcanea World Engine |
| `enterprise-ai-kit` | Enterprise AI Kit | Enterprise AI |
| `creator-product-kit` | Creator Product Kit | Creator Products |

## Product-Grade Discovery

| Plugin slug | Product name | Product line |
| --- | --- | --- |
| `agentic-music-os` | Agentic Music OS | Music and release systems |

## Migration Rule

Future slug renames should be handled as a deliberate V2 migration:

1. Create the new slug as a marketplace-backed plugin.
2. Keep the old slug temporarily as an alias/deprecation bridge.
3. Validate source and installed cache for both.
4. Rebuild the private suite.
5. Update release docs, install snippets, and any automation that references the old slug.

Do not rename folders in place without a compatibility plan.

## Result

- Personal plugins: 52
- Slugs containing `ops`: 29
- Product display names ending in `Ops`: 0
- Product display names containing `Ops`: 1, intentionally `Agentic Ops Harness`
- Public wrapper plugins with clean slugs: 6
- Existing product-grade discovery: `agentic-music-os`
- Immediate user-facing quality: upgraded
- Install compatibility: preserved
