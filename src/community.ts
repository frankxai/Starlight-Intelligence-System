/** Community OS reference kernel. Built on SIP. No network or external side effects. */
import { createHash } from 'node:crypto';

export type CommunityPrivacy = 'private' | 'community' | 'public';
export type CommunityEventKind = 'intake' | 'quest' | 'commitment' | 'artifact' | 'reflection' | 'peer-help';
export interface CommunityEvent {
  version: 1;
  id: string;
  communityId: string;
  memberId: string;
  cellId: string;
  loopId: string;
  source: string;
  sourceUri: string;
  correlationId: string;
  causationId: string | null;
  idempotencyKey: string;
  occurredAt: string;
  kind: CommunityEventKind;
  privacy: CommunityPrivacy;
  consentBasis: 'explicit';
  objectId: string;
}
/** Host-authenticated, current policy. Never derive this from event payloads. */
export interface CommunityConsent {
  communityId: string;
  memberId: string;
  processing: boolean;
  memory: boolean;
  public: boolean;
}
export interface CommunityAdapterManifest {
  version: 1;
  id: string;
  capabilities: readonly CommunityEventKind[];
  health: 'healthy' | 'degraded' | 'offline';
}
export type CommunityAdmission =
  | { status: 'accepted' | 'duplicate'; eventId: string }
  | { status: 'fallback'; reason: 'capability-mismatch' | 'adapter-unavailable'; eventId: string };

const KINDS: readonly CommunityEventKind[] = ['intake', 'quest', 'commitment', 'artifact', 'reflection', 'peer-help'];
const KEYS = ['version', 'id', 'communityId', 'memberId', 'cellId', 'loopId', 'source', 'sourceUri',
  'correlationId', 'causationId', 'idempotencyKey', 'occurredAt', 'kind', 'privacy', 'consentBasis', 'objectId'];
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function validateCommunityEvent(value: unknown): CommunityEvent {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), 'Event must be an object');
  const row = value as Record<string, unknown>;
  assert(Object.keys(row).length === KEYS.length && KEYS.every(key => Object.hasOwn(row, key)), 'Unexpected or missing event field');
  assert(row.version === 1, 'Unsupported event version');
  for (const key of ['id', 'communityId', 'memberId', 'cellId', 'loopId', 'source', 'correlationId', 'idempotencyKey', 'objectId']) {
    assert(typeof row[key] === 'string' && ID.test(row[key] as string), `Invalid ${key}`);
  }
  assert(row.causationId === null || (typeof row.causationId === 'string' && ID.test(row.causationId)), 'Invalid causationId');
  assert(KINDS.includes(row.kind as CommunityEventKind), 'Unsupported event kind');
  assert(['private', 'community', 'public'].includes(row.privacy as string), 'Invalid privacy');
  assert(row.consentBasis === 'explicit', 'Explicit consent basis required');
  assert(typeof row.occurredAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.occurredAt)
    && Number.isFinite(Date.parse(row.occurredAt)) && new Date(row.occurredAt).toISOString() === row.occurredAt, 'Invalid UTC timestamp');
  assert(typeof row.sourceUri === 'string' && row.sourceUri.length <= 2048, 'Invalid sourceUri');
  const uri = new URL(row.sourceUri);
  assert(uri.protocol === 'https:' && !uri.username && !uri.password && !uri.search && !uri.hash, 'Source URI must be credential-free HTTPS without query or fragment');
  // A fixed-field copy prevents prototype data or a caller's later mutation entering the ledger.
  return Object.fromEntries(KEYS.map(key => [key, row[key]])) as unknown as CommunityEvent;
}

function digest(event: CommunityEvent): string {
  return createHash('sha256').update(JSON.stringify(KEYS.map(key => event[key as keyof CommunityEvent]))).digest('hex');
}

function consentFor(event: CommunityEvent, policies: readonly CommunityConsent[]): CommunityConsent | undefined {
  const matches = policies.filter(policy => policy.communityId === event.communityId && policy.memberId === event.memberId);
  assert(matches.length <= 1, 'Ambiguous member consent');
  return matches[0];
}

/** In-memory fixture implementation. Replay retained inputs on restart; host supplies storage/transactions. */
export class CommunityLedger {
  private readonly events: CommunityEvent[] = [];
  private readonly keys = new Map<string, string>();
  private readonly ids = new Map<string, string>();

