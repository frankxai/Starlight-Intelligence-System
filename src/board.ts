/**
 * Starlight Intelligence System — executable Starlight Board.
 *
 * The canonical `/starlight-board` command (.claude/commands/starlight-board.md)
 * convenes five pressure vectors plus an Overseer to pressure-test a proposal.
 * This module makes that runnable: each vector gets a real executor call asking
 * for a structured JSON verdict, the five votes feed the consensus + board-review
 * math already living in swarm.ts, and a verdict record is written to disk.
 *
 * No executor available → dry-run: the five vector prompts are surfaced and an
 * UNRESOLVED verdict is written. Votes are never fabricated — a dry run records
 * zero votes, not invented ones.
 *
 * Built on SIP — operational tier (runs the substrate governance ritual).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { AgentExecutor } from "./types.js";
import {
  calculateModelConsensus,
  performStarlightBoardReview,
  type ModelCouncilConsensus,
} from "./swarm.js";

export type BoardVector = "Sovereign" | "Seer" | "Harmonizer" | "Strategist" | "Verifier";
export type BoardVerdict = "PROCEED" | "REVISE" | "STOP";
export type BoardMethod = "executor" | "dry-run";

/** The five pressure vectors and their mandates (from starlight-board.md). */
export const BOARD_VECTORS: { vector: BoardVector; mandate: string }[] = [
  {
    vector: "Sovereign",
    mandate:
      "ambition + irreversibility. Is this worth your name? Can you take it back if it fails?",
  },
  {
    vector: "Seer",
    mandate:
      "foresight + second-order effects. What does this look like in 18 months? Who is harmed by the success case?",
  },
  {
    vector: "Harmonizer",
    mandate:
      "alignment + resistance. Who resists this, and why? Where does this break a commitment we already made?",
  },
  {
    vector: "Strategist",
    mandate:
      "leverage + option value. What does this unlock that nothing else can? What does it close off?",
  },
  {
    vector: "Verifier",
    mandate:
      "reality + execution cost. What fails first when this meets the world? What is the cheapest experiment that proves it?",
  },
];

/** A single vector's parsed verdict. `note` is set when parsing had to default. */
export interface BoardVectorVote {
  vector: BoardVector;
  verdict: BoardVerdict;
  confidence: number;
  reasoning: string;
  note?: string;
}

/** The persisted board outcome. `verdict` is UNRESOLVED only in dry-run. */
export interface BoardVerdictRecord {
  proposal: string;
  timestamp: string;
  vectors: BoardVectorVote[];
  consensus: ModelCouncilConsensus | null;
  overseer: string;
  verdict: BoardVerdict | "UNRESOLVED";
  method: BoardMethod;
  paths?: { json: string; md: string };
}

export interface RunBoardOptions {
  /** Executor that answers each vector prompt. Absent → dry-run. */
  executor?: AgentExecutor;
  /** Force dry-run even if an executor is supplied. */
  dryRun?: boolean;
  /** Where to write verdict files. Default: <cwd>/docs/boards. */
  outDir?: string;
  /** Injectable clock for deterministic timestamps/filenames. */
  now?: Date;
}

/** Build the in-role prompt for one vector. */
export function buildVectorPrompt(vector: BoardVector, mandate: string, proposal: string): string {
  return (
    `You are the ${vector} pressure vector on the Starlight Board.\n` +
    `Your mandate: ${mandate}\n\n` +
    `Pressure-test the proposal below. You challenge; you do not cheerlead. ` +
    `Respond with ONLY a JSON object and nothing else:\n` +
    `{"vector":"${vector}","verdict":"PROCEED|REVISE|STOP","confidence":0.0-1.0,"reasoning":"one or two sentences"}\n\n` +
    `Proposal:\n${proposal}`
  );
}

/** Parse a vector's raw response defensively. Any failure → REVISE at 0.5. */
export function parseVote(vector: BoardVector, raw: string): BoardVectorVote {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) throw new Error("no JSON object in response");
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      verdict?: unknown;
      confidence?: unknown;
      reasoning?: unknown;
    };
    const verdict = parsed.verdict;
    if (verdict !== "PROCEED" && verdict !== "REVISE" && verdict !== "STOP") {
      throw new Error(`invalid verdict: ${String(verdict)}`);
    }
    let confidence = Number(parsed.confidence);
    if (!Number.isFinite(confidence)) confidence = 0.5;
    confidence = Math.max(0, Math.min(1, confidence));
    const reasoning = typeof parsed.reasoning === "string" ? parsed.reasoning : "";
    return { vector, verdict, confidence, reasoning };
  } catch (err) {
    return {
      vector,
      verdict: "REVISE",
      confidence: 0.5,
      reasoning: "",
      note: `unparseable board response; defaulted to REVISE (${err instanceof Error ? err.message : String(err)})`,
    };
  }
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "proposal"
  );
}

