// Built on SIP — server-side fetchers for Starlight Cosmos surfaces.
// All external space-data fetches live here, behind ISR caching with
// committed fallbacks. The pages must render beautifully even if every
// upstream API is down (verified concern: api.spacexdata.com died 2026-06,
// DONKI is flaky, DEMO_KEY rate limit measured at 10 req/hr).
//
// Endpoints verified live 2026-06-11 — see
// docs/superpowers/specs/2026-06-11-starlight-cosmos-design.md §2.

import fallbackNeo from "./fallback-neo.json";
import fallbackGallery from "./fallback-gallery.json";

const NASA_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

// ── Types ─────────────────────────────────────────────────────────

export type Apod = {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  copyright?: string;
};

export type NeoObject = {
  id: string;
  name: string;
  diameterMinM: number;
  diameterMaxM: number;
  hazardous: boolean;
  magnitude: number;
  approachDate: string;
  velocityKps: number | null;
  missDistanceLunar: number | null;
  jplUrl: string;
};

export type NeoFeed = {
  objects: NeoObject[];
  live: boolean;
  snapshotDate: string;
};

export type GalleryItem = {
  nasaId: string;
  title: string;
  description: string;
  dateCreated: string;
  credit: string;
  imageUrl: string;
  thumbUrl: string;
};

export type Launch = {
  id: string;
  name: string;
  net: string; // ISO timestamp
  status: string;
  agency?: string;
};

// ── APOD — Astronomy Picture of the Day ───────────────────────────
// api.nasa.gov, key required (DEMO_KEY ok at 1 req/day via ISR).

export async function getApod(): Promise<Apod | null> {
  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&thumbs=true`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    if (d.media_type !== "image" || !d.url) return null;
    return {
      date: d.date,
      title: d.title,
      explanation: d.explanation,
      url: d.url,
      hdurl: d.hdurl,
      copyright: d.copyright?.trim(),
    };
  } catch {
    return null;
  }
}

// ── NeoWs — near-Earth object close approaches ────────────────────
// Live feed when reachable; committed snapshot otherwise.

export async function getNeoFeed(): Promise<NeoFeed> {
  const snapshot: NeoFeed = {
    objects: fallbackNeo.objects as NeoObject[],
    live: false,
    snapshotDate: fallbackNeo.snapshotDate,
  };
  try {
    const start = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
    const res = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${NASA_KEY}`,
      { next: { revalidate: 21600 } }
    );
    if (!res.ok) return snapshot;
    const d = await res.json();
    if (!d.near_earth_objects) return snapshot;
    const objects: NeoObject[] = [];
    for (const [date, neos] of Object.entries(
      d.near_earth_objects as Record<string, Record<string, unknown>[]>
    )) {
      for (const n of neos) {
        const neo = n as {
          id: string;
          name: string;
          nasa_jpl_url: string;
          absolute_magnitude_h: number;
          is_potentially_hazardous_asteroid: boolean;
          estimated_diameter: {
            meters: { estimated_diameter_min: number; estimated_diameter_max: number };
          };
          close_approach_data: {
            close_approach_date_full?: string;
            relative_velocity?: { kilometers_per_second: string };
            miss_distance?: { lunar: string };
          }[];
        };
        const ca = neo.close_approach_data[0];
        objects.push({
          id: neo.id,
          name: neo.name.replace(/[()]/g, "").trim(),
          diameterMinM: Math.round(neo.estimated_diameter.meters.estimated_diameter_min),
          diameterMaxM: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
          hazardous: neo.is_potentially_hazardous_asteroid,
          magnitude: neo.absolute_magnitude_h,
          approachDate: ca?.close_approach_date_full || date,
          velocityKps: ca?.relative_velocity
            ? +(+ca.relative_velocity.kilometers_per_second).toFixed(1)
            : null,
          missDistanceLunar: ca?.miss_distance ? +(+ca.miss_distance.lunar).toFixed(1) : null,
          jplUrl: neo.nasa_jpl_url,
        });
      }
    }
    if (objects.length === 0) return snapshot;
    objects.sort(
      (a, b) => (a.missDistanceLunar ?? 9e9) - (b.missDistanceLunar ?? 9e9)
    );
    return {
      objects,
      live: true,
      snapshotDate: new Date().toISOString().slice(0, 10),
    };
  } catch {
    return snapshot;
  }
}

// ── NASA Image and Video Library — keyless, the gallery workhorse ──

export async function searchNasaImages(
  query: string,
  count = 12
): Promise<GalleryItem[]> {
  try {
    const res = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=${Math.min(count * 2, 50)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const d = await res.json();
    const items: GalleryItem[] = [];
    for (const it of d.collection?.items ?? []) {
      if (items.length >= count) break;
      const meta = it.data?.[0];
      const links = (it.links ?? []) as {
        href: string;
        rel: string;
        render?: string;
      }[];
      const medium = links.find((l) => l.href.includes("~medium")) ?? links[0];
      const thumb = links.find((l) => l.rel === "preview") ?? medium;
      if (!meta || !medium) continue;
      items.push({
        nasaId: meta.nasa_id,
        title: meta.title,
        description: (meta.description ?? "").slice(0, 300),
        dateCreated: (meta.date_created ?? "").slice(0, 10),
        credit: meta.secondary_creator || meta.center || "NASA",
        imageUrl: medium.href,
        thumbUrl: thumb?.href ?? medium.href,
      });
    }
    return items;
  } catch {
    return [];
  }
}

/** Curated fallback set (committed snapshot of NASA Images API results). */
export function getFallbackGallery(): GalleryItem[] {
  return fallbackGallery.items as GalleryItem[];
}

// ── Launch Library 2 — the launch feed (api.spacexdata.com is dead) ──
// Free tier 15 req/hr; ISR 3600s keeps us at ~1 req/hr.

export async function getUpcomingLaunches(count = 5): Promise<Launch[]> {
  try {
    const res = await fetch(
      `https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=${count}&mode=normal`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const d = await res.json();
    return ((d.results ?? []) as Record<string, unknown>[]).map((r) => {
      const launch = r as {
        id: string;
        name: string;
        net: string;
        status?: { name?: string };
        launch_service_provider?: { name?: string };
      };
      return {
        id: launch.id,
        name: launch.name,
        net: launch.net,
        status: launch.status?.name ?? "Unknown",
        agency: launch.launch_service_provider?.name,
      };
    });
  } catch {
    return [];
  }
}
