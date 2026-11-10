import { test } from 'node:test';
import assert from 'node:assert';
import { StarlightEdgeSandbox } from './sandbox.js';
import { StarlightCloudWorker, Sandbox } from './index.js';

test('StarlightEdgeSandbox executes isolated python container agent with zero egress', async () => {
  const req = {
    command: ['python3', '-c', 'import sys; print(f"starlight-agent-py-{sys.version_info.major}.{sys.version_info.minor}")'],
    cwd: '/workspace',
    env: { AGENT_ROLE: 'world-scout' },
    timeoutMs: 5000,
  };

  const res = await StarlightEdgeSandbox.execute(req);

  assert.strictEqual(res.exitCode, 0);
  assert.strictEqual(res.zeroEgress, true);
  assert.strictEqual(res.containerImage, 'cloudflare/sandbox:next');
  assert.ok(res.stdout.includes('python3') || res.stdout.includes('zero egress'));
  assert.ok(res.durationMs >= 0);
});

test('StarlightCloudWorker routes /v1/sandbox/health endpoint', async () => {
  const request = new Request('https://edge.starlightintelligence.ai/v1/sandbox/health');
  const response = await StarlightCloudWorker.handleRequest(request, {});

  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.status, 'healthy');
  assert.strictEqual(data.sandbox, 'cloudflare/sandbox:next');
  assert.strictEqual(data.zeroEgress, true);
  assert.strictEqual(data.containerCpu, 1);
  assert.strictEqual(data.containerMemory, '1GB');
});

test('StarlightCloudWorker routes /v1/sandbox/execute endpoint', async () => {
  const request = new Request('https://edge.starlightintelligence.ai/v1/sandbox/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command: ['python3', '--version'],
    }),
  });

  const response = await StarlightCloudWorker.handleRequest(request, {});
  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.exitCode, 0);
  assert.strictEqual(data.zeroEgress, true);
});

test('Sandbox Durable Object persists container execution state in SQLite', async () => {
  const mockSqlRows = [];
  const mockStorage = {
    sql: {
      exec: (statement) => {
        mockSqlRows.push(statement);
      },
    },
  };

  const sandboxDo = new Sandbox({ storage: mockStorage }, {});
  const execRequest = new Request('https://do.sandbox/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command: ['python3', '-c', 'print("hello-from-isolated-container")'],
    }),
  });

  const response = await sandboxDo.fetch(execRequest);
  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.exitCode, 0);
  assert.strictEqual(data.zeroEgress, true);

  // Verify SQLite table creation and insert execution
  assert.ok(mockSqlRows.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS sandbox_runs')));
  assert.ok(mockSqlRows.some((sql) => sql.includes('INSERT INTO sandbox_runs')));
});
