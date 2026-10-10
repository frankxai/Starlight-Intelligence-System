/** Local, bounded context capture. Source claims remain untrusted data. Built on SIP. */
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, openSync, readSync, closeSync,
  writeFileSync, fsyncSync, renameSync, unlinkSync, fstatSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { withLock } from './gateway/lock.js';
import { SanitizationGateway } from './sanitization.js';

const MAX_JOURNAL = 8 * 1024 * 1024;
const MAX_BATCH = 256 * 1024;
const MAX_SOURCE = 16 * 1024 * 1024;
const scrubber = new SanitizationGateway();
const kinds = ['observation', 'decision', 'artifact', 'verification', 'blocker', 'checkpoint'] as const;
export interface ContextRecord {
  id: string; taskId: string; harness: string; sessionId: string;
  kind: typeof kinds[number]; text: string; repo: string; revision: string;
  evidence: 'observed' | 'proposed' | 'accepted' | 'verified';
  privacy: 'internal' | 'public' | 'private';
}
export interface CapturedRecord extends ContextRecord {
  sourceId: string; sourceOffset: number; sourceDigest: string; authority: 'untrusted-data';
}
interface CaptureFrame { sourceId: string; identity: string; offset: number; prefixDigest?: string; records: CapturedRecord[]; rejected: number; }
export interface CaptureOptions {
  sourceId: string; input: string; format?: 'events' | 'codex-rollout' | 'claude-jsonl' | 'opencode-export';
  taskId?: string; harness?: string; sessionId?: string; repo?: string; revision?: string;
}
function digest(value: string | Buffer): string { return createHash('sha256').update(value).digest('hex'); }
function identifier(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(value);
}
export function sanitizeContextText(text: string): string {
  return scrubber.sanitize(text)
    .replace(/\b(?:api[_-]?key|token|secret|password)\s*[=:]\s*[^\s,;]+/gi, '[REDACTED]')
    .replace(/https?:\/\/[^\s/@]+:[^\s/@]+@[^\s]+/gi, '[REDACTED URL]');
}
function parseRecord(raw: unknown): ContextRecord {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid event');
  const v = raw as ContextRecord;
  for (const key of ['id', 'taskId', 'harness', 'sessionId'] as const) if (!identifier(v[key])) throw new Error('Invalid identifier');
  if (!kinds.includes(v.kind) || !['observed', 'proposed', 'accepted', 'verified'].includes(v.evidence)
    || !['internal', 'public', 'private'].includes(v.privacy) || typeof v.text !== 'string' || v.text.length > 16_384
    || typeof v.repo !== 'string' || v.repo.length > 1024 || typeof v.revision !== 'string'
    || !/^(?:[a-f0-9]{7,64}|unknown)$/.test(v.revision)) throw new Error('Invalid event fields');
  return { id: v.id, taskId: v.taskId, harness: v.harness, sessionId: v.sessionId, kind: v.kind,
    text: sanitizeContextText(v.text), repo: sanitizeContextText(v.repo), revision: v.revision, evidence: v.evidence, privacy: v.privacy };
}

/** Atomic replacement under an owned lock. Failed writes preserve the last complete state. */
export class DurableJournal<T> {
  readonly path: string;
  constructor(path: string) { this.path = resolve(path); mkdirSync(dirname(this.path), { recursive: true }); }
  read(): T[] {
    if (!existsSync(this.path)) return [];
    if (statSync(this.path).size > MAX_JOURNAL) throw new Error('Journal capacity reached');
    const data = readFileSync(this.path, 'utf8');
    if (data && !data.endsWith('\n')) throw new Error('Incomplete journal; preserve and reconcile');
    return data.split('\n').filter(Boolean).map(line => JSON.parse(line) as T);
  }
  async update<R>(fn: (frames: T[]) => { frames: T[]; result: R }): Promise<R> {
    return withLock(`${this.path}.lock`, () => {
      const before = this.read();
      const update = fn(before);
      if (update.frames === before) return update.result;
      const data = update.frames.map(frame => JSON.stringify(frame)).join('\n') + (update.frames.length ? '\n' : '');
      if (Buffer.byteLength(data) > MAX_JOURNAL) throw new Error('Journal capacity reached');
      const temp = `${this.path}.${randomUUID()}.tmp`;
      let fd: number | undefined;
      try {
        fd = openSync(temp, 'wx', 0o600); writeFileSync(fd, data); fsyncSync(fd); closeSync(fd); fd = undefined;
        renameSync(temp, this.path);
      } finally {
        if (fd !== undefined) closeSync(fd);
        if (existsSync(temp)) unlinkSync(temp);
      }
      return update.result;
    });
  }
}

