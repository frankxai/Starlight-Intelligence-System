import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { AgentRouter } from "./agents.js";

export interface SwarmTask {
  id: string;
  prompt: string;
}

export interface SwarmResult {
  id: string;
  ok: boolean;
  output: string;
  exitCode: number | null;
  durationMs: number;
  /** Present only when the runner threw or the task timed out. */
  error?: string;
}

/**
 * Runs a single task to completion. Resolves with the agent's stdout and exit
 * code; rejects (or honors `signal` abort) on spawn failure or timeout. Inject
 * a fake in tests; the default spawns `claude -p`.
 */
export type AgentRunner = (
  task: SwarmTask,
  signal: AbortSignal,
) => Promise<{ output: string; exitCode: number | null }>;

export interface SwarmOptions {
  /** Max tasks in flight at once. Default 4. */
  concurrency?: number;
  /** Per-task wall-clock budget in ms before the task is aborted. Default 300_000. */
  timeoutMs?: number;
  /** Process runner. Default: headless `claude -p`. */
  runner?: AgentRunner;
  /** Fired as each task settles (in completion order, not input order). */
  onResult?: (result: SwarmResult) => void;
}

export interface SwarmSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: SwarmResult[];
}

const DEFAULT_CONCURRENCY = 4;
const DEFAULT_TIMEOUT_MS = 300_000;

function resolveClaudeBin(): string {
  if (process.env.STARLIGHT_CLAUDE_BIN) return process.env.STARLIGHT_CLAUDE_BIN;
  // The hardcoded install path is a Windows-only fast path. On POSIX it never
  // existed; fall straight through to PATH resolution.
  if (process.platform === "win32") {
    const known = "C:\\Users\\frank\\.local\\bin\\claude.exe";
    if (existsSync(known)) return known;
  }
  return "claude";
}

/**
 * Default runner — headless `claude -p <prompt>`. stderr is folded into output
 * only when stdout is empty so a failing agent still surfaces a diagnostic.
 * shell:false so prompts with spaces/quotes pass as a single literal argv.
 */
export const defaultClaudeRunner: AgentRunner = (task, signal) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(resolveClaudeBin(), ["-p", task.prompt], {
      shell: false,
      signal,
    });

    let out = "";
    let err = "";
    child.stdout?.on("data", (chunk) => {
      out += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      err += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolvePromise({ output: out.trim() || err.trim(), exitCode: code });
    });
  });

/**
 * Fan tasks out across a bounded worker pool. Never rejects: a runner that
 * throws or a task that times out becomes an `ok: false` result, so one bad
 * task cannot sink the batch. Results are returned in input order regardless
 * of completion order.
 */
export async function runSwarm(
  tasks: SwarmTask[],
  options: SwarmOptions = {},
): Promise<SwarmSummary> {
  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);
  const timeoutMs = Math.max(1, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const runner = options.runner ?? defaultClaudeRunner;

  const results = new Array<SwarmResult>(tasks.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= tasks.length) return;
      const task = tasks[index];

      const start = Date.now();
      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      let result: SwarmResult;
      try {
        const { output, exitCode } = await runner(task, controller.signal);
        result = {
          id: task.id,
          ok: exitCode === 0,
          output,
          exitCode,
          durationMs: Date.now() - start,
        };
      } catch (err) {
        result = {
          id: task.id,
          ok: false,
          output: "",
          exitCode: null,
          durationMs: Date.now() - start,
          error: timedOut
            ? `timed out after ${timeoutMs}ms`
            : err instanceof Error
              ? err.message
              : String(err),
        };
      } finally {
        clearTimeout(timer);
      }

      results[index] = result;
      options.onResult?.(result);
    }
  }

  const poolSize = Math.min(concurrency, tasks.length);
  await Promise.all(Array.from({ length: poolSize }, () => worker()));

  const succeeded = results.filter((r) => r.ok).length;
  return {
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  };
}

export type SwarmAutonomy = "plan_approve";
export type SwarmProviderMode = "adapter_stubs";
export type SwarmProviderStatus = "available" | "missing";
export type SwarmRepoStatus = "available" | "missing";
export type SwarmMutationRisk = "none" | "low" | "medium" | "high";
export type SwarmExternalRisk = "none" | "dry_run_stub" | "live_external";

