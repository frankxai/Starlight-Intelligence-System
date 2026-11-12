/** Offline, untrusted ChatGPT export projection. No storage or work admission. */
import { createHash } from 'node:crypto';
import { SanitizationGateway } from './sanitization.js';

const sanitizer = new SanitizationGateway();
const hash = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const stableId = (...parts: string[]) => hash(JSON.stringify(parts));
const object = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x);
const safeText = (x: string) => sanitizer.sanitize(x);
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (object(value)) return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
};
const timestamp = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;

export interface ConversationAttachment {
  id: string;
  sourceNodeId: string;
  kind: 'attachment';
  name: string | null;
  mimeType: string | null;
  /** Metadata only. Bytes, paths and remote URLs are never accessed or returned. */
  available: 'unknown';
}
export interface ConversationMessage {
  id: string;
  sourceNodeId: string;
  parentId: string | null;
  role: string;
  content: string;
  contentHash: string;
  createdAt: number | null;
  attachments: ConversationAttachment[];
}
export interface ConversationProjection {
  id: string;
  source: { provider: 'chatgpt-export'; conversationIdHash: string; exportIndex: number };
  title: string;
  createdAt: number | null;
  updatedAt: number | null;
  nodes: { id: string; parentId: string | null }[];
  messages: ConversationMessage[];
  currentPath: string[] | null;
  candidates: { id: string; messageId: string; excerpt: string; status: 'unreviewed'; mayAutomaticallyResume: false }[];
}
export interface ConversationImportResult {
  conversations: ConversationProjection[];
  duplicates: number;
  executionStarted: false;
  memoryPromoted: false;
}

/** Raw source identifiers are fingerprinted; content hashes are of redacted text. */
export function importChatGptExport(input: unknown): ConversationImportResult {
  if (!Array.isArray(input)) throw new Error('Expected an array of ChatGPT conversations');
  if (input.length > 10000) throw new Error('Export exceeds conversation limit');
  const conversations: ConversationProjection[] = [];
  const seen = new Map<string, string>();
  let duplicates = 0;
  for (const [exportIndex, item] of input.entries()) {
    if (!object(item) || typeof item.id !== 'string' || !item.id || !object(item.mapping)) {
      throw new Error(`Invalid conversation at index ${exportIndex}`);
    }
    const conversationIdHash = stableId('chatgpt-conversation', item.id);
    const conversationId = `chatgpt:${conversationIdHash}`;
    const nodes = item.mapping;
    const keys = Object.keys(nodes).sort();
    if (keys.length > 100000) throw new Error('Conversation exceeds node limit');
    const nodeIds = new Map(keys.map(key => [key, `chatgpt-node:${stableId(item.id as string, key)}`]));
    const parents = new Map<string, string | null>();
    for (const key of keys) {
      const node = nodes[key];
      if (!object(node) || (node.parent != null && typeof node.parent !== 'string')) throw new Error('Invalid conversation node');
      const parent = node.parent as string | null | undefined;
      if (parent && !Object.hasOwn(nodes, parent)) throw new Error('Conversation has a missing parent');
      parents.set(key, parent ?? null);
    }
    // Walk parents from every node, including unselected branches; reject malformed cycles.
    const checked = new Set<string>();
    for (const key of keys) {
      const visiting = new Set<string>();
      let cursor: string | null = key;
      while (cursor !== null && !checked.has(cursor)) {
        if (visiting.has(cursor)) throw new Error('Conversation has a parent cycle');
        visiting.add(cursor);
        cursor = parents.get(cursor) ?? null;
      }
      for (const visited of visiting) checked.add(visited);
    }
    const messages: ConversationMessage[] = [];
    for (const key of keys) {
      const node = nodes[key] as Record<string, unknown>;
      if (node.message == null) continue;
      if (!object(node.message)) throw new Error('Invalid message');
      const msg = node.message;
      const author = object(msg.author) && typeof msg.author.role === 'string' ? safeText(msg.author.role) : 'unknown';
      const content = object(msg.content) ? msg.content : {};
      const parts = Array.isArray(content.parts) ? content.parts : [];
      if (parts.some(part => typeof part === 'string' && part.length > 1000000)) throw new Error('Message part exceeds size limit');
      const text = safeText(parts.filter((part): part is string => typeof part === 'string').join('\n'));
      const attachments: ConversationAttachment[] = [];
      const attachmentSources = [...parts.filter(object), ...(object(msg.metadata) && Array.isArray(msg.metadata.attachments) ? msg.metadata.attachments.filter(object) : [])];
      for (const [index, attachment] of attachmentSources.entries()) {
        const name = typeof attachment.name === 'string' && !/[\/\\]/.test(attachment.name) ? safeText(attachment.name) : null;
        const mimeType = typeof attachment.mime_type === 'string' && /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(attachment.mime_type) ? attachment.mime_type : null;
        attachments.push({ id: `chatgpt-attachment:${stableId(item.id, key, String(index))}`, sourceNodeId: nodeIds.get(key)!, kind: 'attachment', name, mimeType, available: 'unknown' });
      }
      const parent = parents.get(key) ?? null;
      messages.push({ id: nodeIds.get(key)!, sourceNodeId: nodeIds.get(key)!, parentId: parent ? nodeIds.get(parent)! : null, role: author, content: text, contentHash: hash(text), createdAt: timestamp(msg.create_time), attachments });
    }
    let currentPath: string[] | null = null;
    if (item.current_node != null) {
      if (typeof item.current_node !== 'string' || !nodeIds.has(item.current_node)) throw new Error('Invalid current node');
      currentPath = [];
      let cursor: string | null = item.current_node;
      while (cursor !== null) { currentPath.push(nodeIds.get(cursor)!); cursor = parents.get(cursor) ?? null; }
      currentPath.reverse();
    }
    const candidates = messages.filter(m => m.role === 'user' && /(?:^|[.!?]\s+)(?:please\s+)?(?:build|create|implement|fix|investigate|prepare|draft|design|review|make|add|write|update|ship)\b/i.test(m.content.trim()))
      .map(m => ({ id: `chatgpt-candidate:${stableId(m.id, m.contentHash)}`, messageId: m.id, excerpt: m.content, status: 'unreviewed' as const, mayAutomaticallyResume: false as const }));
    const projection: ConversationProjection = { id: conversationId, source: { provider: 'chatgpt-export', conversationIdHash, exportIndex }, title: typeof item.title === 'string' ? safeText(item.title) : '', createdAt: timestamp(item.create_time), updatedAt: timestamp(item.update_time), nodes: keys.map(key => ({ id: nodeIds.get(key)!, parentId: parents.get(key) ? nodeIds.get(parents.get(key)!)! : null })), messages, currentPath, candidates };
    // Compare full source objects before redaction: equal masks must not hide conflicts.
    // This fingerprint is transient and never returned.
    const digest = hash(canonical(item));
    const prior = seen.get(conversationId);
    if (prior !== undefined) {
      if (prior !== digest) throw new Error('Conflicting duplicate conversation ID');
      duplicates++;
      continue;
    }
    seen.set(conversationId, digest);
    conversations.push(projection);
  }
  return { conversations, duplicates, executionStarted: false, memoryPromoted: false };
}