function nativeRecord(raw: unknown, opts: CaptureOptions, offset: number): ContextRecord | null {
  const value = raw as { type?: string; payload?: { type?: string; role?: string; content?: unknown }; message?: { role?: string; content?: unknown } };
  const message = opts.format === 'codex-rollout'
    ? (value.type === 'response_item' && value.payload?.type === 'message' ? value.payload : undefined)
    : (['user', 'assistant'].includes(value.type ?? '') ? value.message : undefined);
  if (!message || !['user', 'assistant'].includes(message.role ?? '')) return null;
  const parts = message.content;
  const text = typeof parts === 'string' ? parts : Array.isArray(parts)
    ? parts.filter(p => p && typeof p === 'object' && typeof p.text === 'string').map(p => p.text).join('\n') : '';
  if (!text) return null;
  return parseRecord({ id: digest(`${opts.sourceId}:${offset}`), taskId: opts.taskId,
    harness: opts.harness, sessionId: opts.sessionId, repo: opts.repo, revision: opts.revision ?? 'unknown',
    kind: 'observation', evidence: 'observed', privacy: 'internal', text: text.slice(0,16_384) });
}

export class ContextBridge {
  private readonly journal: DurableJournal<CaptureFrame>;
  constructor(path: string) { this.journal = new DurableJournal(path); }
  async capture(opts: CaptureOptions): Promise<{ captured: number; rejected: number; offset: number; pending: boolean }> {
    if (!identifier(opts.sourceId)) throw new Error('Invalid source identifier');
    if (opts.format && !['events', 'codex-rollout', 'claude-jsonl', 'opencode-export'].includes(opts.format)) throw new Error('Unsupported format');
    if (opts.format && opts.format !== 'events' && (![opts.taskId, opts.harness, opts.sessionId].every(identifier) || typeof opts.repo !== 'string')) throw new Error('Native capture requires explicit task, harness, session, and repo');
    if (opts.format === 'opencode-export') return this.captureExport(opts);
    return this.journal.update(frames => {
      const input = resolve(opts.input);
      if (input === this.journal.path) throw new Error('Source cannot be the journal');
      const fd = openSync(input, 'r');
      try {
        const stat = fstatSync(fd);
        if (!stat.isFile()) throw new Error('Source must be a file');
        if (stat.size > MAX_SOURCE) throw new Error('Source capacity reached; select a bounded export');
        const identity = digest(`${input}:${stat.dev}:${stat.ino}:${stat.birthtimeMs}`);
        const previous = frames.filter(f => f.sourceId === opts.sourceId).at(-1);
        if (previous && (previous.identity !== identity || stat.size < previous.offset)) throw new Error('Source replaced or truncated; assign a new source ID');
        const start = previous?.offset ?? 0;
        const prefix = createHash('sha256');
        const scratch = Buffer.alloc(65536);
        let verified = 0;
        while (verified < start) {
          const n = readSync(fd,scratch,0,Math.min(scratch.length,start-verified),verified);
          if (!n) throw new Error('Source changed during capture');
          prefix.update(scratch.subarray(0,n)); verified += n;
        }
        if (previous && prefix.copy().digest('hex') !== previous.prefixDigest) throw new Error('Consumed source prefix changed; preserve and reconcile');
        const bytes = Buffer.alloc(Math.min(MAX_BATCH, stat.size - start));
        const count = readSync(fd, bytes, 0, bytes.length, start);
        const chunk = bytes.subarray(0, count);
        const end = chunk.lastIndexOf(10);
        if (end < 0) {
          if (count === MAX_BATCH) throw new Error('Source line exceeds capture limit');
          return { frames, result: { captured: 0, rejected: 0, offset: start, pending: count > 0 } };
        }
        const records: CapturedRecord[] = []; let rejected = 0; let offset = start;
        const known = new Map(frames.flatMap(f => f.records).map(r => [`${r.taskId}:${r.id}`, r]));
        const decoded = new TextDecoder('utf-8', { fatal: true,ignoreBOM:true }).decode(chunk.subarray(0,end + 1));
        for (const line of decoded.split('\n').slice(0,-1)) {
          const sourceOffset = offset; offset += Buffer.byteLength(line) + 1;
          try {
            const raw: unknown = JSON.parse(line.replace(/^\uFEFF/, ''));
            const record = opts.format && opts.format !== 'events' ? nativeRecord(raw, opts, sourceOffset) : parseRecord(raw);
            if (!record) continue;
            if (record.privacy === 'private') { rejected++; continue; }
            const key = `${record.taskId}:${record.id}`; const old = known.get(key);
            if (old) {
              if (digest(JSON.stringify(parseRecord(old))) !== digest(JSON.stringify(record))) throw new Error('Conflicting event ID');
              continue;
            }
            const captured: CapturedRecord = { ...record, sourceId: opts.sourceId, sourceOffset,
              sourceDigest: digest(line), authority: 'untrusted-data' };
            records.push(captured); known.set(key, captured);
          } catch { rejected++; }
        }
        return { frames: [...frames,{ sourceId: opts.sourceId, identity, offset, prefixDigest:prefix.update(chunk.subarray(0,end+1)).digest('hex'), records, rejected }],
          result: { captured: records.length, rejected, offset, pending: offset < stat.size } };
      } finally { closeSync(fd); }
    });
  }
  private async captureExport(opts: CaptureOptions) {
    return this.journal.update(frames => {
      const input = resolve(opts.input);
      if (input === this.journal.path || statSync(input).size > 2 * 1024 * 1024) throw new Error('Invalid export input');
      const data = readFileSync(input);
      const identity = digest(data);
      if (frames.filter(f=>f.sourceId === opts.sourceId).at(-1)?.identity === identity) {
        return { frames,result:{ captured:0,rejected:0,offset:data.length,pending:false } };
      }
      const exported = JSON.parse(new TextDecoder('utf-8',{ fatal:true }).decode(data).replace(/^\uFEFF/,'')) as { info?: { id?: string }; messages?: unknown[] };
      if (exported.info?.id !== opts.sessionId || !Array.isArray(exported.messages) || exported.messages.length > 10000) throw new Error('Export session identity mismatch or invalid export');
      const records: CapturedRecord[] = []; let rejected = 0;
      const known = new Map(frames.flatMap(f=>f.records).map(r=>[`${r.taskId}:${r.id}`,r]));
      for (const [ordinal,item] of exported.messages.entries()) {
        try {
          const message = item as { info?: { id?: string; role?: string; time?: { completed?: number } }; parts?: { type?: string; text?: string }[] };
          if (!['user','assistant'].includes(message.info?.role ?? '')) continue;
          if (message.info?.role === 'assistant' && !message.info.time?.completed) continue;
          if (!identifier(message.info?.id) || !Array.isArray(message.parts)) throw new Error('Invalid message');
          const text = message.parts.filter(p=>p.type === 'text' && typeof p.text === 'string').map(p=>p.text).join('\n');
          if (!text) continue;
          const record = parseRecord({ id:message.info.id,taskId:opts.taskId,harness:opts.harness,sessionId:opts.sessionId,
            repo:opts.repo,revision:opts.revision ?? 'unknown',kind:'observation',evidence:'observed',privacy:'internal',text:text.slice(0,16384) });
          const key = `${record.taskId}:${record.id}`; const old = known.get(key);
          if (old) {
            if (JSON.stringify(parseRecord(old)) !== JSON.stringify(record)) throw new Error('Conflicting export message');
            continue;
          }
          const captured: CapturedRecord = { ...record,sourceId:opts.sourceId,sourceOffset:ordinal,
            sourceDigest:digest(JSON.stringify(item)),authority:'untrusted-data' };
          records.push(captured); known.set(key,captured);
        } catch { rejected++; }
      }
      return { frames:[...frames,{ sourceId:opts.sourceId,identity,offset:data.length,records,rejected }],
        result:{ captured:records.length,rejected,offset:data.length,pending:false } };
    });
  }
  packet(taskId: string, maxRecords = 50): { taskId: string; authority: 'untrusted-data'; records: CapturedRecord[]; omitted: number } {
    if (!identifier(taskId) || !Number.isInteger(maxRecords) || maxRecords < 1 || maxRecords > 200) throw new Error('Invalid packet request');
    const records = this.journal.read().flatMap(f => f.records).filter(r => r.taskId === taskId);
    return { taskId, authority: 'untrusted-data', records: records.slice(-maxRecords), omitted: Math.max(0, records.length - maxRecords) };
  }
}