export interface SwarmRepoConfig {
  id: string;
  name: string;
  path: string;
  role: string;
}

export interface SwarmProviderConfig {
  id: string;
  name: string;
  kind: "cli" | "powershell-function" | "missing-adapter";
  command?: string;
  wrappers?: string[];
  capability: string;
  mode: SwarmProviderMode;
}

export interface SwarmConfig {
  autonomy: SwarmAutonomy;
  providerMode: SwarmProviderMode;
  repos: SwarmRepoConfig[];
  providers: SwarmProviderConfig[];
}

export interface SwarmProviderStatusReport extends SwarmProviderConfig {
  status: SwarmProviderStatus;
  detail: string;
  liveCallsEnabled: false;
}

export interface SwarmRepoStatusReport extends SwarmRepoConfig {
  status: SwarmRepoStatus;
  branch: string | null;
  dirty: boolean | null;
  detail: string;
}

export interface SwarmPacket {
  id: string;
  goal: string;
  repo: {
    id: string;
    name: string;
    path: string;
  };
  recommendedLane: string;
  agent: string;
  requiredContext: string[];
  mutationRisk: SwarmMutationRisk;
  externalProviderRisk: SwarmExternalRisk;
  approvalRequired: true;
  rationale: string;
}

export interface SwarmPlan {
  command: "starlight-swarm";
  mode: "dry_run";
  autonomy: SwarmAutonomy;
  providerMode: SwarmProviderMode;
  goal: string;
  generatedAt: string;
  repos: SwarmRepoStatusReport[];
  providers: SwarmProviderStatusReport[];
  packets: SwarmPacket[];
  auditLogPath: string;
  approvalRequired: true;
  notes: string[];
}

export interface SwarmRuntimeOptions {
  homeDir?: string;
  now?: Date;
  commandExists?: (name: string) => boolean;
  runCommand?: (command: string, args: string[], cwd?: string) => { status: number | null; stdout: string; stderr: string };
}

export const DEFAULT_SWARM_CONFIG: SwarmConfig = {
  autonomy: "plan_approve",
  providerMode: "adapter_stubs",
  repos: [
    {
      id: "sis",
      name: "Starlight Intelligence System",
      path: "~/Starlight-Intelligence-System",
      role: "memory/context/control spine",
    },
    {
      id: "starlight-voice",
      name: "Starlight Voice",
      path: "~/starlight-voice",
      role: "voice cockpit and local sidecar",
    },
    {
      id: "arcanea",
      name: "Arcanea",
      path: "~/Arcanea",
      role: "working Arcanea orchestrator dependency",
    },
  ],
  providers: [
    {
      id: "claude",
      name: "Claude Code",
      kind: "cli",
      command: "claude",
      capability: "primary architecture, substrate-sensitive planning, and code execution after approval",
      mode: "adapter_stubs",
    },
    {
      id: "codex",
      name: "Codex CLI",
      kind: "cli",
      command: "codex",
      capability: "large code edits, adversarial implementation review, and focused repo work after approval",
      mode: "adapter_stubs",
    },
    {
      id: "opencode",
      name: "OpenCode",
      kind: "cli",
      command: "opencode",
      capability: "fast scratchpad checks and latency-bound exploration after approval",
      mode: "adapter_stubs",
    },
    {
      id: "grok",
      name: "Grok",
      kind: "cli",
      command: "grok",
      capability: "external reasoning lane and second-opinion generation through dry-run packets",
      mode: "adapter_stubs",
    },
    {
      id: "antigravity",
      name: "Antigravity",
      kind: "powershell-function",
      command: "agy",
      wrappers: ["agya", "agysis", "agyfx", "agyg", "agyvc", "agydpi"],
      capability: "repo-scoped Antigravity launch wrappers for configured workspaces",
      mode: "adapter_stubs",
    },
    {
      id: "gemini",
      name: "Gemini CLI",
      kind: "cli",
      command: "gemini",
      capability: "long-context grokking when installed",
      mode: "adapter_stubs",
    },
    {
      id: "higgsfield",
      name: "Higgsfield",
      kind: "missing-adapter",
      command: "higgsfield",
      capability: "image/video generation adapter placeholder; no live calls in v1",
      mode: "adapter_stubs",
    },
  ],
};

