#!/usr/bin/env node
/**
 * Built on SIP — Free-arena transport (v0.1). A transport clone of
 * tools/arena/deep-reasoning.mjs (R5 deep-reasoning lane) that swaps the
 * `claude` CLI transport for `opencode run -m <model> --format json`, with
 * today's zero-cost OpenCode free tier as contestants.
 *
 * WHAT IS REUSED VERBATIM FROM R5 (no new task design of our own):
 *   - All six fixtures in fixtures/deep-reasoning/ (d1..d6), ground truths
 *     and pre-registered attractors included.
 *   - The scoring core: exact-final-line matching against pre-registered
 *     accepting regexes, FAIL-ATTRACTOR near-miss labelling, binary scoring,
 *     and the second, independent output-contract axis (contractCheck).
 *   - Deterministic long-context assembly (assembleDocument) so a later run
 *     is a true replication.
 *
 * WHAT IS DIFFERENT AND CARRIES ITS OWN CAVEATS (see R5-DESIGN.md discipline:
 * a receipt that hides these is a lie):
 *   1. Harness overhead. `opencode run` carries the OpenCode build agent's
 *      own system prompt/tools (~61K input tokens measured on a trivial
 *      prompt, 2026-10-17). Token columns here are harness-inclusive and
 *      NOT comparable to R5's stripped-system-prompt numbers. Correctness
 *      scoring is unaffected.
 *   2. Prompt delivery. The full prompt travels to the CLI via stdin
 *      (`opencode run` reads stdin when no message argument is given —
 *      measured 2026-10-17). Every cell shares this one transport; there is
 *      no argv-size ceiling, so the long-context task runs identical to the
 *      short ones.
 *   3. Free-tier availability. Model IDs were resolved live from the
 *      OpenCode model registry on 2026-10-17 (`opencode models`, all
 *      cost rows $0). A 403/availability failure is recorded as ERROR
 *      for that cell, never invented around.
 *
 * HONEST DEGRADATION (load-bearing, same doctrine as R5): if `opencode` is
 * absent the harness emits a UNRUN receipt with zero result rows and says so
 * loudly. Exit code is 0 on UNRUN; the banner is the signal.
 *
 * USAGE
 *   node tools/arena/free-arena.mjs [--dry-run] [--tasks d1,d3] [--models glm,mimo]
 *                                   [--concurrency 2] [--out PATH] [--timeout-ms 300000]
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dirname, "fixtures", "deep-reasoning");
const OUT_DIR = join(__dirname, "runs");

const ANSWER_LINE_RE = /^[^\S\n]*(?:[*_`>\-\s]*)ANSWER\s*:\s*(.+?)[^\S\n]*$/gim;
const OPENCODE_BIN = process.env.OPENCODE_BIN || "opencode";

// ---- Contestants -----------------------------------------------------------
// Zero-cost tier only. Resolved live from the harness's own registry on
// 2026-10-17 (tools.opencode.models, every cost row 0/0, status active).
// Prices are recorded as 0 — that is the arithmetic fact of the tier, and the
// caveat field notes it is subscription-subsidised rather than free at the API.
const CONTESTANTS = [
  { key: "glm",      model: "opencode/glm-5.3-flash-free" },
  { key: "mimo",     model: "opencode/mimo-v2.6-flash-free" },
  { key: "deepseek", model: "opencode/deepseek-v4.1-flash-free" },
  { key: "longcat",  model: "opencode/longcat-2.5-preview-free" },
  { key: "nemotron", model: "opencode/nemotron-3.5-super-vl-free" },
  { key: "beam",     model: "opencode/beam-free" },
  { key: "spacebunny", model: "opencode/space-bunny-free" },
  { key: "bigpickle", model: "opencode/big-pickle" },
];

// Same minimal framing R5 uses: the reply is harness data, not user prose.
const ANSWER_INSTRUCTION = (format) =>
  `\n\nWork the problem, then end your reply with a single final line in exactly this form:\n${format}\nNothing may follow that line. The reply is raw harness data: no user-facing framing.`;

// ---- Args ------------------------------------------------------------------
function parseArgs(argv) {
  const out = { dryRun: false, tasks: null, models: null, concurrency: 2, out: null, timeoutMs: 300_000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--tasks") out.tasks = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--models") out.models = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--concurrency") out.concurrency = Number(argv[++i]);
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--timeout-ms") out.timeoutMs = Number(argv[++i]);
  }
  return out;
}

// ---- Fixture loading + deterministic prompt assembly (verbatim from R5) -----
const pad2 = (n) => String(n).padStart(2, "0");

function loadTasks(filter) {
  if (!existsSync(FIXTURE_DIR)) return [];
  const files = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith(".json")).sort();
  const tasks = files.map((f) => JSON.parse(readFileSync(join(FIXTURE_DIR, f), "utf8")));
  if (!filter) return tasks;
  return tasks.filter((t) => filter.some((f) => t.id === f || t.id.startsWith(`${f}-`)));
}

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

// ---- Answer extraction + mechanical scoring (verbatim from R5) -------------
function extractAnswer(text) {
  if (typeof text !== "string") return null;
  const matches = [...text.matchAll(ANSWER_LINE_RE)];
  if (!matches.length) return null;
  return matches[matches.length - 1][1];
}

function normalize(raw, steps = []) {
  let s = raw;
  s = s.replace(/[`*_]/g, "").trim().replace(/\.+$/, "").trim();
  for (const step of steps) {
    if (step === "collapse-whitespace") s = s.replace(/\s+/g, " ").trim();
    else if (step === "uppercase") s = s.toUpperCase();
    else if (step === "strip-commas") s = s.replace(/,/g, "");
    else if (step === "strip-currency") s = s.replace(/[$]/g, "");
  }
  return s;
}

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

// ---- opencode CLI transport ------------------------------------------------
// Uniform delivery: the full prompt goes to stdin (`opencode run` reads stdin
// when no message argument is given — measured 2026-10-17). This removes the
// ~32K-char Windows command-line ceiling entirely (d3's ~74KB assembled
// long-context document fits) and gives every cell the same delivery path.
// On Windows the npm shim is a .cmd, which spawn only launches via a shell;
// the prompt still travels via the piped stdin, so no shell quoting applies.
function runOpencode({ prompt, model, timeoutMs }) {
  // Model IDs are registry slugs ([a-z0-9./-]), so interpolating them into a
  // single command line under shell:true is safe and silences DEP0190. The
  // prompt never touches the command line: it travels via stdin.
  const cmdLine = process.platform === "win32" ? `${OPENCODE_BIN} run -m ${model} --format json` : OPENCODE_BIN;
  const argv = process.platform === "win32" ? null : ["run", "-m", model, "--format", "json"];

  return new Promise((resolvePromise) => {
    let child;
    try {
      child = spawn(cmdLine, argv, {
        shell: process.platform === "win32",
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err) {
      resolvePromise({ error: `failed to spawn "${OPENCODE_BIN}": ${err.message}` });
      return;
    }

    let stdout = "", stderr = "", settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      resolvePromise({ error: `timed out after ${timeoutMs}ms` });
    }, timeoutMs);
    const finish = (r) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise(r);
    };

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (c) => (stdout += c));
    child.stderr.on("data", (c) => (stderr += c));
    child.on("error", (err) => finish({ error: `spawn error: ${err.message}` }));
    child.on("close", (code) => {
      const ndjson = stdout.split("\n").filter(Boolean);
      let lastText = null;
      let usage = null;
      let cliTimeout = false;
      for (const line of ndjson) {
        let ev;
        try { ev = JSON.parse(line); } catch { continue; }
        const p = ev.part ?? {};
        if (p.type === "text" && typeof p.text === "string") lastText = p.text;
        if (p.type === "step-finish" && p.tokens) {
          usage = {
            inputTokens: p.tokens.input ?? 0,
            outputTokens: p.tokens.output ?? 0,
            reasoningTokens: p.tokens.reasoning ?? 0,
            cacheReadTokens: p.tokens.cache?.read ?? 0,
            cacheWriteTokens: p.tokens.cache?.write ?? 0,
            costUSD: p.cost ?? 0,
          };
        }
        if (p.type === "step-finish" && p.reason === "timeout") cliTimeout = true;
      }
      if (usage === null && lastText === null) {
        finish({
          error: `no content in opencode stream (exit ${code}): ${(stderr || stdout || "(empty)").slice(-600)}`,
        });
        return;
      }
      finish({ output: lastText ?? "", durationMs: null, usage, transport: "stdin-message", cliTimeout });
    });

    child.stdin.write(prompt, "utf8");
    child.stdin.end();
  });
}

function opencodeVersion() {
  return new Promise((res) => {
    let child, out = "";
    try {
      const cmdLine = process.platform === "win32" ? `${OPENCODE_BIN} --version` : OPENCODE_BIN;
      child = spawn(cmdLine, null, { shell: process.platform === "win32", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    } catch {
      res(null);
      return;
    }
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (c) => (out += c));
    child.on("error", () => res(null));
    child.on("close", () => res(out.trim() || null));
  });
}

// ---- Orchestration ---------------------------------------------------------
async function runAll(pairs, concurrency) {
  const results = new Map();
  let idx = 0;
  async function worker() {
    while (idx < pairs.length) {
      const i = idx++;
      results.set(i, await runOne(pairs[i]));
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return pairs.map((_, i) => results.get(i));
}

async function runOne({ task, contestant }) {
  const prompt = buildPrompt(task);
  const t0 = Date.now();
  const res = await runOpencode({ prompt, model: contestant.model, timeoutMs: T_mB });
  const durationMs = Date.now() - t0;
  if (res.error) {
    return { taskId: task.id, modelKey: contestant.key, status: "ERROR", error: res.error, durationMs };
  }
  const s = score(task, res.output);
  return {
    taskId: task.id,
    modelKey: contestant.key,
    status: s.status,
    answer: s.answer,
    attractor: s.attractor ?? null,
    contract: s.contract,
    transport: res.transport,
    tokens: res.usage,
    durationMs,
  };
}

let T_mB = 300_000; // replaced by parseArgs; declared here for runOne's closure

async function main() {
  const args = parseArgs(process.argv.slice(2));
  T_mB = args.timeoutMs;

  const tasks = loadTasks(args.tasks);
  const contestants = CONTESTANTS.filter((c) => !args.models || args.models.includes(c.key));

  if (args.models) {
    const unknown = args.models.filter((m) => !CONTESTANTS.some((c) => c.key === m));
    if (unknown.length) {
      console.error(`unknown contestant key(s): ${unknown.join(", ")} — known keys: ${CONTESTANTS.map((c) => c.key).join(", ")}`);
      process.exitCode = 2;
      return;
    }
  }

  if (args.dryRun) {
    for (const task of tasks) {
      const p = buildPrompt(task);
      console.log(`${task.id.padEnd(42)} chars=${String(p.length).padStart(6)}`);
    }
    console.log(`contestants: ${contestants.map((c) => c.key).join(", ")}`);
    console.log(`pairs to run: ${tasks.length * contestants.length}`);
    return;
  }

  const version = await opencodeVersion();
  if (!version) {
    const receipt = {
      runId: `arena-${new Date().toISOString().slice(0, 10)}-free-arena`,
      date: new Date().toISOString().slice(0, 10),
      status: "UNRUN",
      reason: `"${OPENCODE_BIN}" CLI not found or unusable`,
      results: [],
    };
    console.error("UNRUN — opencode CLI absent; writing an honest empty receipt. Nothing was fabricated.");
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(args.out ?? join(OUT_DIR, "unrun-free-arena.json"), JSON.stringify(receipt, null, 2), "utf8");
    return;
  }

  const pairs = [];
  for (const t of tasks) for (const c of contestants) pairs.push({ task: t, contestant: c });
  const results = await runAll(pairs, args.concurrency);

  const receipt = {
    "$comment": "Built on SIP — Starlight Model Arena run receipt. Transport clone of R5 with the opencode free tier. Fixtures, scoring and contract axis reused verbatim from tools/arena/deep-reasoning.mjs.",
    runId: `arena-${new Date().toISOString().slice(0, 10)}-free-arena`,
    date: new Date().toISOString().slice(0, 10),
    status: "RAN",
    verdict: "MEASURED",
    card: "R5 deep-reasoning fixtures reused verbatim; zero-cost transport (opencode run, free-tier models)",
    lane: "deep-reasoning / free-tier transport",
    design: "tools/arena/fixtures/deep-reasoning/* (R5 pre-registered)",
    harness: "tools/arena/free-arena.mjs — opencode run --format json, default build agent",
    opencodeVersion: version,
    method: "Identical to R5: minimal framing, no tools restriction beyond the opencode default agent, final ANSWER line scored against pre-registered regexes; FAIL-ATTRACTOR for pre-registered near-misses; contract axis scored independently. No LLM judge.",
    contestants: Object.fromEntries(contestants.map((c) => [c.key, c.model])),
    priceListUSDPerMTok: { note: "free tier — recorded as 0/0; subscription-subsidised, not API-free", input: 0, output: 0 },
    caveats: [
      "Harness overhead: opencode run carries the build agent's system prompt and tools (~61K input tokens on a trivial prompt, measured 2026-10-17). Token columns are harness-inclusive; they measure cost-of-harness-per-answer, not prompt size. Correctness scoring unaffected.",
      "Uniform stdin delivery: every prompt travels via stdin to `opencode run` (measured support), so all cells share one transport; no argv-size ceiling applies, including the long-context task.",
      "n=1 per cell — directional only, per README.md doctrine. Promote a claim only after repeated rounds agree.",
      "Model-in-OpenCode-harness, not a raw API benchmark.",
    ],
    results,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = args.out ?? join(OUT_DIR, `${receipt.runId.replace(/[:]/g, "")}.json`);
  writeFileSync(outPath, JSON.stringify(receipt, null, 2), "utf8");

  // Console leaderboard: pass rate in fixed order, attractors called out.
  const byModel = new Map(contestants.map((c) => [c.key, { pass: 0, attr: 0, scored: 0, err: 0 }]));
  for (const r of results) {
    if (!r) continue;
    const b = byModel.get(r.modelKey);
    if (r.status === "PASS") { b.pass++; b.scored++; }
    else if (r.status === "FAIL-ATTRACTOR") { b.attr++; b.scored++; }
    else if (r.status === "ERROR") b.err++;
    else b.scored++;
  }
  console.log(`receipt: ${outPath}`);
  console.log("\nleaderboard (R5 fixtures, n=1):");
  for (const c of contestants) {
    const b = byModel.get(c.key);
    console.log(`  ${c.key.padEnd(10)} PASS ${b.pass}/${b.scored}${b.attr ? `  attractor-failures ${b.attr}` : ""}${b.err ? `  ERROR ${b.err}` : ""}`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