  ingest(input: unknown, adapter: CommunityAdapterManifest, policies: readonly CommunityConsent[]): CommunityAdmission {
    const event = validateCommunityEvent(input);
    assert(adapter.version === 1 && ID.test(adapter.id) && Array.isArray(adapter.capabilities)
      && adapter.capabilities.every(kind => KINDS.includes(kind))
      && ['healthy', 'degraded', 'offline'].includes(adapter.health), 'Invalid adapter manifest');
    assert(event.source === adapter.id, 'Adapter source mismatch');
    const policy = consentFor(event, policies);
    assert(policy?.processing === true, 'Current processing consent required');
    assert(event.privacy !== 'public' || policy.public === true, 'Public-class events require current sharing consent');
    const key = JSON.stringify([event.communityId, event.source, event.idempotencyKey]);
    const id = JSON.stringify([event.communityId, event.id]);
    const hash = digest(event);
    const priorKey = this.keys.get(key);
    const priorId = this.ids.get(id);
    assert(!priorKey || priorKey === hash, 'Idempotency collision');
    assert(!priorId || priorId === hash, 'Event ID collision');
    if (priorKey || priorId) return { status: 'duplicate', eventId: event.id };
    if (adapter.health !== 'healthy') return { status: 'fallback', reason: 'adapter-unavailable', eventId: event.id };
    if (!adapter.capabilities.includes(event.kind)) return { status: 'fallback', reason: 'capability-mismatch', eventId: event.id };
    const previous = this.events.filter(item => item.communityId === event.communityId && item.memberId === event.memberId
      && item.loopId === event.loopId && item.cellId === event.cellId);
    const prerequisites: Partial<Record<CommunityEventKind, CommunityEventKind>> = {
      quest: 'intake', commitment: 'quest', artifact: 'commitment', reflection: 'artifact', 'peer-help': 'intake',
    };
    const needed = prerequisites[event.kind];
    if (needed) {
      const cause = previous.find(item => item.id === event.causationId);
      assert(cause && cause.kind === needed && cause.correlationId === event.correlationId
        && cause.occurredAt <= event.occurredAt, `Missing ${needed} cause in this member's cell and loop`);
    } else {
      assert(event.causationId === null, 'Intake must start a causal chain');
    }
    assert(!previous.some(item => item.kind === event.kind && item.objectId === event.objectId), 'Object already recorded');
    assert(this.events.length < 10000, 'Fixture ledger capacity reached; persist and partition by community/loop');
    this.events.push(event);
    this.keys.set(key, hash);
    this.ids.set(id, hash);
    return { status: 'accepted', eventId: event.id };
  }

  /** Re-evaluates current consent. Returned projection contains no source URLs or raw content. */
  project(communityId: string, audience: 'memory' | 'public', policies: readonly CommunityConsent[]) {
    assert(audience === 'memory' || audience === 'public', 'Unsupported projection audience');
    return this.events.filter(event => {
      const policy = consentFor(event, policies);
      return event.communityId === communityId && policy?.processing === true
        && (audience === 'memory' ? policy.memory === true && event.privacy !== 'private'
          : policy.public === true && event.privacy === 'public');
    }).map(event => ({ version: event.version, eventId: event.id, kind: event.kind,
      loopId: event.loopId, objectId: event.objectId, occurredAt: event.occurredAt }));
  }

  /** Private operator scorecard; never auto-publish member or small-cell aggregates. */
  scorecard(communityId: string, loopId: string, policies: readonly CommunityConsent[]) {
    const rows = this.events.filter(event => event.communityId === communityId && event.loopId === loopId
      && consentFor(event, policies)?.processing === true);
    const count = (kind: CommunityEventKind) => rows.filter(event => event.kind === kind).length;
    const members = new Set(rows.filter(event => event.kind === 'intake').map(event => event.memberId)).size;
    const completedMembers = new Set(rows.filter(event => event.kind === 'reflection').map(event => event.memberId)).size;
    return { version: 1 as const, communityId, loopId, members, commitments: count('commitment'),
      artifacts: count('artifact'), reflections: count('reflection'), peerHelp: count('peer-help'),
      completedMembers, completionRate: members ? completedMembers / members : null,
      retention: null, adapterReliability: null, stewardCost: null,
      limitations: ['Retention requires prior-period membership', 'Reliability requires adapter attempt telemetry',
        'Cost requires measured provider usage'] };
  }
}

export type CommunityStewardAction = 'draft-quest' | 'draft-reflection' | 'send' | 'sanction' | 'refund' | 'credential' | 'canon';
/** Planning only. Even approved actions must pass the consumer's authenticated execution gate. */
export function planCommunityAction(action: CommunityStewardAction) {
  assert(['draft-quest', 'draft-reflection', 'send', 'sanction', 'refund', 'credential', 'canon'].includes(action), 'Unknown steward action');
  return { action, mode: action.startsWith('draft-') ? 'draft' as const : 'human-review' as const, executable: false as const };
}

export const fixtureCommunityAdapter: CommunityAdapterManifest = {
  version: 1, id: 'native-fixture', capabilities: KINDS, health: 'healthy',
};
