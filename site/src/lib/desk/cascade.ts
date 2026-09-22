/**
 * The Desk cascade: a question in, a cited brief and a signed receipt out.
 *
 *   recall     the vault (no model)         prior beliefs near this question
 *   retrieve   Tavily                       sources with URLs
 *   extract    Nemotron 3 Nano (small)      claims, each quoting one source
 *   synthesize DeepSeek V4 Flash (large)    the six-section brief, every claim cited [n]
 *   contradict Nemotron 3 Nano (small)      where this run disagrees with memory
 *   judge      GPT-OSS 120B (other family)  rubric score, independent of the writer
 *   remember   the vault (no model)         this run's claims, appended as beliefs
 *
 * The architecture story in one line: the small model where the work is
 * mechanical, the large model where the work is judgment, a different family as
 * judge. The receipt says it again in numbers.
 *
 * Grounding rate is computed here from the text, never asked of a model: it is
 * the share of extracted claims whose citation marker survives into the brief.
 * A number a model reports about itself is a number nobody should read aloud.
 *
 * Built on SIP — operational tier.
 */
import { chat, type ProviderConfig } from "./provider";
import { modelCostEur, retrievalCostEur, pricingIsComplete } from "./pricing";
import { retrieve, type RetrieveConfig, type Source } from "./retrieve";
import {
  RUN_RECEIPT_SCHEMA,
  sha256Hex,
  totalsFromStages,
  verdictFromStages,
  type RunReceipt,
  type RunReceiptStage,
} from "./run-receipt";
import { appendAtoms, findRelated, readAtoms, type VaultAtom } from "./vault";

export const MODELS = {
  extract: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B",
  synthesize: "deepseek-ai/DeepSeek-V4-Flash-0731",
  contradict: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B",
  judge: "openai/gpt-oss-120b",
} as const;

export const SECTIONS = ["HYPOTHESIS", "METHOD", "SETUP", "RESULTS", "TAKEAWAY", "NEXT"] as const;

export interface Claim {
  /** 1-based, matching the `[n]` marker the brief must carry. */
  index: number;
  text: string;
  quote: string;
  url: string;
  confidence: number;
}

export interface Judgement {
  score: number;
  rationale: string;
}

/** A place where this run disagrees with something the vault already held. */
export interface Contradiction {
  /** The vault atom being contradicted. */
  priorId: string;
  priorClaim: string;
  newClaim: string;
  reason: string;
}

export interface DeskRun {
  question: string;
  brief: string;
  sources: Source[];
  claims: Claim[];
  judgement: Judgement | null;
  /** Cited claims over total claims, computed from the brief's own text. */
  groundingRate: number;
  /** Prior beliefs the vault held near this question. */
  related: VaultAtom[];
  contradictions: Contradiction[];
  /** How many beliefs this run wrote back to the vault. */
  remembered: number;
  receipt: RunReceipt;
  pricesVerified: boolean;
}

export interface CascadeOptions {
  question: string;
  provider: ProviderConfig;
  retrieval: RetrieveConfig;
  maxSources?: number;
  issuer?: string;
  host?: string;
  /** Where memory lives. Omit and the run reads and writes nothing. */
  vaultPath?: string;
  now?: () => number;
  clock?: () => string;
}

