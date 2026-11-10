import { test } from 'node:test';
import assert from 'node:assert';
import { StarlightEdgeSandbox } from './sandbox.js';
import { StarlightCloudWorker, Sandbox } from './index.js';

const mockSandboxBinding = {
  get: () => ({
    exec: async (command, opts) => ({
      output: async () => ({
        exitCode: 0,
        stdout: `starlight-agent-py-3.11\n[zero egress verified: ${command.join(' ')}]`,
        stderr: '',
      }),
    }),
  }),
};

test('StarlightEdgeSandbox executes isolated python container agent with zero egress', async () => {
  const req = {
    command: ['python3', '-c', 'import sys; print(f"starlight-agent-py-{sys.version_info.major}.{sys.version_info.minor}")'],
    cwd: '/workspace',
    env: { AGENT_ROLE: 'world-scout' },
    timeoutMs: 5000,
  };

  const res = await StarlightEdgeSandbox.execute(req, mockSandboxBinding);

  assert.strictEqual(res.exitCode, 0);
  assert.strictEqual(res.zeroEgress, true);
  assert.strictEqual(res.containerImage, 'cloudflare/sandbox:next');
  assert.ok(res.stdout.includes('python3') || res.stdout.includes('zero egress'));
  assert.ok(res.durationMs >= 0);
});

test('StarlightEdgeSandbox fails closed when container binding is unavailable', async () => {
  const req = {
    command: ['python3', '--version'],
  };

  const res = await StarlightEdgeSandbox.execute(req, undefined);

  assert.strictEqual(res.exitCode, 1);
  assert.strictEqual(res.zeroEgress, true);
  assert.ok(res.stderr.includes('SANDBOX binding unavailable'));
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

test('StarlightCloudWorker rejects unauthenticated /v1/sandbox/execute', async () => {
  const request = new Request('https://edge.starlightintelligence.ai/v1/sandbox/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command: ['python3', '--version'],
    }),
  });

  const response = await StarlightCloudWorker.handleRequest(request, {});
  assert.strictEqual(response.status, 401);
  const data = await response.json();
  assert.strictEqual(data.error, 'Unauthorized');
});

test('StarlightCloudWorker rejects arbitrary unconfigured Bearer token on /v1/sandbox/execute', async () => {
  const request = new Request('https://edge.starlightintelligence.ai/v1/sandbox/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer arbitrary-unverified-token',
    },
    body: JSON.stringify({
      command: ['python3', '--version'],
    }),
  });

  const response = await StarlightCloudWorker.handleRequest(request, {
    SANDBOX_TOKEN: 'verified-production-token',
    SANDBOX: mockSandboxBinding,
  });
  assert.strictEqual(response.status, 403);
  const data = await response.json();
  assert.strictEqual(data.error, 'Forbidden');
});

test('StarlightCloudWorker routes /v1/sandbox/execute endpoint with validated Bearer auth', async () => {
  const request = new Request('https://edge.starlightintelligence.ai/v1/sandbox/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer verified-production-token',
    },
    body: JSON.stringify({
      command: ['python3', '--version'],
    }),
  });

  const response = await StarlightCloudWorker.handleRequest(request, {
    SANDBOX_TOKEN: 'verified-production-token',
    SANDBOX: mockSandboxBinding,
  });
  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.exitCode, 0);
  assert.strictEqual(data.zeroEgress, true);
});

test('Sandbox Durable Object rejects invalid authorization token on /exec', async () => {
  const sandboxDo = new Sandbox({}, { SANDBOX_TOKEN: 'verified-production-token' });
  const unauthRequest = new Request('https://do.sandbox/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer wrong-token',
    },
    body: JSON.stringify({
      command: ['python3', '-c', 'print("unauthorized")'],
    }),
  });

  const response = await sandboxDo.fetch(unauthRequest);
  assert.strictEqual(response.status, 403);
});

test('Sandbox Durable Object persists container execution state in SQLite with parameterized query', async () => {
  const mockSqlExecutions = [];
  const mockStorage = {
    sql: {
      exec: (statement, ...params) => {
        mockSqlExecutions.push({ statement, params });
      },
    },
  };

  const sandboxDo = new Sandbox(
    { storage: mockStorage },
    { SANDBOX_TOKEN: 'verified-production-token', SANDBOX: mockSandboxBinding }
  );
  const execRequest = new Request('https://do.sandbox/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer verified-production-token',
    },
    body: JSON.stringify({
      command: ['python3', '-c', 'print("hello-from-isolated-container")'],
    }),
  });

  const response = await sandboxDo.fetch(execRequest);
  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.exitCode, 0);
  assert.strictEqual(data.zeroEgress, true);

  // Verify SQLite table creation and parameterized insert execution
  assert.ok(mockSqlExecutions.some((e) => e.statement.includes('CREATE TABLE IF NOT EXISTS sandbox_runs')));
  const insertExec = mockSqlExecutions.find((e) => e.statement.includes('INSERT INTO sandbox_runs'));
  assert.ok(insertExec, 'INSERT statement was executed');
  assert.strictEqual(insertExec.statement.includes('?'), true, 'Query uses SQL parameter bindings');
  assert.strictEqual(insertExec.params.length, 5, '5 parameters bound to SQL query');
  assert.strictEqual(insertExec.params[2], 0, 'exit code parameter is 0');
});
