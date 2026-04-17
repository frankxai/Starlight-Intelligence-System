/**
 * Starlight Intelligence System — Contradiction Detector
 * Detects conflicting entries across vaults using word-trigram Jaccard similarity.
 */
import * as fs from "node:fs";
import * as path from "node:path";
const POS = new Set(["always", "must", "should", "do", "enable", "require", "prefer"]);
const NEG = new Set(["never", "don't", "dont", "avoid", "disable", "shouldn't", "shouldnt", "cannot"]);
export class ContradictionDetector {
    tokenize(text) {
        return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/).filter(Boolean);
    }
    trigrams(tokens) {
        const s = new Set();
        for (let i = 0; i <= tokens.length - 3; i++)
            s.add(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
        return s;
    }
    hasOpposing(a, b) {
        const ap = a.some((t) => POS.has(t)), an = a.some((t) => NEG.has(t));
        const bp = b.some((t) => POS.has(t)), bn = b.some((t) => NEG.has(t));
        return (ap && bn) || (an && bp);
    }
    similarity(a, b) {
        const tA = this.tokenize(a), tB = this.tokenize(b);
        if (tA.length < 3 || tB.length < 3)
            return 0;
        const gA = this.trigrams(tA), gB = this.trigrams(tB);
        let inter = 0;
        for (const t of gA)
            if (gB.has(t))
                inter++;
        const union = gA.size + gB.size - inter;
        if (union === 0)
            return 0;
        let score = inter / union;
        if (score >= 0.15 && this.hasOpposing(tA, tB))
            score = Math.min(1, score + 0.25);
        return Math.round(score * 1000) / 1000;
    }
    readEntries(vaultDir) {
        if (!fs.existsSync(vaultDir))
            return [];
        const entries = [];
        for (const file of fs.readdirSync(vaultDir).filter((f) => f.endsWith(".jsonl"))) {
            const vault = path.basename(file, ".jsonl");
            for (const line of fs.readFileSync(path.join(vaultDir, file), "utf-8").split("\n")) {
                if (!line.trim())
                    continue;
                try {
                    const r = JSON.parse(line);
                    const content = r.insight || r.wish || "";
                    if (content)
                        entries.push({ id: r.id, vault: r.vault || vault, content, createdAt: r.createdAt });
                }
                catch { /* skip */ }
            }
        }
        return entries;
    }
    scanVaults(vaultDir, options) {
        const minSim = options?.minSimilarity ?? 0.6, limit = options?.limit ?? 50;
        const entries = this.readEntries(vaultDir);
        const results = [];
        const now = new Date().toISOString();
        for (let i = 0; i < entries.length && results.length < limit; i++) {
            for (let j = i + 1; j < entries.length && results.length < limit; j++) {
                if (entries[i].vault === entries[j].vault)
                    continue;
                const score = this.similarity(entries[i].content, entries[j].content);
                if (score >= minSim)
                    results.push({ entryA: entries[i], entryB: entries[j], similarity: score, type: "potential", detectedAt: now });
            }
        }
        return results.sort((a, b) => b.similarity - a.similarity);
    }
    checkEntry(content, vault, existing) {
        const now = new Date().toISOString();
        const newE = { id: "pending", vault, content, createdAt: now };
        const results = [];
        for (const e of existing) {
            if (e.vault === vault)
                continue;
            const score = this.similarity(content, e.content);
            if (score >= 0.6)
                results.push({ entryA: newE, entryB: e, similarity: score, type: "potential", detectedAt: now });
        }
        return results.sort((a, b) => b.similarity - a.similarity);
    }
}
//# sourceMappingURL=contradiction.js.map