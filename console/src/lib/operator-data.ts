import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export const VAULT_NAMES = [
  "strategic",
  "technical",
  "creative",
  "operational",
  "wisdom",
  "horizon",
] as const;

export type VaultName = (typeof VAULT_NAMES)[number];

export type VaultEntry = {
  id?: string;
  vault: string;
  content: string;
  tags?: string[];
  category?: string;
  confidence?: string | number;
  createdAt?: string;
  score?: number;
};

export type VaultStat = {
  name: VaultName;
  entries: number;
  bytes: number;
  mtime: string | null;
};

const NOISE_RE =
  /operator live|GET \/api\/operator|smoke OK|starlight operator engineered|desktop launchers|console GET/i;

export function homeDir(): string {
  return process.env.USERPROFILE || process.env.HOME || os.homedir();
}

export function vaultDir(): string {
  return (
    process.env.STARLIGHT_VAULT_DIR ||
    path.join(homeDir(), ".starlight", "vaults")
  );
}

export function ledgerPath(): string {
  return (
    process.env.STARLIGHT_OPS_LEDGER ||
    path.join(homeDir(), "agentic-ops", "ops", "OPS-LEDGER.md")
  );
}

export function heartbeatPath(): string {
  return (
    process.env.STARLIGHT_FLEET_HEARTBEAT ||
    path.join(
      homeDir(),
      "agentic-ops",
      "fleet",
      "bus",
      "heartbeats",
      "c940.json",
    )
  );
}

export function voiceStatusUrl(): string {
  return process.env.STARLIGHT_VOICE_STATUS_URL || "http://127.0.0.1:8765/status";
}

function entryText(obj: Record<string, unknown>, fallback: string): string {
  const primary = obj.content ?? obj.text ?? obj.insight ?? obj.note ?? obj.body;
  if (typeof primary === "string" && primary.trim()) return primary.trim();
  if (primary && typeof primary === "object") {
    try {
      return JSON.stringify(primary);
    } catch {
      /* fall through */
    }
  }
  // Last resort: if the whole object looks like a nested record, avoid dumping keys noise
  const fb = String(fallback ?? "").trim();
  if (fb.startsWith("{") && fb.includes("insight")) {
    try {
      const nested = JSON.parse(fb) as Record<string, unknown>;
      const n =
        nested.content ?? nested.text ?? nested.insight ?? nested.note;
      if (typeof n === "string" && n.trim()) return n.trim();
    } catch {
      /* ignore */
    }
  }
  return fb;
}

export function parseEntry(
  vault: string,
  line: string,
): VaultEntry | null {
  const raw = line.trim();
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const content = entryText(obj, raw);
    if (!content) return null;
    return {
      id: typeof obj.id === "string" ? obj.id : undefined,
      vault: String(obj.vault ?? vault),
      content,
      tags: Array.isArray(obj.tags)
        ? obj.tags.map(String)
        : undefined,
      category: obj.category != null ? String(obj.category) : undefined,
      confidence:
        obj.confidence != null ? (obj.confidence as string | number) : undefined,
      createdAt:
        typeof obj.createdAt === "string"
          ? obj.createdAt
          : typeof obj.created_at === "string"
            ? obj.created_at
            : undefined,
    };
  } catch {
    return { vault, content: raw.slice(0, 2000) };
  }
}

export function isNoise(entry: VaultEntry): boolean {
  return NOISE_RE.test(entry.content);
}

/** Prefer mind vaults over ops spam; de-noise operator self-logs. */
export function signalScore(entry: VaultEntry): number {
  let s = 0;
  const v = entry.vault.toLowerCase();
  if (v === "strategic") s += 40;
  else if (v === "wisdom") s += 38;
  else if (v === "horizon") s += 36;
  else if (v === "technical") s += 28;
  else if (v === "creative") s += 26;
  else if (v === "operational") s += 8;

  if (entry.createdAt) {
    const ageH =
      (Date.now() - Date.parse(entry.createdAt)) / (1000 * 60 * 60);
    if (ageH < 24) s += 20;
    else if (ageH < 72) s += 12;
    else if (ageH < 168) s += 6;
  }

  const conf = String(entry.confidence ?? "").toLowerCase();
  if (conf === "high" || conf === "0.9" || conf === "0.95") s += 6;

  if (isNoise(entry)) s -= 80;
  if (/disk|YELLOW|RED|missing|Packet 4|heartbeat/i.test(entry.content) && v === "operational")
    s += 4;

  return s;
}

