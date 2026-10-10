#!/usr/bin/env node
/**
 * starlight-meta.mjs — Starlight Sovereign Meta-Harness Unified CLI
 * 
 * Batteries-included orchestration substrate for all AI agent harnesses.
 * Features:
 *   - status: Telemetry, RAM, storage, process and Tool Plane auditor
 *   - sync: Zero-copy NTFS skill mesh projection across harnesses
 *   - bridge: Cross-transcript streaming & SSE daemon (:7318)
 *   - arena: Maker ≠ Checker multi-agent tournament dispatcher
 *   - memory: Sovereign vault search and event-sourced appending
 */

import { runStatus, C } from './status.mjs';
import { runSync } from './sync.mjs';
import { runBridge } from './bridge.mjs';
import { runArena } from './arena.mjs';
import { searchVaults, appendVault } from './memory.mjs';

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'help';

function printHelp() {
  console.log(`
${C.cyan}${C.bold}╔══════════════════════════════════════════════════════════════════════╗
║          STARLIGHT SOVEREIGN META-HARNESS CLI v1.0.0                 ║
║       "Batteries-Included Multi-Agent Substrate Built on SIP"        ║
╚══════════════════════════════════════════════════════════════════════╝${C.reset}

${C.bold}USAGE:${C.reset}
  node tools/meta-harness/starlight-meta.mjs <command> [options]

${C.bold}COMMANDS:${C.reset}
  ${C.green}status${C.reset}                        Inspect RAM, storage boundaries, active harnesses & tool plane
  ${C.green}sync${C.reset}                          Zero-copy project 480+ skills to OpenCode, Kilo, Codex
  ${C.green}bridge${C.reset}                        Inspect or stream cross-transcript events from all harnesses
      --recent [limit]          Print last N events across Codex, OpenCode, Claude
      --watch                   Live console monitor of all agent activities
      --serve [port]            Start lightweight SSE & HTTP daemon (default: 7318)
  ${C.green}arena${C.reset}                         Run multi-agent tournament & Maker ≠ Checker Santa audit
      run --task="<task>"       Dispatch tournament card to Antigravity, Codex, OpenCode
      --dry-run                 Simulate tournament dispatch and audit without executing
  ${C.green}memory${C.reset}                        Query or append to the 6 sovereign vaults
      search "<query>"          Search Strategic, Technical, Creative, Operational, Wisdom
      append --vault=<name>     Append pattern or decision to specified vault
  ${C.green}help${C.reset}                          Display this help menu

${C.bold}EXAMPLES:${C.reset}
  node tools/meta-harness/starlight-meta.mjs status
  node tools/meta-harness/starlight-meta.mjs sync
  node tools/meta-harness/starlight-meta.mjs bridge --recent 5
  node tools/meta-harness/starlight-meta.mjs bridge --serve 7318
  node tools/meta-harness/starlight-meta.mjs arena run --task="Refactor Lane Guard"
  node tools/meta-harness/starlight-meta.mjs memory search "Maker Checker"
`);
}

async function main() {
  try {
    switch (command) {
      case 'status':
        await runStatus();
        break;

      case 'sync':
        runSync();
        break;

      case 'bridge': {
        const isWatch = args.includes('--watch');
        const isServe = args.includes('--serve') || args.includes('-s');
        const servePort = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1] || (args.includes('--serve') ? args[args.indexOf('--serve') + 1] : null) || '7318', 10);
        const limitArg = args.find(a => a.startsWith('--recent='))?.split('=')[1] || (args.includes('--recent') ? args[args.indexOf('--recent') + 1] : null);
        const limit = limitArg ? parseInt(limitArg, 10) : 15;

        await runBridge({
          watch: isWatch,
          serve: isServe,
          port: isNaN(servePort) ? 7318 : servePort,
          limit: isNaN(limit) ? 15 : limit
        });
        break;
      }

      case 'arena': {
        const subcmd = args[1];
        const taskArg = args.find(a => a.startsWith('--task='))?.split('=')[1] || 'Autonomous Meta-Harness Optimization';
        const repoArg = args.find(a => a.startsWith('--repo='))?.split('=')[1] || 'repos/Starlight-Intelligence-System';
        const isDryRun = args.includes('--dry-run');

        await runArena({
          task: taskArg,
          repo: repoArg,
          dryRun: isDryRun || subcmd !== 'run'
        });
        break;
      }

      case 'memory': {
        const subcmd = args[1] ? args[1].toLowerCase() : 'help';
        if (subcmd === 'search') {
          const query = args[2] || '';
          const vaultArg = args.find(a => a.startsWith('--vault='))?.split('=')[1];
          searchVaults(query, { vault: vaultArg });
        } else if (subcmd === 'append') {
          const vaultArg = args.find(a => a.startsWith('--vault='))?.split('=')[1] || 'operational';
          const titleArg = args.find(a => a.startsWith('--title='))?.split('=')[1] || 'Session Learning';
          const contentArg = args.find(a => a.startsWith('--content='))?.split('=')[1] || 'Documented learning from execution.';
          appendVault(vaultArg, titleArg, contentArg);
        } else {
          console.log(`\nUsage: memory search "<query>" [--vault=name] | memory append --vault=<name> --title="..." --content="..."\n`);
        }
        break;
      }

      case 'help':
      default:
        printHelp();
        break;
    }
  } catch (err) {
    console.error(`\n${C.red}${C.bold}Error:${C.reset} ${err.message}\n`);
    process.exit(1);
  }
}

main();
