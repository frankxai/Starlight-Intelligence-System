#!/usr/bin/env node
// cockpit/mcp/server.js -- MCP server exposing Cockpit Continuity state as tools
//
// Usage (in any Claude Code / Cursor / etc settings):
//   "mcpServers": {
//     "cockpit": { "command": "node", "args": ["<path>/cockpit/mcp/server.js"] }
//   }
//
// Tools exposed:
//   - cockpit_status         -- list alive agent sessions
//   - cockpit_snapshot       -- capture current workspace topology
//   - cockpit_rehydrate      -- (dry-run by default) plan workspace rebuild
//   - cockpit_query_sessions -- search session history with filters
//   - cockpit_save_workspace -- save current state under a name
//   - cockpit_load_workspace -- (dry-run by default) load a named workspace
//   - cockpit_list_workspaces
//   - cockpit_recent_events  -- tail the structured event log
//
// All tools are read-only or dry-run safe by default. Write/spawn ops require explicit confirm=true.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const COCKPIT_HOME = process.env.COCKPIT_HOME || path.join(os.homedir(), '.starlight', 'cockpit');
const MANIFEST_PATH = path.join(COCKPIT_HOME, 'sessions.jsonl');
const SNAPSHOT_PATH = path.join(COCKPIT_HOME, 'last-snapshot.json');
const EVENTS_LOG = path.join(COCKPIT_HOME, 'events.log');
const WORKSPACES_DIR = path.join(COCKPIT_HOME, 'workspaces');

// Repo-relative path to PowerShell scripts (resolved from this file's location)
const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:'));
const COCKPIT_ROOT = path.resolve(__dirname, '..');

// ---------- helpers ----------

async function readManifest() {
  if (!existsSync(MANIFEST_PATH)) return [];
  const raw = await readFile(MANIFEST_PATH, 'utf8');
  const rows = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      // skip corrupt lines
    }
  }
  return rows;
}

