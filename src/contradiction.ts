/**
 * Starlight Intelligence System — Contradiction Detector
 * Detects conflicting entries across vaults using word-trigram Jaccard similarity.
 */
import * as fs from "node:fs";
import * as path from "node:path";

export interface Contradiction {
  entryA: { id: string; vault: string; content: string; createdAt: string };
  entryB: { id: string; vault: string; content: string; createdAt: string };
  similarity: number;
  type: "potential";
  detectedAt: string;
}

type Entry = Contradiction["entryA"];

const POS = new Set(["always", "must", "should", "do", "enable", "require", "prefer"]);
const NEG = new Set(["never", "don't", "dont", "avoid", "disable", "shouldn't", "shouldnt", "cannot"]);

export class ContradictionDetector {
  private tokenize(text: string): string[] {
    return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/).filter(Boolean);
  }

  private trigrams(tokens: string[]): Set<string> {
    const s = new Set<string>();
    for (let i = 0; i <= tokens.length - 3; i++) s.add(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
    return s;
  }

  private hasOpposing(a: string[], b: string[]): boolean {
    const ap = a.some((t) => POS.has(t)), an = a.some((t) => NEG.has(t));
    const bp = b.some((t) => POS.has(t)), bn = b.some((t) => NEG.has(t));
    return (ap && bn) || (an && bp);
  }

  similarity(a: string, b: string): number {
    const tA = this.tokenize(a), tB = this.tokenize(b);
    if (tA.length < 3 || tB.length < 3) return 0;
    const gA = this.trigrams(tA), gB = this.trigrams(tB);
    let inter = 0;
    for (const t of gA) if (gB.has(t)) inter++;
    const union = gA.size + gB.size - inter;
    if (union === 0) return 0;
    let score = inter / union;
    if (score >= 0.15 && this.hasOpposing(tA, tB)) score = Math.min(1, score + 0.25);
    return Math.round(score * 1000) / 1000;
  }

  private readEntries(vaultDir: string): Entry[] {
    if (!fs.existsSync(vaultDir)) return [];
    const entries: Entry[] = [];

    // Tier 1 — legacy JSONL vault format
    for (const file of fs.readdirSync(vaultDir).filter((f) => f.endsWith(".jsonl"))) {
      const vault = path.basename(file, ".jsonl");
      for (const line of fs.readFileSync(path.join(vaultDir, file), "utf-8").split("\n")) {
        if (!line.trim()) continue;
        try {
          const r = JSON.parse(line) as Record<string, unknown>;
          const content = (r.insight as string) || (r.wish as string) || "";
          if (content) entries.push({ id: r.id as string, vault: (r.vault as string) || vault, content, createdAt: r.createdAt as string });
        } catch { /* skip */ }
      }
    }

    // Tier 2 — SIS canonical MD vault format (Fix C, 2026-05-22).
    // Each MD file becomes ONE entry per section (### heading)
    // so trigram similarity has signal rather than whole-file noise.
    // See docs/ops/MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md §5b (Fix C).
    for (const file of fs.readdirSync(vaultDir).filter((f) => f.endsWith(".md"))) {
      const stem = path.basename(file, ".md");
      const vault = stem.endsWith("-vault") ? stem.slice(0, -"-vault".length) : stem;
      try {
        const fileMtime = fs.statSync(path.join(vaultDir, file)).mtime.toISOString();
        const content = fs.readFileSync(path.join(vaultDir, file), "utf-8");
        // Split by section heading (### or ##) — each section becomes one entry.
        // Whole file as one entry caused trigram similarity to drown in noise.
        const sections = content.split(/\n(?=#{2,3}\s)/);
        sections.forEach((sec, i) => {
          const trimmed = sec.trim();
          if (trimmed.length < 100) return;  // skip tiny preamble fragments
          entries.push({
            id: `md:${file}#${i}`,
            vault,
            content: trimmed,
            createdAt: fileMtime,
          });
        });
      } catch { /* skip — corrupt or unreadable file */ }
    }

    return entries;
  }

  scanVaults(vaultDir: string, options?: { minSimilarity?: number; limit?: number }): Contradiction[] {
    const minSim = options?.minSimilarity ?? 0.6, limit = options?.limit ?? 50;
    const entries = this.readEntries(vaultDir);
    const results: Contradiction[] = [];
    const now = new Date().toISOString();
    for (let i = 0; i < entries.length && results.length < limit; i++) {
      for (let j = i + 1; j < entries.length && results.length < limit; j++) {
        if (entries[i].vault === entries[j].vault) continue;
        const score = this.similarity(entries[i].content, entries[j].content);
        if (score >= minSim) results.push({ entryA: entries[i], entryB: entries[j], similarity: score, type: "potential", detectedAt: now });
      }
    }
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  checkEntry(content: string, vault: string, existing: Entry[]): Contradiction[] {
    const now = new Date().toISOString();
    const newE: Entry = { id: "pending", vault, content, createdAt: now };
    const results: Contradiction[] = [];
    for (const e of existing) {
      if (e.vault === vault) continue;
      const score = this.similarity(content, e.content);
      if (score >= 0.6) results.push({ entryA: newE, entryB: e, similarity: score, type: "potential", detectedAt: now });
    }
    return results.sort((a, b) => b.similarity - a.similarity);
  }
}
