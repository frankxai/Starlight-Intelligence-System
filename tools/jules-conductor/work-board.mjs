/**
 * One bounded task at a time. Harvested issues stay in the backlog until armed.
 */

export function isBounded(item) {
  const files = item?.scopeFiles;
  const text = String(item?.description || '');
  const repo = String(item?.repo || '');
  return Array.isArray(files)
    && files.length > 0
    && files.length <= 12
    && files.every((file) => typeof file === 'string' && file.length > 0 && !file.includes('..'))
    && text.length >= 40
    && text.length <= 4000
    && repo.includes('/');
}

export function takeReady(queue) {
  const list = Array.isArray(queue) ? queue.slice() : [];
  const index = list.findIndex((item) => item && item.ready === true && isBounded(item));
  if (index === -1) return { task: null, queue: list };
  const [task] = list.splice(index, 1);
  return { task, queue: list };
}

export function armAction(queue, action) {
  const list = Array.isArray(queue) ? queue.map((item) => ({ ...item, ready: false })) : [];
  if (!action || action.runner !== 'jules') {
    return { queue: list, armed: null, reason: 'this action stays with you' };
  }
  const task = {
    id: action.id,
    repo: action.repo,
    title: action.title,
    description: action.prompt,
    scopeFiles: action.where,
    type: action.lane || 'fix',
    ready: true,
    land: action.land || 'clerk',
  };
  if (!isBounded(task)) {
    return { queue: list, armed: null, reason: 'action is not bounded' };
  }
  const without = list.filter((item) => item.id !== action.id);
  without.unshift(task);
  return { queue: without, armed: task, reason: 'armed' };
}

export function classifyObservation({ verdict, prUrl, merged } = {}) {
  if (merged === true) return 'landed';
  if (verdict === 'reject') return 'rejected';
  return 'accepted-unlanded';
}

export function acceptedHunkOpen(fileText, prUrl) {
  const text = String(fileText || '');
  const stale = text.includes('`frankxai/gencreator` *(to be created)*') || text.includes('gencreator.community');
  if (stale && (prUrl == null || prUrl === '')) return false;
  return true;
}

const MENTION_RE = /[A-Za-z0-9_@][A-Za-z0-9_@./-]{0,160}\.(?:md|json|ts|tsx|js|mjs|cjs|yml|yaml|css|sh|ps1|toml)\b/g;

export function mentionPaths(text) {
  const found = [];
  const seen = new Set();
  const source = String(text || '');
  for (const match of source.matchAll(MENTION_RE)) {
    const file = match[0];
    const prefix = source.slice(Math.max(0, match.index - 3), match.index);
    if (file.includes('..') || prefix.endsWith('..') || prefix.endsWith('../')) continue;
    if (seen.has(file)) continue;
    seen.add(file);
    found.push(file);
    if (found.length === 12) break;
  }
  return found;
}

export function formatBoard(actions, room) {
  const lines = [];
  lines.push(room?.ok ? `Machine: ${room.reason}. A Jules session can start.` : `Machine: ${room?.reason || 'capacity unread'}. Jules stays off.`);
  for (const action of actions || []) {
    lines.push('');
    lines.push(`${action.id}  ${action.lane}  ${action.repo}`);
    lines.push(`why: ${action.why}`);
    lines.push(`where: ${(action.where || []).join(', ')}`);
    lines.push(`how: ${action.how}`);
  }
  return lines.join('\n');
}
