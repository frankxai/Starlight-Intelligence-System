import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

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
  const known = "C:\\Users\\frank\\.local\\bin\\claude.exe";
  return existsSync(known) ? known : "claude";
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

export function appendSwarmAudit(plan: SwarmPlan): void {
  mkdirSync(dirname(plan.auditLogPath), { recursive: true });
  appendFileSync(plan.auditLogPath, JSON.stringify(plan) + "\n", "utf-8");
}

export function getSwarmAuditLogPath(homeDir = homedir()): string {
  return join(homeDir, "Starlight-Intelligence-System", "private", "voice-operator", "logs", "swarm.jsonl");
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
  const result = spawnSync("where.exe", [name], {
    shell: false,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 3_000,
  });
  return result.status === 0 || powerShellFunctionExists(name);
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
