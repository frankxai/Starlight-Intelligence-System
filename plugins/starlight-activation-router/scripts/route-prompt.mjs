#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginRoot =
  process.env.PLUGIN_ROOT ||
  process.env.CODEX_PLUGIN_ROOT ||
  process.env.CLAUDE_PLUGIN_ROOT ||
  path.resolve(__dirname, "..");

const defaultIndexPath = path.join(
  os.homedir(),
  "starlight",
  "repos",
  "ai-capability-registry",
  "registry",
  "generated",
  "codex-activation-index.json",
);

const registryPath = process.env.STARLIGHT_ACTIVATION_INDEX || defaultIndexPath;
let eventName = "SessionStart";

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const input = readHookInput();
  eventName = detectEventName(input);

  if (eventName === "PreToolUse") {
    handlePreToolUse(input);
  } else if (eventName === "UserPromptSubmit") {
    handleUserPromptSubmit(input);
  } else {
    handleSessionStart(input);
  }
}

function readHookInput() {
  try {
    const raw = fs.readFileSync(0, "utf8").trim();
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function detectEventName(payload) {
  const raw =
    payload.hook_event_name ||
    payload.hookEventName ||
    payload.event ||
    payload.eventName;
  if (typeof raw === "string" && raw) {
    return raw;
  }
  if (payload.tool_name || payload.toolName || payload.tool_input || payload.toolInput) {
    return "PreToolUse";
  }
  if (typeof payload.prompt === "string") {
    return "UserPromptSubmit";
  }
  return "SessionStart";
}

function handleSessionStart(payload) {
  const { value: index } = loadActivationIndex();
  const counts = index?.counts;
  const estate =
    counts && typeof counts.gitRepos === "number"
      ? ` Cached registry baseline (${indexSnapshot(index)}): ${counts.gitRepos} git repos, ${counts.withAgentsMd ?? "?"} AGENTS.md, ${counts.withAgentHarness ?? "?"} harness files.`
      : "";
  emitContext(
    [
      "Starlight Activation Router is installed.",
      "If local prompt shortcuts are installed, /si, /so, and /acos expand into the router skills.",
      "For /si-style agent routing, use $starlight-activation-router:starlight-si or mobile alias si:.",
      "For /so-style orchestrator dispatch, use $starlight-activation-router:starlight-so or mobile alias so:.",
      "For /acos Agentic Creator Operating System routing, use $starlight-activation-router:acos-router.",
      "Hooks add routing context and safety checks only; explicit user wording is required before fanout, council, or orchestrator dispatch.",
      estate,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function handleUserPromptSubmit(payload) {
  const prompt = String(payload.prompt || "");
  const cwd = String(payload.cwd || process.cwd());
  const lower = prompt.toLowerCase();
  const hints = [];
  const indexState = loadActivationIndex();
  const index = indexState.value;
  const repo = findRepoForPath(index, cwd);
  const soMatched = matchesSo(lower);
  const swarmMatched = matchesSwarm(lower);

  if (soMatched) {
    hints.push(
      "Use $starlight-activation-router:starlight-so for /so-style Starlight Orchestrator dispatch. Start with a durable packet or dry-run plan; execute fanout only when the prompt explicitly says /so --fanout, run fanout, dispatch, or verify across lanes.",
    );
  }
  if (!soMatched && matchesSi(lower)) {
    hints.push(
      "Use $starlight-activation-router:starlight-si for /si-style routing. Start with a route packet or dry-run dispatch; only run Starlight fanout/council when the user explicitly asks for fanout, council, dispatch execution, or smoke testing.",
    );
  }
  if (matchesAcos(lower)) {
    hints.push(
      "Use $starlight-activation-router:acos-router for /acos Agentic Creator Operating System and creator/content operations. Select the narrow creator lane first, then read only the relevant command or skill files.",
    );
  }
  if (swarmMatched) {
    hints.push(
      "For Starlight Swarm work, prefer the installed starlight-swarm-ops skill. Keep one coordinator, split by capability lane and repo boundary, define each worker's input, artifact, stop condition, verification evidence, and handoff format.",
    );
  }
  for (const priorityHint of priorityRoutingHints(lower)) {
    hints.push(priorityHint);
  }
  if (mentionsAgentChoice(lower) && hints.length === 0) {
    hints.push(
      "The user is asking for agent selection. Prefer $starlight-activation-router:starlight-si to choose the local lane before taking action.",
    );
  }
  if (mentionsInstallOrSkill(lower)) {
    hints.push(
      "For skill/plugin installation work, keep source repo-backed, validate manifests, refresh the Codex activation index, then install from the local marketplace.",
    );
  }
  if (mentionsMobile(lower)) {
    hints.push(
      "Mobile fallback: use si:, so:, or acos: at the start of the prompt when the slash-command picker is unavailable. Mobile remote sessions use the connected host's installed plugins and skills.",
    );
  }
  if (repo && hints.length > 0) {
    hints.push(formatRepoEvidence(repo, index, cwd));
  } else if (hints.length > 0) {
    const evidence = probeAgentsMd(cwd);
    const indexDescription =
      indexState.status === "available"
        ? "available, but no matching repository row"
        : indexState.status;
    hints.push(
      `Repo filesystem evidence at ${cwd}: AGENTS.md=${evidence.status} (fresh check). Repository index=${indexDescription}.`,
    );
  }

  const selected = topInstalledSignals(index, lower);
  if (selected.length > 0) {
    hints.push(`Relevant indexed capabilities (availability not verified): ${selected.join(", ")}.`);
  }

  if (hints.length === 0) {
    return;
  }

  emitContext(`Starlight activation hint: ${hints.join(" ")}`);
}

function handlePreToolUse(payload) {
  const toolName = String(payload.tool_name || payload.toolName || "");
  const toolInput = payload.tool_input || payload.toolInput || {};
  const command = String(toolInput.command || toolInput.cmd || toolInput.script || "");
  const subject = `${toolName}\n${command}`;
  const destructive = findDestructivePattern(subject);
  const secretDisclosure = findSecretDisclosurePattern(subject);
  const hints = [];

  if (destructive || secretDisclosure) {
    const blockedPattern = destructive || secretDisclosure;
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `Starlight Activation Router blocked a high-risk command (${blockedPattern}). Ask Frank for explicit approval or use a scoped, audited alternative.`,
        },
      }),
    );
    return;
  }

  if (/\bcodex\s+plugin\s+(add|install|marketplace\s+add)\b/i.test(command)) {
    hints.push(
      "Plugin install: prefer repo-backed marketplace paths, validate plugin.json and hooks first, then refresh codex-activation-index.json after install.",
    );
  }

  if (/\b(Invoke-SiFanout|Invoke-SiCouncil|si-dispatch\.ps1|si-council\.ps1)\b/i.test(command)) {
    hints.push(
      "Dispatch gate: keep one coordinator, preserve a receipt path, default to read-only lanes unless the prompt authorized implementation, and summarize verification evidence after execution.",
    );
  }

  if (hints.length > 0) {
    emitContext(`Starlight tool hint: ${hints.join(" ")}`);
  }
}

function matchesSi(lower) {
  if (/(^|\s)si:\s*/.test(lower)) {
    return true;
  }
  return [
    "/si",
    "exact `/si` activation",
    "$starlight-si",
    "$starlight-activation-router:starlight-si",
    "starlight si",
    "fanout",
    "council",
    "dispatch packet",
    "which agent",
    "which tool",
    "agent lane",
    "route this",
    "codex or claude",
    "grok",
    "antigravity",
    "deepagent",
  ].some((token) => lower.includes(token));
}

function matchesSo(lower) {
  if (/(^|\s)so:\s*/.test(lower)) {
    return true;
  }
  return [
    "/so",
    "exact `/so` activation",
    "$starlight-so",
    "$starlight-activation-router:starlight-so",
    "starlight so",
    "starlight orchestrator",
    "orchestrator dispatch",
    "queen-enabled orchestrator",
    "queen role",
    "multi-lane dispatch",
    "durable handoff packet",
    "dispatch verify",
  ].some((token) => lower.includes(token));
}

function matchesAcos(lower) {
  if (/(^|\s)acos:\s*/.test(lower)) {
    return true;
  }
  return [
    "/acos",
    "exact `/acos` activation",
    "$acos-router",
    "$starlight-activation-router:acos-router",
    "agentic creator operating system",
    "agentic creator os",
    "creator os",
    "content calendar",
    "tomorrow's content",
    "tomorrows content",
    "content plan",
    "social post",
    "publish",
    "suno",
    "music release",
    "video script",
    "creator workflow",
  ].some((token) => lower.includes(token));
}

function matchesSwarm(lower) {
  const sanitized = lower.replace(/\bdo not (spawn|launch|run) (a )?swarm(s)?\b/g, "");
  return [
    "@starlight-swarm-ops",
    "starlight-swarm-ops",
    "starlight swarm",
    "multi agent",
    "multi-agent",
    "swarm",
    "worker lanes",
    "queen-led",
    "queen led",
    "self-improvement loop",
    "loop design",
    "route measure learn ratify ledger",
  ].some((token) => sanitized.includes(token));
}

function mentionsMobile(lower) {
  return /\b(mobile|phone|ios|android|chatgpt mobile|remote control)\b/.test(lower);
}

function mentionsAgentChoice(lower) {
  return /\b(agent|tool|lane|model|cli)\b/.test(lower) && /\b(which|route|choose|handle|delegate)\b/.test(lower);
}

function mentionsInstallOrSkill(lower) {
  return /\b(install|marketplace|activation registry|codex plugin|plugin creator|skill creator|skill installer)\b/.test(lower)
    || /\b(create|build|update|improve|validate)\s+(a\s+)?(skill|plugin)\b/.test(lower)
    || /\b(skill|plugin)\s+(install|installer|creator|validation|marketplace)\b/.test(lower);
}

function priorityRoutingHints(lower) {
  const hints = [];
  if (matchesCommunity(lower)) {
    hints.push(
      "Priority route: Starlight Communities work should use /so for pilot coordination, ACOS for creator-cell content/workflows, and Starlight Swarm only when worker waves are explicitly needed. Keep evidence in the community spec, module manifest, run-sheet, and pilot receipt.",
    );
  }
  if (matchesHermesPack(lower)) {
    hints.push(
      "Priority route: Hermes pack-factory work should use /so as coordinator, ACOS for content/social production lanes, Railway only for approved runtime changes, and eval receipts before packaging the pack as reusable.",
    );
  }
  if (matchesAgenticLifeOs(lower)) {
    hints.push(
      "Priority route: Agentic Life OS work should use /si for lane selection or /so for offer/package coordination. Preserve the operator-kit manifest, module map, and public/private boundary as the handoff spine.",
    );
  }
  if (matchesLaunch(lower)) {
    hints.push(
      "Priority route: July launch work should use /so for milestone coordination and ACOS for publishing cadence. Keep offers, blockers, proof assets, and next actions tied to the launch ledger.",
    );
  }
  if (matchesHealthOps(lower)) {
    hints.push(
      "Priority route: health/private-ops work should use health-intelligence with strict safety boundaries, dated evidence, private/public separation, and clinician-human authority for medical decisions.",
    );
  }
  if (matchesCrossAgentLoop(lower)) {
    hints.push(
      "Priority route: cross-agent loop work should use /so plus agentic-ops. Add deterministic hook gates for protected files, secrets, external-action claims, generated drift, and eval scorecard receipts.",
    );
  }
  return hints;
}

function matchesCommunity(lower) {
  return [
    "starlight communities",
    "starlight-communities",
    "community creation cell",
    "creation cell",
    "creator cell",
    "community onboarding",
    "pilot surface",
    "community pilot",
    "communities operating system",
  ].some((token) => lower.includes(token));
}

function matchesHermesPack(lower) {
  return [
    "hermes pack",
    "pack factory",
    "content-social-genius",
    "content social genius",
    "business operating pack",
    "pack catalog",
    "automation pack",
    "eval receipts",
  ].some((token) => lower.includes(token));
}

function matchesAgenticLifeOs(lower) {
  return [
    "agentic life os",
    "operator kit",
    "operator-kit",
    "alos",
    "life os offer",
    "offer packaging",
  ].some((token) => lower.includes(token));
}

function matchesLaunch(lower) {
  return [
    "july launch",
    "july 1",
    "2026-07-01",
    "launch cadence",
    "launch command",
    "week-one milestone",
    "offer architecture",
  ].some((token) => lower.includes(token));
}

function matchesHealthOps(lower) {
  return [
    "health ops",
    "private health",
    "nutrition logs",
    "clinician summary",
    "doctor visit",
    "doctor-visit",
    "health intelligence",
    "safety boundaries",
  ].some((token) => lower.includes(token));
}

function matchesCrossAgentLoop(lower) {
  return [
    "cross-agent loop",
    "agent loop os",
    "generated drift",
    "eval scorecard",
    "protected files",
    "external-action claims",
    "hook gates",
  ].some((token) => lower.includes(token));
}

function findDestructivePattern(subject) {
  const checks = [
    ["git reset --hard", /\bgit\s+reset\s+--hard\b/i],
    ["git clean force", /\bgit\s+clean\s+-[^\r\n]*[fdx]/i],
    ["force push", /\bgit\s+push\b[^\r\n]*--force/i],
    ["recursive force delete", /\bRemove-Item\b[^\r\n]*\b-Recurse\b[^\r\n]*\b-Force\b/i],
    ["rm -rf", /\brm\s+-rf\b/i],
    ["del /s", /\bdel\s+\/s\b/i],
    ["format drive", /\bformat\s+[A-Za-z]:/i],
    ["package publish", /\b(npm|pnpm|yarn)\s+publish\b/i],
  ];
  const found = checks.find(([, pattern]) => pattern.test(subject));
  return found?.[0] || null;
}

function findSecretDisclosurePattern(subject) {
  const checks = [
    [
      "secret file disclosure",
      /\b(?:cat|type|Get-Content|gc|more|less|head|tail)\b[^\r\n]*(?:\.env(?:\.(?!example(?:$|[\s;&|]))[^.\s/\\]+)?(?=$|[\s;&|])|\.npmrc\b|\.pypirc\b|credentials(?:\.json)?\b|id_(?:rsa|ed25519)\b|[^\s;&|]+\.(?:pem|key)\b)/i,
    ],
    [
      "environment dump",
      /\bprintenv\b|\benv\s*(?:$|[|;&>])|\bGet-ChildItem\s+Env:/i,
    ],
    [
      "secret environment variable disclosure",
      /\b(?:echo|printf|Write-Output)\b[^\r\n]*\$(?:[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)[A-Z0-9_]*)\b/i,
    ],
  ];
  const found = checks.find(([, pattern]) => pattern.test(subject));
  return found?.[0] || null;
}

function loadActivationIndex() {
  try {
    const raw = fs.readFileSync(registryPath, "utf8");
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { value: null, status: "malformed" };
    }
    return { value, status: "available" };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { value: null, status: "absent" };
    }
    if (error instanceof SyntaxError) {
      return { value: null, status: "malformed" };
    }
    return { value: null, status: "inaccessible" };
  }
}

