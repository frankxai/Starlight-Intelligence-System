import type { MetadataRoute } from "next";
import { RESEARCH_SLUGS } from "@/lib/research";
import { CARD_SLUGS } from "@/lib/cosmos/cards";

const BASE = "https://starlightintelligence.org";

const STATIC_ROUTES = [
  "",
  "/constitution",
  "/perspectives/personal-superintelligence-for-everyone",
  "/protocol",
  "/download",
  "/deploy",
  "/quickstart",
  "/architecture",
  "/explainer",
  "/verticals",
  "/research",
  "/knowledge-tree",
  "/knowledge-tree/explore",
  "/academy/graphs",
  "/cockpit",
  "/docs",
  "/vaults",
  "/featured",
  "/benediction",
  "/badge",
  "/cosmos",
  "/cosmos/gallery",
  "/cosmos/cards",
  "/cosmos/constellations",
  "/asteroids",
  "/queen",
  "/palace",
] as const;

const VERTICAL_SLUGS = [
  "health-intelligence",
  "people-intelligence",
  "sound-intelligence",
  "music-is",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1.0
        : path === "/protocol" || path === "/download" || path === "/deploy" || path === "/quickstart" || path === "/research"
          ? 0.9
          : 0.7,
  }));

  const verticalEntries: MetadataRoute.Sitemap = VERTICAL_SLUGS.map((slug) => ({
    url: `${BASE}/verticals/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const researchEntries: MetadataRoute.Sitemap = RESEARCH_SLUGS.map((slug) => ({
    url: `${BASE}/research/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const cosmosCardEntries: MetadataRoute.Sitemap = CARD_SLUGS.map((slug) => ({
    url: `${BASE}/cosmos/cards/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    ...staticEntries,
    ...verticalEntries,
    ...researchEntries,
    ...cosmosCardEntries,
  ];
}
