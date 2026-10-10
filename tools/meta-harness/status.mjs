/**
 * status.mjs — System, Harness & Telemetry Auditor for Starlight Meta-Harness
 */

import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VAULTS_DIR = path.join(REPO_ROOT, 'memory', 'vaults');

export const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

export async function probeHttp(url, timeoutMs = 1000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.request({
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: 'GET',
        timeout: timeoutMs,
      }, (res) => {
        resolve({ ok: true, status: res.statusCode });
      });
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
      req.on('error', (err) => resolve({ ok: false, error: err.message }));
      req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

export function getRunningProcesses() {
  const targets = ['opencode', 'codex', 'agy', 'node', 'grok'];
  const running = {};
  for (const t of targets) running[t] = 0;

  try {
    const cmd = `powershell -NoProfile -Command "Get-Process | Where-Object { $_.ProcessName -in 'opencode','codex','agy','node','grok' } | Select-Object -Property ProcessName, Id"`;
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 3000 });
    const lines = out.split('\n').filter(Boolean);
    for (const line of lines) {
      for (const t of targets) {
        if (line.toLowerCase().includes(t)) {
          running[t] = (running[t] || 0) + 1;
        }
      }
    }
  } catch {
    // Fallback if pwsh execution is restricted or timed out
  }
  return running;
}

export function getVaultStats() {
  const stats = {};
  if (!fs.existsSync(VAULTS_DIR)) return stats;
  try {
    const files = fs.readdirSync(VAULTS_DIR).filter(f => f.endsWith('.jsonl') || f.endsWith('.md'));
    for (const f of files) {
      const fullPath = path.join(VAULTS_DIR, f);
      const stat = fs.statSync(fullPath);
      let count = 0;
      const content = fs.readFileSync(fullPath, 'utf8');
      if (f.endsWith('.jsonl')) {
        count = content.split('\n').filter(l => l.trim().length > 0).length;
      } else if (f.endsWith('.md')) {
        count = content.split('\n').filter(l => l.match(/^###\s+\[/)).length;
      }
      stats[f] = { count, sizeBytes: stat.size };
    }
  } catch {}
  return stats;
}

export async function runStatus() {
  const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(2);
  const usedMemGB = (totalMemGB - freeMemGB).toFixed(2);
  const memPct = Math.round((usedMemGB / totalMemGB) * 100);

  const toolPlane = await probeHttp('http://127.0.0.1:7317/mcp');
  const polyBridge = await probeHttp('http://127.0.0.1:7318/health');
  const processes = getRunningProcesses();
  const vaultStats = getVaultStats();

  console.log(`\n${C.cyan}${C.bold}╔══════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║          STARLIGHT SOVEREIGN META-HARNESS: SYSTEM STATUS             ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚══════════════════════════════════════════════════════════════════════╝${C.reset}\n`);

  console.log(`${C.bold}Hardware & Resource Envelope:${C.reset}`);
  console.log(`  • Platform:   ${os.type()} ${os.arch()} (${os.cpus()[0]?.model || '16 cores'})`);
  console.log(`  • RAM Usage:  ${usedMemGB} GB / ${totalMemGB} GB (${memPct}% used) | ${C.green}${freeMemGB} GB free${C.reset}`);

  console.log(`\n${C.bold}Network & Tool Plane Gateway:${C.reset}`);
  console.log(`  • Tool Plane (:7317/mcp):     ${toolPlane.ok ? `${C.green}ONLINE${C.reset} (HTTP ${toolPlane.status})` : `${C.red}OFFLINE${C.reset}`}`);
  console.log(`  • Poly-Bridge (:7318/health): ${polyBridge.ok ? `${C.green}ONLINE${C.reset} (SSE Ready)` : `${C.yellow}STANDBY (Run: starlight bridge start)${C.reset}`}`);

  console.log(`\n${C.bold}Active Agent Harness Processes:${C.reset}`);
  console.log(`  • OpenCode CLI:     ${processes.opencode > 0 ? `${C.green}Active (${processes.opencode} instances)${C.reset}` : `${C.dim}Idle${C.reset}`}`);
  console.log(`  • OpenAI Codex:     ${processes.codex > 0 ? `${C.green}Active (${processes.codex} instances)${C.reset}` : `${C.dim}Idle${C.reset}`}`);
  console.log(`  • Antigravity CLI:  ${processes.agy > 0 ? `${C.green}Active (${processes.agy} instances)${C.reset}` : `${C.dim}Idle${C.reset}`}`);
  console.log(`  • Node Service Bus: ${processes.node > 0 ? `${C.green}${processes.node} processes${C.reset}` : `${C.dim}0${C.reset}`}`);

  console.log(`\n${C.bold}Sovereign Memory Vaults (${VAULTS_DIR}):${C.reset}`);
  const vaultEntries = Object.entries(vaultStats);
  if (vaultEntries.length === 0) {
    console.log(`  ${C.dim}No vault files found in repository.${C.reset}`);
  } else {
    for (const [name, info] of vaultEntries) {
      console.log(`  • ${name.padEnd(28)} : ${C.cyan}${info.count} entries${C.reset} (${(info.sizeBytes / 1024).toFixed(1)} KB)`);
    }
  }
  console.log('');
}
