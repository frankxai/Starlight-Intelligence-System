/** Persistent at-most-one dispatch attempt per signed payload; not an execution scheduler. */
export interface RecordStore {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
}
export interface DeliveryStorage extends RecordStore {
  transaction<T>(callback: (store: RecordStore) => Promise<T>): Promise<T>;
}
export interface DeliveryReceipt {
  fingerprint: string;
  state: 'uncertain' | 'accepted';
  policy_id: string;
  recorded_at: string;
  operation?: string;
}
export class LedgerUnavailable extends Error {}
export async function claim(
  storage: DeliveryStorage, fingerprint: string, policyId: string
): Promise<{ claimed: boolean; receipt: DeliveryReceipt }> {
  try {
    return await storage.transaction(async tx => {
      const prior = await tx.get<DeliveryReceipt>('delivery');
      if (prior !== undefined) {
        if (!prior || typeof prior !== 'object' || Array.isArray(prior)
          || prior.fingerprint !== fingerprint || !['uncertain','accepted'].includes(prior.state)
          || typeof prior.policy_id !== 'string' || !prior.policy_id
          || typeof prior.recorded_at !== 'string' || !Number.isFinite(Date.parse(prior.recorded_at))
          || (prior.state === 'accepted' && typeof prior.operation !== 'string'))
          throw new Error('Invalid receipt');
        return { claimed: false, receipt: prior };
      }
      // Persist before the external effect. A crash is not permission to replay.
      const receipt: DeliveryReceipt = {
        fingerprint, state: 'uncertain', policy_id: policyId, recorded_at: new Date().toISOString(),
      };
      await tx.put('delivery', receipt);
      return { claimed: true, receipt };
    });
  } catch { throw new LedgerUnavailable('ledger_unavailable'); }
}
export async function accept(storage: DeliveryStorage, receipt: DeliveryReceipt, operation: string): Promise<void> {
  await storage.transaction(async tx => {
    const current = await tx.get<DeliveryReceipt>('delivery');
    if (!current || current.fingerprint !== receipt.fingerprint || current.state !== 'uncertain')
      throw new Error('Receipt changed');
    await tx.put('delivery', { ...current, state: 'accepted', operation });
  });
}
