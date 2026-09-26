import { NextResponse } from "next/server";
import { runDesk } from "@/lib/desk/cascade";
import { signRunReceipt } from "@/lib/desk/run-receipt";
import { deskAccess } from "@/lib/desk/access";
import { redisConfigFromEnv } from "@/lib/desk/redis-rest";
import {
  dailyRunLimit,
  memoryRunLimiter,
  redisRunLimiter,
  type LimitResult,
  type RunLimiter,
} from "@/lib/desk/run-limit";
import { deskSigningKey } from "@/lib/desk/signing";
import { selectVault } from "@/lib/desk/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION_CHARS = 400;

/** One per process. Only local development reaches it; see deskAccess. */
const localLimiter = memoryRunLimiter({ dailyLimit: dailyRunLimit() });

export async function POST(request: Request) {
  // Room mode means strangers can type into this, and every run spends money.
  // Decide who may run, and count them, before anything is spent.
  const access = deskAccess(process.env, request.headers.get("authorization"));
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const redis = redisConfigFromEnv();
  const limiter: RunLimiter | null =
    access.limiter === "durable" && redis
      ? redisRunLimiter(redis, { dailyLimit: dailyRunLimit() })
      : access.limiter === "memory"
        ? localLimiter
        : null;

  if (limiter && !access.authorized) {
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

  // A Redis REST store when one is configured, the JSONL file on a laptop, and
  // on Vercel without a durable store no vault at all: the receipt then says
  // "no durable vault configured" rather than pretending /tmp is memory.
  const vault = selectVault();

  // The daily ceiling counts runs that are about to spend, not malformed
  // requests, so junk cannot use up the day.
  if (limiter) {
    const day = await count(() => limiter.hitDaily());
    if (day instanceof Response) return day;
    if (!day.ok) {
      return NextResponse.json(
        { error: "The Desk has reached today's run ceiling. It opens again at midnight UTC." },
        { status: 429, headers: { "retry-after": String(day.retryAfter) } },
      );
    }
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
    });

    // Sign with the Desk's own key when one is set; deployed, never with the
    // personal key (see signing.ts). Without one the receipt travels as a
    // draft, which is a record of the run and not a proof of it.
    const signingKey = deskSigningKey();
    let envelope: unknown = null;
    if (signingKey) {
      try {
        envelope = signRunReceipt(run.receipt, signingKey.pem);
      } catch {
        envelope = null;
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
      pricesVerified: run.pricesVerified,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The run failed." },
      { status: 502 },
    );
  }
}

/**
 * A counter that cannot be reached fails closed: a run nobody could count is a
 * run nobody agreed to pay for.
 */
async function count(hit: () => Promise<LimitResult>): Promise<LimitResult | Response> {
  try {
    return await hit();
  } catch {
    return NextResponse.json(
      { error: "The Desk cannot reach its run counter right now, so it is not running. Try again shortly." },
      { status: 503 },
    );
  }
}
