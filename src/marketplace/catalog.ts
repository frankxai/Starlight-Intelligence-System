/**
 * Starlight Sovereign Marketplace Catalog & Attestation Engine
 *
 * Provides marketplace schemas, validation, and curation for community skills,
 * harness configs (Claude Code, Grok, Codex, Antigravity), and modular packs.
 *
 * Attestation: Built on SIP — Marketplace Tier
 */

import type { PackKind } from "../types.js";

export type MarketplaceLicenseTier = "free" | "subscription" | "enterprise";

export interface MarketplacePackItem {
  id: string;
  name: string;
  version: string;
  kind: PackKind;
  author: string;
  description: string;
  licenseTier: MarketplaceLicenseTier;
  permissions: string[];
  attestation: string; // Must be "Built on SIP"
  manifestSha: string;
  rating?: number;
  downloadCount?: number;
  publishedAt: string;
}

export interface MarketplaceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class MarketplaceCatalog {
  private items: Map<string, MarketplacePackItem> = new Map();

  /**
   * Validates a candidate pack against marketplace curation and security standards.
   */
  public static validatePack(pack: Partial<MarketplacePackItem>): MarketplaceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!pack.id || !/^[a-z0-9-_]+$/.test(pack.id)) {
      errors.push("Invalid pack ID: must be lowercase alphanumeric with hyphens/underscores.");
    }
    if (!pack.name || pack.name.trim().length === 0) {
      errors.push("Pack name is required.");
    }
    if (!pack.version || !/^\d+\.\d+\.\d+/.test(pack.version)) {
      errors.push("Semantic version (X.Y.Z) is required.");
    }
    if (!pack.attestation || !pack.attestation.includes("Built on SIP")) {
      errors.push("Attestation missing or invalid: all marketplace items must declare 'Built on SIP'.");
    }
    if (!pack.licenseTier || !["free", "subscription", "enterprise"].includes(pack.licenseTier)) {
      errors.push("Valid licenseTier is required ('free', 'subscription', or 'enterprise').");
    }

    // Security linting on requested permissions
    if (pack.permissions) {
      for (const p of pack.permissions) {
        if (p.includes("*") || p === "fs:write:/") {
          errors.push(`Disallowed dangerous permission scope: '${p}'`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Registers a validated pack in the catalog.
   */
  public registerItem(item: MarketplacePackItem): boolean {
    const check = MarketplaceCatalog.validatePack(item);
    if (!check.valid) return false;
    this.items.set(item.id, item);
    return true;
  }

  public getItem(id: string): MarketplacePackItem | undefined {
    return this.items.get(id);
  }

  public listItems(tier?: MarketplaceLicenseTier): MarketplacePackItem[] {
    const all = Array.from(this.items.values());
    if (tier) {
      return all.filter((i) => i.licenseTier === tier);
    }
    return all;
  }

  /**
   * Searches the catalog by text query across name, description, author, and ID.
   */
  public search(query: string, tier?: MarketplaceLicenseTier): MarketplacePackItem[] {
    const q = query.toLowerCase();
    const pool = this.listItems(tier);
    return pool.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q)
    );
  }

  /**
   * Audits permission requests of a pack against sovereign security policy.
   */
  public static auditPermissions(permissions: string[]): {
    safe: boolean;
    requiresUserAck: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let safe = true;
    let requiresUserAck = false;

    for (const p of permissions) {
      if (p.includes("*") || p.startsWith("fs:write:/") || p.startsWith("env:write")) {
        safe = false;
        reasons.push(`Dangerous wildcard or root write permission: ${p}`);
      } else if (p.startsWith("filesystem:write") || p.startsWith("network:") || p.startsWith("exec:")) {
        requiresUserAck = true;
        reasons.push(`Elevated capability requiring explicit operator acknowledgment: ${p}`);
      }
    }

    return { safe, requiresUserAck, reasons };
  }
}
