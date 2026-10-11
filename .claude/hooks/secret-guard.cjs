#!/usr/bin/env node
// secret-guard.cjs — PreToolUse(Edit|Write|MultiEdit) deny gate.
// Blocks writing private-key / credential material into files. Implements Anthropic's
// PreToolUse JSON permission protocol (hookSpecificOutput.permissionDecision).
//
// Design: intentionally NARROW and FAIL-OPEN. A wrong "allow" is recoverable; a wrong
// "deny" breaks every edit in every session. So the pattern set is deliberately limited to
// unambiguous secret formats, and any parse/IO error falls through to allow. Extend
// SECRET_PATTERNS only with formats that essentially never appear legitimately in source.
const { readFileSync } = require('fs');

const SECRET_PATTERNS = [
  { name: 'private key block', re: /-----BEGIN (?:RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'GitHub personal token', re: /\bghp_[A-Za-z0-9]{36}\b/ },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
];

function contentFromInput(ti) {
  if (!ti) return '';
  const parts = [];
  if (typeof ti.content === 'string') parts.push(ti.content);
  if (typeof ti.new_string === 'string') parts.push(ti.new_string);
  if (Array.isArray(ti.edits)) {
    for (const e of ti.edits) if (e && typeof e.new_string === 'string') parts.push(e.new_string);
  }
  return parts.join('\n');
}

try {
  const data = JSON.parse(readFileSync(0, 'utf-8'));
  const content = contentFromInput(data.tool_input);
  if (content) {
    for (const p of SECRET_PATTERNS) {
      if (p.re.test(content)) {
        const target = (data.tool_input && data.tool_input.file_path) || 'a file';
        process.stdout.write(JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason:
              `secret-guard: refusing to write ${p.name} into ${target}. ` +
              `Put secrets in a secrets manager / env var, not a committed file. ` +
              `If this is intentional (e.g. a fixture), disable secret-guard for this write.`,
          },
        }));
        process.exit(0);
      }
    }
  }
} catch (_) {
  // fail-open: never break a session on malformed input or IO error
}
process.exit(0);
