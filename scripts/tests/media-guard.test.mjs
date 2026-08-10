import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { mkdir, mkdtemp, rename, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const MIB = 1024 * 1024
const guard = fileURLToPath(new URL("../media-guard.mjs", import.meta.url))

async function repository(t) {
  const root = await mkdtemp(join(tmpdir(), "media-guard-"))
  t.after(() => rm(root, { recursive: true, force: true }))
  git(root, "init", "--quiet")
  git(root, "config", "user.email", "media-guard@example.test")
  git(root, "config", "user.name", "Media Guard Test")
  await write(root, "README.md", "baseline\n")
  git(root, "add", ".")
  git(root, "commit", "--quiet", "-m", "baseline")
  return { root, base: git(root, "rev-parse", "HEAD").trim() }
}

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" })
}

async function write(root, path, value) {
  const target = join(root, path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, value)
}

function commit(root, message = "scenario") {
  git(root, "add", "-A")
  git(root, "commit", "--quiet", "-m", message)
}

function run(root, base, env = {}) {
  return spawnSync(process.execPath, base ? [guard, "--base", base] : [guard], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
  })
}

test("allows classified media at the exact size boundary", async (t) => {
  const { root, base } = await repository(t)
  await write(root, "public/images/hero.png", Buffer.alloc(MIB))
  commit(root)

  const result = run(root, base)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /passed for 1 changed file/u)
})

test("rejects oversized classified web media", async (t) => {
  const { root, base } = await repository(t)
  await write(root, "public/video/hero.webm", Buffer.alloc(2 * MIB + 1))
  commit(root)

  const result = run(root, base)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /\.webm exceeds the 2\.00 MiB Git limit/u)
})

test("rejects compound and compressed archives", async (t) => {
  const { root, base } = await repository(t)
  await write(root, "public/downloads/source.tar.gz", "archive")
  commit(root)

  const result = run(root, base)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /\.tar\.gz source\/archive files belong in object storage/u)
})

test("treats renamed destinations as additions", async (t) => {
  const { root, base } = await repository(t)
  await write(root, "legacy.bin", "legacy audio")
  git(root, "add", "legacy.bin")
  git(root, "commit", "--quiet", "-m", "legacy source")
  const renameBase = git(root, "rev-parse", "HEAD").trim()
  await mkdir(join(root, "public/audio"), { recursive: true })
  await rename(join(root, "legacy.bin"), join(root, "public/audio/renamed.wav"))
  commit(root)

  const result = run(root, renameBase || base)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /renamed\.wav/u)
})

test("escapes workflow-command properties in hostile filenames", async (t) => {
  const { root, base } = await repository(t)
  const filename = "public/images/a:b,c%25\r\n::warning::injected.png"
  await write(root, filename, Buffer.alloc(MIB + 1))
  commit(root)

  const result = run(root, base)
  assert.equal(result.status, 1)
  assert.match(
    result.stderr,
    /::error file=public\/images\/a%3Ab%2Cc%2525%0D%0A%3A%3Awarning%3A%3Ainjected\.png::/u,
  )
  assert.doesNotMatch(result.stderr, /(?:^|\n)::warning::injected\.png/mu)
})

test("rejects unclassified files in plural controlled media paths", async (t) => {
  const { root, base } = await repository(t)
  await write(root, "public/videos/hero.jxl", "next-generation video")
  commit(root)

  const result = run(root, base)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /\.jxl is not a classified web-media format/u)
})

test("rejects dangling symlinks in controlled media paths", async (t) => {
  const { root, base } = await repository(t)
  await mkdir(join(root, "public/images"), { recursive: true })
  await symlink("missing-target.png", join(root, "public/images/hero.png"))
  commit(root)

  const result = run(root, base)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /media paths must not be symbolic links/u)
})

test("escapes workflow-command messages derived from hostile extensions", async (t) => {
  const { root, base } = await repository(t)
  const filename = "public/images/asset.\n::error::injected"
  await write(root, filename, "unclassified")
  commit(root)

  const result = run(root, base)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /%0A::error::injected is not a classified web-media format/u)
  assert.doesNotMatch(result.stderr, /(?:^|\n)::error::injected/mu)
})

test("falls back to HEAD^ when the GitHub base ref is unavailable", async (t) => {
  const { root } = await repository(t)
  await write(root, "public/video/oversized.mp4", Buffer.alloc(2 * MIB + 1))
  commit(root)

  const result = run(root, null, { GITHUB_BASE_REF: "missing-base-ref" })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /\.mp4 exceeds the 2\.00 MiB Git limit/u)
  assert.doesNotMatch(result.stderr, /unknown revision|ambiguous argument/u)
})
