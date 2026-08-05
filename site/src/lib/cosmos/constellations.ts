// Built on SIP — star chart data for /cosmos/constellations.
// J2000 coordinates: ra in hours, dec in degrees, mag = apparent magnitude.
// Positions are accurate to chart precision (~0.01h / 0.1°) — good for a
// stylized sky map, not for pointing a telescope. The projection happens in
// ConstellationMap.tsx.

export type ChartStar = {
  id: string;
  name: string;
  /** Right ascension, hours (J2000). */
  ra: number;
  /** Declination, degrees (J2000). */
  dec: number;
  /** Apparent visual magnitude (lower = brighter). */
  mag: number;
  /** One-line note shown on hover via <title>. */
  note?: string;
};

export type Constellation = {
  slug: string; // matches the cosmos card slug
  name: string;
  tagline: string;
  stars: ChartStar[];
  /** Stick-figure lines as pairs of star ids. */
  lines: [string, string][];
  /** The three reading layers. */
  science: string;
  myth: string;
  navigation: string;
};

export const CONSTELLATIONS: Constellation[] = [
  {
    slug: "orion",
    name: "Orion",
    tagline: "The hunter on the celestial equator — visible from every inhabited place on Earth.",
    stars: [
      { id: "betelgeuse", name: "Betelgeuse", ra: 5.919, dec: 7.407, mag: 0.5, note: "M-type red supergiant, ~550 ly — see its own card" },
      { id: "bellatrix", name: "Bellatrix", ra: 5.418, dec: 6.35, mag: 1.64, note: "B2 giant, ~245 ly — the nearest of Orion's bright stars" },
      { id: "meissa", name: "Meissa", ra: 5.585, dec: 9.934, mag: 3.39, note: "The hunter's head — a hot O8 star ~1,100 ly away" },
      { id: "alnitak", name: "Alnitak", ra: 5.679, dec: -1.943, mag: 1.77, note: "Belt east — O9.5 supergiant beside the Flame Nebula" },
      { id: "alnilam", name: "Alnilam", ra: 5.604, dec: -1.202, mag: 1.69, note: "Belt center — B0 supergiant, roughly 1,300+ ly, farthest of the belt" },
      { id: "mintaka", name: "Mintaka", ra: 5.533, dec: -0.299, mag: 2.23, note: "Belt west — sits almost exactly on the celestial equator" },
      { id: "saiph", name: "Saiph", ra: 5.796, dec: -9.67, mag: 2.09, note: "B0.5 supergiant — as hot as Rigel, dimmer only in visible light" },
      { id: "rigel", name: "Rigel", ra: 5.242, dec: -8.202, mag: 0.13, note: "Blue supergiant, ~860 ly — Orion's brightest star" },
    ],
    lines: [
      ["meissa", "betelgeuse"],
      ["meissa", "bellatrix"],
      ["betelgeuse", "alnitak"],
      ["bellatrix", "mintaka"],
      ["alnitak", "alnilam"],
      ["alnilam", "mintaka"],
      ["alnitak", "saiph"],
      ["mintaka", "rigel"],
      ["saiph", "rigel"],
    ],
    science:
      "The stars span ~245 to ~1,300+ light-years — the figure exists only from Earth's line of sight. Below the belt hangs M42, the nearest massive star-forming region.",
    myth:
      "Greek hunter, Egyptian Osiris, and a dozen other figures — nearly every culture drew someone on these seven stars.",
    navigation:
      "Mintaka rides the celestial equator: Orion's belt rises almost due east and sets almost due west, anywhere on Earth.",
  },
  {
    slug: "ursa-major",
    name: "Ursa Major — the Big Dipper",
    tagline: "The sky's most useful machine: two stars that always point to north.",
    stars: [
      { id: "dubhe", name: "Dubhe", ra: 11.062, dec: 61.751, mag: 1.79, note: "Pointer star — not part of the moving group" },
      { id: "merak", name: "Merak", ra: 11.031, dec: 56.383, mag: 2.37, note: "Pointer star — Merak→Dubhe extended ~5× lands on Polaris" },
      { id: "phecda", name: "Phecda", ra: 11.897, dec: 53.695, mag: 2.44, note: "Bowl — Ursa Major Moving Group member" },
      { id: "megrez", name: "Megrez", ra: 12.257, dec: 57.033, mag: 3.31, note: "Faintest of the seven — bowl meets handle" },
      { id: "alioth", name: "Alioth", ra: 12.9, dec: 55.96, mag: 1.77, note: "Brightest of the seven — moving group member" },
      { id: "mizar", name: "Mizar", ra: 13.399, dec: 54.925, mag: 2.27, note: "With Alcor: a naked-eye double that's really six stars" },
      { id: "alkaid", name: "Alkaid", ra: 13.792, dec: 49.313, mag: 1.86, note: "Handle's end — like Dubhe, just passing through" },
    ],
    lines: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
    science:
      "Five of the seven share real motion through the galaxy — the nearest stellar moving group. Dubhe and Alkaid are unrelated photobombers, so the Dipper is slowly deforming.",
    myth:
      "A bear across Greek, Indigenous North American, and Siberian traditions — and the Drinking Gourd whose handle pointed escapes north on the Underground Railroad.",
    navigation:
      "Merak→Dubhe extended about five times its length lands on Polaris — latitude and true north from one glance, no instrument required.",
  },
  {
    slug: "crux",
    name: "Crux — the Southern Cross",
    tagline: "The smallest constellation finds the pole the southern sky doesn't mark.",
    stars: [
      { id: "acrux", name: "Acrux", ra: 12.443, dec: -63.099, mag: 0.77, note: "Foot of the cross — a multiple system of hot B stars" },
      { id: "mimosa", name: "Mimosa", ra: 12.795, dec: -59.689, mag: 1.25, note: "East arm — B0.5 giant, ~280 ly" },
      { id: "gacrux", name: "Gacrux", ra: 12.519, dec: -57.113, mag: 1.64, note: "Head — a red giant ~89 ly away, nearest M giant to the Sun" },
      { id: "imai", name: "Imai", ra: 12.252, dec: -58.749, mag: 2.79, note: "West arm — B2 star" },
      { id: "ginan", name: "Ginan", ra: 12.356, dec: -60.401, mag: 3.59, note: "The fifth star — its name comes from the Wardaman people" },
    ],
    lines: [
      ["acrux", "gacrux"],
      ["mimosa", "imai"],
    ],
    science:
      "Beside the cross sits the Coalsack — a dark nebula visible as a hole in the Milky Way — and the Jewel Box open cluster.",
    myth:
      "In Aboriginal Australian sky knowledge the Coalsack forms the head of the Emu in the Sky — a constellation drawn in darkness, not light. Five nations carry Crux on their flags.",
    navigation:
      "No southern pole star exists: extend the Acrux–Gacrux axis ~4.5 times and you've computed the south celestial pole.",
  },
  {
    slug: "cassiopeia",
    name: "Cassiopeia",
    tagline: "The W that never sets — and the sky's loudest radio source.",
    stars: [
      { id: "caph", name: "Caph", ra: 0.153, dec: 59.15, mag: 2.28, note: "F2 giant, ~54 ly" },
      { id: "schedar", name: "Schedar", ra: 0.675, dec: 56.537, mag: 2.24, note: "K0 giant — the queen's heart" },
      { id: "gamma-cas", name: "γ Cassiopeiae", ra: 0.945, dec: 60.717, mag: 2.47, note: "Eruptive variable — center of the W; navigation star 'Navi'" },
      { id: "ruchbah", name: "Ruchbah", ra: 1.43, dec: 60.235, mag: 2.68, note: "A5 star, eclipsing variable" },
      { id: "segin", name: "Segin", ra: 1.907, dec: 63.67, mag: 3.35, note: "B-class giant, ~410 ly" },
    ],
    lines: [
      ["caph", "schedar"],
      ["schedar", "gamma-cas"],
      ["gamma-cas", "ruchbah"],
      ["ruchbah", "segin"],
    ],
    science:
      "Home to Cassiopeia A — the brightest radio source in the sky beyond the solar system — and to Tycho's 1572 supernova, the 'new star' that broke celestial permanence.",
    myth:
      "The vain queen of Aethiopia, condemned to circle the pole on her throne forever — visibility as punishment.",
    navigation:
      "Circumpolar from mid-northern latitudes and opposite the Big Dipper across Polaris: when the Dipper is low, the W is high.",
  },
];

export const CONSTELLATION_BY_SLUG: Record<string, Constellation> =
  Object.fromEntries(CONSTELLATIONS.map((c) => [c.slug, c]));
