/** Temporal Reasoning — Staleness, Decay & Validity for Vault Entries */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface TemporalConfig {
  staleThresholdDays: number;
  decayHalfLifeDays: number;
  defaultValidityDays: number | null;
}

export interface TemporalMeta {
  validFrom: string;
  validUntil: string | null;
  lastConfirmed: string;
  confidenceDecay: number;
}

export interface StalenessReport {
  entryId: string;
  vault: string;
  content: string;
  daysSinceConfirmed: number;
  isStale: boolean;
  isExpired: boolean;
  currentConfidence: number;
  originalConfidence: number;
}

const MS_PER_DAY = 86_400_000;

function daysBetween(a: string, b: string | Date = new Date()): number {
  const dateA = new Date(a);
  const dateB = b instanceof Date ? b : new Date(b);
  return Math.max(0, (dateB.getTime() - dateA.getTime()) / MS_PER_DAY);
}

const CONFIDENCE_MAP: Record<string, number> = { low: 0.3, medium: 0.6, high: 0.9 };

function resolveConfidence(raw: unknown): number {
  if (typeof raw === 'number') return Math.max(0, Math.min(1, raw));
  if (typeof raw === 'string' && raw in CONFIDENCE_MAP) return CONFIDENCE_MAP[raw];
  return 0.5;
}

const DEFAULTS: TemporalConfig = { staleThresholdDays: 30, decayHalfLifeDays: 90, defaultValidityDays: null };

export class TemporalEngine {
  private config: TemporalConfig;

  constructor(config?: Partial<TemporalConfig>) {
    this.config = { ...DEFAULTS, ...config };
  }

  /** Create temporal metadata for a new entry. */
  createMeta(confidence = 0.5): TemporalMeta {
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
  decayedConfidence(meta: TemporalMeta): number {
    const days = daysBetween(meta.validFrom);
    const decay = Math.pow(0.5, days / this.config.decayHalfLifeDays);
    return meta.confidenceDecay * decay;
  }

  /** True if the entry has not been confirmed within the staleness threshold. */
  isStale(meta: TemporalMeta): boolean {
    return daysBetween(meta.lastConfirmed) > this.config.staleThresholdDays;
  }

  /** True if the entry is past its validUntil date. */
  isExpired(meta: TemporalMeta): boolean {
    if (meta.validUntil == null) return false;
    return new Date(meta.validUntil).getTime() < Date.now();
  }

  /** Touch lastConfirmed to now, returning updated metadata. */
  confirm(meta: TemporalMeta): TemporalMeta {
    return { ...meta, lastConfirmed: new Date().toISOString() };
  }

  /** Set validUntil to now, effectively expiring the entry. */
  invalidate(meta: TemporalMeta): TemporalMeta {
    return { ...meta, validUntil: new Date().toISOString() };
  }

  /** Scan all *.jsonl files in a vault directory and produce staleness reports. */
  scanVaults(vaultDir: string): StalenessReport[] {
    const reports: StalenessReport[] = [];
    let files: string[];
    try {
      files = readdirSync(vaultDir).filter((f) => f.endsWith('.jsonl'));
    } catch {
      return reports;
    }

    for (const file of files) {
      const vaultName = file.replace(/\.jsonl$/, '');
      const raw = readFileSync(join(vaultDir, file), 'utf-8');
      const lines = raw.split('\n').filter((l) => l.trim());

      for (const line of lines) {
        let entry: Record<string, unknown>;
        try {
          entry = JSON.parse(line);
        } catch {
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
  getStalenessStats(reports: StalenessReport[]) {
    if (reports.length === 0)
      return { total: 0, stale: 0, expired: 0, healthy: 0, avgConfidence: 0, stalestEntry: null as StalenessReport | null };

    let stale = 0, expired = 0, confSum = 0;
    let stalest: StalenessReport | null = null;
    for (const r of reports) {
      confSum += r.currentConfidence;
      if (r.isExpired) expired++;
      if (r.isStale) stale++;
      if (!stalest || r.daysSinceConfirmed > stalest.daysSinceConfirmed) stalest = r;
    }
    return {
      total: reports.length, stale, expired,
      healthy: reports.length - stale - expired,
      avgConfidence: Math.round((confSum / reports.length) * 1000) / 1000,
      stalestEntry: stalest,
    };
  }

  /** Extract TemporalMeta from a raw JSONL entry, filling defaults for legacy data. */
  private extractMeta(entry: Record<string, unknown>): TemporalMeta {
    if (entry.temporal && typeof entry.temporal === 'object') {
      const t = entry.temporal as Record<string, unknown>;
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
