/**
 * SIS Compatibility Adapter for starlight-memory (GitHub #64)
 *
 * This provides a narrow bridge so SIS can adopt the portable package without
 * immediate full cutover.
 *
 * - Feature flag: process.env.SIS_USE_STARLIGHT_MEMORY_PROVIDER === '1'
 * - Local module remains authoritative until migration receipt + pinned release.
 * - Documented diffs: see router policy, local_core canonical status, privacy projection rules.
 *
 * Usage:
 *   import { createStarlightMemoryCompatibilityAdapter } from './sis-memory-compatibility-adapter.js';
 *   const adapter = createStarlightMemoryCompatibilityAdapter({ usePackage: true });
 */

import type { SISMemoryRecord, TenantMemoryPolicy, ProviderRoute } from './types.js';

// Attempt to load the portable package (will resolve via file: dep or symlink after `pnpm install`)
let StarlightMemory: any = null;
try {
  // Dynamic to allow feature flag and graceful fallback
  // @ts-ignore - package may be linked or installed
  StarlightMemory = await import('@starlight-intelligence/memory');
} catch {
  // fallback will use local implementations
  console.warn('[memory-boundary] Could not load @starlight-intelligence/memory; using local provider (expected in early dev or before pinned release)');
}

export interface CompatibilityOptions {
  usePackage?: boolean;
  policy?: TenantMemoryPolicy;
}

export function createStarlightMemoryCompatibilityAdapter(options: CompatibilityOptions = {}) {
  const usePackage = options.usePackage ?? (process.env.SIS_USE_STARLIGHT_MEMORY_PROVIDER === '1');
  const basePolicy = options.policy || { local_only: false } as TenantMemoryPolicy;

  if (usePackage && StarlightMemory) {
    // Delegate to package when enabled
    return {
      routeMemoryRecord: StarlightMemory.routeMemoryRecord || ((_record: SISMemoryRecord, _policy: TenantMemoryPolicy) => [{ provider: 'local_core' as const, mode: 'canonical_write' as const, reason: 'package delegation fallback' }]),
      // Add other adapters as needed (Mem0 etc from package)
      name: 'starlight-memory-compat-package',
    };
  }

  // Local fallback (current SIS behavior)
  return {
    routeMemoryRecord: (_record: SISMemoryRecord, _policy: TenantMemoryPolicy = basePolicy): ProviderRoute[] => {
      // Simplified local route for compatibility (full impl in ./router.js)
      return [{ provider: 'local_core' as const, mode: 'canonical_write' as const, reason: 'SIS canonical (compat adapter)' }];
    },
    name: 'starlight-memory-compat-local',
  };
}

// Re-export types for consumers
export type { MemoryProvider, SISMemoryRecord, TenantMemoryPolicy, ProviderRoute } from './types.js';

/**
 * Migration receipt stub (expand before flipping default):
 * - Verified package vX.Y.Z pinned.
 * - Tests: memory-provider-* all pass.
 * - Privacy: secret/regulated never exported in tests.
 * - Rollback: revert env flag + dep.
 * - Diffs logged: local_core remains SIS authority; package adds persistent-local-core.
 */
export const MIGRATION_RECEIPT = {
  status: 'in-progress',
  targetPackageVersion: '>=0.2.0',
  featureFlag: 'SIS_USE_STARLIGHT_MEMORY_PROVIDER',
  date: new Date().toISOString(),
};