function isPidAlive(pid) {
  if (!pid || typeof pid !== 'number') return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

async function getAliveSessions(filterAgent) {
  const rows = await readManifest();
  if (rows.length === 0) return [];

  // Latest event per session_id wins
  const latest = new Map();
  for (const r of rows) {
    if (filterAgent && r.agent !== filterAgent) continue;
    if (!r.session_id) continue;
    const key = `${r.agent}:${r.session_id}`;
    const cur = latest.get(key);
    if (!cur || r.ts > cur.ts) latest.set(key, r);
  }

  const alive = [];
  for (const r of latest.values()) {
    if (r.event !== 'start' && r.event !== 'heartbeat') continue;
    if (!isPidAlive(r.pid)) continue;
    alive.push(r);
  }
  return alive;
}

async function listWorkspaces() {
  if (!existsSync(WORKSPACES_DIR)) return [];
  const entries = await readdir(WORKSPACES_DIR);
  const items = [];
  for (const f of entries) {
    if (!f.endsWith('.json')) continue;
    try {
      const raw = await readFile(path.join(WORKSPACES_DIR, f), 'utf8');
      const ws = JSON.parse(raw);
      if (ws.schema !== 'cockpit.workspace/v1') continue;
      let paneCount = 0;
      for (const w of (ws.snapshot?.windows || [])) {
        for (const t of (w.tabs || [])) paneCount += (t.panes || []).length;
      }
      items.push({
        name: ws.name,
        description: ws.description || '',
        created_at: ws.created_at,
        updated_at: ws.updated_at,
        pane_count: paneCount,
      });
    } catch {}
  }
  return items.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
}

function runPwshScript(scriptName, args = []) {
  return new Promise((resolve) => {
    const scriptPath = path.join(COCKPIT_ROOT, 'scripts', scriptName);
    const isWindows = process.platform === 'win32';
    const pwsh = isWindows ? 'powershell.exe' : 'pwsh';
    const allArgs = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...args];
    const proc = spawn(pwsh, allArgs, {
      env: { ...process.env, COCKPIT_HOME },
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    proc.on('error', (err) => {
      resolve({ code: -1, stdout: '', stderr: err.message });
    });
  });
}

// ---------- tool handlers ----------

const TOOLS = [
  {
    name: 'cockpit_status',
    description: 'List currently alive agent sessions in cockpit (Claude/Gemini/Codex tabs that are running). Returns project, agent type, age, PID, session ID, and cwd for each.',
    inputSchema: {
      type: 'object',
      properties: {
        agent: {
          type: 'string',
          enum: ['claude', 'gemini', 'codex', 'opencode'],
          description: 'Optional filter by agent type',
        },
      },
    },
  },
  {
    name: 'cockpit_query_sessions',
    description: 'Search the session manifest history. Returns rows matching filters (project, agent, since/before timestamps). Useful for "what was I working on yesterday?" or "show me all sessions in /myproject".',
    inputSchema: {
      type: 'object',
      properties: {
        project_key: { type: 'string', description: 'Filter by project key (e.g. "sis", "arcanea")' },
        agent: { type: 'string', enum: ['claude', 'gemini', 'codex', 'opencode'] },
        cwd_contains: { type: 'string', description: 'Filter by substring of cwd' },
        event: { type: 'string', enum: ['start', 'stop', 'heartbeat', 'crash'] },
        since_iso: { type: 'string', description: 'ISO 8601 lower bound on ts' },
        before_iso: { type: 'string', description: 'ISO 8601 upper bound on ts' },
        include_archives: { type: 'boolean', default: false },
        limit: { type: 'integer', default: 50, minimum: 1, maximum: 1000 },
      },
    },
  },
  {
    name: 'cockpit_snapshot',
    description: 'Capture the current terminal workspace topology and write it to last-snapshot.json. Returns counts of windows/panes captured.',
    inputSchema: {
      type: 'object',
      properties: {
        terminal: {
          type: 'string',
          enum: ['auto', 'windows-terminal', 'zellij', 'tmux', 'both'],
          default: 'auto',
        },
      },
    },
  },
  {
    name: 'cockpit_rehydrate',
    description: 'Plan or execute rebuilding the workspace from last-snapshot.json. Defaults to dry-run; pass confirm=true to actually spawn tabs.',
    inputSchema: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', default: false, description: 'Set true to actually spawn (default is dry-run)' },
        mode: { type: 'string', enum: ['merge', 'skip', 'replace'], default: 'skip' },
      },
    },
  },
  {
    name: 'cockpit_save_workspace',
    description: 'Save current cockpit state under a named workspace. Workspaces persist independently and can be loaded later via cockpit_load_workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Workspace name (alphanumeric + dash/underscore)' },
        description: { type: 'string', description: 'Optional description' },
      },
      required: ['name'],
    },
  },
  {
    name: 'cockpit_load_workspace',
    description: 'Load a named workspace (rebuild its tabs). Defaults to dry-run; pass confirm=true to actually spawn.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        confirm: { type: 'boolean', default: false },
        mode: { type: 'string', enum: ['merge', 'skip', 'replace'], default: 'merge' },
      },
      required: ['name'],
    },
  },
  {
    name: 'cockpit_list_workspaces',
    description: 'List all saved cockpit workspaces with name, description, pane count, and last-update time.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cockpit_recent_events',
    description: 'Tail the structured event log (NDJSON). Useful for debugging hook firings, snapshot failures, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        tail: { type: 'integer', default: 20, minimum: 1, maximum: 500 },
        kind_filter: { type: 'string', description: 'Filter to events with this kind (e.g. "session.event", "snapshot.written")' },
        status_filter: { type: 'string', enum: ['ok', 'error', 'warn'] },
      },
    },
  },
];

// ---------- server bootstrap ----------

