#!/usr/bin/env node
// validate-schemas.mjs — validate IIS substrate JSON Schemas + sample data
// against draft-2020-12 spec. Operators run this on their private session
// corpus; substrate CI runs it on the example archetypes.
//
// Usage:
//   node iis/scripts/validate-schemas.mjs                  (validate everything in iis/)
//   node iis/scripts/validate-schemas.mjs --schemas-only   (just schema files, not examples)
//   node iis/scripts/validate-schemas.mjs <path>           (specific file or directory)
//
// Exits non-zero on any validation failure. Emits a structured summary.
//
// Dependencies: ajv (peer-installed by operator). Falls back to manual checks
// if ajv unavailable (substrate-friendly: no required deps).

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, resolve, relative } from 'node:path'
import matter from 'gray-matter'

const args = process.argv.slice(2)
const schemasOnly = args.includes('--schemas-only')

// Promoted copy: the engine root is this script's parent directory
// (verticals/investment-intelligence/engine/), not <cwd>/iis as in the
// operator instance.
const SUBSTRATE_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const targetPath = args.find((a) => !a.startsWith('--')) || SUBSTRATE_ROOT

const ROOT = process.cwd()
const SCHEMA_DIR = resolve(SUBSTRATE_ROOT, 'schemas')

let ajv = null
try {
  const Ajv = (await import('ajv/dist/2020.js')).default
  const addFormats = (await import('ajv-formats')).default
  ajv = new Ajv({ strict: false, allErrors: true })
  addFormats(ajv)
} catch {
  console.warn('[iis-validate] ajv not installed; falling back to structural checks only')
  console.warn('  install with: pnpm add -D ajv ajv-formats')
}

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readMarkdownFrontmatter(path) {
  const raw = readFileSync(path, 'utf8')
  const parsed = matter(raw)
  // YAML parses unquoted ISO dates into Date objects; the schemas expect
  // strings. JSON round-trip coerces Dates to ISO strings, matching how
  // the same record would arrive as JSON.
  return JSON.parse(JSON.stringify(parsed.data))
}

function loadSchemas() {
  if (!existsSync(SCHEMA_DIR)) {
    throw new Error(`schemas dir not found: ${SCHEMA_DIR}`)
  }
  const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.schema.json'))
  const schemas = {}
  for (const file of files) {
    const path = join(SCHEMA_DIR, file)
    const schema = readJSON(path)
    const id = file.replace('.schema.json', '')
    schemas[id] = schema
    if (ajv && schema.$id) {
      try {
        ajv.addSchema(schema)
      } catch (e) {
        console.warn(`[iis-validate] could not register schema ${file}: ${e.message}`)
      }
    }
  }
  return schemas
}

function validateAgainst(schema, data, label) {
  if (!ajv) {
    // Structural fallback: check required fields manually
    const required = schema.required || []
    const missing = required.filter((k) => !(k in data))
    if (missing.length > 0) {
      return { ok: false, errors: [`missing required fields: ${missing.join(', ')}`] }
    }
    return { ok: true, errors: [] }
  }
  const validate = ajv.compile(schema)
  const ok = validate(data)
  if (ok) return { ok: true, errors: [] }
  const errors = (validate.errors || []).map(
    (e) => `${e.instancePath || '/'} ${e.message} (${JSON.stringify(e.params)})`
  )
  return { ok: false, errors }
}

function findExampleSessions(root) {
  const sessions = []
  function walk(dir) {
    if (!existsSync(dir)) return
    for (const ent of readdirSync(dir)) {
      const path = join(dir, ent)
      const stat = statSync(path)
      if (stat.isDirectory()) {
        walk(path)
      } else if (ent.endsWith('.md') && /sessions|retrospectives|theses/.test(path)) {
        sessions.push(path)
      }
    }
  }
  walk(join(root, 'examples'))
  return sessions
}

function classifySession(frontmatter) {
  if (frontmatter.schema_version === '1.0.0' && 'mode' in frontmatter) return 'strategy-session'
  if (frontmatter.trajectory_id && frontmatter.outcome) return 'trajectory'
  if (frontmatter.thesis_id && frontmatter.status) return 'thesis'
  return null
}

function main() {
  console.log(`[iis-validate] validating ${targetPath}`)

  let schemas
  try {
    schemas = loadSchemas()
    console.log(`[iis-validate] loaded ${Object.keys(schemas).length} schema(s)`)
  } catch (e) {
    console.error(`[iis-validate] ✗ ${e.message}`)
    process.exit(1)
  }

  if (schemasOnly) {
    console.log('[iis-validate] ✓ schemas loaded; --schemas-only mode, skipping example validation')
    process.exit(0)
  }

  const sessions = findExampleSessions(SUBSTRATE_ROOT)
  console.log(`[iis-validate] found ${sessions.length} session/trajectory/thesis file(s) to validate`)

  let failures = 0
  for (const path of sessions) {
    const rel = relative(ROOT, path)
    const fm = readMarkdownFrontmatter(path)
    const type = classifySession(fm)
    if (!type) {
      console.warn(`[iis-validate] ⚠ ${rel} — could not classify; skipping`)
      continue
    }
    const schema = schemas[type === 'strategy-session' ? 'strategy-session' : type]
    if (!schema) {
      console.warn(`[iis-validate] ⚠ ${rel} — no schema for type ${type}; skipping`)
      continue
    }
    const result = validateAgainst(schema, fm, rel)
    if (result.ok) {
      console.log(`[iis-validate] ✓ ${rel} (${type})`)
    } else {
      console.error(`[iis-validate] ✗ ${rel} (${type})`)
      for (const err of result.errors) {
        console.error(`    ${err}`)
      }
      failures++
    }
  }

  if (failures > 0) {
    console.error(`\n[iis-validate] ${failures} file(s) failed validation`)
    process.exit(1)
  }
  console.log('\n[iis-validate] ✓ all sessions valid')
  process.exit(0)
}

main()
