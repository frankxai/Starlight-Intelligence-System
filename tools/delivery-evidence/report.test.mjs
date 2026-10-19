import { test } from 'node:test';
import assert from 'node:assert/strict';
import { report } from './report.mjs';

const sha = 'a'.repeat(40);
const release = (overrides = {}) => ({
  id: 'exposure-1', deployment_id: 'dpl_example', service_id: 'one', environment: 'production',
  exposed_at: '2026-10-02T01:00:00Z', evidence: { kind: 'vercel.deployment.promoted', ref: 'evt_example' },
  changes: [{ sha, committed_at: '2026-10-02T00:00:00Z' }], changes_complete: true,
  requires_intervention: false, is_rework: false, ...overrides,
});
const input = (releases = [release()], complete = true) => ({
  schema_version: 1, window: { start: '2026-10-01T00:00:00Z', end: '2026-10-03T00:00:00Z' },
  services: [{ id: 'one', production_observation_complete: complete }], releases,
});
const service = (value) => report(value).services[0];

test('counts exposure frequency and commit-to-production duration', () => {
  const r = service(input());
  assert.equal(r.deployment_frequency_per_day.value, 0.5);
  assert.equal(r.change_lead_time_seconds.value, 3600);
  assert.equal(r.change_fail_rate.value, 0);
  assert.equal(r.failed_deployment_recovery_time_seconds.value, null);
});
test('READY and preview builds are not production exposure', () => {
  const r = report(input([release({ exposed_at: null, state: 'READY' }), release({ id: 'preview', environment: 'preview' })]));
  assert.equal(r.services[0].observed_production_releases, 0);
  assert.equal(r.services[0].change_fail_rate.value, null);
  assert.equal(r.ignored_non_production_or_unexposed, 2);
});
test('refuses build-ready evidence as proof of exposure', () => {
  assert.throws(() => report(input([release({ evidence: { kind: 'READY', ref: 'build' } })])), /exposure evidence/);
});
test('incomplete observation never produces authoritative metric values', () => {
  const r = service(input([release()], false));
  for (const key of ['deployment_frequency_per_day', 'change_lead_time_seconds', 'change_fail_rate', 'deployment_rework_rate', 'failed_deployment_recovery_time_seconds']) assert.equal(r[key].value, null);
  assert.equal(r.change_lead_time_seconds.observed_median, 3600);
});
test('missing classifications are unknown, not zero', () => {
  const r = service(input([release({ requires_intervention: null, is_rework: null })]));
  assert.equal(r.change_fail_rate.value, null);
  assert.equal(r.deployment_rework_rate.value, null);
  assert.equal(r.change_fail_rate.classified, 0);
});
test('failure and rework are separate with explicit incident attribution', () => {
  const r = service(input([
    release({ requires_intervention: true, incident_ref: 'INC-1', failed_at: '2026-10-02T01:02:00Z', recovered_at: '2026-10-02T01:12:00Z' }),
    release({ id: 'fix', deployment_id: 'fix', exposed_at: '2026-10-02T01:12:00Z', is_rework: true, incident_ref: 'INC-1', changes: [{ sha: 'b'.repeat(40), committed_at: '2026-10-02T01:05:00Z' }] }),
  ]));
  assert.equal(r.change_fail_rate.value, 0.5);
  assert.equal(r.deployment_rework_rate.value, 0.5);
  assert.equal(r.failed_deployment_recovery_time_seconds.value, 600);
});
test('unresolved recovery is right censored and not treated as zero', () => {
  const r = service(input([release({ requires_intervention: true, incident_ref: 'INC-2' })]));
  assert.equal(r.failed_deployment_recovery_time_seconds.value, null);
  assert.equal(r.failed_deployment_recovery_time_seconds.unresolved_or_missing_timestamps, 1);
});
test('recovery after the window remains unresolved in the report', () => {
  const r = service(input([release({ requires_intervention: true, incident_ref: 'INC-1', failed_at: '2026-10-02T01:00:00Z', recovered_at: '2026-10-04T01:00:00Z' })]));
  assert.equal(r.failed_deployment_recovery_time_seconds.value, null);
});
test('retries are idempotent but conflicting event ids fail', () => {
  const r = report(input([release(), release()]));
  assert.equal(r.duplicate_deliveries, 1);
  assert.equal(r.services[0].observed_production_releases, 1);
  assert.throws(() => report(input([release(), release({ is_rework: null })])), /Conflicting duplicate/);
});
test('multiple event ids cannot silently count the same exposure twice', () => {
  assert.throws(() => report(input([release(), release({ id: 'other' })])), /multiple release ids/);
});
test('reintroducing a commit does not inflate lead-time samples', () => {
  const r = service(input([release(), release({ id: 'again', exposed_at: '2026-10-02T03:00:00Z' })]));
  assert.equal(r.observed_production_releases, 2);
  assert.equal(r.change_lead_time_seconds.changes, 1);
  assert.equal(r.change_lead_time_seconds.value, 3600);
});
test('pre-window history prevents counting old commits as new changes', () => {
  const r = service(input([release({ id: 'prior', exposed_at: '2026-09-30T01:00:00Z', changes: [{ sha, committed_at: '2026-09-30T00:00:00Z' }] }), release({ changes: [{ sha, committed_at: '2026-09-30T00:00:00Z' }] })]));
  assert.equal(r.change_lead_time_seconds.changes, 0);
  assert.equal(r.change_lead_time_seconds.value, null);
});
test('incomplete change sets cannot masquerade as full lead-time data', () => {
  const r = service(input([release({ changes_complete: false })]));
  assert.equal(r.change_lead_time_seconds.value, null);
  assert.equal(r.change_lead_time_seconds.observed_median, 3600);
});
test('services remain independent', () => {
  const i = input();
  i.services.push({ id: 'two', production_observation_complete: true });
  i.releases.push(release({ id: 'two', service_id: 'two', requires_intervention: true, incident_ref: 'INC-2' }));
  const r = report(i);
  assert.equal(r.services[0].change_fail_rate.value, 0);
  assert.equal(r.services[1].change_fail_rate.value, 1);
  assert.equal(r.services.length, 2);
});
test('window end is exclusive; start is inclusive', () => {
  const r = service(input([release({ id: 'start', exposed_at: '2026-10-01T00:00:00Z', changes: [] }), release({ id: 'end', exposed_at: '2026-10-03T00:00:00Z' })]));
  assert.equal(r.observed_production_releases, 1);
});
test('rejects invalid chronology, local timestamps, unknown services and missing incidents', () => {
  assert.throws(() => report(input([release({ exposed_at: '2026-10-01T00:00:00Z' })])), /Commit cannot follow/);
  assert.throws(() => report(input([release({ exposed_at: '2026-10-02T01:00:00' })])), /timezone/);
  assert.throws(() => report(input([release({ service_id: 'unknown' })])), /Unknown service/);
  assert.throws(() => report(input([release({ requires_intervention: true })])), /Incident linkage/);
  assert.throws(() => report(input([release({ requires_intervention: true, incident_ref: 'INC', failed_at: '2026-10-02T02:00:00Z', recovered_at: '2026-10-02T01:30:00Z' })])), /recovery timeline/);
});
