/**
 * Which key, if any, the Desk signs its receipts with.
 *
 * A signing key on a host is a key the host's operators can use. Frank's
 * personal key (SIS_SIGNING_KEY) signs for Frank, so it stays on a machine he
 * holds: the deployed Desk never reads it. A deployment signs only with
 * DESK_SIGNING_KEY, a separate Ed25519 key that speaks for this Desk and
 * nothing else, and whose public half is registered as the Desk's. Without it
 * the receipt ships as an explicit unsigned draft: a record of the run, not a
 * proof of it.
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
