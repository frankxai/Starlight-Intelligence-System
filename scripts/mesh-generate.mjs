#!/usr/bin/env node
/**
 * Portfolio mesh generator — derive-and-assert, in the shape of
 * scripts/check-agent-harness.mjs.
 *
 * WHY THIS EXISTS
 * ---------------
 * `context/empire/portfolio-mesh.yaml` v0.1.0 was hand-written by the
 * 2026-07-25 audit sweep. Nothing generated it, nothing checked it, and no two
 * audits could agree on its numbers because no counting rule was ever written
 * down. Five days later it claimed 42 repos (45 existed), 179 ACOS skills
 * (a different sweep counted 117), and 16 human-mind schemas (15 exist).
 *
 * A registry nobody can reproduce is not a source of truth, it is a rumour with
 * a filename. So: curated facts are hand-authored in ONE place, measured facts
 * are derived from the filesystem on every run, and the published mesh is a
 * generated artifact that CI refuses to let drift.
 *
 *   mesh.curated.json  (hand-authored: role, status, notes, gaps)
 *            +
 *   filesystem enumeration under THE COUNTING CONTRACT below
 *            =
 *   portfolio-mesh.yaml + portfolio-mesh.json  (generated, do not hand-edit)
 *
 * THE COUNTING CONTRACT
 * ---------------------
 * Every number in the mesh comes from these rules and nowhere else. When a
 * count looks wrong, fix the repo or fix this contract — never hand-edit the
 * output.
 *
 * Authored and installed definitions are counted separately and never summed
 * into one figure, because they are different claims: what a repo *writes*
 * versus what it has *vendored in* under `.claude/`.
 *
 * Doc-file exclusion (everywhere): a file whose basename minus `.md` matches
 * /^[A-Z0-9_]+$/ is documentation, not a definition. This is what makes
 * AGENT_REGISTRY.md, CODING_AGENTS_REGISTRY.md, COMMAND_SYSTEM.md,
 * SKILL_REGISTRY.md and README.md fall out, and it reproduces the counts that
 * check-agent-harness.mjs already asserts.
 *
 * Ignored everywhere: node_modules, .git, build output, and any path segment
 * named `template`/`templates` — a scaffold is not a shipped definition.
 *
 * Skill layout is not uniform — SKILL.md lives under `skills/` in SIS,
 * `free-skills/` and `packs/` in claude-skills-library, and bare category
 * directories in agentic-creator-skills — so skills are found by a repo-wide
 * scan and bucketed by the surface they sit on. A repo-root SKILL.md is the
 * repo's own manifest, not a catalogued skill, and never counts.
 *
 *   skills          = under a TOP-LEVEL skills/ or free-skills/ dir: every
 *                     SKILL.md at any depth, plus every frontmattered non-doc
 *                     *.md at exactly `{root}/{domain}/{name}.md` (the flat
 *                     layout). Nothing deeper — a pack's reference and asset
 *                     markdown carries frontmatter too and is not a skill.
 *   skills_unrooted = SKILL.md outside any such root — verticals/, plugins/,
 *                     packs/, bare category dirs. Real skills, but not part of
 *                     the repo's advertised catalogue, so they are reported
 *                     apart from it rather than folded in.
 *   installed_skills= the same two rules applied under a dot-directory
 *                     (.claude/, .grok/), which is vendored harness surface.
 *                     Only its skills roots hold skills — .claude/agents/ does
 *                     not.
 *   agents          = every non-doc *.md at any depth under agents/ or .claude/agents/.
 *   commands        = every non-doc *.md at any depth under commands/ or .claude/commands/.
 *   schemas         = every *.json directly in schemas/.
 *
 * Verified 2026-07-30 — SIS 84 skills / 144 agents / 25 commands, matching
 * skill-rules.json's `rules` length and check-agent-harness.mjs exactly, plus
 * starlight-agent-skills 27 and marine-agent-skills 6, both of which the
 * 2026-07-25 hand audit also reached. Where this contract disagrees with that
 * audit it is because the audit had no rule: mind-palace-agent-skills is 13,
 * not 14 (its 14th SKILL.md is a `template/` scaffold), and ACOS is 178
 * installed skills, not 179. This contract and check-agent-harness.mjs must
 * move in lockstep.
 *
 * WHAT CI CAN AND CANNOT SEE
 * --------------------------
 * The portfolio lives in sibling directories. A CI checkout of this repo alone
 * can only measure SIS, so `--check` measures whatever repos are present and
 * carries the last recorded block forward verbatim for the rest. That keeps a
 * partial run byte-identical to a full one for the repos it could not see, so
 * CI asserts exactly what it verified and nothing more. It fails on:
 *   - drift between the committed artifacts and a fresh generation
 *   - a repo on disk with a .git dir that mesh.curated.json does not register
 *   - curated entries missing a role
 * Staleness is reported, not failed: a run that cannot see a repo must not be
 * able to fail that repo's freshness. `measured_at` carries the age, so the
 * mesh states how old each number is instead of implying all are current.
 * Run with the whole portfolio checked out to actually refresh it.
 *
 * Usage:
 *   node scripts/mesh-generate.mjs            # write the artifacts
 *   node scripts/mesh-generate.mjs --check    # assert no drift, write nothing
 *   node scripts/mesh-generate.mjs --portfolio-root /path/to/repos
 *
 * Built on SIP — operational tier (drift-defense harness).
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const rootFlag = args.indexOf('--portfolio-root');
const portfolioRoot = rootFlag !== -1 && args[rootFlag + 1]
  ? path.resolve(args[rootFlag + 1])
  : process.env.PORTFOLIO_ROOT
    ? path.resolve(process.env.PORTFOLIO_ROOT)
    : path.dirname(root);

const CURATED = 'context/empire/mesh.curated.json';
const OUT_YAML = 'context/empire/portfolio-mesh.yaml';
const OUT_JSON = 'context/empire/portfolio-mesh.json';
const STALE_DAYS = 30;

const AGENT_ROOTS = [['agents', 'agents'], ['.claude/agents', 'installed_agents']];
const COMMAND_ROOTS = [['commands', 'commands'], ['.claude/commands', 'installed_commands']];
const SKILL_DIR_NAMES = new Set(['skills', 'free-skills']);
const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.next', '.turbo', 'dist', 'build', 'coverage', 'vendor',
]);
const TEMPLATE_DIR = /^_?templates?$/;

/** Today as YYYY-MM-DD. The mesh records dates, never times. */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Documentation, not a definition — see the counting contract. */
function isDocFile(base) {
  return /^[A-Z0-9_]+$/.test(base.replace(/\.md$/, ''));
}

