import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectCloudRun } from './inspect-cloud-run.mjs';

test('preflight only describes the configured existing job and excludes secrets', () => {
  const result = inspectCloudRun((command, args, options) => {
    assert.equal(command, 'gcloud');
    assert.deepEqual(args.slice(0, 4), ['run', 'jobs', 'describe', 'starlight-runner-job']);
    assert.equal(options.shell, false);
    assert.equal(options.timeout, 30000);
    return { status: 0, stdout: JSON.stringify({ template: { template: {
      serviceAccount: 'fixture@example.invalid', timeout: '900s', maxRetries: 0,
      containers: [{ image: 'fixture@sha256:abc', env: [{ name: 'API_KEY', value: 'never-print-this' }] }],
    } } }) };
  });
  assert.equal(result.execution_performed, false);
  assert.equal(result.status, 'observed_not_execution_verified');
  assert.equal(JSON.stringify(result).includes('never-print-this'), false);
});

test('missing CLI, denied auth and malformed response fail closed without raw diagnostics', () => {
  for (const r of [{ error: { code: 'ENOENT' } }, { status: 1, stderr: 'private diagnostic' },
    { status: 0, stdout: 'invalid' }, { status: 0, stdout: '{}' }]) {
    const result = inspectCloudRun(() => r);
    assert.equal(result.status, 'blocked');
    assert.equal(result.execution_performed, false);
    assert.equal(JSON.stringify(result).includes('private diagnostic'), false);
  }
});
