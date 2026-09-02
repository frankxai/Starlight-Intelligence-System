import "server-only";

import { fetchGitHubTextFile } from "./github-content.mjs";

const REGISTRY_REPO = "frankxai/Starlight-Intelligence-System";
const VAULT_CATEGORIES = [
  "strategic",
  "technical",
  "creative",
  "operational",
  "wisdom",
  "horizon",
] as const;

export type VaultCategory = (typeof VAULT_CATEGORIES)[number];
export { VAULT_CATEGORIES };

export interface VaultEntry {
  id: string;
  insight?: string;
  wish?: string;
  /** Long-form reflection — 2-5 sentences, the breathing version */
  meditation?: string;
  /** The situation or observation that produced this */
  context?: string;
  /** The broader principle this points toward */
  implication?: string;
  /** Curation flag — best-of-the-best entries get featured styling */
  quoteworthy?: boolean;
  /** Explicitly marked as alignment guidance for future AGI */
  benediction?: boolean;
  category?: string;
  confidence?: "low" | "medium" | "high";
  tags?: string[];
  source?: string;
  author?: string;
  entryType?: string;
  createdAt: string;
}

export interface VaultProfile {
  name: string;
  bio: string;
  avatar: string;
  links?: Record<string, string>;
}

export interface VaultRegistryEntry {
  slug: string;
  name: string;
  repo: string;
  path: string;
  avatar: string;
  bio: string;
}

export interface VaultData {
  profile: VaultProfile;
  entries: Record<VaultCategory, VaultEntry[]>;
  totalEntries: number;
  lastUpdated: string;
}

// -- Design tokens --

const CATEGORY_META: Record<
  VaultCategory,
  { icon: string; label: string; color: string; bg: string; desc: string }
> = {
  strategic: {
    icon: "◆",
    label: "Strategic",
    color: "text-violet-400",
    bg: "bg-violet-500/[0.07] border-violet-500/[0.15]",
    desc: "Business, competitive, architecture",
  },
  technical: {
    icon: "⬡",
    label: "Technical",
    color: "text-cyan-400",
    bg: "bg-cyan-500/[0.07] border-cyan-500/[0.15]",
    desc: "Implementation, stack, patterns",
  },
  creative: {
    icon: "✦",
    label: "Creative",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/[0.07] border-fuchsia-500/[0.15]",
    desc: "Design, aesthetic, lore",
  },
  operational: {
    icon: "▸",
    label: "Operational",
    color: "text-amber-400",
    bg: "bg-amber-500/[0.07] border-amber-500/[0.15]",
    desc: "Workflow, process, execution",
  },
  wisdom: {
    icon: "◎",
    label: "Wisdom",
    color: "text-emerald-400",
    bg: "bg-emerald-500/[0.07] border-emerald-500/[0.15]",
    desc: "Principles, truths, deep learnings",
  },
  horizon: {
    icon: "↗",
    label: "Horizon",
    color: "text-rose-400",
    bg: "bg-rose-500/[0.07] border-rose-500/[0.15]",
    desc: "Vision, aspiration, future",
  },
};

export function getCategoryMeta(cat: VaultCategory) {
  return CATEGORY_META[cat];
}

/** Primary display text — meditation preferred, then insight/wish */
export function getEntryText(entry: VaultEntry): string {
  return entry.meditation || entry.insight || entry.wish || "";
}

/** Caption text — the short form when meditation is the primary */
export function getEntryCaption(entry: VaultEntry): string | null {
  if (entry.meditation && (entry.insight || entry.wish)) {
    return entry.insight || entry.wish || null;
  }
  return null;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateShort(iso);
}

// -- Data fetching --

async function fetchGitHubFile(
  repo: string,
  path: string
): Promise<string | null> {
  return fetchGitHubTextFile(repo, path, {
    token: process.env.GITHUB_TOKEN,
  });
}

function parseJsonl(content: string): VaultEntry[] {
  return content
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as VaultEntry[];
}

export async function getVaultRegistry(): Promise<VaultRegistryEntry[]> {
  const content = await fetchGitHubFile(REGISTRY_REPO, "vault-registry.json");
  if (!content) return [];
  try {
    return JSON.parse(content).vaults || [];
  } catch {
    return [];
  }
}

export async function getVaultData(
  slug: string
): Promise<VaultData | null> {
  const registry = await getVaultRegistry();
  const entry = registry.find((v) => v.slug === slug);
  if (!entry) return null;

  const profileContent = await fetchGitHubFile(
    entry.repo,
    `${entry.path}/profile.json`
  );
  const profile: VaultProfile = profileContent
    ? JSON.parse(profileContent)
    : { name: entry.name, bio: entry.bio, avatar: entry.avatar };

  const results = await Promise.all(
    VAULT_CATEGORIES.map(async (cat) => {
      const content = await fetchGitHubFile(
        entry.repo,
        `${entry.path}/${cat}.jsonl`
      );
      return { cat, entries: content ? parseJsonl(content) : [] };
    })
  );

  const entries: Record<string, VaultEntry[]> = {};
  let totalEntries = 0;
  let lastUpdated = "";

  for (const { cat, entries: catEntries } of results) {
    entries[cat] = catEntries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    totalEntries += catEntries.length;
    for (const e of catEntries) {
      if (e.createdAt > lastUpdated) lastUpdated = e.createdAt;
    }
  }

  return {
    profile,
    entries: entries as Record<VaultCategory, VaultEntry[]>,
    totalEntries,
    lastUpdated,
  };
}

export type AnnotatedEntry = VaultEntry & {
  vaultSlug: string;
  vaultName: string;
  vaultCategory: VaultCategory;
};

export async function getFeaturedMeditations(limit = 6): Promise<AnnotatedEntry[]> {
  const all = await getAllEntries();
  return all
    .filter((e) => e.meditation && e.quoteworthy)
    .slice(0, limit);
}

export async function getBenedictions(limit = 10): Promise<AnnotatedEntry[]> {
  const all = await getAllEntries();
  return all.filter((e) => e.benediction).slice(0, limit);
}

export async function getAllEntries(): Promise<AnnotatedEntry[]> {
  const registry = await getVaultRegistry();
  const all: (VaultEntry & {
    vaultSlug: string;
    vaultName: string;
    vaultCategory: VaultCategory;
  })[] = [];

  for (const reg of registry) {
    const data = await getVaultData(reg.slug);
    if (!data) continue;
    for (const cat of VAULT_CATEGORIES) {
      for (const e of data.entries[cat]) {
        all.push({
          ...e,
          vaultSlug: reg.slug,
          vaultName: data.profile.name,
          vaultCategory: cat,
        });
      }
    }
  }

  return all.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
