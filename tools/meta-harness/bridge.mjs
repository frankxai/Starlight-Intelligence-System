/**
 * bridge.mjs — Cross-Transcript Poly-Bridge & SSE Daemon for Starlight Meta-Harness
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as polyBridge from '../memory-bridge/poly-bridge.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runBridge(options = {}) {
  const limit = options.limit || 15;

  if (options.serve) {
    const port = options.port || 7318;
    // Call the server logic directly or launch poly-bridge with --serve
    process.argv = [process.argv[0], path.resolve(__dirname, '..', 'memory-bridge', 'poly-bridge.mjs'), '--serve', String(port)];
    await import('../memory-bridge/poly-bridge.mjs');
    return;
  }

  if (options.watch) {
    process.argv = [process.argv[0], path.resolve(__dirname, '..', 'memory-bridge', 'poly-bridge.mjs'), '--watch'];
    await import('../memory-bridge/poly-bridge.mjs');
    return;
  }

  const events = polyBridge.getAllEvents(limit).reverse();
  console.log(`\n${polyBridge.C.bold}════════ STARLIGHT POLY-BRIDGE: RECENT HARNESS ACTIVITY ════════${polyBridge.C.reset}\n`);
  for (const e of events) {
    console.log(polyBridge.formatEvent(e));
  }
  console.log(`\n${polyBridge.C.dim}Live monitoring: starlight bridge --watch${polyBridge.C.reset}`);
  console.log(`${polyBridge.C.dim}SSE Daemon:      starlight bridge --serve 7318${polyBridge.C.reset}\n`);
}
