import { execFileSync } from "node:child_process"
import { existsSync, lstatSync } from "node:fs"
import { extname } from "node:path"

const MIB = 1024 * 1024

const limits = new Map([
  [".avif", 1 * MIB],
  [".gif", 1 * MIB],
  [".ico", 512 * 1024],
  [".jpeg", 1 * MIB],
  [".jpg", 1 * MIB],
  [".png", 1 * MIB],
  [".svg", 512 * 1024],
  [".webp", 1 * MIB],
  [".m4a", 2 * MIB],
  [".mp3", 2 * MIB],
  [".ogg", 2 * MIB],
  [".mp4", 2 * MIB],
  [".webm", 2 * MIB],
  [".pdf", 2 * MIB],
  [".eot", 512 * 1024],
  [".otf", 512 * 1024],
  [".ttf", 512 * 1024],
  [".woff", 512 * 1024],
  [".woff2", 512 * 1024],
])

const prohibitedSuffixes = [
  ".tar.bz2",
  ".tar.gz",
  ".tar.xz",
  ".7z",
  ".ai",
  ".avi",
  ".bmp",
  ".bz2",
  ".flac",
  ".gz",
  ".heic",
  ".heif",
  ".mkv",
  ".mov",
  ".psd",
  ".rar",
  ".tar",
  ".tgz",
  ".tif",
  ".tiff",
  ".wav",
  ".xz",
  ".zip",
]

const controlledMediaPath = /(?:^|\/)(?:audio|downloads?|fonts?|images?|media|video)(?:\/|$)/i
const allowedMediaSidecars = new Set([".css", ".csv", ".json", ".lrc", ".md", ".srt", ".txt", ".vtt", ".xml"])

function parseBaseArgument() {
  const index = process.argv.indexOf("--base")
  if (index === -1) return null
  const value = process.argv[index + 1]
  if (!value) throw new Error("--base requires a Git ref")
  return value
}

function hasRef(ref) {
  try {
    execFileSync("git", ["rev-parse", "--verify", ref], { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

function changedFiles() {
  const requestedBase = parseBaseArgument()
  const githubBase = process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : null
  const base = requestedBase || githubBase || (hasRef("HEAD^") ? "HEAD^" : null)

  const args = base
    ? ["diff", "--no-renames", "--name-only", "--diff-filter=AM", "-z", `${base}...HEAD`]
    : ["diff-tree", "--root", "--no-renames", "--no-commit-id", "--name-only", "-r", "-z", "HEAD"]

  return execFileSync("git", args)
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
}

function formatMiB(bytes) {
  return `${(bytes / MIB).toFixed(2)} MiB`
}

function escapeWorkflowCommandProperty(value) {
  return value
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A")
    .replace(/:/g, "%3A")
    .replace(/,/g, "%2C")
}

function prohibitedSuffix(file) {
  const lower = file.toLowerCase()
  return prohibitedSuffixes.find((suffix) => lower.endsWith(suffix)) || null
}

const files = changedFiles()
const violations = []

for (const file of files) {
  if (!existsSync(file)) continue

  const extension = extname(file).toLowerCase()
  const stats = lstatSync(file)
  const size = stats.size

  if (stats.isSymbolicLink() && controlledMediaPath.test(file)) {
    violations.push({
      file,
      reason: "media paths must not be symbolic links",
      size,
    })
    continue
  }

  const blockedSuffix = prohibitedSuffix(file)
  if (blockedSuffix) {
    violations.push({
      file,
      reason: `${blockedSuffix} source/archive files belong in object storage`,
      size,
    })
    continue
  }

  const limit = limits.get(extension)
  if (limit && size > limit) {
    violations.push({
      file,
      reason: `${extension} exceeds the ${formatMiB(limit)} Git limit`,
      size,
    })
    continue
  }

  if (controlledMediaPath.test(file) && !limit && !allowedMediaSidecars.has(extension)) {
    violations.push({
      file,
      reason: `${extension || "extensionless"} is not a classified web-media format`,
      size,
    })
  }
}

if (violations.length > 0) {
  console.error("Media policy violations:\n")
  for (const violation of violations) {
    console.error(`- ${violation.file} (${formatMiB(violation.size)}): ${violation.reason}`)
    console.error(
      `::error file=${escapeWorkflowCommandProperty(violation.file)}::${violation.reason}; file size ${formatMiB(violation.size)}`,
    )
  }
  console.error(
    "\nStore the original in the portfolio object store and commit only its versioned URL/manifest entry.",
  )
  process.exit(1)
}

console.log(`Media guard passed for ${files.length} changed file(s).`)
