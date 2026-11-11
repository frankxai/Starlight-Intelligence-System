#!/usr/bin/env node
/** Read-only connector preflight for the existing fleet job. Never executes it. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const target = Object.freeze({ project: 'starlight-intelligence-estate', region: 'europe-west4', job: 'starlight-runner-job' });

export function inspectCloudRun(run = spawnSync) {
  const result = run('gcloud', ['run', 'jobs', 'describe', target.job,
    '--project', target.project, '--region', target.region, '--format=json', '--quiet'],
  { shell: false, encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024 });
  if (result.error || result.status !== 0) {
    return { status: 'blocked', target, execution_performed: false,
      reason: result.error?.code === 'ENOENT' ? 'gcloud_unavailable' : 'authenticated_read_failed',
      next: 'Use the existing project with federated read-only credentials; no service-account key export.' };
  }
  try {
    const job = JSON.parse(result.stdout);
    const spec = job.spec?.template?.spec?.template?.spec ?? job.template?.template;
    if (!spec || !Array.isArray(spec.containers)) throw new Error('missing task template');
    return { status: 'observed_not_execution_verified', target, execution_performed: false,
      service_account: spec.serviceAccountName ?? spec.serviceAccount ?? null,
      timeout: spec.timeoutSeconds ?? spec.timeout ?? null, max_retries: spec.maxRetries ?? null,
      containers: spec.containers.map(c => ({ image: c.image ?? null, resources: c.resources ?? null,
        environment_names: (c.env ?? []).map(e => e.name) })),
      holds: ['Verify image digest, task/repository admission, budget reservation and callback provenance.',
        'Missing fields are unknown; a successful describe does not authorize execution.'] };
  } catch { return { status: 'blocked', target, execution_performed: false, reason: 'unrecognized_job_response' }; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = inspectCloudRun();
  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'blocked') process.exitCode = 2;
}