function hasFrontmatter(file) {
  try {
    return readFileSync(file, 'utf8').replace(/^﻿/, '').startsWith('---');
  } catch {
    return false;
  }
}

/**
 * Every *.md under dir as {file, name, segments} where segments is the path
 * relative to dir, split — segments.length 1 means the file sits in dir itself.
 */
function walkMarkdown(dir, out = [], trail = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name) || TEMPLATE_DIR.test(entry.name)) continue;
      walkMarkdown(full, out, [...trail, entry.name]);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push({ file: full, name: entry.name, segments: [...trail, entry.name] });
    }
  }
  return out;
}

/**
 * Skills across a whole repo, bucketed by the surface they live on. Returns
 * {skills, skills_unrooted, installed_skills}. See the counting contract.
 */
function countSkills(repoDir) {
  const counts = { skills: 0, skills_unrooted: 0, installed_skills: 0 };
  for (const f of walkMarkdown(repoDir)) {
    const segs = f.segments;
    if (segs.length < 2) continue; // a repo-root SKILL.md is the repo's own manifest

    // A dot-directory (.claude/, .grok/, .cursor/) is vendored harness surface.
    // Only its skills roots hold skills — .claude/agents/ does not.
    if (segs[0].startsWith('.')) {
      const rootIndex = segs.findIndex((s) => SKILL_DIR_NAMES.has(s));
      if (rootIndex === -1) continue;
      if (f.name === 'SKILL.md') counts.installed_skills += 1;
      else if (
        segs.length - rootIndex === 3 &&
        !isDocFile(f.name) &&
        hasFrontmatter(f.file)
      ) {
        counts.installed_skills += 1;
      }
      continue;
    }

    // The repo's own catalogue is a top-level skills/ or free-skills/ dir.
    if (SKILL_DIR_NAMES.has(segs[0])) {
      if (f.name === 'SKILL.md') counts.skills += 1;
      // The flat layout is exactly `skills/{domain}/{name}.md` — no deeper.
      // Below that sits a pack's reference and asset markdown, which carries
      // frontmatter too and is not a skill.
      else if (segs.length === 3 && !isDocFile(f.name) && hasFrontmatter(f.file)) {
        counts.skills += 1;
      }
      continue;
    }

    // Real skills that live outside a conventional root — verticals/,
    // plugins/, packs/, bare category dirs. SKILL.md is the only evidence
    // strong enough to count out here.
    if (f.name === 'SKILL.md') counts.skills_unrooted += 1;
  }
  return counts;
}