function findRepoForPath(index, cwd) {
  if (!index || !Array.isArray(index.repos) || !isAbsolutePath(cwd)) {
    return null;
  }
  const cwdIsWindows = isWindowsPath(cwd);
  const normalizedCwd = normalizePath(cwd);
  return index.repos
    .filter(
      (repo) =>
        repo &&
        typeof repo.path === "string" &&
        isWindowsPath(repo.path) === cwdIsWindows &&
        isAbsolutePath(repo.path),
    )
    .map((repo) => ({ ...repo, normalizedPath: normalizePath(repo.path) }))
    .filter((repo) => {
      const prefix = repo.normalizedPath.endsWith("/") ? repo.normalizedPath : `${repo.normalizedPath}/`;
      return normalizedCwd === repo.normalizedPath || normalizedCwd.startsWith(prefix);
    })
    .sort((a, b) => b.normalizedPath.length - a.normalizedPath.length)[0] || null;
}

function formatRepoEvidence(repo, index, cwd) {
  const evidence = probeAgentsMd(repo.path);
  const cached =
    typeof repo.agentsMd === "boolean" ? String(repo.agentsMd) : "unknown";
  const conflicts =
    (evidence.status === "present" && repo.agentsMd === false) ||
    (evidence.status === "absent" && repo.agentsMd === true);
  const cachedStatus = conflicts ? `${cached} (stale; conflicts with filesystem)` : cached;
  const name = typeof repo.name === "string" ? repo.name : "unnamed repository";
  const location = typeof repo.path === "string" ? repo.path : cwd;
  const cachedInventory = [
    `harness=${yesNo(repo.agentHarness)}`,
    `Claude commands=${repo.claudeCommandsCount ?? 0}`,
    `Claude hooks=${repo.claudeHooksCount ?? 0}`,
    `skills=${yesNo(repo.skillsDir)}`,
  ].join(", ");
  return `Repo index snapshot (${indexSnapshot(index)}): ${name} (${location}); AGENTS.md cached=${cachedStatus}, ${cachedInventory}. Repo filesystem evidence: AGENTS.md=${evidence.status} (fresh check at ${joinPath(repo.path, "AGENTS.md")}).`;
}

