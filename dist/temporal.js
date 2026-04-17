/** Temporal Reasoning — Staleness, Decay & Validity for Vault Entries */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const MS_PER_DAY = 86_400_000;
function daysBetween(a, b = new Date()) {
    const dateA = new Date(a);
    const dateB = b instanceof Date ? b : new Date(b);
    return Math.max(0, (dateB.getTime() - dateA.getTime()) / MS_PER_DAY);
}
const CONFIDENCE_MAP = { low: 0.3, medium: 0.6, high: 0.9 };
function resolveConfidence(raw) {
    if (typeof raw === 'number')
        return Math.max(0, Math.min(1, raw));
    if (typeof raw === 'string' && raw in CONFIDENCE_MAP)
        return CONFIDENCE_MAP[raw];
    return 0.5;
}
const DEFAULTS = { staleThresholdDays: 30, decayHalfLifeDays: 90, defaultValidityDays: null };
export class TemporalEngine {
    config;
    constructor(config) {
        this.config = { ...DEFAULTS, ...config };
    }
    /** Create temporal metadata for a new entry. */
    createMeta(confidence = 0.5) {
        const now = new Date().toISOString();
        const validUntil = this.config.defaultValidityDays != null
            ? new Date(Date.now() + this.config.defaultValidityDays * MS_PER_DAY).toISOString()
            : null;
        return {
            validFrom: now,
            validUntil,
            lastConfirmed: now,
            confidenceDecay: Math.max(0, Math.min(1, confidence)),
        };
    }
    /** Calculate decayed confidence: original * 0.5^(daysSinceCreated / halfLife). */
    decayedConfidence(meta) {
        const days = daysBetween(meta.validFrom);
        const decay = Math.pow(0.5, days / this.config.decayHalfLifeDays);
        return meta.confidenceDecay * decay;
    }
    /** True if the entry has not been confirmed within the staleness threshold. */
    isStale(meta) {
        return daysBetween(meta.lastConfirmed) > this.config.staleThresholdDays;
    }
    /** True if the entry is past its validUntil date. */
    isExpired(meta) {
        if (meta.validUntil == null)
            return false;
        return new Date(meta.validUntil).getTime() < Date.now();
    }
    /** Touch lastConfirmed to now, returning updated metadata. */
    confirm(meta) {
        return { ...meta, lastConfirmed: new Date().toISOString() };
    }
    /** Set validUntil to now, effectively expiring the entry. */
    invalidate(meta) {
        return { ...meta, validUntil: new Date().toISOString() };
    }
    /** Scan all *.jsonl files in a vault directory and produce staleness reports. */
    scanVaults(vaultDir) {
        const reports = [];
        let files;
        try {
            files = readdirSync(vaultDir).filter((f) => f.endsWith('.jsonl'));
        }
        catch {
            return reports;
        }
        for (const file of files) {
            const vaultName = file.replace(/\.jsonl$/, '');
            const raw = readFileSync(join(vaultDir, file), 'utf-8');
            const lines = raw.split('\n').filter((l) => l.trim());
            for (const line of lines) {
                let entry;
                try {
                    entry = JSON.parse(line);
                }
                catch {
                    continue;
                }
                const meta = this.extractMeta(entry);
                const daysSinceConfirmed = daysBetween(meta.lastConfirmed);
                const currentConfidence = this.decayedConfidence(meta);
                reports.push({
                    entryId: String(entry.id ?? 'unknown'),
                    vault: vaultName,
                    content: String(entry.insight ?? entry.content ?? entry.wish ?? ''),
                    daysSinceConfirmed: Math.round(daysSinceConfirmed * 100) / 100,
                    isStale: this.isStale(meta),
                    isExpired: this.isExpired(meta),
                    currentConfidence: Math.round(currentConfidence * 1000) / 1000,
                    originalConfidence: meta.confidenceDecay,
                });
            }
        }
        return reports;
    }
    /** Get summary statistics from a set of staleness reports. */
    getStalenessStats(reports) {
        if (reports.length === 0)
            return { total: 0, stale: 0, expired: 0, healthy: 0, avgConfidence: 0, stalestEntry: null };
        let stale = 0, expired = 0, confSum = 0;
        let stalest = null;
        for (const r of reports) {
            confSum += r.currentConfidence;
            if (r.isExpired)
                expired++;
            if (r.isStale)
                stale++;
            if (!stalest || r.daysSinceConfirmed > stalest.daysSinceConfirmed)
                stalest = r;
        }
        return {
            total: reports.length, stale, expired,
            healthy: reports.length - stale - expired,
            avgConfidence: Math.round((confSum / reports.length) * 1000) / 1000,
            stalestEntry: stalest,
        };
    }
    /** Extract TemporalMeta from a raw JSONL entry, filling defaults for legacy data. */
    extractMeta(entry) {
        if (entry.temporal && typeof entry.temporal === 'object') {
            const t = entry.temporal;
            return {
                validFrom: String(t.validFrom ?? entry.createdAt ?? new Date().toISOString()),
                validUntil: t.validUntil != null ? String(t.validUntil) : null,
                lastConfirmed: String(t.lastConfirmed ?? entry.createdAt ?? new Date().toISOString()),
                confidenceDecay: resolveConfidence(t.confidenceDecay ?? entry.confidence),
            };
        }
        const createdAt = String(entry.createdAt ?? entry.created_at ?? new Date().toISOString());
        return {
            validFrom: createdAt,
            validUntil: entry.expiresAt != null ? String(entry.expiresAt) : null,
            lastConfirmed: String(entry.updatedAt ?? entry.lastConfirmed ?? createdAt),
            confidenceDecay: resolveConfidence(entry.confidence),
        };
    }
}
//# sourceMappingURL=temporal.js.map