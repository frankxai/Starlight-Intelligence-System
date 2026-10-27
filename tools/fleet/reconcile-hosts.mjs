/**
 * Read-only projection of machine observations against reviewed machine identities.
 *
 * Caller must implement signature/connection verification in its trusted server.
 * A self-reported machine ID, digest, process, or file never grants authority.
 */
const MAX_AGE_MS = 120_000;
const FUTURE_SKEW_MS = 30_000;

export function reconcileHostObservations({ machines, observations, now = new Date().toISOString(), verifyEnvelope = () => false } = {}) {
  if (!Array.isArray(machines) || !Array.isArray(observations)) throw new TypeError('machine/observation arrays required');
  const at = Date.parse(now);
  if (!Number.isFinite(at)) throw new TypeError('invalid reconciliation timestamp');
  const ids = new Set();
  const output = [];
  for (const machine of machines) {
    if (!machine || typeof machine.id !== 'string' || ids.has(machine.id) || !Array.isArray(machine.expectedHostnames) || !machine.expectedHostnames.length) {
      throw new TypeError('invalid or duplicate reviewed machine');
    }
    ids.add(machine.id);
    const matched = observations.filter(x => x?.host?.claimedMachineId === machine.id);
    // Treat the most recent report as observed evidence, but never fall back to an older
    // attested report if a newer report is contradictory or revoked.
    matched.sort((a,b) => Date.parse(b?.observedAt || '') - Date.parse(a?.observedAt || ''));
    const report = matched[0] || null;
    let state = 'no_observation';
    let reason = 'No recent report received from this known machine';
    let trusted = false;
    let ageSeconds = null;
    if (report) {
      const observedAt = Date.parse(report.observedAt);
      if (!Number.isFinite(observedAt)) { state = 'invalid'; reason = 'Malformed observation timestamp'; }
      else if (observedAt > at + FUTURE_SKEW_MS) { state = 'invalid'; reason = 'Observation clock is ahead'; }
      else {
        ageSeconds = Math.round((at - observedAt)/1000);
        if (observedAt < at - MAX_AGE_MS) { state = 'stale'; reason = 'Observation older than 120 seconds'; }
        else if (report.schemaVersion !== 'starlight.host-observation.v0') { state = 'invalid'; reason = 'Unsupported observation schema'; }
        else if (!machine.expectedHostnames.includes(report.host.osHostname)) { state = 'identity_mismatch'; reason = 'Machine hostname does not match the reviewed registry'; }
        else {
          // Signature verification must use enrolled keys, signed canonical payload,
          // monotonic sequence / replay windows, and revocation checks in an external
          // trust service. This projection cannot verify a host itself.
          try { trusted = verifyEnvelope(report, machine) === true; } catch { trusted = false; }
          if (trusted) { state = 'verified_fresh'; reason = 'External identity verifier accepted the fresh envelope'; }
          else { state = 'unverified'; reason = 'No independently authenticated device observation'; }
        }
      }
    }
    output.push({
      machineId: machine.id,
      state,
      reason,
      observedAt: report?.observedAt || null,
      ageSeconds,
      identityVerified: trusted,
      harnessesInstalledUnverified: report?.harnesses?.filter(x=>x.state==='installed_unverified').map(x=>x.id) || [],
      cloudSessions: 'unknown',
      canDispatch: false, // only the existing Queen authority can issue executable grants
      requiredNextGate: trusted ? 'capability_probe_and_queen_authority' : 'authenticated_device_enrollment',
    });
  }
  return { schemaVersion: 'starlight.machine-reconciliation.v0', computedAt: now, machines: output };
}
