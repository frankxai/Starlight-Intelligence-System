/**
 * Which key, if any, the Desk signs its receipts with.
 *
 * A signing key on a host is a key the host's operators can use. Frank's
 * personal key (SIS_SIGNING_KEY) signs for Frank, so it stays on a machine he
 * holds: the deployed Desk never reads it. A deployment signs only with
 * DESK_SIGNING_KEY, a separate Ed25519 key that speaks for this Desk and
 * nothing else, and whose public half is registered as the Desk's. Without it
 * the receipt ships as an explicit unsigned draft, which records the run and
 * proves nothing about who ran it.
 *
 * On a laptop (not Vercel) SIS_SIGNING_KEY remains the fallback, so the local
 * sovereign flow signs with the owner's own key as before.
 *
 * Built on SIP — operational tier.
 */

export type SigningKeySource = "DESK_SIGNING_KEY" | "SIS_SIGNING_KEY";

export interface SigningKeyChoice {
  pem: string;
  source: SigningKeySource;
}

export function deskSigningKey(env: NodeJS.ProcessEnv = process.env): SigningKeyChoice | null {
  const desk = env.DESK_SIGNING_KEY?.trim();
  if (desk) return { pem: desk, source: "DESK_SIGNING_KEY" };
  // Deployed: the personal key is not even looked at.
  if (env.VERCEL) return null;
  const personal = env.SIS_SIGNING_KEY?.trim();
  return personal ? { pem: personal, source: "SIS_SIGNING_KEY" } : null;
}

export const COST_INCOMPLETE_UNSIGNED = "cost-incomplete: signing would assert a total the Desk cannot vouch for";
export const NO_SIGNING_KEY = "no Desk signing key configured";

export type SigningPlan = { sign: true; key: SigningKeyChoice } | { sign: false; reason: string };

/**
 * Whether to sign this run's receipt. The v1 receipt must state a euro total,
 * and it cannot say "unknown". A run with an unpriced paid stage would sign a
 * total that leaves that stage out, so it ships as an unsigned draft with the
 * reason, even when a key is present.
 */
export function signingPlan(costComplete: boolean, key: SigningKeyChoice | null): SigningPlan {
  if (!costComplete) return { sign: false, reason: COST_INCOMPLETE_UNSIGNED };
  if (!key) return { sign: false, reason: NO_SIGNING_KEY };
  return { sign: true, key };
}