function countDefinitions(rootDir) {
  if (!existsSync(rootDir)) return 0;
  return walkMarkdown(rootDir).filter((f) => !isDocFile(f.name)).length;
}

function countSchemas(repoDir) {
  const dir = path.join(repoDir, 'schemas');
  if (!existsSync(dir)) return 0;
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

/** Measure one repo. Returns null when the repo is not on this disk. */
function measureRepo(name) {
  const dir = path.join(portfolioRoot, name);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return null;
  const measured = {};
  for (const [key, n] of Object.entries(countSkills(dir))) {
    if (n) measured[key] = n;
  }
  for (const [rel, key] of [...AGENT_ROOTS, ...COMMAND_ROOTS]) {
    const n = countDefinitions(path.join(dir, rel));
    if (n) measured[key] = n;
  }
  const schemas = countSchemas(dir);
  if (schemas) measured.schemas = schemas;
  measured.measured_at = today();
  return measured;
}

/** Sibling dirs that look like git repos — used to catch unregistered ones. */
function discoverRepos() {
  try {
    return readdirSync(portfolioRoot, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(path.join(portfolioRoot, e.name, '.git')))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

// ── YAML emitter ───────────────────────────────────────────────────────────
// Deliberately narrow: it serialises the mesh shape (scalars, scalar lists,
// one level of nested map) and nothing else. A general YAML library would be a
// dependency this repo does not carry.

const YAML_RESERVED = new Set(['true', 'false', 'null', 'yes', 'no', 'on', 'off', '~']);

function yamlScalar(value) {
  if (value === null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const s = String(value);
  const safe = /^[A-Za-z0-9][A-Za-z0-9 ._/@+-]*$/.test(s);
  const looksNumeric = /^-?\d+(\.\d+)?$/.test(s);
  const looksDated = /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!safe || looksNumeric || looksDated || YAML_RESERVED.has(s.toLowerCase())) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

function yamlInlineList(list) {
  return `[${list.map(yamlScalar).join(', ')}]`;
}

function yamlInlineMap(map) {
  const inner = Object.entries(map)
    .map(([k, v]) => `${k}: ${yamlScalar(v)}`)
    .join(', ');
  return `{${inner}}`;
}

/** Emit `key: value` lines for a plain object at the given indent. */
function yamlFields(obj, indent, lines) {
  const pad = ' '.repeat(indent);
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      lines.push(`${pad}${key}: ${value.length ? yamlInlineList(value) : '[]'}`);
    } else if (value && typeof value === 'object') {
      const nested = Object.values(value).every((v) => v === null || typeof v !== 'object');
      if (nested && Object.keys(value).length <= 2) {
        lines.push(`${pad}${key}: ${yamlInlineMap(value)}`);
      } else {
        lines.push(`${pad}${key}:`);
        yamlFields(value, indent + 2, lines);
      }
    } else {
      lines.push(`${pad}${key}: ${yamlScalar(value)}`);
    }
  }
}

function renderYaml(mesh, curated) {
  const lines = [];
  lines.push('# portfolio-mesh.yaml — GENERATED FILE, DO NOT HAND-EDIT.');
  lines.push('#');
  lines.push('# Regenerate:  node scripts/mesh-generate.mjs   (npm run mesh:generate)');
  lines.push('# Verify:      node scripts/mesh-generate.mjs --check');
  lines.push('#');
  lines.push('# Curated facts (role, status, notes, gaps) are hand-authored in');
  lines.push(`# ${CURATED}. Everything under a repo's \`measured:\` block is derived`);
  lines.push('# from the filesystem by the counting contract documented at the top of');
  lines.push('# scripts/mesh-generate.mjs. Authored (skills/, agents/, commands/) and');
  lines.push('# installed (.claude/*) definitions are counted separately and never');
  lines.push('# summed — conflating them is what made two 2026-07 audits disagree.');
  lines.push('#');
  lines.push('# `measured.present: false` means the repo was not on disk for this run,');
  lines.push('# so its numbers are carried forward from the date in `measured_at`.');
  lines.push('');
  yamlFields(
    {
      version: mesh.version,
      generated_by: mesh.generated_by,
      generated_at: mesh.generated_at,
      curated_source: mesh.curated_source,
      maintainer: mesh.maintainer,
    },
    0,
    lines,
  );
  lines.push('');
  lines.push('substrate:');
  yamlFields(mesh.substrate, 2, lines);
  lines.push('');
  lines.push('repos:');

  const sectionTitles = new Map(curated.sections.map((s) => [s.key, s.title]));
  let currentSection = null;
  for (const repo of mesh.repos) {
    if (repo.section !== currentSection) {
      currentSection = repo.section;
      const title = sectionTitles.get(currentSection) || currentSection;
      const bar = '─'.repeat(Math.max(2, 58 - title.length));
      lines.push(`  # ── ${title} ${bar}`);
    }
    // `section` is emitted as a field as well as a comment header, so the YAML
    // and JSON artifacts deserialise to identical data.
    const { name, measured, ...fields } = repo;
    lines.push(`  - name: ${yamlScalar(name)}`);
    yamlFields(fields, 4, lines);
    lines.push('    measured:');
    yamlFields(measured, 6, lines);
  }

  lines.push('');
  lines.push('gaps:');
  yamlFields(mesh.gaps, 2, lines);
  lines.push('');
  lines.push('# Repos with a .git dir next to this one that the curated registry does');
  lines.push('# not know about. A non-empty list fails --check: register them.');
  lines.push(`unregistered_repos: ${mesh.unregistered_repos.length ? yamlInlineList(mesh.unregistered_repos) : '[]'}`);
  lines.push('');
  return lines.join('\n');
}

// ── Build ──────────────────────────────────────────────────────────────────

function loadJson(rel) {
  return JSON.parse(readFileSync(path.join(root, rel), 'utf8').replace(/^﻿/, ''));
}

function previousMeasurements() {
  const out = new Map();
  const file = path.join(root, OUT_JSON);
  if (!existsSync(file)) return out;
  try {
    const prev = JSON.parse(readFileSync(file, 'utf8'));
    for (const repo of prev.repos || []) {
      if (repo.measured) out.set(repo.name, repo.measured);
    }
  } catch {
    /* a corrupt previous artifact just means nothing to carry forward */
  }
  return out;
}

function build() {
  const curated = loadJson(CURATED);
  const carried = previousMeasurements();
  const failures = [];
  const stale = [];
  const measuredNow = new Set();
  const registered = new Set(curated.repos.map((r) => r.name));

  const repos = curated.repos.map((entry) => {
    const { name, section, ...fields } = entry;
    if (!fields.role) failures.push(`${CURATED}: ${name} has no role`);
    const fresh = measureRepo(name);
    if (fresh) {
      measuredNow.add(name);
      return { name, section, ...fields, measured: fresh };
    }
    // Not on this disk. Carry the last recorded block forward verbatim — the
    // claim being made is "nothing re-measured", not "measured as absent" — so
    // a run that cannot see a repo produces byte-identical output for it and
    // CI stays honest about what it actually checked.
    const measured = carried.get(name) || { measured_at: 'never' };
    if (measured.measured_at === 'never') {
      stale.push(`${name}: never measured (absent from ${portfolioRoot})`);
    } else {
      const ageDays = Math.floor(
        (Date.parse(today()) - Date.parse(measured.measured_at)) / 86400000,
      );
      if (ageDays > STALE_DAYS) stale.push(`${name}: last measured ${ageDays}d ago`);
    }
    return { name, section, ...fields, measured };
  });

  const unregistered = discoverRepos().filter(
    (name) => !registered.has(name) && name !== path.basename(root),
  );
  for (const name of unregistered) {
    failures.push(`${name}: on disk but not registered in ${CURATED}`);
  }

  const mesh = {
    version: curated.version,
    generated_by: 'scripts/mesh-generate.mjs',
    generated_at: today(),
    curated_source: CURATED,
    maintainer: curated.maintainer,
    substrate: curated.substrate,
    repos,
    gaps: curated.gaps,
    unregistered_repos: unregistered,
  };

  return { mesh, curated, failures, stale, measuredNow };
}

function main() {
  const { mesh, curated, failures, stale, measuredNow } = build();
  const yaml = renderYaml(mesh, curated);
  const json = `${JSON.stringify(mesh, null, 2)}\n`;

  if (checkOnly) {
    for (const [file, expected] of [[OUT_YAML, yaml], [OUT_JSON, json]]) {
      const full = path.join(root, file);
      if (!existsSync(full)) {
        failures.push(`${file}: missing — run npm run mesh:generate`);
        continue;
      }
      const actual = readFileSync(full, 'utf8');
      // Dates move every day; drift in a date alone is not drift. `generated_at`
      // is stamped on every run, and `measured_at` is re-stamped for every repo
      // this run could actually see — so without stripping both, --check fails
      // the day after any commit even when nothing was measured differently.
      // Staleness is unaffected: it is computed from the committed file's
      // carried-forward dates before regeneration, not from this comparison.
      const norm = (s) =>
        s.replace(/^(generated_at|measured_at|\s*"(generated_at|measured_at)"|\s+measured_at).*$/gm, '');
      if (norm(actual) !== norm(expected)) {
        failures.push(`${file}: out of date — run npm run mesh:generate and commit`);
      }
    }
  } else {
    writeFileSync(path.join(root, OUT_YAML), yaml, 'utf8');
    writeFileSync(path.join(root, OUT_JSON), json, 'utf8');
  }

  for (const note of stale) console.warn(`  stale: ${note}`);
  if (stale.length) {
    console.warn(
      `Mesh: ${stale.length} repo(s) carry numbers older than ${STALE_DAYS}d. Re-run with the full portfolio checked out (--portfolio-root) to refresh.`,
    );
  }

  if (failures.length) {
    console.error('\nMesh check FAILED:');
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(
    `Mesh ${checkOnly ? 'check passed' : 'generated'} (${mesh.repos.length} repos registered, ${measuredNow.size} re-measured from ${portfolioRoot}, ${mesh.repos.length - measuredNow.size} carried forward).`,
  );
}

main();
