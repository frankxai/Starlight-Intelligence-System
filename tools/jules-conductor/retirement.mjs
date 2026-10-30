/** Jules retirement boundary. Existing work is never cancelled or replayed. */
// Conservative boundary: no remote calls on the announced shutdown day.
export const SHUTDOWN_AT = Date.parse('2026-12-31T00:00:00Z');
export const RETIREMENT_REASON = 'Jules new-session dispatch is retired. Use migration.mjs handoff and the agentic-ops router; do not replay existing sessions.';

export function julesCommandPolicy(args, now = Date.now()) {
  if (!Number.isFinite(now) || now >= SHUTDOWN_AT) {
    return { allowed: false, reason: 'Jules service shutdown: use preserved GitHub artifacts and offline inventory.' };
  }
  // Explicit read allowlist; no new, approve, send, cancel, or apply operations.
  const read = Array.isArray(args) && (
    (args.length === 2 && args[0] === 'get' && /^\d+$/.test(args[1])) ||
    (args.length === 3 && args.join(' ') === 'remote list --session') ||
    (args.length === 4 && args[0] === 'remote' && args[1] === 'pull' &&
      args[2] === '--session' && /^\d+$/.test(args[3]))
  );
  return { allowed: read, reason: read ? 'preservation read' : RETIREMENT_REASON };
}
