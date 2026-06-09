import type { MetadataRoute } from "next";

const BASE = "https://starlightintelligence.org";

const STATIC_ROUTES = [
  "",
  "/protocol",
  "/quickstart",
  "/architecture",
  "/explainer",
  "/verticals",
  "/knowledge-tree",
  "/cockpit",
  "/docs",
  "/vaults",
  "/featured",
  "/benediction",
  "/badge",
] as const;

const VERTICAL_SLUGS = [
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
    priority: path === "" ? 1.0 : path === "/protocol" || path === "/quickstart" ? 0.9 : 0.7,
  }));

  const verticalEntries: MetadataRoute.Sitemap = VERTICAL_SLUGS.map((slug) => ({
    url: `${BASE}/verticals/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...verticalEntries];
}
