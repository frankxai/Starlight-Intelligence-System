import { execFileSync } from "node:child_process"
import { lstatSync, readFileSync } from "node:fs"
import { extname } from "node:path"

const MIB = 1024 * 1024
const KIB = 1024
const MAX_SIDECAR_BYTES = 512 * KIB
const MAX_GENERIC_FILE_BYTES = 2 * MIB
const MAX_GOVERNED_CHANGE_BYTES = 5 * MIB
const MAX_TOTAL_CHANGE_BYTES = 20 * MIB

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

const controlledMediaRoot = /(?:^|\/)(?:public|generated_audio|generated_imgs)(?:\/|$)|(?:^|\/)content\/music\/source(?:\/|$)/i
const controlledMediaPath = /(?:^|\/)(?:audios?|downloads?|fonts?|images?|media|videos?)(?:\/|$)/i
const protectedPolicyFiles = new Set([
  ".github/workflows/media-guard.yml",
  "scripts/media-guard.mjs",
  "scripts/tests/media-guard.contract.mjs",
])
const allowedMediaSidecars = new Set([
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".lrc",
  ".map",
  ".md",
  ".mjs",
  ".srt",
  ".txt",
  ".vtt",
  ".webmanifest",
  ".xml",
  ".yaml",
  ".yml",
])

function parseBaseArgument() {
  const index = process.argv.indexOf("--base")
  if (index === -1) return null
  const value = process.argv[index + 1]
  if (!value) throw new Error("--base requires a Git ref")
  return value
}

function protectPolicyFiles() {
  return process.argv.includes("--protect-policy")
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
  const base = requestedBase || (githubBase && hasRef(githubBase) ? githubBase : null) || (hasRef("HEAD^") ? "HEAD^" : null)

  const args = base
    ? ["diff", "--no-renames", "--name-status", "--diff-filter=ADMT", "-z", `${base}...HEAD`]
    : ["diff-tree", "--root", "--no-renames", "--no-commit-id", "--name-status", "-r", "-z", "HEAD"]

  const fields = execFileSync("git", args)
    .toString("utf8")
    .split("\0")
    .filter(Boolean)

  if (fields.length % 2 !== 0) {
    throw new Error("Unexpected Git name-status output")
  }

  const entries = []
  for (let index = 0; index < fields.length; index += 2) {
    entries.push({ status: fields[index], file: fields[index + 1] })
  }
  return entries
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

function escapeWorkflowCommandMessage(value) {
  return value
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A")
}

function formatLogValue(value) {
  return JSON.stringify(value)
}

function prohibitedSuffix(file) {
  const lower = file.toLowerCase()
  return prohibitedSuffixes.find((suffix) => lower.endsWith(suffix)) || null
}

function isControlledMediaFile(file) {
  return controlledMediaRoot.test(file) || controlledMediaPath.test(file)
}

function isGitLfsPointer(file, size) {
  if (size > 1_024) return false
  const lines = readFileSync(file, "utf8").split(/\r?\n/u)
  return (
    lines[0] === "version https://git-lfs.github.com/spec/v1" &&
    lines.some((line) => /^oid sha256:[0-9a-f]{64}$/u.test(line)) &&
    lines.some((line) => /^size [0-9]+$/u.test(line))
  )
}

const entries = changedFiles()
const violations = []
let governedChangeBytes = 0
let totalChangeBytes = 0
let firstGovernedFile = null
let firstChangedFile = null

for (const { status, file } of entries) {
  if (protectPolicyFiles() && protectedPolicyFiles.has(file)) {
    violations.push({
      file,
      reason: "media-guard trust roots require an administrator-authorized policy update",
      size: 0,
    })
  }

  if (status === "D") continue

  const extension = extname(file).toLowerCase()
  let stats
  try {
    stats = lstatSync(file)
  } catch {
    violations.push({
      file,
      reason: "changed path is unavailable for inspection",
      size: 0,
    })
    continue
  }
  const size = stats.size
  totalChangeBytes += size
  firstChangedFile ||= file

  const blockedSuffix = prohibitedSuffix(file)
  const limit = limits.get(extension)
  const controlled = isControlledMediaFile(file)
  if (controlled || limit || blockedSuffix) {
    governedChangeBytes += size
    firstGovernedFile ||= file
  }

  if (stats.isSymbolicLink()) {
    violations.push({
      file,
      reason: "repository additions and type changes must not be symbolic links",
      size,
    })
    continue
  }

  if (!stats.isFile()) {
    violations.push({
      file,
      reason: "repository additions and type changes must be regular files",
      size,
    })
    continue
  }

  if (isGitLfsPointer(file, size)) {
    violations.push({
      file,
      reason: "Git LFS pointers are not permitted; use the portfolio object store",
      size,
    })
    continue
  }

  if (blockedSuffix) {
    violations.push({
      file,
      reason: `${blockedSuffix} source/archive files belong in object storage`,
      size,
    })
    continue
  }

  if (limit && size > limit) {
    violations.push({
      file,
      reason: `${extension} exceeds the ${formatMiB(limit)} Git limit`,
      size,
    })
    continue
  }

  if (controlled && !limit && !allowedMediaSidecars.has(extension)) {
    violations.push({
      file,
      reason: `${extension || "extensionless"} is not a classified web-media format`,
      size,
    })
    continue
  }

  if (controlled && allowedMediaSidecars.has(extension) && size > MAX_SIDECAR_BYTES) {
    violations.push({
      file,
      reason: `${extension} sidecar exceeds the ${formatMiB(MAX_SIDECAR_BYTES)} Git limit`,
      size,
    })
    continue
  }

  if (size > MAX_GENERIC_FILE_BYTES) {
    violations.push({
      file,
      reason: `unclassified file exceeds the ${formatMiB(MAX_GENERIC_FILE_BYTES)} Git limit`,
      size,
    })
  }
}

if (governedChangeBytes > MAX_GOVERNED_CHANGE_BYTES && firstGovernedFile) {
  violations.push({
    file: firstGovernedFile,
    reason: `governed media changes exceed the ${formatMiB(MAX_GOVERNED_CHANGE_BYTES)} pull-request budget`,
    size: governedChangeBytes,
  })
}

if (totalChangeBytes > MAX_TOTAL_CHANGE_BYTES && firstChangedFile) {
  violations.push({
    file: firstChangedFile,
    reason: `changed files exceed the ${formatMiB(MAX_TOTAL_CHANGE_BYTES)} pull-request budget`,
    size: totalChangeBytes,
  })
}

if (violations.length > 0) {
  console.error("Media policy violations:\n")
  for (const violation of violations) {
    console.error(
      `- ${formatLogValue(violation.file)} (${formatMiB(violation.size)}): ${formatLogValue(violation.reason)}`,
    )
    console.error(
      `::error file=${escapeWorkflowCommandProperty(violation.file)}::${escapeWorkflowCommandMessage(violation.reason)}; file size ${formatMiB(violation.size)}`,
    )
  }
  console.error(
    "\nStore the original in the portfolio object store and commit only its versioned URL/manifest entry.",
  )
  process.exit(1)
}

console.log(`Media guard passed for ${entries.length} changed path(s).`)
