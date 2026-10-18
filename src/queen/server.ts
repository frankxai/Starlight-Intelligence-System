import * as http from 'node:http';
import { QueenSovereignEngine } from './sovereign-engine';
import { renderQueenCockpitHtml } from './ui-cockpit';

export interface QueenServerHandle {
  port: number;
  host: string;
  url: string;
  server: http.Server;
  engine: QueenSovereignEngine;
  close: () => Promise<void>;
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim();
        if (!raw) {
          resolve({});
          return;
        }
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res: http.ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

export async function startQueenSovereignServer(options?: {
  port?: number;
  host?: string;
  workspaceRoot?: string;
  autoUpgradeOnBoot?: boolean;
}): Promise<QueenServerHandle> {
  const port = options?.port ?? Number(process.env.QUEEN_PORT || 4329);
  const host = options?.host ?? '127.0.0.1';
  const engine = new QueenSovereignEngine(options?.workspaceRoot ?? process.cwd());

  if (options?.autoUpgradeOnBoot !== false) {
    engine.upgradeHarnessesAndRecord();
  }

  const sseClients = new Set<http.ServerResponse>();

  const broadcastState = (eventLabel: string) => {
    if (sseClients.size === 0) return;
    const data = JSON.stringify({
      event: eventLabel,
      state: engine.getFullStateSnapshot(),
    });
    for (const client of sseClients) {
      try {
        client.write(`data: ${data}\n\n`);
      } catch {
        sseClients.delete(client);
      }
    }
  };

  const server = http.createServer(async (req, res) => {
    const method = req.method || 'GET';
    const urlObj = new URL(req.url || '/', `http://${host}:${port}`);
    const pathname = urlObj.pathname;

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    if (method === 'GET' && (pathname === '/' || pathname === '/queen')) {
      const state = engine.getFullStateSnapshot();
      const html = renderQueenCockpitHtml(state);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(html);
      return;
    }

    if (method === 'GET' && pathname === '/api/queen/state') {
      sendJson(res, 200, engine.getFullStateSnapshot());
      return;
    }

    if (method === 'GET' && pathname === '/api/queen/estate-gtm') {
      const refresh = urlObj.searchParams.get('refresh') === '1';
      sendJson(res, 200, engine.estateRadar.getSnapshot(refresh));
      return;
    }

    if (method === 'GET' && pathname === '/api/queen/master-codex') {
      sendJson(res, 200, engine.masterCodex.getSnapshot());
      return;
    }

    if (method === 'GET' && pathname === '/api/queen/stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.write(`data: ${JSON.stringify({ event: 'CONNECTED', state: engine.getFullStateSnapshot() })}\n\n`);
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    if (method === 'POST' && pathname === '/api/queen/route') {
      const body = await readJsonBody(req);
      const decision = engine.routeAndRecord({
        prompt: String(body.prompt || 'Synthesize sovereign multi-agent architecture'),
        preferredBrand: body.preferredBrand ? String(body.preferredBrand) : undefined,
        commandToVerify: body.commandToVerify ? String(body.commandToVerify) : undefined,
        parallelWorkers: body.parallelWorkers ? Number(body.parallelWorkers) : undefined,
      });
      const state = engine.getFullStateSnapshot();
      broadcastState('ROUTE_TASK');
      sendJson(res, 200, { ok: true, decision, state });
      return;
    }

    if (method === 'POST' && pathname === '/api/queen/upgrade-harnesses') {
      const body = await readJsonBody(req);
      const targetIds = Array.isArray(body.harnessIds)
        ? body.harnessIds.map(String)
        : undefined;
      const actions = engine.upgradeHarnessesAndRecord(targetIds);
      const state = engine.getFullStateSnapshot();
      broadcastState('UPGRADE_HARNESSES');
      sendJson(res, 200, { ok: true, actions, state });
      return;
    }

    if (method === 'POST' && pathname === '/api/queen/rust-gate') {
      const body = await readJsonBody(req);
      const result = engine.evaluateRustGateAndRecord({
        commandToVerify: String(body.commandToVerify || 'starlight queen route'),
        intentKeywords: Array.isArray(body.intentKeywords)
          ? body.intentKeywords.map(String)
          : ['vault', 'queen'],
        waitForEdges: Array.isArray(body.waitForEdges)
          ? (body.waitForEdges as Array<{ from: string; to: string }>)
          : undefined,
      });
      const state = engine.getFullStateSnapshot();
      broadcastState('RUST_KERNEL_GATE');
      sendJson(res, 200, { ok: true, result, state });
      return;
    }

    if (method === 'POST' && pathname === '/api/queen/eval') {
      const { layers, comparison } = engine.runBenchmarksAndRecord();
      const state = engine.getFullStateSnapshot();
      broadcastState('FRONTIER_BENCHMARK');
      sendJson(res, 200, { ok: true, layers, comparison, state });
      return;
    }

    if (method === 'POST' && pathname === '/api/queen/execute-mission') {
      const body = await readJsonBody(req);
      const mission = engine.executeMissionAndRecord({
        prompt: String(body.prompt || 'Execute full-stack sovereign swarm mission'),
        preferredBrand: body.preferredBrand ? String(body.preferredBrand) : undefined,
        parallelWorkers: body.parallelWorkers ? Number(body.parallelWorkers) : undefined,
      });
      const state = engine.getFullStateSnapshot();
      broadcastState('SWARM_DISPATCH');
      sendJson(res, 200, { ok: true, mission, state });
      return;
    }

    sendJson(res, 404, { error: 'Not found', path: pathname });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });

  const actualAddress = server.address();
  const actualPort =
    typeof actualAddress === 'object' && actualAddress ? actualAddress.port : port;
  const url = `http://${host}:${actualPort}`;

  return {
    port: actualPort,
    host,
    url,
    server,
    engine,
    close: () =>
      new Promise<void>((resolve) => {
        for (const client of sseClients) {
          try {
            client.end();
          } catch {
            // ignore
          }
        }
        sseClients.clear();
        server.close(() => resolve());
      }),
  };
}

// Allow running `npx tsx src/queen/server.ts` directly in ESM
const isDirectEntry =
  typeof process.argv[1] === 'string' &&
  (process.argv[1].endsWith('queen/server.ts') ||
    process.argv[1].endsWith('queen\\server.ts') ||
    process.argv[1].endsWith('queen/server.js') ||
    process.argv[1].endsWith('queen\\server.js'));

if (isDirectEntry) {
  const portArg = process.argv.find((a) => a.startsWith('--port='));
  const port = portArg ? Number(portArg.split('=')[1]) : Number(process.env.QUEEN_PORT || 4329);
  startQueenSovereignServer({ port }).then((handle) => {
    console.log(
      `[Starlight Queen v1.0] Sovereign Superintelligence Cockpit live at ${handle.url}`
    );
  });
}
