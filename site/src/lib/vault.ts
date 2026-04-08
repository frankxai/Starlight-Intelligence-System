const GITHUB_API = "https://api.github.com";
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
  category?: string;
  confidence?: "low" | "medium" | "high";
  tags?: string[];
  source?: string;
  context?: string;
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

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchGitHubFile(
  repo: string,
  path: string
): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
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
  const content = await fetchGitHubFile(
    REGISTRY_REPO,
    "vault-registry.json"
  );
  if (!content) return [];
  try {
    const data = JSON.parse(content);
    return data.vaults || [];
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

  const entries: Record<string, VaultEntry[]> = {};
  let totalEntries = 0;
  let lastUpdated = "";

  const results = await Promise.all(
    VAULT_CATEGORIES.map(async (cat) => {
      const content = await fetchGitHubFile(
        entry.repo,
        `${entry.path}/${cat}.jsonl`
      );
      return { cat, entries: content ? parseJsonl(content) : [] };
    })
  );

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

export async function getAllEntries(): Promise<
  (VaultEntry & { vaultSlug: string; vaultName: string; vaultCategory: VaultCategory })[]
> {
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
      for (const entry of data.entries[cat]) {
        all.push({
          ...entry,
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

export function getEntryText(entry: VaultEntry): string {
  return entry.insight || entry.wish || "";
}

export function getCategoryColor(cat: VaultCategory): string {
  const colors: Record<VaultCategory, string> = {
    strategic: "text-blue-400",
    technical: "text-emerald-400",
    creative: "text-purple-400",
    operational: "text-orange-400",
    wisdom: "text-amber-300",
    horizon: "text-amber-400",
  };
  return colors[cat] || "text-slate-400";
}

export function getCategoryBg(cat: VaultCategory): string {
  const colors: Record<VaultCategory, string> = {
    strategic: "bg-blue-500/10 border-blue-500/20",
    technical: "bg-emerald-500/10 border-emerald-500/20",
    creative: "bg-purple-500/10 border-purple-500/20",
    operational: "bg-orange-500/10 border-orange-500/20",
    wisdom: "bg-amber-400/10 border-amber-400/20",
    horizon: "bg-amber-500/10 border-amber-500/20",
  };
  return colors[cat] || "bg-slate-500/10 border-slate-500/20";
}

export function getCategoryIcon(cat: VaultCategory): string {
  const icons: Record<VaultCategory, string> = {
    strategic: "◆",
    technical: "⚙",
    creative: "✦",
    operational: "▶",
    wisdom: "☉",
    horizon: "↗",
  };
  return icons[cat] || "•";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
