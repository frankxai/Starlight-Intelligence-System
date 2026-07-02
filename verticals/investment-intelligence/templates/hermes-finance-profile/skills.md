# Seed skills — hermes-finance-profile

> Starting skill set for the finance-research profile. Hermes Agent's skill-authoring loop will grow these; anything gate-adjacent it writes is reviewed as a diff before activation.

---

## morning-pulse (cron: weekdays 07:30)
Read watchlist + macro snapshot via OpenBB; compare against the current regime thesis; message a 5-line pulse (aggregates only) to the operator's channel. No proposals from this skill — pulse only. Open with the R5 clause.

## snapshot-prep (cron: Sunday 17:00)
Compose the weekly aggregate portfolio context: weights by asset class from Ghostfolio, ledger deltas from Actual Budget, DPI category mix (band labels, never amounts). Output feeds `/invest-snapshot` and the weekly `/invest-strategy` session.

## dca-heartbeat (cron: per whitelist cadence)
For each DCA-whitelist entry: call `propose_trade` with the pre-declared intent. Auto-approval and caps are the gate's business, not yours — report the verdict verbatim. If the verdict is `pending` (cap drift), notify the operator; never retry to force it through.

## pending-nudge (cron: daily 18:00)
Call `list_pending`; if anything has waited >48h, remind the operator with the intent summary and its reason. Never approve, never ask for the token.

## retro-reminder (cron: last Sunday of month, 16:00)
Remind the operator to run `/invest-retro`; attach the count of trajectories written since the last retro and any executed intents missing a trajectory record (that gap is pipeline drift — flag it explicitly).

---

**Built on SIP** — hermes-finance-profile seed skills · v0.1