export function inspectSwarmProviders(
  config: SwarmConfig = DEFAULT_SWARM_CONFIG,
  options: SwarmRuntimeOptions = {},
): SwarmProviderStatusReport[] {
  const commandExists = options.commandExists ?? defaultCommandExists;

  return config.providers.map((provider) => {
    let available = false;
    let detail = "adapter registered";

    if (provider.kind === "missing-adapter") {
      available = Boolean(provider.command && commandExists(provider.command));
      detail = available
        ? `${provider.command} found; still dry-run only until live adapter is promoted`
        : "registered as unavailable until a real CLI/API path is configured";
    } else if (provider.command) {
      available = commandExists(provider.command);
      detail = available ? `${provider.command} found` : `${provider.command} not found`;
    } else if (provider.wrappers && provider.wrappers.length > 0) {
      const found = provider.wrappers.filter((wrapper) => commandExists(wrapper));
      available = found.length > 0;
      detail = available
        ? `wrappers found: ${found.join(", ")}`
        : `wrappers not found: ${provider.wrappers.join(", ")}`;
    }

    return {
      ...provider,
      status: available ? "available" : "missing",
      detail,
      liveCallsEnabled: false,
    };
  });
}

export function inspectSwarmRepos(
  config: SwarmConfig = DEFAULT_SWARM_CONFIG,
  options: SwarmRuntimeOptions = {},
): SwarmRepoStatusReport[] {
  const runCommand = options.runCommand ?? defaultRunCommand;
  const home = options.homeDir ?? homedir();

  return config.repos.map((repo) => {
    const repoPath = expandHome(repo.path, home);
    if (!existsSync(repoPath)) {
      return {
        ...repo,
        path: repoPath,
        status: "missing",
        branch: null,
        dirty: null,
        detail: "path not found",
      };
    }

    const branchResult = runCommand("git", ["branch", "--show-current"], repoPath);
    const statusResult = runCommand("git", ["status", "--porcelain"], repoPath);
    const branch = branchResult.status === 0 ? branchResult.stdout.trim() || "detached" : null;
    const dirty = statusResult.status === 0 ? statusResult.stdout.trim().length > 0 : null;

    return {
      ...repo,
      path: repoPath,
      status: "available",
      branch,
      dirty,
      detail: branch ? `branch=${branch}${dirty ? " dirty" : " clean"}` : "available; git metadata unavailable",
    };
  });
}

export function createSwarmPlan(
  goal: string,
  config: SwarmConfig = DEFAULT_SWARM_CONFIG,
  options: SwarmRuntimeOptions = {},
): SwarmPlan {
  const now = options.now ?? new Date();
  const cleanGoal = goal.trim();
  const repos = inspectSwarmRepos(config, options);
  const providers = inspectSwarmProviders(config, options);
  const availableRepos = repos.filter((repo) => repo.status === "available");
  const targetRepos = chooseTargetRepos(cleanGoal, availableRepos);

  const packets = targetRepos.map((repo, index) => createPacket(cleanGoal, repo, providers, index));

  return {
    command: "starlight-swarm",
    mode: "dry_run",
    autonomy: config.autonomy,
    providerMode: config.providerMode,
    goal: cleanGoal,
    generatedAt: now.toISOString(),
    repos,
    providers,
    packets,
    auditLogPath: getSwarmAuditLogPath(options.homeDir),
    approvalRequired: true,
    notes: [
      "v1 is plan-and-approve only; packets are recommendations, not execution.",
      "Provider adapters are dry-run stubs; live external calls are disabled.",
      "Repo mutation requires explicit approval outside this plan.",
    ],
  };
}

export function appendSwarmAudit(record: SwarmPlan | SwarmRunRecord): void {
  mkdirSync(dirname(record.auditLogPath), { recursive: true });
  appendFileSync(record.auditLogPath, JSON.stringify(record) + "\n", "utf-8");
}

/**
 * Where the swarm audit log lives. With no override (the real CLI path), this
 * resolves relative to the current working directory's own `private/` (the
 * same gitignored, project-relative convention every other voice-operator log
 * uses — see docs/ops/HANDOVER-2026-04-28.md). It previously defaulted to
 * `$HOME/Starlight-Intelligence-System/...` regardless of cwd, which wrote
 * side-effect files outside the actual project checkout whenever $HOME didn't
 * happen to contain a same-named sibling directory. Tests still sandbox via an
 * explicit homeDir (matching the pre-existing v96 fixture layout).
 */