function probeAgentsMd(repoPath, statSync = fs.statSync) {
  if (
    typeof repoPath !== "string" ||
    !isAbsolutePath(repoPath) ||
    isWindowsPath(repoPath) !== (process.platform === "win32")
  ) {
    return { status: "unknown" };
  }
  let repoStat;
  try {
    repoStat = statSync(repoPath);
  } catch (error) {
    if (["EACCES", "EPERM", "ENOTDIR"].includes(error?.code)) {
      return { status: "inaccessible" };
    }
    return { status: "unknown" };
  }
  if (!repoStat.isDirectory()) {
    return { status: "unknown" };
  }
  try {
    const markerStat = statSync(joinPath(repoPath, "AGENTS.md"));
    return { status: markerStat.isFile() ? "present" : "unknown" };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { status: "absent" };
    }
    if (["EACCES", "EPERM", "ENOTDIR"].includes(error?.code)) {
      return { status: "inaccessible" };
    }
    return { status: "unknown" };
  }
}

function topInstalledSignals(index, lower) {
  if (!index || !Array.isArray(index.skills)) {
    return [];
  }
  const candidates = index.skills
    .filter((skill) => typeof skill.name === "string")
    .map((skill) => skill.name)
    .filter((name) => {
      const normalized = name.toLowerCase();
      if (lower.includes("vercel") && normalized.includes("vercel")) return true;
      if (lower.includes("motion") && normalized.includes("motion")) return true;
      if (lower.includes("notion") && normalized.includes("notion")) return true;
      if (lower.includes("gmail") && normalized.includes("gmail")) return true;
      if (lower.includes("slack") && normalized.includes("slack")) return true;
      if (lower.includes("railway") && normalized.includes("railway")) return true;
      if (lower.includes("suno") && normalized.includes("suno")) return true;
      if (lower.includes("domain") && normalized.includes("domain")) return true;
      if (lower.includes("health") && normalized.includes("health")) return true;
      if (lower.includes("hermes") && normalized.includes("hermes")) return true;
      if ((lower.includes("community") || lower.includes("communities")) && normalized.includes("community")) return true;
      if ((lower.includes("agentic life os") || lower.includes("operator kit")) && normalized.includes("agentic")) return true;
      if ((lower.includes("content-social-genius") || lower.includes("pack factory")) && normalized.includes("agentic-ops")) return true;
      if (lower.includes("orchestrator") && normalized.includes("starlight-so")) return true;
      if ((lower.includes("swarm") || lower.includes("multi-agent") || lower.includes("multi agent")) && normalized.includes("starlight-swarm")) return true;
      if ((lower.includes("agentic creator operating system") || lower.includes("creator os")) && normalized.includes("acos-router")) return true;
      return false;
    });
  return [...new Set(candidates)].slice(0, 4);
}

