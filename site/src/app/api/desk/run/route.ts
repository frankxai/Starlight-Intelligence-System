import { NextResponse } from "next/server";
import { MAX_QUESTION_CHARS, WORST_CASE_RUN_TOKENS, meteredTokens, runDeadlineMs, runDesk } from "@/lib/desk/cascade";
import { signRunReceipt } from "@/lib/desk/run-receipt";
import { deskAccess } from "@/lib/desk/access";
import { deskNamespace, redisConfigFromEnv } from "@/lib/desk/redis-rest";
import {
  METER_TIMEOUT_MS,
  dailyRunLimit,
  dailyTokenBudget,
  memoryRunLimiter,
  memoryTokenMeter,
  redisRunLimiter,
  redisTokenMeter,
  type RunLimiter,
  type TokenMeter,
} from "@/lib/desk/run-limit";
import { deskSigningKey, signingPlan } from "@/lib/desk/signing";
import { vaultForRun } from "@/lib/desk/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/**
 * Seconds the platform lets this function run. The run's own deadline is at
 * most MAX_RUN_DEADLINE_MS (55 s), counted from the start of the request, and
 * after it come only the token record (at most METER_TIMEOUT_MS, 3 s) and
 * signing. A literal, because Next.js reads it statically.
 */
export const maxDuration = 60;

/** One per process. Only local development reaches these; see deskAccess. */
const localLimiter = memoryRunLimiter({ dailyLimit: dailyRunLimit() });
const localMeter = memoryTokenMeter({ budget: dailyTokenBudget() });

