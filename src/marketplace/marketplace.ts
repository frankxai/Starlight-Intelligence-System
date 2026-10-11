/**
 * Starlight Marketplace & Hub — Search & Query Engine
 *
 * Provides typed discovery, filtering, and detail extraction for
 * community and official ecosystem artifacts.
 *
 * Built on SIP — operational layer.
 */

import { MARKETPLACE_CATALOG } from './catalog.js';
import type { MarketplaceItem, MarketplaceSearchFilter } from './types.js';

export class StarlightMarketplace {
  private items: MarketplaceItem[];

  constructor(customCatalog?: MarketplaceItem[]) {
    this.items = customCatalog ?? MARKETPLACE_CATALOG;
  }

  /**
   * Search marketplace items by text query and faceted filters.
   */
  public search(filter: MarketplaceSearchFilter = {}): MarketplaceItem[] {
    return this.items.filter((item) => {
      if (filter.kind && item.kind !== filter.kind) {
        return false;
      }
      if (filter.pricingTier && item.pricingTier !== filter.pricingTier) {
        return false;
      }
      if (filter.category && item.category.toLowerCase() !== filter.category.toLowerCase()) {
        return false;
      }
      if (filter.tag && !item.tags.includes(filter.tag.toLowerCase())) {
        return false;
      }
      if (filter.query) {
        const q = filter.query.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCapability = item.capabilities.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesId && !matchesTag && !matchesCapability) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get all items in the marketplace catalog.
   */
  public getAll(): MarketplaceItem[] {
    return [...this.items];
  }

  /**
   * Get an item by its unique ID.
   */
  public getItem(id: string): MarketplaceItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * List all unique categories across catalog items.
   */
  public listCategories(): string[] {
    const set = new Set<string>();
    for (const item of this.items) {
      set.add(item.category);
    }
    return Array.from(set).sort();
  }

  /**
   * List all featured items for hero showcases.
   */
  public listFeatured(): MarketplaceItem[] {
    return this.items.filter((item) => item.featured);
  }

  /**
   * Get summary statistics of the marketplace ecosystem.
   */
  public getStats(): {
    totalItems: number;
    skillPacksCount: number;
    mcpServersCount: number;
    harnessProfilesCount: number;
    cloudServicesCount: number;
    verticalStacksCount: number;
  } {
    return {
      totalItems: this.items.length,
      skillPacksCount: this.items.filter((i) => i.kind === 'skill_pack').length,
      mcpServersCount: this.items.filter((i) => i.kind === 'mcp_server').length,
      harnessProfilesCount: this.items.filter((i) => i.kind === 'harness_profile').length,
      cloudServicesCount: this.items.filter((i) => i.kind === 'cloud_service').length,
      verticalStacksCount: this.items.filter((i) => i.kind === 'vertical_stack').length,
    };
  }

  /**
   * Register a new item into the marketplace catalog at runtime.
   */
  public registerItem(item: MarketplaceItem): void {
    const existingIndex = this.items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = item;
    } else {
      this.items.push(item);
    }
  }
}
