/** Operator-configured source admission. A valid webhook is not a workload grant. */
export type JsonObject = Record<string, unknown>;
export interface SourceGrant {
  repository_id: number;
  repository: string;
  installation_id: number;
  commits: string[];
  events: string[];
  push_refs: string[];
  pr_base_refs: string[];
  workflow_branches: string[];
}
export interface DispatchPolicy {
  version: 1;
  policy_id: string;
  expires_at: string;
  job_etag: string;
  max_duration_seconds: number;
  grants: SourceGrant[];
}
export class AdmissionError extends Error {
  readonly status: number;
  constructor(code: string, status = 403) { super(code); this.status = status; }
}
export function object(value: unknown): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonObject : {};
}
function exact(value: JsonObject, fields: string[]): boolean {
  return Object.keys(value).length === fields.length && fields.every(k => Object.hasOwn(value, k));
}
function id(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}
function text(value: unknown, max = 200): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max
    && value === value.trim() && !/[\x00-\x20\x7f]/.test(value);
}
function list(value: unknown, predicate: (item: unknown) => boolean, max = 64): value is string[] {
  return Array.isArray(value) && value.length <= max && value.every(predicate)
    && new Set(value).size === value.length;
}
function sha(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value) && !/^0+$/.test(value);
}
function ref(value: unknown): value is string {
  return text(value) && /^[A-Za-z0-9_][A-Za-z0-9_./-]*$/.test(value)
    && !value.includes('..') && !value.includes('//')
    && !value.split('/').some(part => part.startsWith('.') || part.endsWith('.') || part.endsWith('.lock'))
    && !value.endsWith('/');
}
function repo(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value);
}
export function parsePolicy(raw: unknown, now = Date.now()): DispatchPolicy {
  const invalid = () => { throw new AdmissionError('admission_unavailable', 503); };
  if (typeof raw !== 'string' || raw.length > 65536) return invalid();
  let p: JsonObject;
  try { p = object(JSON.parse(raw)); } catch { return invalid(); }
  if (!exact(p, ['version','policy_id','expires_at','job_etag','max_duration_seconds','grants'])
    || p.version !== 1 || !text(p.policy_id, 128) || !text(p.job_etag, 256)
    || typeof p.expires_at !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(p.expires_at)
    || !Number.isFinite(Date.parse(p.expires_at))
    || new Date(p.expires_at).toISOString() !== p.expires_at
    || !Number.isSafeInteger(p.max_duration_seconds) || Number(p.max_duration_seconds) < 1
    || Number(p.max_duration_seconds) > 900 || !Array.isArray(p.grants)
    || p.grants.length === 0 || p.grants.length > 64) return invalid();
  const ids = new Set<number>();
  const names = new Set<string>();
  for (const value of p.grants) {
    const g = object(value);
    if (!exact(g, ['repository_id','repository','installation_id','commits','events','push_refs','pr_base_refs','workflow_branches'])
      || !id(g.repository_id) || !repo(g.repository) || !id(g.installation_id)
      || !list(g.commits, sha) || g.commits.length === 0
      || !list(g.events, e => typeof e === 'string' && ['push','pull_request','workflow_job'].includes(e)) || g.events.length === 0
      || !list(g.push_refs, r => ref(r) && (r.startsWith('refs/heads/') || r.startsWith('refs/tags/')))
      || !list(g.pr_base_refs, ref) || !list(g.workflow_branches, ref)
      || ids.has(g.repository_id) || names.has(g.repository.toLowerCase())) return invalid();
    ids.add(g.repository_id); names.add(g.repository.toLowerCase());
  }
  if (now >= Date.parse(p.expires_at)) throw new AdmissionError('admission_expired', 503);
  return p as unknown as DispatchPolicy;
}

/** Validate signed body fields against an operator policy, never against client assertions. */
export function authorizeSource(event: string, payload: JsonObject, policy: DispatchPolicy): void {
  const repository = object(payload.repository);
  const installation = object(payload.installation);
  const grant = policy.grants.find(g => g.repository_id === repository.id
    && g.repository === repository.full_name && g.installation_id === installation.id);
  if (!grant || !grant.events.includes(event)) throw new AdmissionError('source_not_admitted');
  let commit: unknown;
  const shapes = ['pull_request','workflow_job','after'].filter(k => Object.hasOwn(payload, k));
  const expected = event === 'push' ? 'after' : event;
  if (shapes.length !== 1 || shapes[0] !== expected) throw new AdmissionError('event_shape_invalid', 400);
  if (event === 'push') {
    if (payload.deleted !== false || !ref(payload.ref) || !grant.push_refs.includes(payload.ref))
      throw new AdmissionError('ref_not_admitted');
    commit = payload.after;
  } else if (event === 'pull_request') {
    const pr = object(payload.pull_request), head = object(pr.head), base = object(pr.base);
    const headRepo = object(head.repo), baseRepo = object(base.repo);
    if (typeof payload.action !== 'string' || !['opened','synchronize','reopened'].includes(payload.action)
      || pr.draft !== false || pr.state !== 'open' || !id(pr.number) || pr.number !== payload.number
      || headRepo.id !== grant.repository_id || headRepo.full_name !== grant.repository
      || baseRepo.id !== grant.repository_id || baseRepo.full_name !== grant.repository
      || !ref(head.ref) || !ref(base.ref) || !grant.pr_base_refs.includes(base.ref))
      throw new AdmissionError('pull_request_not_admitted');
    commit = head.sha;
  } else if (event === 'workflow_job') {
    const job = object(payload.workflow_job);
    if (payload.action !== 'queued' || job.status !== 'queued' || !id(job.id) || !id(job.run_id)
      || !ref(job.head_branch) || !grant.workflow_branches.includes(job.head_branch)
      || !Array.isArray(job.labels) || !job.labels.every(v => text(v, 100))
      || !job.labels.includes('self-hosted') || !job.labels.includes('starlight-runner'))
      throw new AdmissionError('workflow_job_not_admitted');
    commit = job.head_sha;
  } else throw new AdmissionError('source_not_admitted');
  if (!sha(commit) || !grant.commits.includes(commit)) throw new AdmissionError('commit_not_admitted');
}
