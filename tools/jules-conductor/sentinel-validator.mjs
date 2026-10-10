/**
 * Sentinel Validator for Jules Sessions
 * Cross-checks patches and PRs against safety, secrets, scope bounds, and test assertions.
 *
 * Built on SIP — Starlight Intelligence Protocol.
 */

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9_]{36,}/,
  /gho_[A-Za-z0-9_]{36,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /AIza[0-9A-Za-z-_]{35}/,
  /Bearer\s+[A-Za-z0-9-_]{32,}/i,
  /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
];

function matchesDisallowed(filePath, pattern) {
  const normPath = filePath.replace(/\\/g, '/');
  const cleanPattern = pattern.replace(/\\/g, '/');

  if (cleanPattern === '.git' || cleanPattern === '.git/**') {
    return normPath === '.git' || normPath.startsWith('.git/');
  }

  if (cleanPattern.startsWith('**/*')) {
    const token = cleanPattern.slice(4);
    return normPath.includes(token);
  }

  if (cleanPattern.endsWith('/**')) {
    const prefix = cleanPattern.slice(0, -3);
    return normPath === prefix || normPath.startsWith(prefix + '/');
  }

  return normPath === cleanPattern || normPath.endsWith('/' + cleanPattern);
}

export function validatePatch(diffText, safetyRules) {
  const result = {
    ok: true,
    violations: [],
    stats: {
      filesChanged: 0,
      linesAdded: 0,
      linesRemoved: 0,
    },
  };

  if (!diffText || typeof diffText !== 'string' || diffText.trim().length === 0) {
    return { ok: false, violations: ['Empty or missing diff patch.'], stats: result.stats };
  }

  // Check secrets
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(diffText)) {
      result.violations.push(`Potential secret or token pattern detected matching ${pattern.source}`);
      result.ok = false;
    }
  }

  // Parse files changed from diff lines
  const lines = diffText.split('\n');
  const files = new Set();
  let added = 0;
  let removed = 0;

  for (const line of lines) {
    if (line.startsWith('diff --git a/')) {
      const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      if (match) files.add(match[2]);
    } else if (line.startsWith('+++ b/')) {
      files.add(line.slice(6));
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      added++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      removed++;
    }
  }

  result.stats.filesChanged = files.size;
  result.stats.linesAdded = added;
  result.stats.linesRemoved = removed;

  const totalLines = added + removed;

  // Rule: max files
  if (safetyRules.maxChangedFiles && files.size > safetyRules.maxChangedFiles) {
    result.violations.push(`File count exceeded: ${files.size} > ${safetyRules.maxChangedFiles}`);
    result.ok = false;
  }

  // Rule: max diff lines
  if (safetyRules.maxDiffLines && totalLines > safetyRules.maxDiffLines) {
    result.violations.push(`Diff lines exceeded: ${totalLines} > ${safetyRules.maxDiffLines}`);
    result.ok = false;
  }

  // Rule: disallowed paths
  if (safetyRules.disallowedPaths) {
    for (const filePath of files) {
      for (const disallowed of safetyRules.disallowedPaths) {
        if (matchesDisallowed(filePath, disallowed)) {
          result.violations.push(`Disallowed path modified: ${filePath}`);
          result.ok = false;
        }
      }
    }
  }

  return result;
}
