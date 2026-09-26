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
 *   sibling harness's dependency-graceful convention (the income-payments-safety harness in the starlight-evals mirror);
 *   the banner, not the exit code, is what tells you nothing ran.
 *
 * TRANSPORT CAVEAT
 *   Runs go through the local `claude` CLI in print mode, the same transport
 *   the arena's claude-CLI transport (tools/arena/README.md) establishes for this repo, so no ANTHROPIC_API_KEY
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
const FIXTURE_DIR = join(ARENA_DIR, "fixtures", "deep-reasoning");

// Both axes must agree on what an ANSWER line is. Duplicating this regex let the
// contract metric drift from the scored population with nothing to catch it.
// matchAll clones the regex, so a shared /g literal is safe here.
const ANSWER_LINE_RE = /^[^\S\n]*(?:[*_`>\-\s]*)ANSWER\s*:\s*(.+?)[^\S\n]*$/gim;
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
  const matches = [...text.matchAll(ANSWER_LINE_RE)];
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

// Output-contract compliance — a SECOND axis, scored independently of correctness.
//
// ANSWER_INSTRUCTION asks for "a single final line" and states "Nothing may
// follow that line." Neither clause was ever checked: extractAnswer takes the
// LAST match, so extra ANSWER lines and trailing prose passed silently.
//
// This is the axis arena R4 (2026-06-10 work-samples) found actually separates
// the tiers — "Fable 5 violated an output contract for the first time across
// four rounds; when the task itself is heavy, its constraint edge narrows" —
// and the one this card could not report on. Computed from rawOutput, which the
// harness already holds, so it costs no extra model call.
//
// It never changes PASS/FAIL. A reply may be correct and non-conformant, or
// conformant and wrong; the point is to stop conflating the two.
function contractCheck(rawOutput) {
  if (typeof rawOutput !== "string") {
    return { answerLines: 0, trailingChars: 0, conformant: false, violations: ["no-output"] };
  }
  const matches = [...rawOutput.matchAll(ANSWER_LINE_RE)];
  const answerLines = matches.length;
  let trailingChars = 0;
  if (answerLines) {
    const last = matches[answerLines - 1];
    trailingChars = rawOutput.slice(last.index + last[0].length).trim().length;
  }
  const violations = [];
  if (answerLines === 0) violations.push("no-answer-line");
  if (answerLines > 1) violations.push(`multiple-answer-lines:${answerLines}`);
  if (trailingChars > 0) violations.push(`trailing-content:${trailingChars}`);
  return { answerLines, trailingChars, conformant: violations.length === 0, violations };
}

function score(task, rawOutput) {
  const contract = contractCheck(rawOutput);
  const answerLine = extractAnswer(rawOutput);
  if (answerLine === null) {
    return { status: "NO-ANSWER", answer: null, contract, note: "no final ANSWER line found in the reply" };
  }
  const v = task.verification;
  const norm = normalize(answerLine, v.normalize);
  for (const pat of v.accept) {
    if (new RegExp(pat).test(norm)) return { status: "PASS", answer: norm, contract };
  }
  for (const att of v.attractors ?? []) {
    for (const pat of att.accept) {
      if (new RegExp(pat).test(norm)) {
        return { status: "FAIL-ATTRACTOR", answer: norm, contract, attractor: att.label, note: att.why };
      }
    }
  }
  return { status: "FAIL", answer: norm, contract };
}

// ---- claude CLI transport --------------------------------------------------
// Linux caps a single argv element at MAX_ARG_STRLEN (131072 bytes) and the prompt goes
// in via -p. d3 is already ~74KB, and R5-DESIGN.md section 5 sanctions growing it toward
// ~150K tokens, which spawn would reject with E2BIG. Left unchecked that surfaces as an
// ERROR cell, which then perturbs `separation` and the stamped verdict — a measurement
// artifact disguised as a result. Fail loudly instead.
const MAX_ARG_BYTES = 131072;

function runClaude({ prompt, model, effort, timeoutMs }) {
  const bytes = Buffer.byteLength(prompt, "utf8");
  if (bytes >= MAX_ARG_BYTES) {
    return Promise.resolve({
      error: `prompt is ${bytes} bytes, at or over the ${MAX_ARG_BYTES}-byte single-argument limit for -p. ` +
             `This is a harness limit, NOT a model result: do not score this cell. ` +
             `Pass the prompt on stdin before growing this task further.`,
    });
  }
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

    // Decode as UTF-8 per stream, not per chunk: `stdout += buffer` stringifies each
    // chunk independently and mangles any multi-byte character straddling a 64 KiB
    // boundary, which silently turns a correct long answer into a FAIL.
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
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

// Returns the CLI version string, or null when the binary is unusable. The version is
// recorded in the receipt: R5-DESIGN.md section 10 makes transport identity the condition
// for R6 concordance, so a receipt that omits it cannot be compared against a later one.
function claudeVersion() {
  return new Promise((res) => {
    let child, out = "";
    try { child = spawn(CLAUDE_BIN, ["--version"], { shell: false, stdio: ["ignore", "pipe", "ignore"] }); }
    catch { res(null); return; }
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (c) => (out += c));
    child.on("error", () => res(null));
    child.on("close", (code) => res(code === 0 ? out.trim() || "unknown" : null));
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
    card: "round-5-deep-reasoning: 6 tasks, fully mechanical verification, cost-adjusted",
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
  if (args.models) {
    const valid = CONTESTANTS.map((c) => c.key);
    const unknown = args.models.filter((m) => !valid.includes(m));
    if (unknown.length) {
      console.error(`unknown --models key(s): ${unknown.join(", ")}\nvalid keys: ${valid.join(", ")}`);
      process.exit(2);
    }
  }
  if (!contestants.length) {
    console.error("no contestants selected — refusing to write a receipt with an empty lineup");
    process.exit(2);
  }
  const outPath = args.out
    ? resolve(args.out)
    : join(ARENA_DIR, "out", `r5-deep-reasoning-${ranAt}.json`);

  if (!tasks.length) {
    console.error(`no task fixtures found under ${FIXTURE_DIR}`);
    process.exit(2);
  }

  console.log(`\nR5 deep-reasoning lane — ${tasks.length} task(s) x ${contestants.length} contestant(s)`);
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
  const cliVersion = await claudeVersion();
  if (!cliVersion) {
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
        contract: s.contract,
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
      failed: rows.filter((r) => r.status === "FAIL").length,
      failAttractor: rows.filter((r) => r.status === "FAIL-ATTRACTOR").length,
      noAnswer: rows.filter((r) => r.status === "NO-ANSWER").length,
      errors: rows.filter((r) => r.status === "ERROR").length,
      inputTokens: rows.reduce((a, r) => a + (r.inputTokens ?? 0), 0),
      outputTokens: rows.reduce((a, r) => a + (r.outputTokens ?? 0), 0),
      costUSD: Number(cost.toFixed(6)),
      costPerPassedTaskUSD: passed > 0 ? Number((cost / passed).toFixed(6)) : null,
      // Second axis, independent of correctness. Only cells that produced output
      // are scoreable: a transport ERROR is not a contract violation.
      contract: (() => {
        const scored = rows.filter((r) => r.contract);
        const bad = scored.filter((r) => !r.contract.conformant);
        return {
          scoreable: scored.length,
          conformant: scored.length - bad.length,
          violations: bad.flatMap((r) => r.contract.violations),
        };
      })(),
    };
  }

  const passCounts = Object.values(perTier).map((t) => t.passed);
  const separation = Math.max(...passCounts) - Math.min(...passCounts);
  const anyErrors = Object.values(perTier).some((t) => t.errors > 0);

  // The verdict is machine-stamped, per R5-DESIGN.md section 4 — never a judgment made
  // after seeing the numbers. `separation === 0 ? VOID : MEASURED` was wrong twice:
  //
  //  PARTIAL          a run restricted by --tasks or --models cannot separate the full
  //                   lineup by construction, so it is not evidence about the card in
  //                   either direction. The old stamp called the documented
  //                   `--models opus` reproduction a design failure.
  //  VOID             spread 0 over the full lineup: the card did not separate.
  //  VOID-EQUIVALENT  spread > 0 but NO tier gave a wrong answer — every non-PASS cell
  //                   is a transport ERROR or a missing ANSWER line. One dead socket
  //                   used to stamp MEASURED while the reviewed verdict said
  //                   void-equivalent, so a consumer reading .verdict would have
  //                   counted this round toward the A2 floor.
  //  MEASURED         spread > 0 with at least one real FAIL or FAIL-ATTRACTOR.
  const isSubset = Boolean(args.tasks) || Boolean(args.models);
  const wrongAnswers = Object.values(perTier).reduce((a, x) => a + x.failed + x.failAttractor, 0);
  const verdict = isSubset
    ? "PARTIAL"
    : separation === 0
      ? "VOID"
      : wrongAnswers === 0
        ? "VOID-EQUIVALENT"
        : "MEASURED";

  const scorecard = {
    $comment:
      "Built on SIP — Starlight Model Arena run receipt. Schema: arena-run v0.3 (R5 deep-reasoning). " +
      "Round 5 = the deep-reasoning lane R3 named as its own missing weakness. Fully mechanical verification, " +
      "cost-adjusted. Pre-registered design: tools/arena/R5-DESIGN.md — written before any of these numbers existed.",
    runId: `arena-${ranAt}-r5-deep-reasoning`,
    date: ranAt,
    status: "RAN",
    verdict,
    card: "round-5-deep-reasoning: 6 tasks across 5 families where one wrong intermediate step propagates; fully mechanical verification; per-run token and cost accounting",
    lane: "deep-reasoning",
    design: "tools/arena/R5-DESIGN.md",
    harness: "tools/arena/deep-reasoning.mjs — claude CLI print mode, default system prompt replaced",
    transport: {
      cli: CLAUDE_BIN,
      cliVersion,
      note: "Recorded because R5-DESIGN.md section 10 makes transport identity the condition for R6 concordance: a round run on a different CLI is a different experiment, and two receipts cannot be compared without this field.",
    },
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
      contractTally: Object.fromEntries(
        Object.entries(perTier).map(([k, v]) => [k, `${v.contract.conformant}/${v.contract.scoreable}`])
      ),
      contractNote:
        "Output-contract compliance, scored independently of correctness: did the reply emit exactly one final ANSWER line with nothing after it, as ANSWER_INSTRUCTION requires. This is the axis arena R4 (2026-06-10 work-samples) found actually separates the tiers; correctness on this card does not. A cell can be correct and non-conformant. Transport ERRORs are excluded — they are not contract violations.",
      headline:
        verdict === "PARTIAL"
          ? `PARTIAL — a subset run (${contestants.length} of ${CONTESTANTS.length} contestants, ${tasks.length} task(s)). A restricted lineup cannot separate the tiers by construction, so this receipt is NOT evidence about the card in either direction and must not move routing-table.json.`
          : verdict === "VOID"
            ? `VOID — every contestant scored ${passCounts[0]}/${tasks.length}. The card did not separate the tiers, so it yields no routing evidence. Per the pre-registered rule in R5-DESIGN.md this is a design failure, not a finding: redesign the card before R6.`
            : verdict === "VOID-EQUIVALENT"
              ? `VOID-EQUIVALENT — nominal separation of ${separation} task(s), but no tier gave a WRONG answer: every non-PASS cell is a transport ERROR or a missing ANSWER line. No reasoning separation was established, so this does not count toward the A2 floor.`
              : `Separation of ${separation} task(s) between the best and worst tier, including at least one real wrong answer. Read summary.perTier for the cost-adjusted comparison; a single round sets confidence to at most medium under the A2 sample floor.`,
      caveats: [
        "n=1 per (task, contestant) cell — directional, not statistical.",
        "Zero LLM-judge dependence: every result is a regex match against a pre-registered ground truth.",
        "model-in-Claude-Code-CLI, not raw API. The default system prompt is replaced to keep token accounting attributable, but this is still a harness measurement.",
        "Cost is the CLI's own list-price attribution for the contestant's model entry; it excludes the background Haiku call the CLI makes per invocation.",
      "inputTokens sums the uncached, cache-write and cache-read buckets. Reading only the uncached bucket under-reports a large prompt by orders of magnitude — see the harness comment in runClaude().",
        "Effort is held constant across the three tiers that accept it and is not applied to claude-haiku-4-5, which does not support it. The cost-adjusted effort frontier is NOT measured by this round.",
        "One round cannot harden a routing rule: the A2 floor requires >=2 concordant rounds.",
        "PROMPT-CACHE COST CONFOUND — costUSD and costPerPassedTaskUSD are NOT comparable across tiers on a cache-warm run. Cache reads bill about 0.1x and the hit rate is wildly asymmetric per cell: in the 2026-08-28 run 2, opus on d1 was 99.8% cacheRead while fable, sonnet and haiku paid full price on the same task. Re-running an identical card immediately (as run 2 did, to fix a token-accounting bug) guarantees a cache-warm and therefore incomparable cost column. Treat the cost axis as sound only on a cold cache, and read cacheReadInputTokens per cell before drawing any cost conclusion.",
        "inputTokens is a BLENDED sum of three buckets that bill at different rates (uncached 1x, cache-write ~1.25x, cache-read ~0.1x) while priceListUSDPerMTok.input is a single number. Recomputing cost as inputTokens * input price overstates spend — by 2.10x for opus in the 2026-08-28 run 2. Use costUSD, or the per-bucket fields on each cell; never the blended sum against the list price.",
        "contractTally is a second axis and never affects PASS/FAIL. It was added 2026-09-21, after the 2026-08-28 runs, so the promoted receipt for those runs carries no contract data — the harness discarded raw replies then. It is measured from the next run forward.",
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
