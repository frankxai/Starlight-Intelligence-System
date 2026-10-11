/**
 * Cinematic stills for the Deep Field viewport.
 *
 * Decorative only — never carry essential copy. Generated 2026-08-31 with
 * grok-imagine-image-quality (xAI Imagine). CDN advertised image/png; bytes
 * are JPEG 1280×720. Committed as .jpg under 1 MiB. No baked-in text.
 */
export const CINEMATIC_STILLS = {
  spiral: "/assets/cinematic/galaxy-spiral.jpg",
  deepField: "/assets/cinematic/galaxy-deep-field.jpg",
  nursery: "/assets/cinematic/galaxy-nursery.jpg",
  veil: "/assets/cinematic/galaxy-veil.jpg",
} as const;

export type CinematicStill = keyof typeof CINEMATIC_STILLS;

export const NAV_GROUP_STILLS: Record<string, CinematicStill> = {
  Explore: "deepField",
  Build: "nursery",
  Learn: "veil",
};

export const PAGE_STILLS: Record<string, CinematicStill> = {
  "/": "spiral",
  "/cosmos": "spiral",
  "/cosmos/gallery": "deepField",
  "/cosmos/cards": "deepField",
  "/cosmos/constellations": "veil",
  "/asteroids": "nursery",
  "/palace": "veil",
  "/queen": "spiral",
  "/verticals": "nursery",
  "/knowledge-tree": "veil",
  "/vaults": "veil",
  "/protocol": "veil",
  "/research": "veil",
  "/explainer": "veil",
  "/docs": "veil",
  "/changelog": "veil",
  "/constitution": "veil",
  "/quickstart": "nursery",
  "/download": "nursery",
  "/deploy": "nursery",
  "/cockpit": "nursery",
  "/architecture": "nursery",
  "/badge": "veil",
  "/benediction": "veil",
  "/featured": "deepField",
};
