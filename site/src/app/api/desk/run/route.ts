import { NextResponse } from "next/server";
import { runDesk } from "@/lib/desk/cascade";
import { signRunReceipt } from "@/lib/desk/run-receipt";
import { selectVault } from "@/lib/desk/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Room mode means strangers can type into this. Cap what one address may spend. */
const WINDOW_MS = 60_000;
const MAX_RUNS_PER_WINDOW = 6;
const MAX_QUESTION_CHARS = 400;
const seen = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const record = seen.get(key);
  if (!record || now > record.resetAt) {
    seen.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (seen.size > 2000) for (const [id, value] of seen) if (now > value.resetAt) seen.delete(id);
    return { ok: true, retryAfter: 0 };
  }
  record.count += 1;
  if (record.count > MAX_RUNS_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(client);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many runs from this address; try again in a minute." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
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

    // Sign when a key is present. Without one the receipt travels as a draft,
    // which is a record of the run and not a proof of it.
    const signingKey = process.env.SIS_SIGNING_KEY;
    let envelope: unknown = null;
    if (signingKey) {
      try {
        envelope = signRunReceipt(run.receipt, signingKey);
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
