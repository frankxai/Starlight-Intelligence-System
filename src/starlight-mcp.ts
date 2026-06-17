#!/usr/bin/env node
/**
 * Starlight Intelligence System — Substrate MCP Server (v1.1)
 *
 * Exposes the SIP substrate as queryable MCP tools over stdio.
 * Pure JSON-RPC 2.0 — zero external dependencies. Mirrors the pattern in
 * `src/mcp-server.ts` (the v6 vault MCP) for style and discipline.
 *
 * This is the SIP v1.1 substrate MCP planned in REGISTRY.md. It reads the
 * substrate's own canonical files (REGISTRY.md, VERTICALS.md, MEMORY.md,
 * SIP.md) and surfaces them as tools.
 *
 * Bin naming: the package's existing `starlight-mcp` bin name is taken by
 * the v6 vault MCP (`dist/mcp-server.js`). To avoid breaking that surface
 * for current installs, this binary registers as `starlight-substrate-mcp`.
 * Once v7.x deprecates the legacy name, we can promote this one.
 *
 * Tools (4):
 *   1. starlight_registry_query    — query the SIP MCP registry
 *   2. starlight_verticals_list    — list sovereign verticals + alliances
 *   3. starlight_attestation_verify — verify a "Built on SIP" attestation block
 *   4. starlight_alliance_status   — read the alliance table from MEMORY.md
 *
 * Usage: node dist/starlight-mcp.js [--substrate-dir <path>]
 *        Default substrate-dir is the repo root containing REGISTRY.md.
 */
import { createInterface } from 'node:readline';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSipVersion } from './version.js';

// ── Interfaces ────────────────────────────────────────────────
export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
interface JsonRpcRequest {
  jsonrpc?: string;
  method: string;
  params?: unknown;
  id?: number | string | null;
}
interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface RegistryEntry {
  name: string;
  sip_version?: string;
  owner?: string;
  status?: string;
  repo?: string;
  endpoint?: string;
  provides?: string[];
  requires?: string[];
  license?: string;
  attestation?: string;
}

export interface VerticalEntry {
  name: string;
  class?: string;
  domain?: string;
  owner?: string;
  status?: string;
  repo?: string;
  public_surface?: string;
  canon?: string;
}

export interface AllianceRow {
  alliance: string;
  members?: string;
  role?: string;
  status?: string;
}

export interface AttestationParsed {
  substrate_version: string | null;
  layers: string[];
  verticals: string[];
  canon: string[];
  nodes: string[];
  generated: string | null;
}

// ── Helpers ───────────────────────────────────────────────────
function readIfExists(path: string): string | null {
  if (!existsSync(path)) return null;
  try { return readFileSync(path, 'utf-8'); } catch { return null; }
}

