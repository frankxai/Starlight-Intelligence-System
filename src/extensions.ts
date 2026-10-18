/**
 * `starlight <name>` runs an installed `starlight-<name>` command when no
 * built-in matches, the way git and gh find their extensions. Any package
 * that ships a `starlight-*` bin becomes part of one CLI without SIS
 * depending on it; built-ins always win.
 *
 * Windows: npm installs bins as .cmd shims, and starting a .cmd needs a
 * shell, which would pass user arguments through cmd.exe. The shim's target
 * script is read instead and run with this Node binary directly. A shim
 * whose target cannot be read is not run.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { delimiter, dirname, isAbsolute, join, resolve } from "node:path";

export const EXTENSION_NAME = /^[a-z][a-z0-9-]{0,39}$/;

export interface ExtensionCommand {
  /** Executable to start, without a shell. */
  file: string;
  /** Arguments placed before the user's own. */
  prefix: string[];
  /** Where the command was found, for messages. */
  source: string;
}

const NPM_SHIM_TARGET = /"%(?:dp0|~dp0)%\\([^"]+\.(?:js|mjs|cjs))"/i;

function isFile(path: string): boolean {
  try { return statSync(path).isFile(); } catch { return false; }
}

/** Reads the script an npm .cmd shim launches, or null when the shim has another shape. */
export function npmShimTarget(cmdPath: string): string | null {
  const match = NPM_SHIM_TARGET.exec(readFileSync(cmdPath, "utf8"));
  if (!match) return null;
  const target = resolve(dirname(cmdPath), match[1]);
  return isFile(target) ? target : null;
}

export function findExtension(
  name: string,
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  nodePath: string = process.execPath,
): ExtensionCommand | null {
  if (!EXTENSION_NAME.test(name)) return null;
  const bin = `starlight-${name}`;
  const dirs = (env.PATH ?? env.Path ?? "").split(platform === "win32" ? ";" : delimiter).filter(d => d && isAbsolute(d));
  for (const dir of dirs) {
    if (platform === "win32") {
      const exe = join(dir, `${bin}.exe`);
      if (isFile(exe)) return { file: exe, prefix: [], source: exe };
      const cmd = join(dir, `${bin}.cmd`);
      if (isFile(cmd)) {
        const target = npmShimTarget(cmd);
        if (target) return { file: nodePath, prefix: [target], source: cmd };
      }
      continue;
    }
    const candidate = join(dir, bin);
    if (existsSync(candidate) && isFile(candidate)) return { file: candidate, prefix: [], source: candidate };
  }
  return null;
}

/** Runs the extension with the caller's terminal and returns its exit code. */
export function runExtension(command: ExtensionCommand, args: string[]): number {
  const result = spawnSync(command.file, [...command.prefix, ...args], { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  return result.status ?? 1;
}