/** One-line Overseer synthesis from the vote tally (deterministic, no extra call). */
function synthesizeOverseer(votes: BoardVectorVote[], verdict: BoardVerdict): string {
  const stop = votes.filter((v) => v.verdict === "STOP").length;
  const revise = votes.filter((v) => v.verdict === "REVISE").length;
  const proceed = votes.filter((v) => v.verdict === "PROCEED").length;
  return `Board verdict ${verdict} from ${proceed} PROCEED / ${revise} REVISE / ${stop} STOP across five vectors.`;
}

function renderMarkdown(record: BoardVerdictRecord): string {
  const date = record.timestamp.slice(0, 10);
  const title = record.proposal.length > 80 ? record.proposal.slice(0, 77) + "..." : record.proposal;
  const lines = [
    `# Starlight Board — ${title}`,
    "",
    `**Method:** ${record.method}`,
    `**Verdict:** ${record.verdict}`,
    "",
  ];

  if (record.vectors.length > 0) {
    lines.push("| Vector | Verdict | Confidence | Reasoning |", "|---|---|---|---|");
    for (const v of record.vectors) {
      const reason = (v.reasoning || v.note || "").replace(/\|/g, "\\|");
      lines.push(`| ${v.vector} | ${v.verdict} | ${v.confidence.toFixed(2)} | ${reason} |`);
    }
    lines.push("", `**Overseer:** ${record.overseer}`);
  } else {
    lines.push(
      "_Dry run — no executor available. The five vector prompts were surfaced but no votes were cast._",
    );
  }

  lines.push("", "---", `**Built on SIP** · Starlight Board · ${date}`, "");
  return lines.join("\n");
}

/**
 * Run the Starlight Board over a proposal.
 *
 * With an executor: fan the five vector prompts out in parallel, parse the
 * votes, run consensus + board-review math, and write a verdict record.
 * Without one (or with `dryRun`): surface the prompts and write an UNRESOLVED
 * record with zero votes — never fabricated.
 */
export async function runBoard(
  proposal: string,
  options: RunBoardOptions = {},
): Promise<BoardVerdictRecord> {
  const proposalText = proposal.trim();
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const outDir = options.outDir ?? resolve(process.cwd(), "docs", "boards");
  const slug = slugify(proposalText);
  const date = timestamp.slice(0, 10);
  const jsonPath = join(outDir, `${date}-${slug}-verdict.json`);
  const mdPath = join(outDir, `${date}-${slug}-verdict.md`);

  const isDryRun = options.dryRun === true || !options.executor;

  let record: BoardVerdictRecord;

  if (isDryRun) {
    for (const { vector, mandate } of BOARD_VECTORS) {
      console.log(`\n── ${vector} ──`);
      console.log(buildVectorPrompt(vector, mandate, proposalText));
    }
    record = {
      proposal: proposalText,
      timestamp,
      vectors: [],
      consensus: null,
      overseer: "Dry run — no executor available; votes not cast.",
      verdict: "UNRESOLVED",
      method: "dry-run",
    };
  } else {
    const executor = options.executor!;
    const votes = await Promise.all(
      BOARD_VECTORS.map(async ({ vector, mandate }) => {
        const prompt = buildVectorPrompt(vector, mandate, proposalText);
        const raw = await executor(`starlight-board-${vector.toLowerCase()}`, prompt, {});
        return parseVote(vector, raw);
      }),
    );

    const consensus = calculateModelConsensus(
      slug,
      votes.map((v) => ({
        modelId: v.vector,
        verdict: v.verdict,
        confidence: v.confidence,
        rationale: v.reasoning,
      })),
    );

    const boardReview = performStarlightBoardReview(
      slug,
      votes.map((v) => ({
        vector: v.vector,
        verdict: v.reasoning || v.note || "",
        recommendation: v.verdict,
      })),
      synthesizeOverseer(votes, "PROCEED"),
    );
    const verdict = boardReview.finalRecommendation;

    record = {
      proposal: proposalText,
      timestamp,
      vectors: votes,
      consensus,
      overseer: synthesizeOverseer(votes, verdict),
      verdict,
      method: "executor",
    };
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(record, null, 2) + "\n", "utf-8");
  writeFileSync(mdPath, renderMarkdown(record), "utf-8");
  record.paths = { json: jsonPath, md: mdPath };

  return record;
}