export function getSwarmAuditLogPath(homeDir?: string): string {
  if (homeDir !== undefined) {
    return join(homeDir, "Starlight-Intelligence-System", "private", "voice-operator", "logs", "swarm.jsonl");
  }
  return join(process.cwd(), "private", "voice-operator", "logs", "swarm.jsonl");
}

// ── Plan → Run bridge ───────────────────────────────────────
//
// createSwarmPlan() emits SwarmPacket[] (recommendations, approval-gated).
// runSwarm() consumes SwarmTask[] (a flat prompt per worker). packetsToTasks
// is the seam: it folds each packet's target repo, agent, and required context
// into a single self-contained prompt so an executor has everything it needs
// without re-reading the plan.

/** Compose a self-contained worker prompt from a planned packet. */
function packetToPrompt(packet: SwarmPacket): string {
  const context =
    packet.requiredContext.length > 0
      ? `\nRequired context files: ${packet.requiredContext.join(", ")}`
      : "";
  return (
    `[${packet.agent}] ${packet.goal}\n` +
    `Target repo: ${packet.repo.name} (${packet.repo.path})\n` +
    `Recommended lane: ${packet.recommendedLane}${context}\n` +
    `Rationale: ${packet.rationale}`
  );
}

/** Map planned packets onto executable swarm tasks (preserves packet ids). */
export function packetsToTasks(packets: SwarmPacket[]): SwarmTask[] {
  return packets.map((packet) => ({ id: packet.id, prompt: packetToPrompt(packet) }));
}

/**
 * Dry-run runner — echoes each prompt deterministically with a success exit.
 * No subprocess, no model call: used when a plan is approved but --live is off,
 * so the run path is exercisable end-to-end without touching a real harness.
 */
export const dryRunEchoRunner: AgentRunner = async (task) => ({
  output: `[dry-run] ${task.prompt}`,
  exitCode: 0,
});

/** Audit record written after an approved swarm run (distinct from the plan record). */
export interface SwarmRunRecord {
  command: "starlight-swarm-run";
  goal: string;
  mode: "live" | "dry-run";
  generatedAt: string;
  auditLogPath: string;
  summary: { total: number; succeeded: number; failed: number };
  results: SwarmResult[];
}

export interface SwarmRunOptions {
  /** Execute the plan. Without this, executeSwarmPlan is a no-op gate. */
  approve?: boolean;
  /** Use the real runner instead of the deterministic dry-run echo. */
  live?: boolean;
  /** Override the runner (defaults: live → claude subprocess, else dry-run echo). */
  runner?: AgentRunner;
  /** Worker pool size. */
  concurrency?: number;
  /** Injectable clock for deterministic audit timestamps. */
  now?: Date;
}

export interface SwarmRunOutcome {
  approved: boolean;
  executed: boolean;
  mode: "live" | "dry-run" | "not-executed";
  summary?: SwarmSummary;
  record?: SwarmRunRecord;
}

/**
 * Execute an approved plan through the worker pool and write a run-audit record.
 * The approval gate is structural: without `approve`, nothing runs and no audit
 * record is written — the caller gets `{ approved: false, executed: false }`.
 */
export async function executeSwarmPlan(
  plan: SwarmPlan,
  options: SwarmRunOptions = {},
): Promise<SwarmRunOutcome> {
  if (!options.approve) {
    return { approved: false, executed: false, mode: "not-executed" };
  }

  const live = options.live === true;
  const runner = options.runner ?? (live ? defaultClaudeRunner : dryRunEchoRunner);
  const tasks = packetsToTasks(plan.packets);
  const summary = await runSwarm(tasks, { runner, concurrency: options.concurrency });

  const record: SwarmRunRecord = {
    command: "starlight-swarm-run",
    goal: plan.goal,
    mode: live ? "live" : "dry-run",
    generatedAt: (options.now ?? new Date()).toISOString(),
    auditLogPath: plan.auditLogPath,
    summary: { total: summary.total, succeeded: summary.succeeded, failed: summary.failed },
    results: summary.results,
  };
  appendSwarmAudit(record);

  return { approved: true, executed: true, mode: record.mode, summary, record };
}