/** Run the cascade. Every stage records itself, including the ones that fail. */
export async function runDesk(options: CascadeOptions): Promise<DeskRun> {
  const now = options.now ?? (() => Date.now());
  const clock = options.clock ?? (() => new Date().toISOString());
  const maxSources = options.maxSources ?? 8;
  const question = options.question.trim();
  if (!question) throw new Error("the Desk needs a question");

  const startedAt = clock();
  const stages: RunReceiptStage[] = [];
  let sources: Source[] = [];
  let claims: Claim[] = [];
  let brief = "";
  let judgement: Judgement | null = null;
  let related: VaultAtom[] = [];
  let contradictions: Contradiction[] = [];
  let remembered = 0;

  // ── recall ────────────────────────────────────────────────────────────────
  // Memory first, and locally: keyword overlap over the vault's own lines. No
  // model, no index, no network, so this stage cannot be the one that fails.
  if (options.vaultPath) {
    const startedRecall = now();
    try {
      const atoms = await readAtoms(options.vaultPath);
      related = findRelated(atoms, question);
      stages.push({
        name: "recall",
        status: "ok",
        provider: "vault",
        latencyMs: now() - startedRecall,
        costEur: 0,
        note: `${related.length} of ${atoms.length} prior beliefs`,
      });
    } catch (error) {
      stages.push({ name: "recall", status: "failed", provider: "vault", note: message(error) });
    }
  } else {
    stages.push({ name: "recall", status: "skipped", provider: "vault", note: "no vault" });
  }

  // ── retrieve ──────────────────────────────────────────────────────────────
  try {
    const found = await retrieve(question, maxSources, options.retrieval);
    sources = found.sources;
    stages.push({
      name: "retrieve",
      status: sources.length > 0 ? "ok" : "failed",
      provider: "tavily",
      latencyMs: found.latencyMs,
      ...costFields(retrievalCostEur("tavily", found.calls)),
      note: `${sources.length} sources`,
    });
  } catch (error) {
    stages.push({ name: "retrieve", status: "failed", provider: "tavily", note: message(error) });
  }

  // ── extract ───────────────────────────────────────────────────────────────
  if (sources.length > 0) {
    try {
      const result = await chat(
        {
          model: MODELS.extract,
          json: true,
          temperature: 0,
          messages: [
            { role: "system", content: EXTRACT_SYSTEM },
            { role: "user", content: extractPrompt(question, sources) },
          ],
        },
        options.provider,
      );
      claims = parseClaims(result.text, sources);
      stages.push({
        name: "extract",
        status: claims.length > 0 ? "ok" : "failed",
        model: result.model,
        provider: "nebius",
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        ...costFields(modelCostEur(result.model, result.inputTokens, result.outputTokens)),
        note: `${claims.length} claims`,
      });
    } catch (error) {
      stages.push({ name: "extract", status: "failed", model: MODELS.extract, provider: "nebius", note: message(error) });
    }
  } else {
    stages.push({ name: "extract", status: "skipped", model: MODELS.extract, provider: "nebius", note: "no sources" });
  }

  // ── synthesize ────────────────────────────────────────────────────────────
  if (claims.length > 0) {
    try {
      const result = await chat(
        {
          model: MODELS.synthesize,
          temperature: 0.3,
          maxTokens: 3000,
          messages: [
            { role: "system", content: SYNTHESIZE_SYSTEM },
            { role: "user", content: synthesizePrompt(question, claims) },
          ],
        },
        options.provider,
      );
      brief = result.text.trim();
      stages.push({
        name: "synthesize",
        status: brief.length > 0 ? "ok" : "failed",
        model: result.model,
        provider: "nebius",
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        ...costFields(modelCostEur(result.model, result.inputTokens, result.outputTokens)),
        note: `${sectionsPresent(brief).length}/${SECTIONS.length} sections`,
      });
    } catch (error) {
      stages.push({ name: "synthesize", status: "failed", model: MODELS.synthesize, provider: "nebius", note: message(error) });
    }
  } else {
    stages.push({ name: "synthesize", status: "skipped", model: MODELS.synthesize, provider: "nebius", note: "no claims" });
  }

  // ── contradict ────────────────────────────────────────────────────────────
  // What memory is for: not recalling agreement, but catching the moment this
  // run says something the vault already said otherwise.
  if (related.length > 0 && claims.length > 0) {
    try {
      const result = await chat(
        {
          model: MODELS.contradict,
          json: true,
          temperature: 0,
          maxTokens: 800,
          messages: [
            { role: "system", content: CONTRADICT_SYSTEM },
            { role: "user", content: contradictPrompt(related, claims) },
          ],
        },
        options.provider,
      );
      contradictions = parseContradictions(result.text, related);
      stages.push({
        name: "contradict",
        status: "ok",
        model: result.model,
        provider: "nebius",
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        ...costFields(modelCostEur(result.model, result.inputTokens, result.outputTokens)),
        note: `${contradictions.length} against ${related.length} prior beliefs`,
      });
    } catch (error) {
      stages.push({ name: "contradict", status: "failed", model: MODELS.contradict, provider: "nebius", note: message(error) });
    }
  } else {
    stages.push({
      name: "contradict",
      status: "skipped",
      model: MODELS.contradict,
      provider: "nebius",
      note: related.length === 0 ? "nothing recalled" : "no claims",
    });
  }

  // ── judge ─────────────────────────────────────────────────────────────────
  const groundingRate = computeGroundingRate(brief, claims);
  if (brief.length > 0) {
    try {
      const result = await chat(
        {
          model: MODELS.judge,
          json: true,
          temperature: 0,
          maxTokens: 800,
          messages: [
            { role: "system", content: JUDGE_SYSTEM },
            { role: "user", content: judgePrompt(question, brief) },
          ],
        },
        options.provider,
      );
      judgement = parseJudgement(result.text);
      stages.push({
        name: "judge",
        status: judgement ? "ok" : "failed",
        model: result.model,
        provider: "nebius",
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        ...costFields(modelCostEur(result.model, result.inputTokens, result.outputTokens)),
        note: judgement ? `score ${judgement.score}/10 · grounding ${(groundingRate * 100).toFixed(0)}%` : "unparsable verdict",
      });
    } catch (error) {
      stages.push({ name: "judge", status: "failed", model: MODELS.judge, provider: "nebius", note: message(error) });
    }
  } else {
    stages.push({ name: "judge", status: "skipped", model: MODELS.judge, provider: "nebius", note: "no brief" });
  }

  // ── remember ──────────────────────────────────────────────────────────────
  // Best-effort by design: a vault that refuses the write records a failed
  // stage, and the run still hands over its brief and its receipt.
  const runId = `run_${now().toString(36)}`;
  const receiptId = `rcpt_${now()}_${runId.slice(4, 12)}`;
  if (options.vaultPath && claims.length > 0) {
    const startedRemember = now();
    try {
      remembered = await appendAtoms(options.vaultPath, claims.map((claim) => atomFrom(claim, question, receiptId, clock())));
      stages.push({
        name: "remember",
        status: remembered > 0 ? "ok" : "failed",
        provider: "vault",
        latencyMs: now() - startedRemember,
        costEur: 0,
        note: `${remembered} beliefs written`,
      });
    } catch (error) {
      stages.push({ name: "remember", status: "failed", provider: "vault", note: message(error) });
    }
  } else {
    stages.push({
      name: "remember",
      status: "skipped",
      provider: "vault",
      note: options.vaultPath ? "no claims" : "no vault",
    });
  }

  const endedAt = clock();
  const receipt: RunReceipt = {
    schema: RUN_RECEIPT_SCHEMA,
    receiptId,
    issuedAt: endedAt,
    issuer: { name: options.issuer ?? "Starlight Desk" },
    run: { id: runId, kind: "desk.brief", host: options.host ?? "desk", startedAt, endedAt },
    subject: { name: subjectName(question), digest: { sha256: sha256Hex(brief || question) } },
    stages,
    totals: totalsFromStages(stages),
    decisions: [],
    evidence: [
      ...sources.map((source) => ({ kind: "source", ref: source.url })),
      ...(remembered > 0 && options.vaultPath ? [{ kind: "vault", ref: options.vaultPath }] : []),
    ],
    verdict: verdictFromStages(stages),
  };

  return {
    question,
    brief,
    sources,
    claims,
    judgement,
    groundingRate,
    related,
    contradictions,
    remembered,
    receipt,
    pricesVerified: pricingIsComplete(),
  };
}

