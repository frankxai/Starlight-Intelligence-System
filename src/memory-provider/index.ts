/**
 * SIS Memory Provider boundary (see GitHub issue #64).
 * Portable contract lives in @starlight-intelligence/memory.
 * SIS owns: protocol integration, vaults, evals, product behavior.
 * starlight-memory owns: portable interfaces, router, adapters, privacy policy, outbox.
 *
 * Feature flag: SIS_USE_STARLIGHT_MEMORY_PROVIDER=1 to prefer the extracted package.
 * Compatibility adapter provided; existing local module NOT deleted in this change.
 */

export * from "./types.js";
export * from "./resources.js";
export * from "./router.js";
export * from "./local-core-provider.js";
export * from "./mem0-remote-provider.js";
export * from "./ttl-cache.js";

// Narrow compatibility adapter for gradual adoption of starlight-memory package boundary.
// Maps SIS-specific behavior; intentional diffs documented in migration receipt.
export * as starlightMemory from "./sis-memory-compatibility-adapter.js";
export { createStarlightMemoryCompatibilityAdapter } from "./sis-memory-compatibility-adapter.js";