export async function POST(request: Request) {
  // The run's deadline counts from here, so time spent on the counters below
  // comes out of the run's budget rather than past the function's.
  const deadlineAt = Date.now() + runDeadlineMs();
  // Room mode means strangers can type into this, and every run spends money.
  // Decide who may run, and count them, before anything is spent.
  const access = deskAccess(process.env, request.headers.get("authorization"));
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  // Every run is counted, token or not: in Redis when it is configured, and
  // in memory only off Vercel (deskAccess refuses Vercel without Redis).
  const redis = access.limiter === "durable" ? redisConfigFromEnv() : null;
  const namespace = deskNamespace();
  const limiter: RunLimiter = redis
    ? redisRunLimiter(redis, { dailyLimit: dailyRunLimit(), namespace })
    : localLimiter;
  const meter: TokenMeter = redis
    ? redisTokenMeter({ ...redis, timeoutMs: METER_TIMEOUT_MS }, { budget: dailyTokenBudget(), namespace })
    : localMeter;

  if (!access.authorized) {
    const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const hit = await count(() => limiter.hitAddress(client));
    if (hit instanceof Response) return hit;
    if (!hit.ok) {
      return NextResponse.json(
        { error: "Too many runs from this address; try again in a minute." },
        { status: 429, headers: { "retry-after": String(hit.retryAfter) } },
      );
    }
  }

  const nebiusKey = process.env.NEBIUS_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!nebiusKey || !tavilyKey) {
    return NextResponse.json(
      { error: "The Desk needs NEBIUS_API_KEY and TAVILY_API_KEY in the environment." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const question = typeof (body as { question?: unknown })?.question === "string" ? (body as { question: string }).question.trim() : "";
  if (!question) return NextResponse.json({ error: "Ask a question." }, { status: 422 });
  if (question.length > MAX_QUESTION_CHARS) {
    return NextResponse.json({ error: `Keep the question under ${MAX_QUESTION_CHARS} characters.` }, { status: 422 });
  }

  // Memory belongs to a trusted identity. Deployed, an anonymous run gets no
  // vault and its receipt says "anonymous run: memory is operator-only". An
  // operator's run gets the Redis REST store when one is configured; on Vercel
  // without one, no vault ("no durable vault configured") rather than /tmp. A
  // laptop gets the JSONL file.
  const vault = vaultForRun(process.env, access.authorized);

  // The daily token budget: refuse when today's tokens plus one run's worst
  // case would pass it. Checked before the run ceiling, so a refusal here does
  // not use up a run.
  const budget = await count(() => meter.reserve(WORST_CASE_RUN_TOKENS));
  if (budget instanceof Response) return budget;
  if (!budget.ok) {
    return NextResponse.json(
      { error: "The Desk has used today's token budget. It opens again at midnight UTC." },
      { status: 429, headers: { "retry-after": String(budget.retryAfter) } },
    );
  }

  // The daily ceiling counts runs that are about to spend, not malformed
  // requests, so junk cannot use up the day.
  const day = await count(() => limiter.hitDaily());
  if (day instanceof Response) {
    await reconcileKnownUsage(meter, budget, 0);
    return day;
  }
  if (!day.ok) {
    await reconcileKnownUsage(meter, budget, 0);
    return NextResponse.json(
      { error: "The Desk has reached today's run ceiling. It opens again at midnight UTC." },
      { status: 429, headers: { "retry-after": String(day.retryAfter) } },
    );
  }

  try {
    const run = await runDesk({
      question,
      provider: { apiKey: nebiusKey, baseUrl: process.env.NEBIUS_BASE_URL },
      retrieval: { apiKey: tavilyKey, endpoint: process.env.TAVILY_URL },
      issuer: process.env.DESK_ISSUER ?? "Starlight Desk",
      host: "desk",
      vault: vault.store ?? undefined,
      noVaultReason: vault.reason,
      deadlineMs: deadlineAt - Date.now(),
    });

    // Replace the reservation only when every model call ran once and reported
    // usage. Retries, unknown usage, and accounting errors retain the worst case.
    if (run.billableUsageComplete) {
      await reconcileKnownUsage(meter, budget, meteredTokens(run.receipt.stages, run.usageReportedStages));
    }

    // Sign with the Desk's own key when one is set; deployed, never with the
    // personal key (see signing.ts). A cost-incomplete run is never signed:
    // the receipt must state a euro total, and one that leaves out unpriced
    // paid stages is a total the Desk cannot vouch for. Unsigned, the receipt
    // travels as a draft with the reason, a record of the run that proves
    // nothing about who ran it.
    const plan = signingPlan(run.costComplete, deskSigningKey(), run.unpricedStages);
    let envelope: unknown = null;
    let unsignedReason: string | null = plan.sign ? null : plan.reason;
    if (plan.sign) {
      try {
        envelope = signRunReceipt(run.receipt, plan.key.pem);
      } catch {
        unsignedReason = "signing failed";
      }
    }

    return NextResponse.json({
      question: run.question,
      brief: run.brief,
      sources: run.sources,
      claims: run.claims,
      judgement: run.judgement,
      groundingRate: run.groundingRate,
      related: run.related,
      contradictions: run.contradictions,
      remembered: run.remembered,
      receipt: run.receipt,
      envelope,
      signed: Boolean(envelope),
      unsignedReason,
      pricesVerified: run.pricesVerified,
      costComplete: run.costComplete,
      unpricedStages: run.unpricedStages,
      unaccounted: run.unaccounted,
      // Until the receipt schema can say "unknown", a cost-incomplete receipt's
      // totals.costEur is the subtotal of priced stages; name that here too.
      draft: !envelope,
      costEurMeaning: run.costComplete ? "total" : "priced-stage subtotal",
    });
  } catch (error) {
    // The class name only; the message may carry upstream detail.
    console.error("desk: run failed", error instanceof Error ? error.name : typeof error);
    return NextResponse.json(
      // A fixed message: the error's own text may carry upstream detail.
      { error: "The run failed." },
      { status: 502 },
    );
  }
}

async function reconcileKnownUsage(
  meter: TokenMeter,
  reservation: Parameters<TokenMeter["reconcile"]>[0],
  actual: number,
): Promise<void> {
  try {
    await meter.reconcile(reservation, actual);
  } catch {
    // Paid work already happened (or admission was already refused elsewhere),
    // so fail conservative by retaining the reservation. Never log credentials.
    console.error("desk: the token reservation was not reconciled");
  }
}

/**
 * A counter that cannot be reached fails closed: a run nobody could count is a
 * run nobody agreed to pay for.
 */
async function count<T>(hit: () => Promise<T>): Promise<T | Response> {
  try {
    return await hit();
  } catch {
    return NextResponse.json(
      { error: "The Desk cannot reach its run counter right now, so it is not running. Try again shortly." },
      { status: 503 },
    );
  }
}
