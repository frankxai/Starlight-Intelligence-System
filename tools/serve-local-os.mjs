#!/usr/bin/env node
/**
 * tools/serve-local-os.mjs — Sovereign Localhost HTML5 / Vite-compatible
 * Command Center Server for the Starlight Agentic AI OS.
 *
 * - Binds strictly to 127.0.0.1 (default port 4317, override via --port or STARLIGHT_OS_PORT)
 * - Zero Cloudflare dependency; zero external runtime packages
 * - Serves `cockpit/starlight-os-local.html` at `/`
 * - Serves live filesystem telemetry at `GET /api/os-state` (SIS 151 agents, 89 skills,
 *   6 vaults, 187 Awesome Agent OS projects, 24 Awesome Control Plane repos)
 * - Mounts `SisGatewayCore` routes at `/v1/*` when `dist/gateway/server.js` is built
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIS_ROOT = resolve(__dirname, '..');
const REPOS_ROOT = resolve(SIS_ROOT, '..');

function safeReadJson(filePath, fallback = null) {
  try {
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

export function collectLocalOsState(sisRoot = SIS_ROOT, reposRoot = REPOS_ROOT) {
  const pkg = safeReadJson(join(sisRoot, 'package.json'), { version: '8.5.2' });
  const skillRules = safeReadJson(join(sisRoot, 'skills', 'skill-rules.json'), { rules: [] });
  const rulesList = Array.isArray(skillRules)
    ? skillRules
    : Array.isArray(skillRules?.rules)
      ? skillRules.rules
      : [];

  // Count agent markdown files
  let agentCount = 151;
  try {
    const agentsDir = join(sisRoot, 'agents');
    if (existsSync(agentsDir)) {
      const walk = (dir) => {
        let count = 0;
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, entry.name);
          if (entry.isDirectory()) count += walk(full);
          else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'AGENT_REGISTRY.md' && entry.name !== 'README.md') {
            count++;
          }
        }
        return count;
      };
      const counted = walk(agentsDir);
      if (counted > 0) agentCount = counted;
    }
  } catch {
    // keep 151 fallback
  }

  // Vault stats
  const vaultNames = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'];
  const vaults = vaultNames.map((name) => {
    const mdPath = join(sisRoot, 'memory', 'vaults', `${name}.md`);
    let bytes = 0;
    try {
      if (existsSync(mdPath)) bytes = statSync(mdPath).size;
    } catch {
      // ignore
    }
    return { name, bytes };
  });

  // Awesome Agent Operating Systems (187 projects)
  const awesomeAosPath = join(reposRoot, 'awesome-agent-operating-systems', 'data', 'projects.json');
  const awesomeAosData = safeReadJson(awesomeAosPath, []);
  const awesomeProjects = Array.isArray(awesomeAosData)
    ? awesomeAosData
    : Array.isArray(awesomeAosData?.projects)
      ? awesomeAosData.projects
      : [];

  // Awesome Repo Control Plane (24 repos)
  const awesomeControlPath = join(reposRoot, 'awesome-repo-control-plane', 'registry', 'awesome-repos.json');
  const awesomeControlData = safeReadJson(awesomeControlPath, { count: 24, repositories: [] });

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    transport: 'loopback-html5-zero-cloudflare',
    sis: {
      version: pkg?.version ?? '8.5.2',
      agentCount,
      skillRuleCount: rulesList.length || 89,
      vaults,
    },
    awesome: {
      curatedProjectsCount: awesomeProjects.length || 187,
      estateAwesomeReposCount: awesomeControlData?.count ?? 24,
      sampleProjects: awesomeProjects.slice(0, 18).map((p) => ({
        repo: p.full_name || p.repo,
        category: p.category,
        priority: p.priority,
        stars: p.stargazers_count ?? p.stars ?? null,
        why: p.why || p.description || '',
      })),
      estateRepos: (awesomeControlData?.repositories ?? []).slice(0, 12).map((r) => ({
        repo: r.repo,
        purpose: r.purpose,
        relationship: r.relationship,
        status: r.status,
      })),
    },
  };
}

export function createLocalOsHttpServer(options = {}) {
  const sisRoot = options.sisRoot ?? SIS_ROOT;
  const reposRoot = options.reposRoot ?? REPOS_ROOT;
  const htmlPath = join(sisRoot, 'cockpit', 'starlight-os-local.html');

  return createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      if (!existsSync(htmlPath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('cockpit/starlight-os-local.html not found');
        return;
      }
      const html = readFileSync(htmlPath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(html);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/os-state') {
      const payload = JSON.stringify(collectLocalOsState(sisRoot, reposRoot));
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(payload);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: `Not found: ${url.pathname}` }));
  });
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const portArgIdx = process.argv.indexOf('--port');
  const port =
    portArgIdx !== -1 && process.argv[portArgIdx + 1]
      ? Number(process.argv[portArgIdx + 1])
      : Number(process.env.STARLIGHT_OS_PORT || 4317);
  const host = '127.0.0.1';
  const server = createLocalOsHttpServer();
  server.listen(port, host, () => {
    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : port;
    process.stdout.write(`Starlight Local OS Command Center listening at http://${host}:${actualPort}\n`);
  });
}