function atomFrom(claim: Claim, question: string, receiptId: string, at: string): VaultAtom {
  return {
    id: `${receiptId}_c${claim.index}`,
    kind: "belief",
    question,
    claim: claim.text,
    quote: claim.quote,
    url: claim.url,
    confidence: claim.confidence,
    receiptId,
    at,
  };
}

/** Cited claims over total claims, read out of the brief. Zero claims is zero grounding. */
export function computeGroundingRate(brief: string, claims: Claim[]): number {
  if (claims.length === 0) return 0;
  const cited = claims.filter((claim) => brief.includes(`[${claim.index}]`)).length;
  return Math.round((cited / claims.length) * 100) / 100;
}

/** Which of the six sections the brief actually carries. */
export function sectionsPresent(brief: string): string[] {
  const upper = brief.toUpperCase();
  return SECTIONS.filter((section) => upper.includes(section));
}

/** Claims the model returned, kept only where they quote a source it was given. */
export function parseClaims(text: string, sources: Source[]): Claim[] {
  const parsed = parseJsonObject(text);
  if (!parsed) return [];
  const raw = Array.isArray(parsed.claims) ? parsed.claims : [];
  const urls = new Set(sources.map((source) => source.url));
  const claims: Claim[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const claimText = str(record.text);
    const quote = str(record.quote);
    const url = str(record.url);
    if (!claimText || !quote || !urls.has(url)) continue;
    claims.push({
      index: claims.length + 1,
      text: claimText,
      quote,
      url,
      confidence: clamp01(typeof record.confidence === "number" ? record.confidence : 0.5),
    });
  }
  return claims;
}