function createPacket(
  goal: string,
  repo: SwarmRepoStatusReport,
  providers: SwarmProviderStatusReport[],
  index: number,
): SwarmPacket {
  const lane = chooseLane(goal, repo, providers);
  const mutationRisk = estimateMutationRisk(goal);
  const externalRisk = estimateExternalRisk(goal);
  const stamp = (index + 1).toString().padStart(2, "0");

  return {
    id: `swarm-${Date.now().toString(36)}-${stamp}-${repo.id}`,
    goal,
    repo: {
      id: repo.id,
      name: repo.name,
      path: repo.path,
    },
    recommendedLane: lane,
    agent: chooseAgent(goal, repo),
    requiredContext: chooseContext(repo),
    mutationRisk,
    externalProviderRisk: externalRisk,
    approvalRequired: true,
    rationale: buildRationale(repo, lane, mutationRisk, externalRisk),
  };
}

function chooseTargetRepos(goal: string, repos: SwarmRepoStatusReport[]): SwarmRepoStatusReport[] {
  const lower = goal.toLowerCase();
  const explicit = repos.filter((repo) => {
    if (repo.id === "sis" && /\bsis\b|starlight|swarm|orchestrator|memory|dispatch/.test(lower)) return true;
    if (repo.id === "starlight-voice" && /voice|cockpit|spoken|sidecar/.test(lower)) return true;
    if (repo.id === "arcanea" && /arcanea|arco|dispatcher|orchestrator/.test(lower)) return true;
    return false;
  });

  return explicit.length > 0 ? explicit : repos;
}

function chooseLane(goal: string, repo: SwarmRepoStatusReport, providers: SwarmProviderStatusReport[]): string {
  const lower = goal.toLowerCase();
  const available = new Set(providers.filter((provider) => provider.status === "available").map((provider) => provider.id));

  if (/grok|second opinion|external/.test(lower) && available.has("grok")) return "grok";
  if (/antigravity|agy/.test(lower) && available.has("antigravity")) return "antigravity";
  if (/quick|scratch|smoke/.test(lower) && available.has("opencode")) return "opencode";
  if (/refactor|implement|code|test/.test(lower) && available.has("codex")) return "codex";
  if (repo.id === "arcanea" && available.has("antigravity")) return "antigravity";
  return available.has("claude") ? "claude" : "dry-run-only";
}

function chooseAgent(goal: string, repo: SwarmRepoStatusReport): string {
  const lower = goal.toLowerCase();
  if (/security|risk|audit|approval/.test(lower)) return "starlight-sentinel";
  if (/architecture|orchestrator|adapter|integration|swarm/.test(lower)) return "starlight-architect";
  if (/roadmap|sequence|priority/.test(lower)) return "starlight-navigator";
  if (repo.id === "sis") return "starlight-orchestrator";
  return "starlight-architect";
}

function chooseContext(repo: SwarmRepoStatusReport): string[] {
  if (repo.id === "sis") {
    return ["CLAUDE.md", "AGENTS.md", "commands/dispatch.md", "core/orchestrator/README.md"];
  }
  if (repo.id === "starlight-voice") {
    return ["README.md", "docs/ARCHITECTURE.md", "docs/CAPABILITIES.md", "sidecar/"];
  }
  if (repo.id === "arcanea") {
    return ["package.json", "packages/orchestrator/", "CLAUDE.md"];
  }
  return ["README.md"];
}

function estimateMutationRisk(goal: string): SwarmMutationRisk {
  const lower = goal.toLowerCase();
  if (/delete|migrate|rewrite|substrate|sip|registry|governance/.test(lower)) return "high";
  if (/implement|build|edit|wire|configure|fix|refactor/.test(lower)) return "medium";
  if (/inspect|status|plan|review|dry-run|dry run/.test(lower)) return "low";
  return "low";
}

function estimateExternalRisk(goal: string): SwarmExternalRisk {
  const lower = goal.toLowerCase();
  if (/higgsfield|generate|video|image|grok|external|provider/.test(lower)) return "dry_run_stub";
  return "none";
}