export async function loadAllEntries(): Promise<{
  stats: VaultStat[];
  entries: VaultEntry[];
  totalBytes: number;
}> {
  const dir = vaultDir();
  const stats: VaultStat[] = [];
  const entries: VaultEntry[] = [];
  let totalBytes = 0;

  for (const name of VAULT_NAMES) {
    const file = path.join(dir, `${name}.jsonl`);
    try {
      const st = await fs.stat(file);
      const raw = await fs.readFile(file, "utf8");
      const lines = raw.split(/\r?\n/).filter((l) => l.trim());
      totalBytes += st.size;
      stats.push({
        name,
        entries: lines.length,
        bytes: st.size,
        mtime: st.mtime.toISOString(),
      });
      for (const line of lines) {
        const e = parseEntry(name, line);
        if (e) entries.push(e);
      }
    } catch {
      stats.push({ name, entries: 0, bytes: 0, mtime: null });
    }
  }

  return { stats, entries, totalBytes };
}

export function searchEntries(
  entries: VaultEntry[],
  query: string,
  limit = 12,
): VaultEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = entries
    .map((e) => {
      const hay = `${e.content} ${(e.tags ?? []).join(" ")} ${e.category ?? ""} ${e.vault}`.toLowerCase();
      let hit = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return null;
        hit += 10;
        if (e.content.toLowerCase().includes(t)) hit += 4;
      }
      hit += signalScore(e) * 0.15;
      if (isNoise(e)) hit -= 30;
      return { ...e, score: hit };
    })
    .filter((x): x is VaultEntry & { score: number } => x != null);

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored.slice(0, limit);
}