/** Strip leading list markers, surrounding markdown emphasis, and trim. */
function clean(s: string): string {
  return s.replace(/^[-*\s]+/, '').replace(/\*\*/g, '').replace(/[`*]/g, '').trim();
}

/** Parse a YAML-style key inside a markdown bullet: `- **key:** value` or `- key: value`. */
function parseBulletKv(line: string): { key: string; value: string } | null {
  const m = line.match(/^\s*[-*]\s*\*{0,2}([\w_.-]+)\*{0,2}\s*:\s*(.+?)\s*$/);
  if (!m) return null;
  return { key: m[1].toLowerCase(), value: clean(m[2]) };
}

/** Parse a markdown table into rows of column→value. Returns [] if no table found. */
function parseMarkdownTable(block: string): Record<string, string>[] {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  let headerIdx = -1;
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[i + 1])) {
      headerIdx = i; break;
    }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split('|').map(c => c.trim()).filter(Boolean).map(h => h.toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    if (!lines[i].startsWith('|')) break;
    const cells = lines[i].split('|').map(c => c.trim());
    // Strip leading/trailing empty cells from `| a | b |` splits
    while (cells.length && cells[0] === '') cells.shift();
    while (cells.length && cells[cells.length - 1] === '') cells.pop();
    if (!cells.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

/**
 * Parse REGISTRY.md into a list of registry entries.
 * Format: each entry begins with `### <name>` and is followed by bullet
 * lines of the shape `- **key:** value` (per Layer 3 schema).
 */
export function parseRegistry(md: string): RegistryEntry[] {
  // Only parse server entries inside the registry's "Active servers" section.
  // Later H3 headings ("Schema", "Active", "Planned") describe Claws and
  // registration mechanics; treating every H3 in REGISTRY.md as an MCP server
  // creates phantom registry rows.
  const activeServers = md.match(/##\s+Active servers[\s\S]*?(?=\n##\s+|$)/i)?.[0] ?? '';
  const sections = activeServers.split(/^###\s+/m).slice(1);
  const out: RegistryEntry[] = [];
  for (const section of sections) {
    const lines = section.split('\n');
    const headLine = lines.shift() ?? '';
    // Heading may include ` *(v1.1 — planned)*` annotation — strip it.
    const nameMatch = headLine.match(/^([\w.-]+)/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();
    const entry: RegistryEntry = { name };
    // Status hint from heading annotation
    if (/\bplanned\b/i.test(headLine)) entry.status = 'planned';

    let inProvides = false;
    for (const raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) { inProvides = false; continue; }
      // Collect nested bullets under `provides:` (e.g. `  - tool — desc`).
      if (inProvides && /^\s{2,}[-*]\s+/.test(line)) {
        const tool = clean(line).split(/\s+[—-]\s+/)[0];
        if (tool) (entry.provides ??= []).push(tool);
        continue;
      }
      const kv = parseBulletKv(line);
      if (!kv) { inProvides = false; continue; }
      switch (kv.key) {
        case 'sip_version': entry.sip_version = kv.value.replace(/\s*\(.*\)\s*$/, ''); break;
        case 'owner':       entry.owner = kv.value; break;
        case 'status':      entry.status = kv.value; break;
        case 'repo':        entry.repo = kv.value; break;
        case 'endpoint':    entry.endpoint = kv.value; break;
        case 'license':     entry.license = kv.value; break;
        case 'attestation': entry.attestation = kv.value; break;
        case 'requires': {
          if (kv.value.toLowerCase() === 'none') entry.requires = [];
          else entry.requires = kv.value.split(',').map(s => s.trim()).filter(Boolean);
          break;
        }
        case 'provides':
        case 'provides (planned)': {
          inProvides = true;
          // Inline form: `provides: [a, b, c]`
          const inline = kv.value.match(/^\[(.*)\]$/);
          if (inline) {
            entry.provides = inline[1].split(',').map(s => s.trim()).filter(Boolean);
            inProvides = false;
          } else {
            entry.provides = [];
          }
          break;
        }
        default: /* unknown key, skip */ break;
      }
    }
    out.push(entry);
  }
  return out;
}

/**
 * Parse VERTICALS.md into a list of vertical entries.
 * Format: each vertical begins with `### <name>` under the
 * "## Sovereign verticals" section. Same bullet shape as registry.
 */
export function parseVerticals(md: string): VerticalEntry[] {
  // Only consider sections under "## Sovereign verticals" — alliances are
  // explicitly tracked elsewhere (private to each alliance per spec).
  const sovereignMatch = md.match(/##\s+Sovereign verticals[\s\S]*?(?=\n##\s+|\n---\s*\n|$)/);
  if (!sovereignMatch) return [];
  const sections = sovereignMatch[0].split(/^###\s+/m).slice(1);
  const out: VerticalEntry[] = [];
  for (const section of sections) {
    const lines = section.split('\n');
    const headLine = lines.shift() ?? '';
    const name = headLine.trim();
    if (!name) continue;
    const entry: VerticalEntry = { name };
    for (const raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) continue;
      const kv = parseBulletKv(line);
      if (!kv) continue;
      switch (kv.key) {
        case 'class':          entry.class = kv.value; break;
        case 'domain':         entry.domain = kv.value; break;
        case 'owner':          entry.owner = kv.value; break;
        case 'status':         entry.status = kv.value; break;
        case 'primary repo':
        case 'repo':           entry.repo = kv.value; break;
        case 'public surface': entry.public_surface = kv.value; break;
        case 'canon':          entry.canon = kv.value; break;
        default: break;
      }
    }
    out.push(entry);
  }
  return out;
}

/**
 * Parse a "Built on SIP" attestation block out of arbitrary markdown.
 * Accepts both the minimum form (SIP.md § Layer 2 lines 41-49) and the
 * extended form emitted by /sip-attest (lines 42-63 of sip-attest.md).
 */
export function parseAttestation(content: string): { found: boolean; parsed: AttestationParsed; issues: string[] } {
  const issues: string[] = [];
  const parsed: AttestationParsed = {
    substrate_version: null, layers: [], verticals: [], canon: [], nodes: [], generated: null,
  };

  // Find a fenced ``` block OR a `---`-delimited block that contains "Built on SIP".
  const blocks: string[] = [];
  // Fenced
  const fenceRe = /```[\s\S]*?```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(content)) !== null) {
    if (/Built on SIP/i.test(m[0])) blocks.push(m[0].replace(/^```\w*\n?|\n?```$/g, ''));
  }
  // Triple-dash delimited
  const dashRe = /(^|\n)---\s*\n([\s\S]*?)\n---(\s|$)/g;
  while ((m = dashRe.exec(content)) !== null) {
    if (/Built on SIP/i.test(m[2])) blocks.push(m[2]);
  }
  // If nothing fenced, treat the whole content as a candidate when it contains the marker.
  if (!blocks.length && /Built on SIP/i.test(content)) blocks.push(content);

  if (!blocks.length) {
    return { found: false, parsed, issues: ['No "Built on SIP" attestation block detected'] };
  }

  const block = blocks[0];
  const lines = block.split('\n');

  // Field extraction — tolerant of both forms.
  let mode: 'verticals' | 'canon' | 'nodes' | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { mode = null; continue; }

    // Substrate version
    const sub = line.match(/Substrate\s*:\s*(\S+)\s+v?([\d.]+\S*)/i);
    if (sub) { parsed.substrate_version = sub[2]; mode = null; continue; }

    // Layers used: [a, b, c]   OR    Layers: [...]
    const layers = line.match(/Layers(?:\s+used)?\s*:\s*\[?(.*?)\]?\s*$/i);
    if (layers && /^Layers/i.test(line)) {
      parsed.layers = layers[1].split(',').map(s => clean(s)).filter(Boolean);
      mode = null; continue;
    }

    // Section openers
    if (/^[-*]?\s*Verticals\s*:/i.test(line)) {
      const inline = line.match(/Verticals\s*:\s*\[(.*?)\]/i);
      if (inline) parsed.verticals = inline[1].split(',').map(s => clean(s)).filter(Boolean);
      else mode = 'verticals';
      continue;
    }
    if (/^[-*]?\s*Canon\s*:/i.test(line)) {
      const inline = line.match(/Canon\s*:\s*\[(.*?)\]/i);
      if (inline) {
        const v = clean(inline[1]);
        parsed.canon = v.toLowerCase() === 'none' ? [] : v.split(',').map(s => clean(s)).filter(Boolean);
      } else mode = 'canon';
      continue;
    }
    if (/^[-*]?\s*Nodes(?:\s*\(.*\))?\s*:/i.test(line)) {
      const inline = line.match(/Nodes(?:\s*\(.*\))?\s*:\s*\[(.*?)\]/i);
      if (inline) parsed.nodes = inline[1].split(',').map(s => clean(s)).filter(Boolean);
      else mode = 'nodes';
      continue;
    }
    const gen = line.match(/Generated\s*:\s*(.+)$/i);
    if (gen) { parsed.generated = clean(gen[1]); mode = null; continue; }

    // Continuation lines under a section opener (extended form bullets).
    if (mode && /^[-*]\s+/.test(line)) {
      const value = clean(line);
      if (mode === 'verticals') parsed.verticals.push(value);
      else if (mode === 'canon') parsed.canon.push(value);
      else if (mode === 'nodes') parsed.nodes.push(value);
    }
  }

  // Shape validation per SIP § Layer 2 minimum block.
  if (!parsed.substrate_version) issues.push('Missing or unparseable Substrate version');
  if (!parsed.verticals.length) issues.push('Missing Verticals list');
  if (!parsed.generated) issues.push('Missing Generated timestamp');

  return { found: true, parsed, issues };
}

/**
 * Parse the alliance table out of MEMORY.md. The public template renders
 * an empty (placeholder) table — that's expected; we return [].
 */
export function parseAllianceTable(md: string): AllianceRow[] {
  const sectionMatch = md.match(/##\s+Alliances[\s\S]*?(?=\n##\s+|\n---\s*\n|$)/i);
  if (!sectionMatch) return [];
  const rows = parseMarkdownTable(sectionMatch[0]);
  const out: AllianceRow[] = [];
  for (const row of rows) {
    const alliance = row['alliance'] ?? '';
    // Skip placeholder rows (`<name>`, `...`, etc.)
    if (!alliance || /^[<.`]/.test(alliance) || alliance === '...') continue;
    out.push({
      alliance: clean(alliance),
      members: row['members'] ? clean(row['members']) : undefined,
      role: row['your role'] ? clean(row['your role']) : undefined,
      status: row['status'] ? clean(row['status']) : undefined,
    });
  }
  return out;
}

// ── Server ────────────────────────────────────────────────────
export class StarlightSubstrateMcpServer {
  private tools = new Map<string, { definition: McpTool; handler: (p: Record<string, unknown>) => unknown }>();
  private substrateDir: string;

  constructor(substrateDir: string) {
    this.substrateDir = substrateDir;
    this.registerTools();
  }

  private reg(def: McpTool, handler: (p: Record<string, unknown>) => unknown): void {
    this.tools.set(def.name, { definition: def, handler });
  }

  private substrateFile(name: string): string {
    return join(this.substrateDir, name);
  }

  private registerTools(): void {
    // 1. starlight_registry_query — query the SIP MCP registry (REGISTRY.md)
    this.reg({
      name: 'starlight_registry_query',
      description: 'Query the SIP MCP server registry. Returns SIP-compliant MCP servers declared in REGISTRY.md per SIP § Layer 3.',
      inputSchema: { type: 'object', properties: {
        status: { type: 'string', enum: ['active', 'planned', 'dormant', 'deprecated'] },
        name: { type: 'string' },
      }},
    }, (p) => {
      const md = readIfExists(this.substrateFile('REGISTRY.md'));
      if (md == null) return { error: 'REGISTRY.md not found in substrate directory' };
      let entries = parseRegistry(md);
      if (p.status) {
        const want = String(p.status).toLowerCase();
        entries = entries.filter(e => (e.status ?? '').toLowerCase().includes(want));
      }
      if (p.name) {
        const want = String(p.name).toLowerCase();
        entries = entries.filter(e => e.name.toLowerCase().includes(want));
      }
      return { count: entries.length, servers: entries };
    });

    // 2. starlight_verticals_list — list sovereign verticals (VERTICALS.md)
    this.reg({
      name: 'starlight_verticals_list',
      description: 'List sovereign verticals declared in VERTICALS.md. Each vertical adopts the SIS pattern and carries SIP attestation on shipped artifacts.',
      inputSchema: { type: 'object', properties: {
        status: { type: 'string' },
        owner: { type: 'string' },
      }},
    }, (p) => {
      const md = readIfExists(this.substrateFile('VERTICALS.md'));
      if (md == null) return { error: 'VERTICALS.md not found in substrate directory' };
      let verticals = parseVerticals(md);
      if (p.status) {
        const want = String(p.status).toLowerCase();
        verticals = verticals.filter(v => (v.status ?? '').toLowerCase().includes(want));
      }
      if (p.owner) {
        const want = String(p.owner).toLowerCase();
        verticals = verticals.filter(v => (v.owner ?? '').toLowerCase().includes(want));
      }
      return { count: verticals.length, verticals };
    });

    // 3. starlight_attestation_verify — verify a "Built on SIP" attestation block
    this.reg({
      name: 'starlight_attestation_verify',
      description: 'Verify the shape of a "Built on SIP" attestation block per SIP § Layer 2. Accepts inline content or a file path. Reports validity, issues, and the parsed substrate/layers/verticals/canon/nodes/generated fields.',
      inputSchema: { type: 'object', properties: {
        content: { type: 'string' },
        path: { type: 'string' },
      }},
    }, (p) => {
      let source = '';
      if (typeof p.content === 'string' && p.content.length) {
        source = p.content;
      } else if (typeof p.path === 'string' && p.path.length) {
        const filePath = resolve(p.path);
        if (!existsSync(filePath)) return { valid: false, issues: [`File not found: ${filePath}`], parsed: null };
        try {
          if (statSync(filePath).isDirectory()) return { valid: false, issues: [`Path is a directory: ${filePath}`], parsed: null };
          source = readFileSync(filePath, 'utf-8');
        } catch (err) {
          return { valid: false, issues: [`Read failed: ${err instanceof Error ? err.message : String(err)}`], parsed: null };
        }
      } else {
        return { valid: false, issues: ['Provide either `content` or `path`'], parsed: null };
      }
      const { found, parsed, issues } = parseAttestation(source);
      if (!found) return { valid: false, issues, parsed };
      return { valid: issues.length === 0, issues, parsed };
    });

    // 4. starlight_alliance_status — read alliance rows from MEMORY.md
    // TODO(v1.2): integrate Notion DB for live alliance cycle state per
    // REGISTRY.md "starlight.alliance.status" planned tool. v1.1 reads the
    // local MEMORY.md table only — the public template is sanitized and
    // returns an empty list, which is the correct behavior.
    this.reg({
      name: 'starlight_alliance_status',
      description: 'Return alliance rows parsed from MEMORY.md. v1.1 reads the local file only (no Notion integration). Public substrate ships with a sanitized template — empty result is expected, not an error.',
      inputSchema: { type: 'object', properties: {
        alliance: { type: 'string' },
      }},
    }, (p) => {
      const md = readIfExists(this.substrateFile('MEMORY.md'));
      if (md == null) return { error: 'MEMORY.md not found in substrate directory' };
      let rows = parseAllianceTable(md);
      if (p.alliance) {
        const want = String(p.alliance).toLowerCase();
        rows = rows.filter(r => r.alliance.toLowerCase().includes(want));
      }
      return {
        count: rows.length,
        alliances: rows,
        source: 'MEMORY.md (local)',
        notion_integration: 'planned for v1.2',
      };
    });
  }

  // ── JSON-RPC Dispatch ───────────────────────────────────────
  handleRequest(request: JsonRpcRequest): JsonRpcResponse | null {
    const { method, params, id } = request;
    if (method === 'notifications/initialized') return null;
    const rpcId = id ?? null;

    if (method === 'initialize') {
      return { jsonrpc: '2.0', id: rpcId, result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'starlight-substrate-mcp', version: getSipVersion().replace(/^v/, '') },
      }};
    }
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id: rpcId, result: {
        tools: Array.from(this.tools.values()).map(t => t.definition),
      }};
    }
    if (method === 'tools/call') {
      const p = (params ?? {}) as Record<string, unknown>;
      const name = String(p.name ?? ''), args = (p.arguments ?? {}) as Record<string, unknown>;
      const tool = this.tools.get(name);
      if (!tool) return { jsonrpc: '2.0', id: rpcId, error: { code: -32601, message: `Unknown tool: ${name}` } };
      try {
        const result = tool.handler(args);
        return { jsonrpc: '2.0', id: rpcId, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } };
      } catch (err) {
        return { jsonrpc: '2.0', id: rpcId, result: {
          content: [{ type: 'text', text: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }) }],
          isError: true,
        }};
      }
    }
    return { jsonrpc: '2.0', id: rpcId, error: { code: -32601, message: `Method not found: ${method}` } };
  }

  // ── Start ───────────────────────────────────────────────────
  start(): void {
    const rl = createInterface({ input: process.stdin, terminal: false });
    rl.on('line', (line) => {
      if (!line.trim()) return;
      let request: JsonRpcRequest;
      try { request = JSON.parse(line); } catch {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n');
        return;
      }
      const response = this.handleRequest(request);
      if (response) process.stdout.write(JSON.stringify(response) + '\n');
    });
    process.stderr.write(`[starlight-substrate-mcp] MCP server started, substrate: ${this.substrateDir}\n`);
  }
}

// ── CLI Entry Point ───────────────────────────────────────────
function defaultSubstrateDir(): string {
  // Walk up from this file's location looking for REGISTRY.md.
  // When installed via npm, the package root is two dirs up from dist/.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'REGISTRY.md'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: cwd.
  return process.cwd();
}

function main(): void {
  const args = process.argv.slice(2);
  let substrateDir = defaultSubstrateDir();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--substrate-dir' && args[i + 1]) { substrateDir = resolve(args[++i]); }
  }
  const server = new StarlightSubstrateMcpServer(substrateDir);
  server.start();
}

main();
