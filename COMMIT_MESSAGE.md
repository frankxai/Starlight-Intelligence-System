feat(visuals): expand FrankX Omega assets and system infographics (149-174)

This commit introduces a new batch of premium visual assets to the Starlight Intelligence System, ranging from 149 to 174. 

Highlights:
- **Domain Specialist 3D Mascot Studies (149-160):** Expanded Omega Codex into Health, Music, and People sub-stacks (e.g., Bio-Architect, Sound Composer, Talent Scout).
- **Expanded Swarm Fields (161-165):** Abstract generative visualizations of agent swarms (Creative, Healing, Ledger, etc.).
- **The Queen Narratives (166-170):** Cinematic scale shots of the Queen conducting, weaving, and archiving.
- **Advanced System Infographics (171-174):** Premium 3D artistic foundations for topologies and the 144-Agent Blueprint.

Wiring Changes:
- `site/src/lib/queen-visuals.ts`: Added new arrays (`DOMAIN_OMEGA_ASSETS`, `EXPANDED_SWARM_FIELDS`, etc.) and integrated them into `STAR_GUARDIAN_SOURCES`.
- `site/src/app/visuals/brand-lab/page.tsx`: Created new UI sections to display the Domain Sub-Stacks, Swarm Fields, Queen Archetypes, and Infographics with metadata.

All newly promoted assets are securely added to both `brand-assets/` and `site/public/assets/visuals/queen-premium/`.
