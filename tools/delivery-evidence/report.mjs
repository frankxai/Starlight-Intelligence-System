#!/usr/bin/env node
// Offline measurement only. Input is normalized evidence, never executable instructions.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DAY = 86_400_000;
const EXPOSURE_KINDS = new Set(['vercel.deployment.promoted', 'verified-production-alias', 'verified-rollback']);
const fail = (message) => { throw new Error(message); };
const required = (value, field) => typeof value === 'string' && value.trim() ? value : fail(`${field} is required`);
const instant = (value, field) => {
  required(value, field);
  // Explicit offsets prevent machine-local time from changing the result.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) fail(`${field} needs an ISO timestamp with timezone`);
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) fail(`${field} is invalid`);
  return ms;
};
const triState = (value, field) => {
  if (value !== true && value !== false && value !== null) fail(`${field} must be true, false, or null`);
};
const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const stable = (value) => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);

export function report(input) {
  if (input.schema_version !== 1) fail('Unsupported schema_version');
  const start = instant(input.window?.start, 'window.start');
  const end = instant(input.window?.end, 'window.end');
  if (end <= start) fail('window.end must follow window.start');
  if (!Array.isArray(input.services) || !input.services.length || !Array.isArray(input.releases)) fail('services and releases must be arrays');
  const services = new Map();
  for (const service of input.services) {
    required(service.id, 'service.id');
    if (services.has(service.id)) fail('Duplicate service id');
    if (typeof service.production_observation_complete !== 'boolean') fail('production_observation_complete must be boolean');
    services.set(service.id, service);
  }

  const seen = new Map();
  const exposures = new Map();
  const normalized = [];
  let ignored = 0;
  let duplicates = 0;
  for (const release of input.releases) {
    required(release.id, 'release.id');
    if (!services.has(release.service_id)) fail('Unknown service_id');
    const fingerprint = stable(release);
    if (seen.has(release.id)) {
      if (seen.get(release.id) !== fingerprint) fail('Conflicting duplicate release id');
      duplicates++;
      continue;
    }
    seen.set(release.id, fingerprint);
    required(release.environment, 'environment');
    if (release.environment !== 'production' || release.exposed_at == null) { ignored++; continue; }
    required(release.deployment_id, 'deployment_id');
    const exposed = instant(release.exposed_at, 'exposed_at');
    if (!EXPOSURE_KINDS.has(release.evidence?.kind)) fail('Production exposure evidence is required; READY is insufficient');
    required(release.evidence?.ref, 'evidence.ref');
    const key = `${release.service_id}:${release.deployment_id}:${exposed}`;
    if (exposures.has(key)) fail('Same production exposure has multiple release ids; normalize before reporting');
    exposures.set(key, true);
    if (!Array.isArray(release.changes) || typeof release.changes_complete !== 'boolean') fail('changes and changes_complete are required');
    triState(release.requires_intervention, 'requires_intervention');
    triState(release.is_rework, 'is_rework');
    if ((release.requires_intervention === true || release.is_rework === true) && !release.incident_ref) fail('Incident linkage is required for failure or rework');
    const intervention = release.failed_at == null ? null : instant(release.failed_at, 'failed_at');
    const recovered = release.recovered_at == null ? null : instant(release.recovered_at, 'recovered_at');
    if (intervention !== null && (release.requires_intervention !== true || intervention < exposed)) fail('Invalid intervention timeline');
    if (recovered !== null && (intervention === null || recovered < intervention)) fail('Invalid recovery timeline');
    const changes = release.changes.map((change) => {
      if (!/^[a-f0-9]{40}$/i.test(change.sha)) fail('changes.sha must be a full Git commit SHA');
      const committed = instant(change.committed_at, 'committed_at');
      if (committed > exposed) fail('Commit cannot follow production exposure');
      return { sha: change.sha.toLowerCase(), committed };
    });
    normalized.push({ ...release, exposed, intervention, recovered, changes });
  }

  const output = [];
  for (const service of services.values()) {
    const history = normalized.filter((r) => r.service_id === service.id).sort((a, b) => a.exposed - b.exposed);
    const releases = history.filter((r) => r.exposed >= start && r.exposed < end);
    const complete = service.production_observation_complete;
    const classifiedFailure = releases.filter((r) => r.requires_intervention !== null).length;
    const classifiedRework = releases.filter((r) => r.is_rework !== null).length;
    const failures = releases.filter((r) => r.requires_intervention === true);
    const reworks = releases.filter((r) => r.is_rework === true);
    const recoveries = failures.filter((r) => r.intervention !== null && r.recovered !== null && r.recovered <= end);
    const observedRecovery = median(recoveries.map((r) => (r.recovered - r.intervention) / 1000));
    const firstExposure = new Map();
    for (const release of history) for (const change of release.changes) {
      const previous = firstExposure.get(change.sha);
      if (previous && previous.committed !== change.committed) fail('Conflicting commit timestamps');
      if (!previous) firstExposure.set(change.sha, { ...change, exposed: release.exposed });
    }
    const changes = [...firstExposure.values()].filter((c) => c.exposed >= start && c.exposed < end);
    const observedLead = median(changes.map((c) => (c.exposed - c.committed) / 1000));
    const changeCoverage = releases.filter((r) => r.changes_complete).length;
    const rate = (known, count) => ({
      value: complete && releases.length > 0 && known === releases.length ? count / releases.length : null,
      known_numerator: count, denominator: releases.length, classified: known,
    });
    output.push({
      service_id: service.id,
      production_observation_complete: complete,
      observed_production_releases: releases.length,
      deployment_frequency_per_day: { value: complete ? releases.length / ((end - start) / DAY) : null },
      change_lead_time_seconds: {
        value: complete && changeCoverage === releases.length ? observedLead : null,
        observed_median: observedLead, changes: changes.length, releases_with_complete_change_sets: changeCoverage,
      },
      change_fail_rate: rate(classifiedFailure, failures.length),
      deployment_rework_rate: rate(classifiedRework, reworks.length),
      failed_deployment_recovery_time_seconds: {
        value: complete && classifiedFailure === releases.length && recoveries.length === failures.length ? observedRecovery : null,
        observed_median: observedRecovery, recovered: recoveries.length,
        unresolved_or_missing_timestamps: failures.length - recoveries.length,
      },
    });
  }
  return {
    schema_version: 1, window: input.window,
    methodology: 'Per service; exposure cohort; [start,end); first observed exposure per commit; median durations; unknown is null.',
    ignored_non_production_or_unexposed: ignored, duplicate_deliveries: duplicates, services: output,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) fail('Usage: node tools/delivery-evidence/report.mjs INPUT.json');
    process.stdout.write(`${JSON.stringify(report(JSON.parse(readFileSync(process.argv[2], 'utf8'))), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Delivery evidence: ${error.message}\n`);
    process.exitCode = 1;
  }
}