const server = new Server(
  {
    name: 'cockpit-continuity',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args || {};

  try {
    switch (name) {
      case 'cockpit_status': {
        const alive = await getAliveSessions(a.agent);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: alive.length,
              cockpit_home: COCKPIT_HOME,
              sessions: alive.map(s => ({
                agent: s.agent,
                project_key: s.project_key,
                cwd: s.cwd,
                session_id: s.session_id,
                pid: s.pid,
                started_ts: s.ts,
                wt_session: s.wt_session,
                tmux_pane: s.tmux_pane,
              })),
            }, null, 2),
          }],
        };
      }

      case 'cockpit_query_sessions': {
        const rows = await readManifest();
        let filtered = rows;
        if (a.project_key)   filtered = filtered.filter(r => r.project_key === a.project_key);
        if (a.agent)         filtered = filtered.filter(r => r.agent === a.agent);
        if (a.event)         filtered = filtered.filter(r => r.event === a.event);
        if (a.cwd_contains)  filtered = filtered.filter(r => r.cwd && r.cwd.includes(a.cwd_contains));
        if (a.since_iso)     filtered = filtered.filter(r => r.ts >= a.since_iso);
        if (a.before_iso)    filtered = filtered.filter(r => r.ts <= a.before_iso);
        const limit = a.limit || 50;
        const sorted = filtered.sort((x, y) => (y.ts || '').localeCompare(x.ts || '')).slice(0, limit);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              total_matched: filtered.length,
              returned: sorted.length,
              filters_applied: a,
              rows: sorted,
            }, null, 2),
          }],
        };
      }

      case 'cockpit_snapshot': {
        const result = await runPwshScript('snapshot.ps1', ['-Terminal', a.terminal || 'auto']);
        return {
          content: [{
            type: 'text',
            text: result.code === 0
              ? `Snapshot taken.\n${result.stdout}`
              : `Snapshot failed (exit ${result.code}):\n${result.stderr || result.stdout}`,
          }],
          isError: result.code !== 0,
        };
      }

      case 'cockpit_rehydrate': {
        const args = ['-Mode', a.mode || 'skip'];
        if (!a.confirm) args.push('-DryRun');
        const result = await runPwshScript('rehydrate.ps1', args);
        return {
          content: [{
            type: 'text',
            text: `${a.confirm ? 'Rehydrated' : 'DRY-RUN — no spawn'}.\n${result.stdout}\n${result.stderr}`,
          }],
          isError: result.code !== 0,
        };
      }

      case 'cockpit_save_workspace': {
        if (!a.name) {
          return { content: [{ type: 'text', text: 'ERROR: name parameter required' }], isError: true };
        }
        const args = ['-Name', a.name];
        if (a.description) { args.push('-Description', a.description); }
        const result = await runPwshScript('arc-cockpit.ps1', ['save', ...args]);
        return {
          content: [{ type: 'text', text: result.stdout || result.stderr }],
          isError: result.code !== 0,
        };
      }

      case 'cockpit_load_workspace': {
        if (!a.name) {
          return { content: [{ type: 'text', text: 'ERROR: name parameter required' }], isError: true };
        }
        const args = ['-Name', a.name, '-Mode', a.mode || 'merge'];
        if (!a.confirm) args.push('-DryRun');
        const result = await runPwshScript('arc-cockpit.ps1', ['load', ...args]);
        return {
          content: [{
            type: 'text',
            text: `${a.confirm ? 'Loaded' : 'DRY-RUN'} workspace '${a.name}'.\n${result.stdout}`,
          }],
          isError: result.code !== 0,
        };
      }

      case 'cockpit_list_workspaces': {
        const items = await listWorkspaces();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ count: items.length, workspaces: items }, null, 2),
          }],
        };
      }

      case 'cockpit_recent_events': {
        if (!existsSync(EVENTS_LOG)) {
          return { content: [{ type: 'text', text: '(no events logged yet)' }] };
        }
        const raw = await readFile(EVENTS_LOG, 'utf8');
        const lines = raw.split('\n').filter(l => l.trim());
        const tail = a.tail || 20;
        const recent = lines.slice(-tail);
        const parsed = [];
        for (const line of recent) {
          try {
            const obj = JSON.parse(line);
            if (a.kind_filter && obj.kind !== a.kind_filter) continue;
            if (a.status_filter && obj.status !== a.status_filter) continue;
            parsed.push(obj);
          } catch {}
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ count: parsed.length, events: parsed }, null, 2),
          }],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (e) {
    return {
      content: [{ type: 'text', text: `ERROR in ${name}: ${e.message}\n${e.stack || ''}` }],
      isError: true,
    };
  }
});

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write(`cockpit-continuity MCP v0.2.0 ready (cockpit_home=${COCKPIT_HOME})\n`);
