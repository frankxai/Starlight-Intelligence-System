/**
 * Starlight Marketplace & Hub — Types
 *
 * Defines the schema for discoverable, publishable, and installable
 * ecosystem artifacts: Skill Packs, MCP Servers, Harness Profiles,
 * Cloud Services, and Domain Verticals.
 *
 * Built on SIP — operational layer.
 */

export type MarketplaceItemKind =
  | 'skill_pack'
  | 'mcp_server'
  | 'harness_profile'
  | 'cloud_service'
  | 'vertical_stack';

export type PricingTier = 'free' | 'freemium' | 'pro' | 'enterprise';

export interface MarketplaceItem {
  id: string;
  name: string;
  version: string;
  kind: MarketplaceItemKind;
  category: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  npmPackage?: string;
  installCommand: string;
  permissions: string[];
  pricingTier: PricingTier;
  manifestSha: string;
  verifiedAttestation: boolean;
  tags: string[];
  capabilities: string[];
  rating?: number;
  downloadsCount?: number;
  featured?: boolean;
}

export interface MarketplaceSearchFilter {
  query?: string;
  kind?: MarketplaceItemKind;
  category?: string;
  pricingTier?: PricingTier;
  tag?: string;
}
