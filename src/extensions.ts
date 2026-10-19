/**
 * `starlight <name>` runs an installed `starlight-<name>` command when no
 * built-in matches, the way git and gh find their extensions. Any package
 * that ships a `starlight-*` bin becomes part of one CLI without SIS
 * depending on it; built-ins always win.
 *
 * Windows: npm installs bins as .cmd shims, and starting a .cmd needs a
 * shell, which would pass user arguments through cmd.exe. The shim is parsed
 * instead: only shims whose program is Node are accepted, and their script
 * (with any Node flags npm copied from its shebang) runs under this Node
 * binary without a shell. Anything else in a shim is not run.
 */
import { spawnSync } from "node:child_process";
import { accessSync, constants, readFileSync, statSync } from "node:fs";
import { delimiter, dirname, isAbsolute, join, resolve } from "node:path";

export const EXTENSION_NAME = /^[a-z][a-z0-9-]{0,39}$/;

/** Top-level commands handled inside SIS. test/extensions.test.ts keeps this equal to cli.ts. */
export const BUILTIN_COMMANDS: ReadonlySet<string> = new Set([
  "domain", "harness", "run", "creator", "ecosystem",
  "init", "generate", "guidance", "project", "forge", "sync", "doctor", "dispatch", "starlight-swarm",
  "cockpit", "score", "vault", "orchestrate", "workpacket", "events", "memory", "modules", "stats",
  "version", "goal", "pack", "queen",
]);

export interface ExtensionCommand {
  /** Executable to start, without a shell. */
  file: string;
  /** Arguments placed before the user's own. */
  prefix: string[];
  /** Where the command was found, for messages. */
  source: string;
}

// npm cmd-shim: SET "_prog=node" (or %dp0%\node.exe), then  "%_prog%" <shebang flags> "%dp0%\<target>" %*
const SHIM_PROG = /SET "_prog=([^"]+)"/gi;
const SHIM_RUN = /"%_prog%"\s+(.*?)"%~?dp0%\\([^"]+)"\s+%\*/i;
const SAFE_FLAG = /^[A-Za-z0-9@._:=/+-]+$/;

function isFile(path: string): boolean {
  try { return statSync(path).isFile(); } catch { return false; }
}

function isExecutable(path: string): boolean {
  try { accessSync(path, constants.X_OK); return true; } catch { return false; }
}

/**
 * Reads what an npm .cmd shim runs: Node flags plus the script path, or null
 * when the shim is unreadable, runs something other than Node, or carries a
 * flag that would need shell quoting.
 */
export function npmShimTarget(cmdPath: string): { script: string; flags: string[] } | null {
  let text: string;
  try { text = readFileSync(cmdPath, "utf8"); } catch { return null; }
  const programs = [...text.matchAll(SHIM_PROG)].map(m => m[1]);
  if (!programs.length || !programs.every(p => /(^|[\\/])node(\.exe)?$/i.test(p))) return null;
  const run = SHIM_RUN.exec(text);
  if (!run) return null;
  const flags = run[1].trim() ? run[1].trim().split(/\s+/) : [];
  if (!flags.every(f => SAFE_FLAG.test(f))) return null;
  // The shim writes the target with backslashes; resolve it on whatever host reads it.
  const script = resolve(dirname(cmdPath), ...run[2].split(/[\\/]/));
  return isFile(script) ? { script, flags } : null;
}

export function findExtension(
  name: string,
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  nodePath: string = process.execPath,
): ExtensionCommand | null {
  if (!EXTENSION_NAME.test(name) || BUILTIN_COMMANDS.has(name)) return null;
  const bin = `starlight-${name}`;
  const dirs = (env.PATH ?? env.Path ?? "").split(platform === "win32" ? ";" : delimiter).filter(d => d && isAbsolute(d));
  for (const dir of dirs) {
    if (platform === "win32") {
      const exe = join(dir, `${bin}.exe`);
      if (isFile(exe)) return { file: exe, prefix: [], source: exe };
      const cmd = join(dir, `${bin}.cmd`);
      if (isFile(cmd)) {
        const target = npmShimTarget(cmd);
        if (target) return { file: nodePath, prefix: [...target.flags, target.script], source: cmd };
      }
      continue;
    }
    const candidate = join(dir, bin);
    if (isFile(candidate) && isExecutable(candidate)) return { file: candidate, prefix: [], source: candidate };
  }
  return null;
}

/** Runs the extension with the caller's terminal and returns its exit code. */
export function runExtension(command: ExtensionCommand, args: string[]): number {
  const result = spawnSync(command.file, [...command.prefix, ...args], { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  return result.status ?? 1;
}