function buildRationale(
  repo: SwarmRepoStatusReport,
  lane: string,
  mutationRisk: SwarmMutationRisk,
  externalRisk: SwarmExternalRisk,
): string {
  return `${repo.name} is in the v1 repo ring for ${repo.role}. Lane ${lane} is recommended from the goal shape. Mutation risk=${mutationRisk}; external risk=${externalRisk}. Approval remains required.`;
}

function expandHome(path: string, home: string): string {
  if (path === "~") return home;
  if (path.startsWith("~/") || path.startsWith("~\\")) return resolve(home, path.slice(2));
  return resolve(path);
}

function defaultCommandExists(name: string): boolean {
  if (process.platform === "win32") {
    const result = spawnSync("where.exe", [name], {
      shell: false,
      encoding: "utf-8",
      stdio: "pipe",
      timeout: 3_000,
    });
    // PowerShell wrappers (agy*) are functions, not binaries — where.exe misses them.
    return result.status === 0 || powerShellFunctionExists(name);
  }
  // POSIX: `which` resolves PATH binaries. Wrapper functions live in the user's
  // shell profile and are not visible here, which matches the win32 fallback intent.
  const result = spawnSync("which", [name], {
    shell: false,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 3_000,
  });
  return result.status === 0;
}

function defaultRunCommand(command: string, args: string[], cwd?: string): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(command, args, {
    cwd,
    shell: true,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 15_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function powerShellFunctionExists(name: string): boolean {
  const home = homedir();
  const candidates = [
    join(process.cwd(), "scripts", "agy-tools.ps1"),
    join(home, "Starlight-Intelligence-System", "scripts", "agy-tools.ps1"),
    join(home, "Documents", "PowerShell", "Microsoft.PowerShell_profile.ps1"),
    join(home, "Documents", "PowerShell", "profile.ps1"),
    join(home, "OneDrive", "Dokumente", "PowerShell", "Microsoft.PowerShell_profile.ps1"),
    join(home, "OneDrive", "Dokumente", "PowerShell", "profile.ps1"),
  ];
  const pattern = new RegExp(`function\\s+${escapeRegExp(name)}\\b`, "i");
  for (const candidate of candidates) {
    try {
      if (existsSync(candidate) && pattern.test(readFileSync(candidate, "utf-8"))) {
        return true;
      }
    } catch {
      // Ignore unreadable local profile files; a missing wrapper is non-fatal.
    }
  }
  return false;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatAgyToolCalls(plan: SwarmPlan): string {
  const router = new AgentRouter();
  const output: string[] = [
    "### Google Antigravity Swarm Execution Blueprint",
    "",
    "> [!NOTE]",
    "> The following executable block was automatically generated from the swarm plan.",
    "> Run these tool calls to manifest the swarm in parallel.",
    "",
  ];

  for (const packet of plan.packets) {
    if (packet.recommendedLane !== "antigravity") continue;
    const agent = router.getAgent(packet.agent);
    const systemPrompt = agent
      ? `# Dynamic Identity: ${agent.name} (${agent.id})\n\n> ${agent.description}\n\nVoice: systems-practitioner\nSkills: ${agent.skills.join(", ")}\n\n*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*`
      : `# Dynamic Identity: ${packet.agent}\n\n*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*`;

    output.push(`#### 🤖 Agent: \`${packet.agent}\` (Task ID: \`${packet.id}\`)`);
    output.push("```json");
    output.push(JSON.stringify({
      tool: "define_subagent",
      arguments: {
        name: packet.agent,
        system_prompt: systemPrompt,
        toolSummary: `Define ${packet.agent} swarm profile`,
        toolAction: `Registering subagent ${packet.agent}`
      }
    }, null, 2));
    output.push("```");
    output.push("```json");
    output.push(JSON.stringify({
      tool: "invoke_subagent",
      arguments: {
        Subagents: [{
          TypeName: packet.agent,
          Role: agent ? agent.name : packet.agent,
          Prompt: `${packet.goal}\n\nTarget Repo: ${packet.repo.name} (${packet.repo.path})\nRequired Context Files: ${packet.requiredContext.join(", ")}\n\n*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*`
        }],
        toolSummary: `Launch ${packet.agent} swarm worker`,
        toolAction: `Invoking subagent ${packet.agent}`
      }
    }, null, 2));
    output.push("```");
    output.push("");
  }

  if (output.length === 6) {
    return "> No Antigravity lanes recommended in this plan. All tasks routed to other harnesses.";
  }

  return output.join("\n");
}

export interface ModelCouncilConsensus {
  proposalId: string;
  models: {
    modelId: string;
    verdict: "PROCEED" | "REVISE" | "STOP";
    confidence: number;
    rationale: string;
  }[];
  consensusCoefficient: number; // 0.0 - 1.0
  recommendedAction: "PROCEED" | "REVISE" | "STOP";
  isConsensusReached: boolean;
}

export interface StarlightBoardReview {
  proposalId: string;
  verdicts: {
    vector: "Sovereign" | "Seer" | "Harmonizer" | "Strategist" | "Verifier";
    verdict: string;
    recommendation: "PROCEED" | "REVISE" | "STOP";
  }[];
  overseerSynthesis: string;
  finalRecommendation: "PROCEED" | "REVISE" | "STOP";
  rationale: string;
  timestamp: string;
}

export function calculateModelConsensus(
  proposalId: string,
  modelOutputs: { modelId: string; verdict: "PROCEED" | "REVISE" | "STOP"; confidence: number; rationale: string }[]
): ModelCouncilConsensus {
  const count = modelOutputs.length;
  if (count === 0) {
    return {
      proposalId,
      models: [],
      consensusCoefficient: 0,
      recommendedAction: "STOP",
      isConsensusReached: false
    };
  }

  const votes = { PROCEED: 0, REVISE: 0, STOP: 0 };
  let weightedProceed = 0;
  let weightedRevise = 0;
  let weightedStop = 0;
  let totalConfidence = 0;

  for (const m of modelOutputs) {
    votes[m.verdict]++;
    const weight = m.confidence;
    totalConfidence += weight;
    if (m.verdict === "PROCEED") weightedProceed += weight;
    else if (m.verdict === "REVISE") weightedRevise += weight;
    else if (m.verdict === "STOP") weightedStop += weight;
  }

  const proceedRatio = weightedProceed / (totalConfidence || 1);
  const reviseRatio = weightedRevise / (totalConfidence || 1);
  const stopRatio = weightedStop / (totalConfidence || 1);

  let recommendedAction: "PROCEED" | "REVISE" | "STOP" = "STOP";
  let consensusCoefficient = 0;

  if (proceedRatio >= reviseRatio && proceedRatio >= stopRatio) {
    recommendedAction = "PROCEED";
    consensusCoefficient = proceedRatio;
  } else if (reviseRatio >= proceedRatio && reviseRatio >= stopRatio) {
    recommendedAction = "REVISE";
    consensusCoefficient = reviseRatio;
  } else {
    recommendedAction = "STOP";
    consensusCoefficient = stopRatio;
  }

  const hasHighConfidenceStop = modelOutputs.some(m => m.verdict === "STOP" && m.confidence >= 0.85);
  const isConsensusReached = consensusCoefficient >= 0.80 && !hasHighConfidenceStop;

  return {
    proposalId,
    models: modelOutputs,
    consensusCoefficient,
    recommendedAction,
    isConsensusReached
  };
}

export function performStarlightBoardReview(
  proposalId: string,
  vectorInputs: { vector: "Sovereign" | "Seer" | "Harmonizer" | "Strategist" | "Verifier"; verdict: string; recommendation: "PROCEED" | "REVISE" | "STOP" }[],
  overseerSynthesis: string
): StarlightBoardReview {
  const stopCount = vectorInputs.filter(v => v.recommendation === "STOP").length;
  const reviseCount = vectorInputs.filter(v => v.recommendation === "REVISE").length;

  let finalRecommendation: "PROCEED" | "REVISE" | "STOP" = "PROCEED";
  let rationale = "Proposal approved by the Starlight Board.";

  if (stopCount >= 2) {
    finalRecommendation = "STOP";
    rationale = `Vetoed: ${stopCount} vectors recommended STOP.`;
  } else if (stopCount === 1 || reviseCount >= 2) {
    finalRecommendation = "REVISE";
    rationale = `Revisions required: ${stopCount} STOP and ${reviseCount} REVISE vector votes.`;
  }

  return {
    proposalId,
    verdicts: vectorInputs,
    overseerSynthesis,
    finalRecommendation,
    rationale,
    timestamp: new Date().toISOString()
  };
}


