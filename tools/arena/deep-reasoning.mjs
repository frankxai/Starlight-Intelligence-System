#!/usr/bin/env node
/**
 * Built on SIP — R5 deep-reasoning lane harness (v0.1).
 *
 * Runs the pre-registered R5 card (tools/arena/R5-DESIGN.md) across the four Claude
 * tiers and emits a run receipt under tools/arena/out/ using the arena-run schema that
 * tools/arena/runs/*.json already uses.
 *
 * WHAT THIS MEASURES
 *   Whether the expensive tiers buy materially fewer wrong answers than the
 *   cheap tiers on reasoning tasks where one wrong intermediate step
 *   propagates — and whether that margin justifies their price multiple.
 *   Cost is recorded per run, so the finding is cost-adjusted, not
 *   capability-only.
 *
 * SCORING
 *   Fully mechanical. Every task declares ground truth and a set of accepting
 *   regexes applied to the final `ANSWER:` line. There is no LLM judge on this
 *   card (see R5-DESIGN.md, Scoring: all four tiers are contestants, so no
 *   Claude model is a non-contestant judge). Scoring is binary per task; there
 *   is no partial credit. Answers that match a pre-registered attractor are
 *   recorded as FAIL-ATTRACTOR so a near-miss is distinguishable from noise.
 *
 * HONEST DEGRADATION (load-bearing)
 *   If the `claude` CLI is absent, or present but unauthenticated, this
 *   harness emits an UNRUN receipt with zero result rows and says so loudly.
 *   It never invents a number. An empty honest result is the correct output;
 *   fabricated results would poison routing-table.json, which is the artifact
 *   this whole lane exists to inform. Exit code is 0 on UNRUN, matching the
 *   sibling harness's dependency-graceful convention (harness/income-payments-safety.mjs);
 *   the banner, not the exit code, is what tells you nothing ran.
 *
 * TRANSPORT CAVEAT
 *   Runs go through the local `claude` CLI in print mode, the same transport
 *   providers/claude-cli.mjs establishes for this repo, so no ANTHROPIC_API_KEY
 *   is needed. The default CLI system prompt is REPLACED with a minimal one
 *   (--system-prompt), which drops per-call harness overhead from ~27,300 tokens
 *   to ~250 and makes the cost column attributable to the task rather than to
 *   the harness. Token and cost figures are read from the CLI's own
 *   modelUsage[<model id>] entry for the contestant, which excludes the
 *   background Haiku call the CLI makes on every invocation.
 *
 * EFFORT
 *   Held constant across the three tiers that support it (see R5-DESIGN.md,
 *   Effort). claude-haiku-4-5 does NOT accept output_config.effort at the API
 *   level, so no effort flag is sent for it and its row records
 *   effortApplied: null. This asymmetry is a stated limitation of the card, not
 *   an oversight — do not "fix" it by sending an effort the API would reject.
 *
 * USAGE
 *   node tools/arena/deep-reasoning.mjs [--dry-run] [--tasks d1,d3] [--models opus,haiku]
 *                                   [--effort high] [--concurrency 4] [--out PATH]
 *   --dry-run assembles every prompt and reports its size without spending anything.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARENA_DIR = __dirname;
const REPO_ROOT = resolve(__dirname, "..", "..");
const FIXTURE_DIR = join(ARENA_DIR, "fixtures", "deep-reasoning");
const CLAUDE_BIN = process.env.CLAUDE_CLI_BIN || "claude";

// ---- Contestants ----------------------------------------------------------
// Exact model IDs, never date-suffixed. supportsEffort follows the Anthropic
// API contract: output_config.effort is rejected on claude-haiku-4-5.
const CONTESTANTS = [
  { key: "fable",  model: "claude-fable-5",  supportsEffort: true,  priceIn: 10.0, priceOut: 50.0 },
  { key: "opus",   model: "claude-opus-5",   supportsEffort: true,  priceIn: 5.0,  priceOut: 25.0 },
  { key: "sonnet", model: "claude-sonnet-5", supportsEffort: true,  priceIn: 2.0,  priceOut: 10.0 },
  { key: "haiku",  model: "claude-haiku-4-5", supportsEffort: false, priceIn: 1.0,  priceOut: 5.0 },
];

const SYSTEM_PROMPT =
  "You are a subject in a controlled model evaluation. Work the problem carefully, " +
  "then end your reply with a single final line in exactly the requested ANSWER form. " +
  "Nothing may follow that line.";

const ANSWER_INSTRUCTION = (format) =>
  `\n\nWork the problem, then end your reply with a single final line in exactly this form:\n${format}\nNothing may follow that line.`;

// ---- Args -----------------------------------------------------------------
function parseArgs(argv) {
  const out = { dryRun: false, tasks: null, models: null, effort: "high", concurrency: 4, out: null, timeoutMs: 900_000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--tasks") out.tasks = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--models") out.models = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--effort") out.effort = argv[++i];
    else if (a === "--concurrency") out.concurrency = Number(argv[++i]);
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--timeout-ms") out.timeoutMs = Number(argv[++i]);
  }
  return out;
}

// ---- Fixture loading + deterministic prompt assembly -----------------------
function loadTasks(filter) {
  if (!existsSync(FIXTURE_DIR)) return [];
  const files = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith(".json")).sort();
  const tasks = files.map((f) => JSON.parse(readFileSync(join(FIXTURE_DIR, f), "utf8")));
  if (!filter) return tasks;
  return tasks.filter((t) => filter.some((f) => t.id === f || t.id.startsWith(`${f}-`)));
}

const pad2 = (n) => String(n).padStart(2, "0");

// Assembles the long-context document from the fixture's recipe. Fully
// deterministic: index arithmetic only, no RNG, no clock. The same fixture
// always produces byte-identical text, so a later round is a true replication.
function assembleDocument(a) {
  const needleByIndex = new Map(a.needles.map((n) => [n.atSection, n]));
  const lines = [a.preamble, ""];
  for (let i = 1; i <= a.sectionCount; i++) {
    const needle = needleByIndex.get(i);
    if (needle) {
      lines.push(needle.text, "");
      continue;
    }
    const f = a.filler;
    const topic = f.topics[i % f.topics.length];
    const hh = pad2((i * f.hour.mul) % f.hour.mod);
    const mm = pad2((i * f.minute.mul) % f.minute.mod);
    const dur = f.duration.base + ((i * f.duration.mul) % f.duration.mod);
    lines.push(
      f.template
        .replaceAll("{i}", String(i))
        .replaceAll("{job}", `job-${String(i).padStart(3, "0")}`)
        .replaceAll("{topic}", topic)
        .replaceAll("{hh}", hh)
        .replaceAll("{mm}", mm)
        .replaceAll("{dur}", String(dur)),
      "",
    );
  }
  lines.push(a.question);
  return lines.join("\n");
}

function buildPrompt(task) {
  const body = task.prompt ?? assembleDocument(task.assemble);
  return body + ANSWER_INSTRUCTION(task.answerFormat);
}

// ---- Answer extraction + mechanical scoring --------------------------------
function extractAnswer(text) {
  if (typeof text !== "string") return null;
  const matches = [...text.matchAll(/^[^\S\n]*(?:[*_`>\-\s]*)ANSWER\s*:\s*(.+?)[^\S\n]*$/gim)];
  if (!matches.length) return null;
  return matches[matches.length - 1][1];
}

function normalize(raw, steps = []) {
  let s = raw;
  // Applied to every task: models routinely wrap the answer in markdown or end
  // the line with a period. Neither changes the semantics of the answer.
  s = s.replace(/[`*_]/g, "").trim().replace(/\.+$/, "").trim();
  for (const step of steps) {
    if (step === "collapse-whitespace") s = s.replace(/\s+/g, " ").trim();
    else if (step === "uppercase") s = s.toUpperCase();
    else if (step === "strip-commas") s = s.replace(/,/g, "");
    else if (step === "strip-currency") s = s.replace(/[$]/g, "");
  }
  return s;
}

function score(task, rawOutput) {
  const answerLine = extractAnswer(rawOutput);
  if (answerLine === null) {
    return { status: "NO-ANSWER", answer: null, note: "no final ANSWER line found in the reply" };
  }
  const v = task.verification;
  const norm = normalize(answerLine, v.normalize);
  for (const pat of v.accept) {
    if (new RegExp(pat).test(norm)) return { status: "PASS", answer: norm };
  }
  for (const att of v.attractors ?? []) {
    for (const pat of att.accept) {
      if (new RegExp(pat).test(norm)) {
        return { status: "FAIL-ATTRACTOR", answer: norm, attractor: att.label, note: att.why };
      }
    }
  }
  return { status: "FAIL", answer: norm };
}

// ---- claude CLI transport --------------------------------------------------
function runClaude({ prompt, model, effort, timeoutMs }) {
  return new Promise((resolvePromise) => {
    const args = [
      "-p", prompt,
      "--system-prompt", SYSTEM_PROMPT,
      "--model", model,
      "--output-format", "json",
      "--tools", "",
    ];
    if (effort) args.push("--effort", effort);

    let child;
    try {
      child = spawn(CLAUDE_BIN, args, { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    } catch (err) {
      resolvePromise({ error: `failed to spawn "${CLAUDE_BIN}": ${err.message}` });
      return;
    }

    let stdout = "", stderr = "", settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      resolvePromise({ error: `timed out after ${timeoutMs}ms` });
    }, timeoutMs);
    const finish = (r) => { if (settled) return; settled = true; clearTimeout(timer); resolvePromise(r); };

    child.stdout.on("data", (c) => (stdout += c));
    child.stderr.on("data", (c) => (stderr += c));
    child.on("error", (err) => finish({ error: `spawn error: ${err.message}` }));
    child.on("close", () => {
      let parsed;
      try {
        parsed = JSON.parse(stdout);
      } catch {
        finish({ error: `non-JSON stdout: ${(stderr || stdout || "(empty)").slice(-600)}` });
        return;
      }
      const ev = Array.isArray(parsed) ? [...parsed].reverse().find((e) => e?.type === "result") : parsed;
      if (!ev) { finish({ error: "no result event in CLI output" }); return; }
      if (ev.is_error || typeof ev.result !== "string") {
        finish({ error: `CLI reported error: ${String(ev.result ?? ev.subtype ?? "unknown").slice(0, 400)}` });
        return;
      }
      // Attribute tokens/cost to the contestant's own model entry, excluding
      // the background Haiku call the CLI makes on every invocation.
      // Prompt tokens are split across three buckets (uncached / cache-write /
      // cache-read). Reading only `inputTokens` under-reports by orders of
      // magnitude — the first R5 run recorded in=2 for an 18.5K-token prompt,
      // because the whole prompt had landed in the cache buckets. Sum all three.
      const mu = ev.modelUsage?.[model] ?? null;
      const usage = mu
        ? {
            inputTokensUncached: mu.inputTokens ?? 0,
            cacheCreationInputTokens: mu.cacheCreationInputTokens ?? 0,
            cacheReadInputTokens: mu.cacheReadInputTokens ?? 0,
            outputTokens: mu.outputTokens ?? 0,
            costUSD: mu.costUSD ?? null,
            attribution: `modelUsage["${model}"]`,
          }
        : {
            inputTokensUncached: ev.usage?.input_tokens ?? 0,
            cacheCreationInputTokens: ev.usage?.cache_creation_input_tokens ?? 0,
            cacheReadInputTokens: ev.usage?.cache_read_input_tokens ?? 0,
            outputTokens: ev.usage?.output_tokens ?? 0,
            costUSD: ev.total_cost_usd ?? null,
            attribution: "top-level usage (per-model entry absent)",
          };
      usage.inputTokens =
        usage.inputTokensUncached + usage.cacheCreationInputTokens + usage.cacheReadInputTokens;
      finish({ output: ev.result, durationMs: ev.duration_ms ?? null, usage });
    });
  });
}

function claudeBinaryPresent() {
  return new Promise((res) => {
    let child;
    try { child = spawn(CLAUDE_BIN, ["--version"], { shell: false, stdio: "ignore" }); }
    catch { res(false); return; }
    child.on("error", () => res(false));
    child.on("close", (code) => res(code === 0));
  });
}

async function credentialsUsable(timeoutMs) {
  const r = await runClaude({
    prompt: "Reply with exactly: OK",
    model: "claude-haiku-4-5",
    effort: null,
    timeoutMs: Math.min(timeoutMs, 120_000),
  });
  return r.error ? { ok: false, reason: r.error } : { ok: true };
}

// ---- Concurrency pool ------------------------------------------------------
async function pool(jobs, limit, worker) {
  const results = new Array(jobs.length);
  let next = 0;
  const runners = Array.from({ length: Math.max(1, Math.min(limit, jobs.length)) }, async () => {
    while (true) {
      const i = next++;
      if (i >= jobs.length) return;
      results[i] = await worker(jobs[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

// ---- Receipt ---------------------------------------------------------------
function writeReceipt(scorecard, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(scorecard, null, 2) + "\n", "utf8");
  return outPath;
}

function unrunReceipt(ranAt, reason, contestants, tasks, effort) {
  return {
    $comment:
      "Built on SIP — Starlight Model Arena run receipt. Schema: arena-run v0.3 (R5 deep-reasoning). " +
      "STATUS: UNRUN. The lane is specified and the card is built, but no model was called, so this receipt " +
      "carries ZERO results. Nothing here may be read as evidence. Do not derive a routing rule from it.",
    runId: `arena-${ranAt}-r5-deep-reasoning-UNRUN`,
    date: ranAt,
    status: "UNRUN",
    unrunReason: reason,
    card: "round-4-deep-reasoning: 6 tasks, fully mechanical verification, cost-adjusted",
    lane: "deep-reasoning",
    design: "tools/arena/R5-DESIGN.md",
    harness: "tools/arena/deep-reasoning.mjs (claude CLI print mode)",
    effortRequested: effort,
    contestants: Object.fromEntries(contestants.map((c) => [c.key, c.model])),
    tasksSpecified: tasks.map((t) => t.id),
    tasks: [],
    summary: {
      tally: {},
      headline: "UNRUN — no model credentials available in this environment. The card is specified and reproducible; it has not been executed.",
      caveats: ["No data was collected. routing-table.json must not be changed on the basis of this receipt."],
    },
    attestation: "Built on SIP — Starlight Intelligence Protocol",
  };
}

// ---- Main ------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const ranAt = new Date().toISOString().slice(0, 10);
  const tasks = loadTasks(args.tasks);
  const contestants = args.models ? CONTESTANTS.filter((c) => args.models.includes(c.key)) : CONTESTANTS;
  const outPath = args.out
    ? resolve(args.out)
    : join(ARENA_DIR, "out", `r5-deep-reasoning-${ranAt}.json`);

  if (!tasks.length) {
    console.error(`no task fixtures found under ${FIXTURE_DIR}`);
    process.exit(2);
  }

  console.log(`\nR4 deep-reasoning lane — ${tasks.length} task(s) x ${contestants.length} contestant(s)`);
  console.log(`design: tools/arena/R5-DESIGN.md   effort requested: ${args.effort}\n`);

  if (args.dryRun) {
    for (const t of tasks) {
      const p = buildPrompt(t);
      console.log(`  ${t.id.padEnd(38)} ${String(p.length).padStart(7)} chars  ~${Math.round(p.length / 4)} tokens`);
      console.log(`      family: ${t.family}`);
      console.log(`      truth:  ${t.groundTruth.answer}`);
      console.log(`      predict: ${Object.entries(t.prediction).map(([k, v]) => `${k}=${v}`).join(" ")}`);
    }
    console.log("\ndry run — no model was called, nothing was spent, no receipt written.");
    process.exit(0);
  }

  // ---- Honest degradation gate --------------------------------------------
  if (!(await claudeBinaryPresent())) {
    const reason = `the "${CLAUDE_BIN}" CLI is not on PATH, so no model could be called`;
    const p = writeReceipt(unrunReceipt(ranAt, reason, contestants, tasks, args.effort), outPath);
    console.log("=".repeat(72));
    console.log("  LANE STATUS: SPECIFIED BUT UNRUN");
    console.log(`  ${reason}.`);
    console.log("  Zero results emitted. routing-table.json must not be changed from this run.");
    console.log("=".repeat(72));
    console.log(`\nunrun receipt: ${p}`);
    process.exit(0);
  }
  const cred = await credentialsUsable(args.timeoutMs);
  if (!cred.ok) {
    const reason = `the "${CLAUDE_BIN}" CLI is present but no usable model credential was found (${cred.reason})`;
    const p = writeReceipt(unrunReceipt(ranAt, reason, contestants, tasks, args.effort), outPath);
    console.log("=".repeat(72));
    console.log("  LANE STATUS: SPECIFIED BUT UNRUN");
    console.log(`  ${reason}.`);
    console.log("  Zero results emitted. routing-table.json must not be changed from this run.");
    console.log("=".repeat(72));
    console.log(`\nunrun receipt: ${p}`);
    process.exit(0);
  }

  // ---- Run ----------------------------------------------------------------
  const jobs = [];
  for (const t of tasks) for (const c of contestants) jobs.push({ task: t, contestant: c });

  const started = Date.now();
  const runs = await pool(jobs, args.concurrency, async ({ task, contestant }) => {
    const effort = contestant.supportsEffort ? args.effort : null;
    const t0 = Date.now();
    const r = await runClaude({ prompt: buildPrompt(task), model: contestant.model, effort, timeoutMs: args.timeoutMs });
    const wallMs = Date.now() - t0;
    if (r.error) {
      console.log(`  !  ${task.id.padEnd(38)} ${contestant.key.padEnd(7)} ERROR  ${r.error.slice(0, 90)}`);
      return { task, contestant, row: { status: "ERROR", error: r.error, effortApplied: effort, wallMs } };
    }
    const s = score(task, r.output);
    console.log(`  ${s.status === "PASS" ? "+" : "-"}  ${task.id.padEnd(38)} ${contestant.key.padEnd(7)} ${s.status.padEnd(15)} ${String(s.answer ?? "").slice(0, 44)}`);
    return {
      task, contestant,
      row: {
        status: s.status,
        answer: s.answer,
        ...(s.attractor ? { attractor: s.attractor, attractorWhy: s.note } : {}),
        ...(s.note && !s.attractor ? { note: s.note } : {}),
        effortApplied: effort,
        effortNote: contestant.supportsEffort ? undefined : "claude-haiku-4-5 does not accept output_config.effort; no effort flag sent",
        inputTokens: r.usage.inputTokens,
        inputTokensUncached: r.usage.inputTokensUncached,
        cacheCreationInputTokens: r.usage.cacheCreationInputTokens,
        cacheReadInputTokens: r.usage.cacheReadInputTokens,
        outputTokens: r.usage.outputTokens,
        costUSD: r.usage.costUSD,
        costAttribution: r.usage.attribution,
        durationMs: r.durationMs,
        wallMs,
      },
    };
  });
  const elapsedMs = Date.now() - started;

  // ---- Assemble the receipt in the arena-run shape -------------------------
  const taskRows = tasks.map((t) => {
    const results = {};
    for (const c of contestants) {
      const hit = runs.find((r) => r.task.id === t.id && r.contestant.key === c.key);
      if (hit) results[c.key] = hit.row;
    }
    const passers = Object.entries(results).filter(([, r]) => r.status === "PASS").map(([k]) => k);
    return {
      id: t.id,
      category: t.category,
      family: t.family,
      verification: "mechanical — final ANSWER line matched against pre-registered accepting regexes; no LLM judge",
      groundTruth: t.groundTruth.answer,
      prediction: t.prediction,
      results,
      winner: passers.length === 0 ? "none — all contestants failed"
        : passers.length === contestants.length ? `tie (${contestants.length}-way) — saturated`
        : passers.join(" / "),
    };
  });

  const perTier = {};
  for (const c of contestants) {
    const rows = runs.filter((r) => r.contestant.key === c.key).map((r) => r.row);
    const passed = rows.filter((r) => r.status === "PASS").length;
    const cost = rows.reduce((a, r) => a + (r.costUSD ?? 0), 0);
    perTier[c.key] = {
      model: c.model,
      passed,
      of: rows.length,
      failAttractor: rows.filter((r) => r.status === "FAIL-ATTRACTOR").length,
      noAnswer: rows.filter((r) => r.status === "NO-ANSWER").length,
      errors: rows.filter((r) => r.status === "ERROR").length,
      inputTokens: rows.reduce((a, r) => a + (r.inputTokens ?? 0), 0),
      outputTokens: rows.reduce((a, r) => a + (r.outputTokens ?? 0), 0),
      costUSD: Number(cost.toFixed(6)),
      costPerPassedTaskUSD: passed > 0 ? Number((cost / passed).toFixed(6)) : null,
    };
  }

  const passCounts = Object.values(perTier).map((t) => t.passed);
  const separation = Math.max(...passCounts) - Math.min(...passCounts);
  const anyErrors = Object.values(perTier).some((t) => t.errors > 0);
  const verdict = separation === 0 ? "VOID" : "MEASURED";

  const scorecard = {
    $comment:
      "Built on SIP — Starlight Model Arena run receipt. Schema: arena-run v0.3 (R5 deep-reasoning). " +
      "Round 5 = the deep-reasoning lane R3 named as its own missing weakness. Fully mechanical verification, " +
      "cost-adjusted. Pre-registered design: tools/arena/R5-DESIGN.md — written before any of these numbers existed.",
    runId: `arena-${ranAt}-r5-deep-reasoning`,
    date: ranAt,
    status: "RAN",
    verdict,
    card: "round-4-deep-reasoning: 6 tasks across 5 families where one wrong intermediate step propagates; fully mechanical verification; per-run token and cost accounting",
    lane: "deep-reasoning",
    design: "tools/arena/R5-DESIGN.md",
    harness: "tools/arena/deep-reasoning.mjs — claude CLI print mode, default system prompt replaced",
    method:
      "Each task is dispatched independently to every contestant with a minimal replaced system prompt and no tools. " +
      "The reply's final ANSWER line is matched against pre-registered accepting regexes; a match against a " +
      "pre-registered attractor is recorded as FAIL-ATTRACTOR. Binary scoring, no partial credit, no LLM judge.",
    effort: {
      requested: args.effort,
      appliedTo: contestants.filter((c) => c.supportsEffort).map((c) => c.key),
      notAppliedTo: contestants.filter((c) => !c.supportsEffort).map((c) => c.key),
      note: "Effort is held constant, not swept. claude-haiku-4-5 does not accept output_config.effort at the API level, so its arm runs at the CLI default — a stated asymmetry of this card, not a controlled condition.",
    },
    contestants: Object.fromEntries(contestants.map((c) => [c.key, c.model])),
    priceListUSDPerMTok: Object.fromEntries(contestants.map((c) => [c.key, { input: c.priceIn, output: c.priceOut }])),
    tasks: taskRows,
    summary: {
      perTier,
      separation,
      tally: Object.fromEntries(Object.entries(perTier).map(([k, v]) => [k, `${v.passed}/${v.of}`])),
      headline:
        verdict === "VOID"
          ? `VOID — every contestant scored ${passCounts[0]}/${tasks.length}. The card did not separate the tiers, so it yields no routing evidence. Per the pre-registered rule in R5-DESIGN.md this is a design failure, not a finding: redesign the card before R6.`
          : `Separation of ${separation} task(s) between the best and worst tier. Read summary.perTier for the cost-adjusted comparison; a single round sets confidence to at most medium under the A2 sample floor.`,
      caveats: [
        "n=1 per (task, contestant) cell — directional, not statistical.",
        "Zero LLM-judge dependence: every result is a regex match against a pre-registered ground truth.",
        "model-in-Claude-Code-CLI, not raw API. The default system prompt is replaced to keep token accounting attributable, but this is still a harness measurement.",
        "Cost is the CLI's own list-price attribution for the contestant's model entry; it excludes the background Haiku call the CLI makes per invocation.",
      "inputTokens sums the uncached, cache-write and cache-read buckets. Reading only the uncached bucket under-reports a large prompt by orders of magnitude — see the harness comment in runClaude().",
        "Effort is held constant across the three tiers that accept it and is not applied to claude-haiku-4-5, which does not support it. The cost-adjusted effort frontier is NOT measured by this round.",
        "One round cannot harden a routing rule: the A2 floor requires >=2 concordant rounds.",
        ...(anyErrors ? ["At least one cell errored; treat any tier with errors > 0 as incompletely measured."] : []),
      ],
    },
    runtime: { elapsedMs, concurrency: args.concurrency, jobs: jobs.length },
    attestation: "Built on SIP — Starlight Intelligence Protocol",
  };

  const p = writeReceipt(scorecard, outPath);

  console.log(`\n  tier      pass   attractor  no-ans  err   in-tok   out-tok    cost$   $/passed`);
  for (const [k, v] of Object.entries(perTier)) {
    console.log(
      `  ${k.padEnd(8)}  ${String(v.passed + "/" + v.of).padEnd(6)} ${String(v.failAttractor).padEnd(10)} ${String(v.noAnswer).padEnd(7)} ${String(v.errors).padEnd(5)} ${String(v.inputTokens).padStart(7)} ${String(v.outputTokens).padStart(9)} ${String(v.costUSD).padStart(8)} ${String(v.costPerPassedTaskUSD ?? "n/a").padStart(10)}`,
    );
  }
  console.log(`\nseparation: ${separation} task(s)   verdict: ${verdict}`);
  if (verdict === "VOID") {
    console.log("VOID — the card did not separate the tiers. Pre-registered rule: this is a design failure, not a finding.");
  }
  console.log(`receipt: ${p}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("harness fatal:", err);
  process.exit(2);
});
