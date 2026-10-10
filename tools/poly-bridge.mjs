#!/usr/bin/env node
// Explicit inputs only. No global scanning, provider calls, or resident daemon.
import { ContextBridge } from '../src/context-bridge.ts';
const flags = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]; const value = process.argv[i + 1];
  if (!key.startsWith('--') || !value || flags.has(key)) throw new Error('Use unique --name value arguments');
  flags.set(key,value);
}
const allowed = ['journal','input','source','format','task','harness','session','repo','revision','duration-ms','packet'];
if ([...flags.keys()].some(k => !allowed.includes(k.slice(2)))) throw new Error('Unknown argument');
if (!flags.get('--journal')) throw new Error('--journal is required; use a task-owned private runtime path');
const bridge = new ContextBridge(flags.get('--journal'));
const duration = Number(flags.get('--duration-ms') ?? 0);
if (!Number.isInteger(duration) || duration < 0 || duration > 300000) throw new Error('Duration must be 0..300000ms');
try {
  if (flags.has('--packet')) console.log(JSON.stringify(bridge.packet(flags.get('--packet'))));
  else {
    if (!flags.get('--input') || !flags.get('--source')) throw new Error('--input and --source are required');
    const end = Date.now() + duration;
    do {
      const result = await bridge.capture({ input:flags.get('--input'),sourceId:flags.get('--source'),
        format:flags.get('--format') ?? 'events',taskId:flags.get('--task'),harness:flags.get('--harness'),
        sessionId:flags.get('--session'),repo:flags.get('--repo'),revision:flags.get('--revision') });
      console.log(JSON.stringify(result));
      if (Date.now() >= end) break;
      await new Promise(done => setTimeout(done,1000));
    } while (Date.now() < end);
  }
} catch { console.error('Capture failed; source and committed state preserved. Inspect locally.'); process.exitCode = 1; }
