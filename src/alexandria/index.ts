/**
 * Starlight Alexandria — public surface.
 *
 * import { Alexandria, Library, NativeTransport, FirecrawlTransport } from './dist/alexandria/index.js';
 *
 * A `./alexandria` entry in package.json `exports` is deferred: package.json is
 * digest-pinned by foundry/validators/toolchain.lock.v1.json, and relocking is
 * an independently reviewed step (see docs/boards/2026-09-19-sip-graph-signed-receipts.md).
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */
export * from './types.js';
export { Library, loadCatalog, validateCatalog, scoreCapability, tokenize, DEFAULT_CATALOG_PATH, REPO_ROOT } from './catalog.js';
export { FirecrawlTransport, NativeTransport, MemoryTransport, FIRECRAWL_SCRAPE_URL } from './transport.js';
export { buildReceipt, hashRecords, canonicalJson, attestationBlock, ReceiptLedger, SIP_VERSION, SIP_SUBSTRATE } from './receipts.js';
export { Alexandria, AlexandriaError } from './router.js';
export type { ExecuteRequest, ExecuteResponse, Plan } from './router.js';
export { loadExperiments, validateExperiment, validateRegistry, transition, canTransition, overdue, HOUSES, DEFAULT_EXPERIMENTS_PATH } from './experiments.js';
export { AlexandriaMcpServer, createDefaultServer } from './mcp.js';
