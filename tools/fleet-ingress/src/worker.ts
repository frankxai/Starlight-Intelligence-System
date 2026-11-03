/**
 * Production Cloudflare Workers entrypoint (`wrangler.jsonc` `"main": "src/worker.ts"`).
 *
 * Exports ONLY the default Worker handler and `WebhookDeduplicator` Durable Object class
 * so `workerd` never encounters primitive/numeric constant exports on the root module.
 */
export { WebhookDeduplicator, default } from './index.ts';