/**
 * Contradictions the model reported, kept only where they name a prior belief
 * that was actually recalled. One naming a belief nobody holds is dropped.
 */
export function parseContradictions(text: string, related: VaultAtom[]): Contradiction[] {
  const parsed = parseJsonObject(text);
  if (!parsed) return [];
  const raw = Array.isArray(parsed.contradictions) ? parsed.contradictions : [];
  const priors = new Map(related.map((atom) => [atom.id, atom]));
  const found: Contradiction[] = [];
  const claimed = new Set<string>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const priorId = str(record.priorId);
    const prior = priors.get(priorId);
    const newClaim = str(record.newClaim);
    if (!prior || !newClaim || claimed.has(priorId)) continue;
    claimed.add(priorId);
    found.push({ priorId, priorClaim: prior.claim, newClaim, reason: str(record.reason) });
  }
  return found;
}

/** The judge's verdict, or null when it did not return one this run can use. */
export function parseJudgement(text: string): Judgement | null {
  const parsed = parseJsonObject(text);
  if (!parsed) return null;
  const score = typeof parsed.score === "number" ? parsed.score : Number(parsed.score);
  if (!Number.isFinite(score)) return null;
  return { score: Math.min(10, Math.max(0, Math.round(score * 10) / 10)), rationale: str(parsed.rationale) };
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const candidates = [trimmed];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) candidates.push(fenced[1]);
  const braced = trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
  if (braced.length > 1) candidates.push(braced);
  for (const candidate of candidates) {
    try {
      const value: unknown = JSON.parse(candidate);
      if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
    } catch {
      // try the next shape
    }
  }
  return null;
}

function costFields(eur: number | null): { costEur?: number } {
  return typeof eur === "number" ? { costEur: eur } : {};
}

function subjectName(question: string): string {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `briefs/${slug || "question"}.md`;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

const EXTRACT_SYSTEM = `You extract claims from sources. Return JSON: {"claims":[{"text","quote","url","confidence"}]}.
Rules: every claim quotes one source verbatim in "quote"; "url" is that source's URL exactly as given; a claim you cannot quote is a claim you drop; at most 12 claims.`;

const SYNTHESIZE_SYSTEM = `You write a research brief in six sections, in this order and with these exact headings:
## HYPOTHESIS
## METHOD
## SETUP
## RESULTS
## TAKEAWAY
## NEXT
Every sentence that states a fact carries the citation marker [n] of the claim it rests on. A sentence you cannot cite is a sentence you do not write. Direct, technical, warm. No filler.`;

const CONTRADICT_SYSTEM = `You compare new claims against beliefs already held. Return JSON: {"contradictions":[{"priorId","newClaim","reason"}]}.
Rules: "priorId" is the id of the held belief exactly as given; report only a direct disagreement of fact, never a difference of wording, scope, or date of measurement; when nothing disagrees return an empty list; one entry per held belief at most.`;

const JUDGE_SYSTEM = `You score a research brief against a methodology rubric. Return JSON: {"score": 0-10, "rationale": "one sentence"}.
Score for: falsifiability of the hypothesis, whether the method could be replicated, whether every factual sentence carries a citation, and whether the takeaway follows from the results.`;

function extractPrompt(question: string, sources: Source[]): string {
  const body = sources
    .map((source) => `[${source.index}] ${source.title}\nURL: ${source.url}\n${source.content.slice(0, 2400)}`)
    .join("\n\n");
  return `Question: ${question}\n\nSources:\n\n${body}`;
}

function synthesizePrompt(question: string, claims: Claim[]): string {
  const body = claims.map((claim) => `[${claim.index}] ${claim.text} (source: ${claim.url})`).join("\n");
  return `Question: ${question}\n\nClaims you may cite, by marker:\n${body}\n\nWrite the brief.`;
}

function contradictPrompt(related: VaultAtom[], claims: Claim[]): string {
  const held = related.map((atom) => `${atom.id}: ${atom.claim}`).join("\n");
  const fresh = claims.map((claim) => `- ${claim.text}`).join("\n");
  return `Beliefs already held:\n${held}\n\nNew claims from this run:\n${fresh}\n\nReport only direct disagreements.`;
}

function judgePrompt(question: string, brief: string): string {
  return `Question: ${question}\n\nBrief:\n\n${brief}`;
}
