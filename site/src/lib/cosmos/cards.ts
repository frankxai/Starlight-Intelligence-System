// Built on SIP — structured registry for Starlight Cosmos knowledge cards.
// Source-of-truth for cosmos card metadata. Read by /cosmos (hub),
// /cosmos/cards (library) and /cosmos/cards/[slug] (detail).
//
// Design intent: every card is simultaneously a web page for humans and a
// future MCP resource for agents (cosmos://cards/{slug}) — see
// docs/superpowers/specs/2026-06-11-starlight-cosmos-design.md §8.
//
// Adding a card: append entry here, commit site/content/cosmos/{slug}.md
// alongside. Facts carry only well-established figures; estimates are
// labeled as estimates.

import type { Accent } from "@/lib/accents";

export type CardKind =
  | "star"
  | "planet"
  | "moon"
  | "asteroid"
  | "galaxy"
  | "nebula"
  | "element"
  | "law"
  | "concept"
  | "mission";

export const KIND_LABEL: Record<CardKind, string> = {
  star: "Star",
  planet: "Planet",
  moon: "Moon",
  asteroid: "Asteroid",
  galaxy: "Galaxy",
  nebula: "Nebula",
  element: "Element",
  law: "Law",
  concept: "Concept",
  mission: "Mission",
};

export const KIND_ACCENT: Record<CardKind, Accent> = {
  star: "amber",
  planet: "emerald",
  moon: "cyan",
  asteroid: "rose",
  galaxy: "violet",
  nebula: "fuchsia",
  element: "amber",
  law: "cyan",
  concept: "violet",
  mission: "fuchsia",
};

export type CosmosCard = {
  slug: string;
  title: string;
  kind: CardKind;
  /** Single-sentence summary for index cards + AEO. ~120-180 chars. */
  tldr: string;
  /** Key data points shown in the facts panel. Established figures only. */
  facts: { label: string; value: string }[];
  /** Prompts to explore — the thinking layer. Copy-paste into any agent. */
  prompts: string[];
  /** Source markdown filename under site/content/cosmos/. */
  contentFile: string;
  tags: string[];
  related: string[];
  sources: { label: string; url: string }[];
  updated: string; // ISO date of last editorial pass
};

