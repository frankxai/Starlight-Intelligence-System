import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const dir = dirname(fileURLToPath(import.meta.url));
const siteDir = join(dir, "..");

try {
  console.log("Checking lockfile consistency via git status...");

  // Use pnpm install with --lockfile-only or regular install to resolve updates to the lockfile without freezing it.
  execSync("pnpm install --lockfile-only --ignore-scripts --prefer-offline", { cwd: siteDir, stdio: "inherit" });

  let isGitRepo = false;
  try {
     isGitRepo = existsSync(join(siteDir, "..", ".git"));
  } catch (e) {
  }

  if (isGitRepo) {
    // Check if pnpm-lock.yaml was modified
    const afterDiff = execSync("git status --porcelain pnpm-lock.yaml", { cwd: siteDir }).toString().trim();
    if (afterDiff !== "") {
       execSync("git checkout -- pnpm-lock.yaml", { cwd: siteDir }); // Restore the original lockfile
       throw new Error("Lockfile changed");
    }
  }

  console.log("Lockfile check passed.");
} catch (error) {
  console.error("Lockfile drift detected! The pnpm-lock.yaml does not match package.json.");
  console.error("Please run 'pnpm install' in the site directory to update the lockfile and commit the changes.");
  process.exit(1);
}
