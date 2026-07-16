import { createHash } from 'node:crypto';
import type { SISMemoryRecord } from './types.js';

export interface ExternalMirrorPolicy {
  allow_private_external_mirror?: boolean;
  allow_regulated_external_mirror?: boolean;
}

/** Secrets never leave SIS; private and regulated data require explicit opt-in. */
export function isExternalMirrorBlocked(
  record: SISMemoryRecord,
  policy: ExternalMirrorPolicy = {},
): boolean {
  if (record.privacy_class === 'secret') return true;
  if (record.privacy_class === 'private' && !policy.allow_private_external_mirror) return true;
  if (record.privacy_class === 'regulated' && !policy.allow_regulated_external_mirror) return true;
  return false;
}

/** The only content representation an external provider may receive. */
export function externalMemoryText(record: SISMemoryRecord): string {
  return record.normalized_fact?.trim() || record.summary?.trim() || '';
}

/** Stable pseudonymous scope key. Production deployments should salt upstream. */
export function externalScopeId(kind: string, value: string | undefined): string | undefined {
  if (!value) return undefined;
  const digest = createHash('sha256').update(`${kind}:${value}`).digest('hex').slice(0, 24);
  return `sis-${kind}-${digest}`;
}