const CARDS: CosmosCard[] = [
  // ── Stars + physics ─────────────────────────────────────────────
  {
    slug: "sol",
    title: "The Sun",
    kind: "star",
    tldr: "A G2V main-sequence star holding 99.86% of the solar system's mass — a self-regulating fusion reactor that has run stable for 4.6 billion years.",
    facts: [
      { label: "Spectral type", value: "G2V main-sequence" },
      { label: "Age", value: "~4.6 billion years" },
      { label: "Share of solar system mass", value: "99.86%" },
      { label: "Core temperature", value: "~15.7 million K" },
      { label: "Hydrogen fused", value: "~600 million tons/second" },
      { label: "Surface temperature", value: "~5,772 K" },
    ],
    prompts: [
      "The Sun balances gravity against radiation pressure for billions of years without a controller. What human-built systems achieve stability through opposing forces rather than active control — and where could that pattern apply next?",
      "The Sun converts mass to energy at 0.7% efficiency and still outputs 3.8×10²⁶ watts. Work through what that says about scale versus efficiency in system design.",
      "Estimate: how much of humanity's annual energy demand is one second of solar output? What does the gap imply about energy abundance as an engineering problem rather than a scarcity problem?",
    ],
    contentFile: "sol.md",
    tags: ["sun", "G2V star", "fusion", "proton-proton chain", "solar energy", "hydrostatic equilibrium"],
    related: ["stellar-fusion", "spectroscopy", "iron"],
    sources: [
      { label: "NASA Sun fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" },
      { label: "NASA Heliophysics", url: "https://science.nasa.gov/sun/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "stellar-fusion",
    title: "Stellar Fusion",
    kind: "concept",
    tldr: "How stars burn: quantum tunneling lets hydrogen fuse at 'only' 15 million K, releasing 0.7% of mass as energy — and the ladder ends at iron.",
    facts: [
      { label: "Dominant process (Sun)", value: "Proton-proton chain" },
      { label: "Dominant process (massive stars)", value: "CNO cycle" },
      { label: "Mass-to-energy efficiency", value: "~0.7%" },
      { label: "Fusion ladder endpoint", value: "Iron (Fe-56 region)" },
      { label: "First lab ignition (net gain)", value: "NIF, December 2022" },
    ],
    prompts: [
      "Fusion in stars is 'inefficient' (0.7%) yet powers everything. Fission is more efficient per reaction but scarcer in fuel. Compare fuel abundance vs conversion efficiency as competing axes in any energy system you might design.",
      "Quantum tunneling makes stellar fusion possible at temperatures classical physics says are too low. Where else does a system work only because of edge-case behavior the average-case model misses?",
      "We have one working fusion reactor design (a star: gravity-confined) and are attempting two others (magnetic, inertial). What does the confinement problem teach about substituting a force you don't have with engineering you do?",
    ],
    contentFile: "stellar-fusion.md",
    tags: ["fusion", "proton-proton chain", "CNO cycle", "quantum tunneling", "ITER", "NIF ignition", "fusion power"],
    related: ["sol", "iron", "supernova-nucleosynthesis"],
    sources: [
      { label: "DOE: NIF ignition", url: "https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition" },
      { label: "ITER", url: "https://www.iter.org/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "spectroscopy",
    title: "Spectroscopy — How Stars Tell Us Their Secrets",
    kind: "law",
    tldr: "Every element has a spectral barcode. Reading starlight revealed what stars are made of, found helium before Earth did, and proved the universe expands.",
    facts: [
      { label: "Fraunhofer lines catalogued", value: "1814" },
      { label: "Lines matched to elements", value: "Kirchhoff & Bunsen, 1859" },
      { label: "Helium found in Sun", value: "1868 — 27 years before on Earth" },
      { label: "Expansion of universe", value: "Hubble–Lemaître, via redshift" },
      { label: "Exoplanet atmospheres read by", value: "JWST transmission spectroscopy" },
    ],
    prompts: [
      "Spectroscopy turned starlight from scenery into a queryable database. What stream of data are you currently treating as scenery that could become a database with the right instrument?",
      "Helium was discovered in the Sun's spectrum before anyone found it on Earth. What does it mean for a detection method to outrun physical access — and where is that true in your domain?",
      "A redshifted spectrum encodes velocity; an absorption dip encodes chemistry. One signal, multiple orthogonal readings. Design a metric for your own system that carries more than one dimension of truth.",
    ],
    contentFile: "spectroscopy.md",
    tags: ["spectroscopy", "Fraunhofer lines", "redshift", "helium discovery", "exoplanet atmospheres", "stellar composition"],
    related: ["sol", "jwst", "supernova-nucleosynthesis"],
    sources: [
      { label: "NASA: Spectroscopy 101", url: "https://webbtelescope.org/contents/articles/spectroscopy-101--how-absorption-and-emission-spectra-work" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "gravity-and-orbits",
    title: "Gravity & Orbits",
    kind: "law",
    tldr: "Orbits are perpetual falling. Kepler described them, Newton explained them, Einstein corrected them — and delta-v, not distance, is the true cost of going anywhere.",
    facts: [
      { label: "Kepler's laws published", value: "1609–1619" },
      { label: "Newton's universal gravitation", value: "1687, Principia" },
      { label: "Einstein's correction", value: "General relativity, 1915" },
      { label: "True cost metric of spaceflight", value: "Delta-v (m/s), via the rocket equation" },
      { label: "Some NEAs vs lunar surface", value: "Energetically closer (lower delta-v)" },
    ],
    prompts: [
      "Delta-v, not distance, prices a space mission — some asteroids are cheaper to reach than the Moon's surface. What's the delta-v analog in your business: the real cost metric hiding behind the intuitive one?",
      "The rocket equation is tyrannical: payload fraction shrinks exponentially with delta-v. Refueling in space breaks the tyranny by splitting the problem. Where can you split an exponential problem into staged linear ones?",
      "Mercury's orbit disagreed with Newton by 43 arcseconds per century — a tiny anomaly that demanded a whole new theory. What small persistent anomaly in your data are you currently rounding away?",
    ],
    contentFile: "gravity-and-orbits.md",
    tags: ["gravity", "Kepler's laws", "rocket equation", "delta-v", "orbital mechanics", "general relativity", "Tsiolkovsky"],
    related: ["water-ice", "433-eros", "jupiter"],
    sources: [
      { label: "NASA: Basics of spaceflight", url: "https://science.nasa.gov/learn/basics-of-space-flight/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "supernova-nucleosynthesis",
    title: "Where the Elements Come From",
    kind: "concept",
    tldr: "The Big Bang made hydrogen and helium. Stars forged everything up to iron. Exploding stars and colliding neutron stars made the rest — including you.",
    facts: [
      { label: "Big Bang produced", value: "H, He, trace Li" },
      { label: "Stellar fusion produces", value: "Elements up to iron" },
      { label: "s-process site", value: "AGB stars (slow neutron capture)" },
      { label: "r-process sites", value: "Neutron-star mergers, some supernovae" },
      { label: "Direct r-process confirmation", value: "GW170817 kilonova, 2017" },
    ],
    prompts: [
      "Every element heavier than helium in your body was processed through at least one star. Trace one atom of the iron in your blood backwards — what's the minimum chain of events that put it there?",
      "The periodic table is a supply chain: different elements come from different cosmic factories with different throughputs. Map the bottleneck factory for the elements your industry depends on.",
      "GW170817 was heard in gravitational waves, then seen in light, then read in spectra — three independent instruments confirming one event. What would three-instrument confirmation look like for claims in your field?",
    ],
    contentFile: "supernova-nucleosynthesis.md",
    tags: ["nucleosynthesis", "r-process", "s-process", "supernova", "kilonova", "GW170817", "origin of elements"],
    related: ["gold", "iron", "stellar-fusion"],
    sources: [
      { label: "LIGO: GW170817", url: "https://www.ligo.caltech.edu/page/press-release-gw170817" },
    ],
    updated: "2026-06-11",
  },

  // ── Elements + resources ────────────────────────────────────────
  {
    slug: "gold",
    title: "Gold",
    kind: "element",
    tldr: "Forged in neutron-star collisions, delivered to Earth's crust by late impacts. Gold's scarcity is an astrophysical accident — all of it ever mined fits in a ~22 m cube.",
    facts: [
      { label: "Primary origin", value: "r-process (neutron-star mergers)" },
      { label: "GW170817 produced", value: "Several Earth-masses of heavy elements (est.)" },
      { label: "Crustal gold delivered by", value: "Late veneer impacts (post core formation)" },
      { label: "All gold ever mined", value: "~216,000 tons — a ~22 m cube" },
    ],
    prompts: [
      "Gold is scarce on Earth's surface because most of it sank into the core 4.5 billion years ago. Scarcity here is positional, not absolute. What resources in your world are positionally scarce rather than actually scarce?",
      "A single neutron-star merger makes more gold than humanity has ever mined. If supply is astronomically large but access is hard, is the asset the metal — or the access?",
      "Gold's price assumes today's supply curve. Model what happens to any 'store of value' when its supply mechanism changes regime (asteroid return, synthesis, algorithmic issuance).",
    ],
    contentFile: "gold.md",
    tags: ["gold", "r-process", "neutron star merger", "kilonova", "late veneer", "precious metals"],
    related: ["supernova-nucleosynthesis", "platinum-group-metals", "16-psyche"],
    sources: [
      { label: "LIGO: GW170817", url: "https://www.ligo.caltech.edu/page/press-release-gw170817" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "iron",
    title: "Iron",
    kind: "element",
    tldr: "The fusion endpoint and the most load-bearing element of civilization. Iron cores trigger supernovae; iron asteroids are exposed hearts of shattered protoplanets.",
    facts: [
      { label: "Binding energy peak", value: "Fe-56 region (Ni-62 technically highest)" },
      { label: "Fusion beyond iron", value: "Consumes energy — triggers core collapse" },
      { label: "Earth's core", value: "Iron-nickel alloy" },
      { label: "M-type asteroids", value: "Exposed cores of differentiated protoplanets" },
    ],
    prompts: [
      "Iron is where stellar fusion stops paying. Every system has an 'iron point' — the place where the strategy that built it stops returning energy. Where is the iron point of your current strategy?",
      "Planetary differentiation sorted metals by density into cores — then collisions re-exposed them as M-type asteroids. Catastrophe as an access mechanism: where else does breakage expose value that order had buried?",
      "Off-world industry will likely build with iron-nickel before anything exotic — the material is pre-smelted by nature. What's the 'already-refined' resource in your domain everyone overlooks while chasing the exotic one?",
    ],
    contentFile: "iron.md",
    tags: ["iron", "binding energy", "core collapse", "M-type asteroids", "planetary differentiation", "space manufacturing"],
    related: ["stellar-fusion", "16-psyche", "supernova-nucleosynthesis"],
    sources: [
      { label: "NASA Psyche mission", url: "https://science.nasa.gov/mission/psyche/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "platinum-group-metals",
    title: "Platinum-Group Metals",
    kind: "element",
    tldr: "Earth's PGMs mostly sank into the core; some asteroids carry concentrations above the richest mines. The catch: return too much and you crash the price.",
    facts: [
      { label: "The six PGMs", value: "Pt, Pd, Rh, Ir, Ru, Os" },
      { label: "Why rare in crust", value: "Siderophile — sank during differentiation" },
      { label: "Asteroid concentrations", value: "Can exceed richest crustal ores (estimates)" },
      { label: "Launch cost shift", value: "~$54,000/kg (Shuttle) → ~$1,500/kg (Falcon Heavy class)" },
    ],
    prompts: [
      "Run the supply-elasticity trap: returning 100 tons of platinum (~half of annual mined supply) would move the price how much? Build the back-of-envelope demand curve before believing any trillion-dollar asteroid headline.",
      "PGMs are valuable because they catalyze reactions at scale (autocatalysts, electrolyzers, fuel cells). Price the metal by the industrial capacity it unlocks, not by the spot market — does the business case change?",
      "Launch costs fell ~35x in two decades and every space business case from before is stale. Which assumption in your own industry's 'settled math' has quietly moved by an order of magnitude?",
    ],
    contentFile: "platinum-group-metals.md",
    tags: ["platinum", "PGM", "asteroid mining", "siderophile", "launch costs", "space economy", "supply elasticity"],
    related: ["gold", "16-psyche", "water-ice"],
    sources: [
      { label: "NSS asteroid mining feasibility study", url: "https://nss.org/wp-content/uploads/2023/05/the-technical-and-economic-feasibility-of-mining-the-near-earth-asteroids.pdf" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "water-ice",
    title: "Water Ice — The Oil of Space",
    kind: "element",
    tldr: "Water is propellant, shielding, and life support in one molecule. The near-term asteroid-mining business case is volatiles for in-space refueling — not platinum for Earth.",
    facts: [
      { label: "Propellant via", value: "Electrolysis → LOX/LH2" },
      { label: "Primary sources", value: "C-type asteroids, lunar polar cold traps" },
      { label: "Key economics", value: "Already at the top of the gravity well" },
      { label: "Active commercial bet", value: "Karman+ (volatiles for orbital refueling)" },
    ],
    prompts: [
      "Water launched from Earth costs thousands of dollars per kilogram in delta-v; water already in space costs extraction. Find the 'already up the gravity well' asset in your industry — the one priced by origin rather than position.",
      "One molecule serves three critical systems (propulsion, shielding, life support). What's the maximally multi-purpose primitive in your stack, and are you treating it as infrastructure or as a commodity?",
      "Refueling depots change mission architecture from single-throw to multi-hop. Sketch what 'depots' would look like for any supply chain you operate.",
    ],
    contentFile: "water-ice.md",
    tags: ["water ice", "ISRU", "volatiles", "propellant depot", "C-type asteroids", "space economy", "asteroid mining"],
    related: ["platinum-group-metals", "1-ceres", "101955-bennu", "gravity-and-orbits"],
    sources: [
      { label: "NASA ISRU", url: "https://www.nasa.gov/isru/" },
    ],
    updated: "2026-06-11",
  },

  // ── Asteroids ───────────────────────────────────────────────────
  {
    slug: "16-psyche",
    title: "16 Psyche",
    kind: "asteroid",
    tldr: "A ~226 km metal-rich world — possibly the exposed core of a shattered protoplanet. NASA's Psyche spacecraft arrives in 2029 to find out what it actually is.",
    facts: [
      { label: "Type / size", value: "M-type, ~226 km mean diameter" },
      { label: "Location", value: "Main belt, ~2.9 AU" },
      { label: "Metal fraction", value: "~30-60% by volume (estimates)" },
      { label: "NASA Psyche mission", value: "Launched Oct 2023, arrives Aug 2029" },
    ],
    prompts: [
      "The '$10 quintillion asteroid' headline prices Psyche at today's metal prices with infinite demand. Rebuild the estimate with a real demand curve — what is Psyche actually 'worth', and what does the exercise teach about valuing any unprecedented asset?",
      "Psyche may be a planetary core we can visit — the only way to study a core without destroying a planet. What inaccessible system in your field has an 'exposed core' analog you could study instead?",
      "The Psyche mission is calibration: ground truth for every remote metal-asteroid estimate. What single measurement, if you had it, would recalibrate your entire model of an opportunity?",
    ],
    contentFile: "16-psyche.md",
    tags: ["16 Psyche", "M-type asteroid", "metal asteroid", "NASA Psyche mission", "planetary core", "asteroid mining"],
    related: ["iron", "platinum-group-metals", "gold"],
    sources: [
      { label: "NASA Psyche mission", url: "https://science.nasa.gov/mission/psyche/" },
      { label: "JPL SBDB: 16 Psyche", url: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=16" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "101955-bennu",
    title: "101955 Bennu",
    kind: "asteroid",
    tldr: "A carbonaceous rubble pile that gave us 121.6 grams of pristine early solar system — organics, hydrated minerals, and a 1-in-2,700 impact question for 2182.",
    facts: [
      { label: "Type / size", value: "B-type carbonaceous, ~490 m" },
      { label: "Sample returned", value: "121.6 g — OSIRIS-REx, Sept 24, 2023" },
      { label: "Sample contains", value: "Amino acids, nucleobases, hydrated minerals" },
      { label: "Impact probability", value: "~1-in-2,700 cumulative through 2300" },
      { label: "Most-likely impact date", value: "Sept 24, 2182" },
    ],
    prompts: [
      "Bennu is simultaneously a science target, a resource prospect, and a hazard. One object, three completely different value frames. Pick something in your world and deliberately re-price it under three frames.",
      "The returned sample is ground truth that calibrates all remote sensing of carbonaceous asteroids. What's the cost of ground truth in your domain, and what does every decision made without it silently assume?",
      "A 1-in-2,700 chance 156 years out: too far to panic, too real to ignore. How should a civilization price low-probability, high-consequence, long-horizon risks — and how does your own planning horizon compare?",
    ],
    contentFile: "101955-bennu.md",
    tags: ["Bennu", "OSIRIS-REx", "sample return", "carbonaceous asteroid", "planetary defense", "organics"],
    related: ["water-ice", "433-eros", "1-ceres"],
    sources: [
      { label: "NASA OSIRIS-REx", url: "https://science.nasa.gov/mission/osiris-rex/" },
      { label: "CNEOS Sentry: Bennu", url: "https://cneos.jpl.nasa.gov/sentry/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "1-ceres",
    title: "Ceres",
    kind: "asteroid",
    tldr: "The main belt's dwarf planet: ~940 km across, roughly a quarter water by mass, with salty brines still seeping to its surface. The belt's natural depot.",
    facts: [
      { label: "Class / size", value: "Dwarf planet, ~940 km diameter" },
      { label: "Water content", value: "~25% by mass (estimates)" },
      { label: "Explored by", value: "Dawn orbiter, 2015–2018" },
      { label: "Occator bright spots", value: "Sodium carbonate brines from subsurface" },
    ],
    prompts: [
      "Ceres holds more fresh water (as ice) than Earth does. If the belt ever industrializes, Ceres is the watering hole — position, not just composition. Map the 'Ceres' of any network you operate in: the node that wins by location.",
      "Dawn found a possible relict ocean world where textbooks expected a dead rock. List the 'dead rocks' in your mental map that you haven't re-examined since you first labeled them.",
      "Depot economics: one large source with infrastructure vs many small sources without. When does concentration beat distribution for supply networks?",
    ],
    contentFile: "1-ceres.md",
    tags: ["Ceres", "dwarf planet", "Dawn mission", "Occator", "brines", "water", "main belt"],
    related: ["water-ice", "101955-bennu", "europa"],
    sources: [
      { label: "NASA Dawn mission", url: "https://science.nasa.gov/mission/dawn/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "433-eros",
    title: "433 Eros",
    kind: "asteroid",
    tldr: "The first asteroid ever orbited and landed on — in 2001, with a spacecraft never designed to land. Proof that NEA prospecting is solved, decades-old engineering.",
    facts: [
      { label: "Type / size", value: "S-type, ~16.8 km" },
      { label: "Rank", value: "Second-largest near-Earth asteroid" },
      { label: "First orbited", value: "NEAR Shoemaker, Feb 2000" },
      { label: "First landed on", value: "Feb 12, 2001 (improvised)" },
    ],
    prompts: [
      "NEAR Shoemaker landed on Eros without landing gear, twenty-five years ago. The prospecting playbook exists; what's missing is economics, not engineering. Name a capability in your field that's 'proven but unpriced' — waiting for a business model, not an invention.",
      "Eros was surveyed down to its element ratios from orbit. Given that data exists for one body, what's the marginal cost of the same survey for the next thousand — and what does that curve do to the value of being first?",
      "An improvised landing succeeded because the team understood the system deeply enough to exceed its spec. When has spec-exceeding worked for you, and what made it safe rather than reckless?",
    ],
    contentFile: "433-eros.md",
    tags: ["Eros", "NEAR Shoemaker", "near-Earth asteroid", "S-type", "asteroid prospecting"],
    related: ["101955-bennu", "16-psyche", "gravity-and-orbits"],
    sources: [
      { label: "NASA NEAR Shoemaker", url: "https://science.nasa.gov/mission/near-shoemaker/" },
      { label: "JPL SBDB: 433 Eros", url: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=433" },
    ],
    updated: "2026-06-11",
  },

  // ── Galaxies + missions + worlds ────────────────────────────────
  {
    slug: "milky-way",
    title: "The Milky Way",
    kind: "galaxy",
    tldr: "Our barred spiral home: 100,000+ light-years across, 100-400 billion stars, a 4-million-solar-mass black hole at the center — and we've mapped a sliver.",
    facts: [
      { label: "Type", value: "Barred spiral (SBbc)" },
      { label: "Disk diameter", value: "~100,000+ light-years" },
      { label: "Stars", value: "100–400 billion" },
      { label: "Central black hole", value: "Sgr A*, ~4 million solar masses (EHT image 2022)" },
      { label: "Our galactic orbit", value: "~225–250 million years" },
    ],
    prompts: [
      "The star-count uncertainty for our own galaxy spans 4x (100-400 billion). We live inside the dataset and still can't count it. What does measuring-from-inside do to any system's self-knowledge — including an organization's?",
      "The Sun has completed ~18-20 galactic orbits. Civilization spans less than 0.000005 of one. Use that ratio to stress-test what 'long-term' means in your planning.",
      "Sgr A* anchors the orbits of the whole galaxy while emitting almost nothing. Identify the quiet mass at the center of any system you're part of — the thing everything orbits but nobody watches.",
    ],
    contentFile: "milky-way.md",
    tags: ["Milky Way", "barred spiral", "Sagittarius A*", "galactic structure", "Event Horizon Telescope"],
    related: ["andromeda", "sol", "jwst"],
    sources: [
      { label: "EHT: Sgr A* image", url: "https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "andromeda",
    title: "Andromeda (M31)",
    kind: "galaxy",
    tldr: "The nearest large spiral, a trillion stars, 2.5 million light-years out — and the long-promised collision with us may actually be a coin flip.",
    facts: [
      { label: "Distance", value: "~2.5 million light-years" },
      { label: "Stars", value: "~1 trillion" },
      { label: "Naked-eye visible", value: "Yes — most distant unaided object" },
      { label: "Milky Way merger", value: "~4.5 Gyr (classic); 2025 Gaia analyses: ~50/50 within 10 Gyr" },
    ],
    prompts: [
      "The Andromeda collision went from textbook certainty to coin flip when measurement precision improved. Which 'certain' long-range forecast in your field rests on error bars nobody has rechecked?",
      "Photons from Andromeda left 2.5 million years ago — pre-Homo. Every observation is time travel; every dataset is a delayed snapshot. Where does data latency silently distort your picture of the present?",
      "Galaxy mergers don't collide stars — the spacing is too vast; they reshape orbits. When two large organizations merge, what actually collides and what merely reshapes?",
    ],
    contentFile: "andromeda.md",
    tags: ["Andromeda", "M31", "galaxy merger", "Gaia", "Local Group"],
    related: ["milky-way", "jwst", "spectroscopy"],
    sources: [
      { label: "NASA: Andromeda", url: "https://science.nasa.gov/universe/galaxies/andromeda-galaxy/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "jwst",
    title: "James Webb Space Telescope",
    kind: "mission",
    tldr: "A 6.5 m gold-coated infrared eye at L2 with 344 single-point failures that all worked. It found the early universe surprisingly mature — and reads exoplanet air.",
    facts: [
      { label: "Primary mirror", value: "6.5 m, 18 gold-coated beryllium segments" },
      { label: "Orbit", value: "Sun–Earth L2, ~1.5 million km" },
      { label: "Wavelengths", value: "0.6–28.5 μm (infrared)" },
      { label: "Operating temperature", value: "Below ~50 K" },
      { label: "Launched / first images", value: "Dec 25, 2021 / July 12, 2022" },
    ],
    prompts: [
      "JWST shipped with 344 single-point failures and zero repair options. What discipline of review would your projects need before you'd bet everything on a deploy you can never patch?",
      "Webb sees in infrared because the early universe's light has been stretched out of the visible. To see further, change instruments, not effort. Where are you straining at a problem that needs a different sensor instead of more force?",
      "JWST's early-galaxy findings forced revisions to formation models within months. List the observations that would force a model revision in your work — and whether you're actually pointed at them.",
    ],
    contentFile: "jwst.md",
    tags: ["JWST", "infrared astronomy", "L2", "deep field", "exoplanet atmospheres", "early galaxies"],
    related: ["spectroscopy", "andromeda", "milky-way"],
    sources: [
      { label: "Webb (NASA)", url: "https://science.nasa.gov/mission/webb/" },
      { label: "ESA Webb image gallery", url: "https://esawebb.org/images/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "europa",
    title: "Europa",
    kind: "moon",
    tldr: "An ice-wrapped ocean world holding more liquid water than all of Earth's seas, kept warm by tidal kneading. Clipper arrives 2030 to ask if anything lives there.",
    facts: [
      { label: "Diameter", value: "~3,122 km" },
      { label: "Ocean depth", value: "~60–150 km under 15–25 km of ice (estimates)" },
      { label: "Liquid water", value: "More than all Earth's oceans combined" },
      { label: "Energy source", value: "Tidal flexing from Jupiter" },
      { label: "Europa Clipper", value: "Launched Oct 2024, arrives 2030" },
    ],
    prompts: [
      "Europa's ocean is heated by gravity, not sunlight — energy from orbital geometry. Inventory the non-obvious energy sources in any system you run: what's powered by position rather than fuel?",
      "Clipper will fly ~50 flybys instead of orbiting, trading elegance for radiation survival. When has the 'uglier' architecture been the one that survives contact with your environment?",
      "If life exists under Europa's ice, biology is a planetary default, not an Earth anomaly. How would that single bit of information re-price every assumption about our place in the universe — and what's the equivalent single-bit discovery in your field?",
    ],
    contentFile: "europa.md",
    tags: ["Europa", "ocean world", "tidal heating", "Europa Clipper", "astrobiology", "Jupiter moons"],
    related: ["jupiter", "1-ceres", "mars"],
    sources: [
      { label: "NASA Europa Clipper", url: "https://science.nasa.gov/mission/europa-clipper/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "mars",
    title: "Mars",
    kind: "planet",
    tldr: "0.38 g, a whisper of atmosphere, and the first place humanity made oxygen on another world. The case for Mars is a systems-engineering problem, not a romance.",
    facts: [
      { label: "Gravity", value: "0.38 g" },
      { label: "Atmosphere", value: "~6 mbar, mostly CO2" },
      { label: "Day length", value: "24h 37m" },
      { label: "First ISRU demo", value: "MOXIE made O2 from CO2, 2021–2023" },
      { label: "Sample caching", value: "Perseverance, Jezero crater" },
    ],
    prompts: [
      "MOXIE proved you can manufacture a consumable on arrival instead of shipping it. Apply ISRU thinking to your own operations: what do you currently ship that you could make at the destination?",
      "Mars settlement pencils out only as a closed-loop systems problem: energy, water, air, radiation, dust — each a dependency of the others. Draw the dependency graph; which single node, failing, cascades worst?",
      "The romantic case for Mars precedes the economic one by a century. When does narrative-before-economics accelerate a field, and when does it distort it? Find one example of each in your own industry.",
    ],
    contentFile: "mars.md",
    tags: ["Mars", "ISRU", "MOXIE", "Perseverance", "Jezero", "settlement", "sample return"],
    related: ["water-ice", "europa", "jupiter"],
    sources: [
      { label: "NASA Mars exploration", url: "https://science.nasa.gov/mars/" },
    ],
    updated: "2026-06-11",
  },
  {
    slug: "jupiter",
    title: "Jupiter",
    kind: "planet",
    tldr: "2.5x the mass of every other planet combined — the solar system's gravitational architect, debris shield (debatably), and free momentum source for every outbound mission.",
    facts: [
      { label: "Scale", value: "11x Earth's diameter" },
      { label: "Mass", value: "2.5x all other planets combined" },
      { label: "Confirmed moons", value: "95" },
      { label: "Magnetosphere", value: "Largest structure in the solar system" },
      { label: "Great Red Spot", value: "Shrinking for over a century" },
    ],
    prompts: [
      "Every outbound mission borrows momentum from Jupiter via gravity assist — energy nobody pays for. Identify the 'gravity assist' in your domain: the massive installed base whose momentum you can borrow instead of building.",
      "Jupiter shaped the entire solar system's architecture by existing — clearing zones, flinging material, anchoring resonances. What's the Jupiter of your market: the mass whose gravity defines everyone else's stable orbits?",
      "The shield hypothesis (Jupiter protects Earth from comets) is genuinely contested — it deflects some impactors and redirects others toward us. Take a protective institution you rely on and argue both sides of its shield hypothesis.",
    ],
    contentFile: "jupiter.md",
    tags: ["Jupiter", "gas giant", "gravity assist", "magnetosphere", "Great Red Spot", "solar system architecture"],
    related: ["europa", "gravity-and-orbits", "sol"],
    sources: [
      { label: "NASA Jupiter", url: "https://science.nasa.gov/jupiter/" },
    ],
    updated: "2026-06-11",
  },
];

export const COSMOS_CARDS = CARDS;

export const CARD_BY_SLUG: Record<string, CosmosCard> = Object.fromEntries(
  CARDS.map((c) => [c.slug, c])
);

export const CARD_SLUGS = CARDS.map((c) => c.slug);

/** Kinds in display order for the library index. */
export const KIND_ORDER: CardKind[] = [
  "asteroid",
  "element",
  "star",
  "planet",
  "moon",
  "galaxy",
  "law",
  "concept",
  "mission",
  "nebula",
];

export function cardsByKind(): { kind: CardKind; cards: CosmosCard[] }[] {
  return KIND_ORDER.map((kind) => ({
    kind,
    cards: CARDS.filter((c) => c.kind === kind),
  })).filter((g) => g.cards.length > 0);
}

/** Featured picks for the /cosmos hub. */
export function featuredCards(): CosmosCard[] {
  const picks = ["16-psyche", "spectroscopy", "jwst", "water-ice", "andromeda", "gold"];
  return picks.map((s) => CARD_BY_SLUG[s]).filter(Boolean);
}

/** Asteroid + resource cards for /asteroids. */
export function miningCards(): CosmosCard[] {
  const picks = [
    "16-psyche",
    "101955-bennu",
    "1-ceres",
    "433-eros",
    "platinum-group-metals",
    "water-ice",
    "gold",
    "iron",
  ];
  return picks.map((s) => CARD_BY_SLUG[s]).filter(Boolean);
}
