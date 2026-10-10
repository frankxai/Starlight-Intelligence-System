---
name: business/digital-product-forge
domain: business
description: Architect, audit, package, and distribute sovereign digital products, lead magnets, and multi-tier funnels across the 20+ estate brands. Enforces zero AI slop, empirical engineering grounding, SHA-256 package assembly, and multi-platform distribution (Lemon Squeezy, Whop, GitHub Sponsors).
triggers:
  keywords: ["digital product", "digital products", "lead magnet", "product forge", "forge", "funnel", "agy-products", "lemon squeezy", "whop", "gumroad", "product catalog"]
  agents: ["starlight-business", "starlight-orchestrator", "starlight-navigator", "starlight-genius"]
  intents: ["digital_products", "funnel_architecture", "monetization", "release_engineering"]
priority: high
load_level: core
---

# Digital Product Forge & Estate Funnel Architecture

> *"A digital product is not a PDF with high margins. A digital product is an operational substrate: runnable code, active memory vaults, and empirical frameworks that collapse the buyer's time-to-first-value to under 180 seconds."*

**Built on SIP § Sovereign Distribution**

## Purpose

The **Digital Product Forge** (`C:\Users\frank\digital-product-forge`) is the unified production studio for digital products, lead magnets, and multi-brand conversion ladders across Frank's 20+ estate brands (FrankX, Arcanea, ACOS, Second Brain, DPI, VibeClubs, GenCreator, etc.).

This skill instructs agents how to:
1. Navigate the master product catalog (`forge.config.json`).
2. Enforce the **Anti-Slop Humanizer Standard** on all documentation, copy, and prompts.
3. Assemble distribution packages (`.zip`) with SHA-256 integrity checksums and cryptographic `SIP-ATTESTATION.json` certificates.
4. Process purchase webhooks from Lemon Squeezy and Whop to mint sovereign license keys.
5. Synchronize estate catalog data between Forge and live production websites (`frankx-money-unlocked/data/products.json`).

## Tooling & Fast Terminal Shortcuts

- **Dedicated Repo**: `C:\Users\frank\digital-product-forge`
- **Antigravity YOLO CLI Shortcut**: `agy-products` (or `agyprod`, `agyforge`)
- **CLI Commands**:
  - `node bin/forge.js catalog`: View all 4 clusters and 20 brands.
  - `node bin/forge.js audit [path]`: Audit text against the 5 Cardinal Prohibitions.
  - `node bin/forge.js funnel [brand]`: Validate 4-tier funnel flow.
  - `node bin/forge.js build`: Compile markdown to print HTML in `dist/`.
  - `node bin/forge.js package [prodId]`: Assemble release bundles in `dist/packages/`.
  - `node bin/forge.js sync [--push]`: Audit or push products to live website.
  - `node bin/forge.js webhook [provider] [id]`: Simulate purchase and license minting.
  - `node bin/forge.js marketplace [id]`: Generate copy for Whop, Lemon Squeezy, GitHub Sponsors.
  - `node bin/forge.js test`: Run 13-part automated test suite.

## The Five Cardinal Anti-Slop Rules

Before any digital product or lead magnet is released, it must pass `core/humanizer/anti-slop.js`:
1. **No Announcement Fluff**: Prohibit "In this comprehensive guide", "We are thrilled to unveil", "Step into a world where".
2. **No Hollow Superlatives**: Prohibit "game-changing", "revolutionary", "seamlessly", "tapestry", "delve".
3. **No Monotone Parallel Syntax**: Sentence length standard deviation must be >= 4.0 (short punchy sentences alternating with detailed technical sentences).
4. **Mandatory Empirical Grounding**: Text must contain verified code, exact metrics, or reproducible steps.
5. **Clear Mechanism Over Abstraction**: Name the exact mechanism (e.g. "SQLite FTS5 Porter stemming with 90-day half-life decay", not "AI memory optimization").

## 4-Tier Funnel Architecture

Every estate brand follows a 4-tier ladder:
- **Tier 0: Lead Magnet ($0)** — Frictionless entry, high TTFV (<180s), captures email or attention.
- **Tier 1: Entry Substrate ($19 - $67)** — Solves one acute operational bottleneck immediately.
- **Tier 2: Core Substrate ($97 - $297)** — Full operating system, runnable codebase, or active vault.
- **Tier 3: Flagship Guild / Bespoke Sprint ($997 - $2,997+)** — High-touch integration, private mesh access.

## Merchant & Compliance Architecture

- **Merchant of Record (MoR)**: All transactional sales route through Lemon Squeezy or Polar to eliminate EU VAT, US state sales tax, and chargeback liabilities.
- **App Store / Community**: Whop Storefront is leveraged for community role gates and developer app discovery.
- **Attestation**: Every release zip carries `SIP-ATTESTATION.json` and displays `Built on SIP`.