function normalizePath(rawPath) {
  if (isWindowsPath(rawPath)) {
    return path.win32.resolve(rawPath).replace(/\\/g, "/").toLowerCase();
  }
  return path.resolve(rawPath);
}

function isWindowsPath(rawPath) {
  return typeof rawPath === "string" && (/^[a-z]:[\\/]/i.test(rawPath) || /^(?:\\\\|\/\/)[^\\/]+[\\/]/.test(rawPath));
}

function isAbsolutePath(rawPath) {
  return isWindowsPath(rawPath) ? path.win32.isAbsolute(rawPath) : path.isAbsolute(rawPath);
}

function joinPath(root, child) {
  return isWindowsPath(root) ? path.win32.join(root, child) : path.join(root, child);
}

function indexSnapshot(index) {
  return typeof index?.generatedAt === "string"
    ? `generated ${index.generatedAt}; cached, not live`
    : "generation time unknown; cached, not live";
}

function yesNo(value) {
  return value ? "yes" : "no";
}

function emitContext(additionalContext) {
  const trimmed = additionalContext.replace(/\s+/g, " ").trim();
  if (!trimmed) {
    return;
  }
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: eventName,
        additionalContext: trimmed.slice(0, 1400),
      },
    }),
  );
}

export { findRepoForPath, normalizePath, probeAgentsMd };