export function pickSignalFeed(entries: VaultEntry[], limit = 8): VaultEntry[] {
  const ranked = entries
    .filter((e) => !isNoise(e))
    .map((e) => ({ ...e, score: signalScore(e) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  // diversify vaults a bit
  const out: VaultEntry[] = [];
  const used = new Set<string>();
  for (const e of ranked) {
    const key = e.id || e.content.slice(0, 80);
    if (used.has(key)) continue;
    used.add(key);
    out.push(e);
    if (out.length >= limit) break;
  }
  return out;
}

export async function parseLedgerToday(): Promise<{
  path: string;
  lastSweep: string | null;
  bullets: string[];
  exists: boolean;
}> {
  const p = ledgerPath();
  try {
    const t = await fs.readFile(p, "utf8");
    const lines = t.split(/\r?\n/);
    const sweep =
      lines.find((l) => l.includes("Last sweep"))?.replace(/\*\*/g, "").trim() ??
      null;

    const bullets: string[] = [];
    // Prefer the most recent |||| / ||| blocks after header — skip register banners
    for (const line of lines.slice(0, 60)) {
      const isBlock =
        line.includes("||||") ||
        line.startsWith("|||") ||
        line.startsWith("||**");
      if (!isBlock && !/^\|\|\|\|/.test(line)) continue;
      let clean = line
        .replace(/^\|{2,4}/, "")
        .replace(/\*\*/g, "")
        .trim();
      if (clean.startsWith(">")) clean = clean.replace(/^>\s*/, "");
      if (/^Register:/i.test(clean)) continue;
      if (clean.length < 60) continue;
      if (/no Professional\/Mythic/i.test(clean)) continue;
      const short =
        clean.length > 280 ? `${clean.slice(0, 277).trim()}…` : clean;
      // de-dupe near-identical
      if (bullets.some((b) => b.slice(0, 80) === short.slice(0, 80))) continue;
      bullets.push(short);
      if (bullets.length >= 3) break;
    }

    return { path: p, lastSweep: sweep, bullets, exists: true };
  } catch {
    return { path: p, lastSweep: null, bullets: [], exists: false };
  }
}

export type Risk = {
  id: string;
  level: "red" | "yellow" | "green";
  title: string;
  detail: string;
};

export async function buildRisks(input: {
  bookOnline: boolean | null;
  voiceReachable: boolean;
  vaultTotal: number;
  diskFreeGb?: number | null;
}): Promise<Risk[]> {
  const risks: Risk[] = [];

  if (input.bookOnline === false) {
    risks.push({
      id: "book",
      level: "red",
      title: "Yoga Book offline",
      detail:
        "No yoga-book heartbeat. Packet 4 still open — frontend twin not joined.",
    });
  } else if (input.bookOnline === true) {
    risks.push({
      id: "book",
      level: "green",
      title: "Book online",
      detail: "Frontend node heartbeat present.",
    });
  }

  if (!input.voiceReachable) {
    risks.push({
      id: "voice",
      level: "yellow",
      title: "Voice status down",
      detail: "Sidecar/console not answering on :8765. Tray loop still incomplete.",
    });
  } else {
    risks.push({
      id: "voice",
      level: "yellow",
      title: "Voice status only",
      detail: "Dashboard up; PTT/voice loop not production-complete.",
    });
  }

  // disk from df is hard cross-platform; try free approx via ledger keywords already
  if (input.diskFreeGb != null && input.diskFreeGb < 50) {
    risks.push({
      id: "disk",
      level: "red",
      title: `Disk ${input.diskFreeGb.toFixed(0)} GB free`,
      detail: "Under 50 GB floor. Reclaim before heavy agent runs.",
    });
  } else if (input.diskFreeGb != null && input.diskFreeGb < 80) {
    risks.push({
      id: "disk",
      level: "yellow",
      title: `Disk ${input.diskFreeGb.toFixed(0)} GB free`,
      detail: "Above floor, under 80 GB target.",
    });
  }

  const opHeavy = input.vaultTotal > 0;
  if (opHeavy) {
    risks.push({
      id: "memory-skew",
      level: "yellow",
      title: "Memory skewed operational",
      detail:
        "Most atoms are ops logs. Promote patterns into strategic / wisdom.",
    });
  }

  return risks.slice(0, 4);
}

export async function appendCapture(opts: {
  content: string;
  vault?: VaultName;
  tags?: string[];
}): Promise<VaultEntry> {
  const vault = opts.vault ?? "operational";
  const dir = vaultDir();
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${vault}.jsonl`);
  const now = new Date().toISOString();
  const id = `sis_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  const entry = {
    id,
    content: opts.content.trim(),
    vault,
    tags: opts.tags ?? ["operator-capture", "local"],
    confidence: "high",
    category: "insight",
    createdAt: now,
    temporal: {
      validFrom: now,
      validUntil: null,
      lastConfirmed: now,
      confidenceDecay: 0.9,
    },
  };
  await fs.appendFile(file, `${JSON.stringify(entry)}\n`, "utf8");
  return {
    id,
    vault,
    content: entry.content,
    tags: entry.tags,
    category: entry.category,
    confidence: entry.confidence,
    createdAt: now,
  };
}

export async function fetchVoice(): Promise<{
  reachable: boolean;
  url: string;
  status: Record<string, unknown> | null;
  error?: string;
}> {
  const url = voiceStatusUrl();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 1200);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) {
      return { reachable: false, url, status: null, error: `HTTP ${res.status}` };
    }
    return {
      reachable: true,
      url,
      status: (await res.json()) as Record<string, unknown>,
    };
  } catch (e) {
    return {
      reachable: false,
      url,
      status: null,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(t);
  }
}

export async function readHeartbeat(): Promise<{
  heartbeatPath: string;
  heartbeat: Record<string, unknown> | null;
  bookOnline: boolean | null;
}> {
  const hp = heartbeatPath();
  try {
    const raw = await fs.readFile(hp, "utf8");
    const heartbeat = JSON.parse(raw) as Record<string, unknown>;
    const bookPath = path.join(path.dirname(hp), "yoga-book.json");
    let bookOnline: boolean | null = null;
    try {
      await fs.stat(bookPath);
      bookOnline = true;
    } catch {
      bookOnline = false;
    }
    return { heartbeatPath: hp, heartbeat, bookOnline };
  } catch {
    return { heartbeatPath: hp, heartbeat: null, bookOnline: null };
  }
}

/** Best-effort free GB on Windows C: via wmic/powershell is slow; skip if unavailable. */
export async function estimateDiskFreeGb(): Promise<number | null> {
  try {
    // Node fs.statfs available Node 18.15+ / 19+
    const statfs = (
      fs as unknown as {
        statfs?: (p: string) => Promise<{ bavail: number; bsize: number }>;
      }
    ).statfs;
    if (!statfs) return null;
    const root =
      process.platform === "win32"
        ? `${(process.env.SystemDrive || "C:").replace(/\\$/, "")}\\`
        : "/";
    const s = await statfs(root);
    return (s.bavail * s.bsize) / (1024 * 1024 * 1024);
  } catch {
    return null;
  }
}
