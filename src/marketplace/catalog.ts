/**
 * Starlight Sovereign Marketplace Catalog & Attestation Engine
 *
 * Provides marketplace schemas, validation, and curation for community skills,
 * harness configs (Claude Code, Grok, Windsurf, Cursor, Antigravity), and modular packs.
 *
 * Attestation: Built on SIP — Marketplace Tier
 */

import { createHmac, createVerify, timingSafeEqual } from "node:crypto";
import type { PackKind } from "../types.js";

export type MarketplaceLicenseTier = "free" | "subscription" | "enterprise";

export type MarketplaceHarnessTarget =
  | "claude-code"
  | "grok"
  | "windsurf"
  | "cursor"
  | "antigravity"
  | "universal";

export type MarketplaceItemKind =
  | PackKind
  | "harness-config"
  | "vertical-pack"
  | "agent-skill";

export interface MarketplacePackItem {
  id: string;
  name: string;
  version: string;
  kind: MarketplaceItemKind;
  harnessTarget?: MarketplaceHarnessTarget;
  author: string;
  description: string;
  licenseTier: MarketplaceLicenseTier;
  permissions: string[];
  attestation: string; // Must contain "Built on SIP"
  manifestSha: string;
  signature?: string;
  publicKey?: string;
  rating?: number;
  downloadCount?: number;
  publishedAt: string;
}

export interface MarketplaceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PublishItemOptions {
  requireSignature?: boolean;
}

export interface PublishItemResult {
  success: boolean;
  item?: MarketplacePackItem;
  errors: string[];
  warnings: string[];
}

export class MarketplaceCatalog {
  private items: Map<string, MarketplacePackItem> = new Map();

  /**
   * Computes deterministic canonical JSON string for payload verification.
   */
  public static getCanonicalPayload(item: Partial<MarketplacePackItem>): string {
    return JSON.stringify({
      id: item.id || "",
      name: item.name || "",
      version: item.version || "",
      kind: item.kind || "",
      harnessTarget: item.harnessTarget || "universal",
      author: item.author || "",
      description: item.description || "",
      licenseTier: item.licenseTier || "free",
      permissions: (item.permissions || []).slice().sort(),
      attestation: item.attestation || "",
      manifestSha: item.manifestSha || "",
    });
  }

  /**
   * Verifies cryptographic signature for a marketplace item using an RSA/Ed25519 public key or HMAC key.
   */
  public static verifySignature(item: MarketplacePackItem, publicKey?: string): boolean {
    const keyToUse = publicKey || item.publicKey;
    if (!item.signature || !keyToUse) return false;

    const payload = MarketplaceCatalog.getCanonicalPayload(item);

    try {
      if (keyToUse.includes("-----BEGIN")) {
        const verifier = createVerify("SHA256");
        verifier.update(payload);
        verifier.end();
        return verifier.verify(keyToUse, item.signature, "hex");
      }
      const expectedHmac = createHmac("sha256", keyToUse).update(payload).digest("hex");
      return timingSafeEqual(Buffer.from(expectedHmac, "utf-8"), Buffer.from(item.signature, "utf-8"));
    } catch {
      return false;
    }
  }

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
    if (
      pack.harnessTarget &&
      !["claude-code", "grok", "windsurf", "cursor", "antigravity", "universal"].includes(pack.harnessTarget)
    ) {
      errors.push(`Invalid harnessTarget: '${pack.harnessTarget}'`);
    }

    // Security linting on requested permissions
    if (pack.permissions) {
      for (const p of pack.permissions) {
        if (
          p.includes("*") ||
          p === "fs:write:/" ||
          p.includes("..") ||
          p.startsWith("exec:rm") ||
          p.startsWith("exec:sudo")
        ) {
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
   * Community publishing protocol method: validates attestation, security linting,
   * cryptographic signature (if present or required), and registers the item.
   */
  public publishItem(item: MarketplacePackItem, options: PublishItemOptions = {}): PublishItemResult {
    const validation = MarketplaceCatalog.validatePack(item);
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (options.requireSignature && !item.signature) {
      errors.push("Cryptographic signature is required for publication under configured policy.");
    }

    if (item.signature && !MarketplaceCatalog.verifySignature(item)) {
      errors.push("Cryptographic signature verification failed.");
    }

    if (errors.length > 0) {
      return { success: false, errors, warnings };
    }

    const publishedItem: MarketplacePackItem = {
      ...item,
      publishedAt: item.publishedAt || new Date().toISOString(),
    };

    this.items.set(publishedItem.id, publishedItem);
    return { success: true, item: publishedItem, errors: [], warnings };
  }

  /**
   * Registers a validated pack in the catalog.
   */
  public registerItem(item: MarketplacePackItem): boolean {
    const res = this.publishItem(item);
    return res.success;
  }

  public getItem(id: string): MarketplacePackItem | undefined {
    return this.items.get(id);
  }

  public listItems(
    filter?:
      | MarketplaceLicenseTier
      | {
          tier?: MarketplaceLicenseTier;
          harnessTarget?: MarketplaceHarnessTarget;
          kind?: MarketplaceItemKind;
        }
  ): MarketplacePackItem[] {
    const options = typeof filter === "string" ? { tier: filter } : filter || {};
    let all = Array.from(this.items.values());

    if (options.tier) {
      all = all.filter((i) => i.licenseTier === options.tier);
    }
    if (options.harnessTarget) {
      all = all.filter(
        (i) => !i.harnessTarget || i.harnessTarget === options.harnessTarget || i.harnessTarget === "universal"
      );
    }
    if (options.kind) {
      all = all.filter((i) => i.kind === options.kind);
    }

    return all;
  }

  /**
   * Searches the catalog by text query across name, description, author, harnessTarget, and ID.
   */
  public search(
    query: string,
    filter?:
      | MarketplaceLicenseTier
      | {
          tier?: MarketplaceLicenseTier;
          harnessTarget?: MarketplaceHarnessTarget;
          kind?: MarketplaceItemKind;
        }
  ): MarketplacePackItem[] {
    const q = query.toLowerCase();
    const pool = this.listItems(filter);
    return pool.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        (item.harnessTarget && item.harnessTarget.toLowerCase().includes(q))
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
      if (
        p.includes("*") ||
        p.startsWith("fs:write:/") ||
        p.startsWith("env:write") ||
        p.includes("..") ||
        p.startsWith("exec:rm") ||
        p.startsWith("exec:sudo")
      ) {
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
