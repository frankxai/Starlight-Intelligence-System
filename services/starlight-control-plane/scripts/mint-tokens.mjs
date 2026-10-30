#!/usr/bin/env node
// Mints one bearer token per agent identity. Frank runs this; agents never mint their own.
//
//   node scripts/mint-tokens.mjs <identities.json> --table <agent-tokens.json> --tokens <new-tokens.json>
//
// identities.json: [{ "agentId", "harness", "provider", "roles": [...] }, ...]
// --table holds only SHA-256 hashes, so it is safe to keep and re-use: an existing table is read
// and the new identities are appended (the secret replaces the whole table on every put).
// --tokens receives the raw tokens, once: a new file outside every git work tree, readable only by
// the current user. Hand each token to its agent, move them into Infisical, then delete the file.
// Exit 0 on success, 2 on any refused input.

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { userInfo } from 'node:os';
import { dirname, resolve } from 'node:path';
import { isIdentity, sha256Hex } from '../src/handler.ts';

const USAGE = 'usage: mint-tokens.mjs <identities.json> --table <agent-tokens.json> --tokens <new-tokens.json>';
const HASH = /^[0-9a-f]{64}$/;

function flag(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

function insideGitTree(file) {
  try {
    execFileSync('git', ['-C', dirname(resolve(file)), 'rev-parse', '--show-toplevel'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Creates the file empty and owner-only before any secret goes in. On Windows `mode` is ignored,
// so inheritance is cut and the ACL is checked to hold the current user alone.
function createPrivate(file) {
  writeFileSync(file, '', { flag: 'wx', mode: 0o600 });
  if (process.platform !== 'win32') return;
  const user = userInfo().username;
  try {
    execFileSync('icacls', [file, '/inheritance:r', '/grant:r', `${user}:F`], { stdio: 'pipe' });
    const aces = execFileSync('icacls', [file], { encoding: 'utf8' })
      .split(/\r?\n/).map((l) => l.replace(file, '').trim()).filter((l) => l.includes(':('));
    if (aces.length !== 1 || !aces[0].toLowerCase().includes(user.toLowerCase())) {
      throw new Error(`unexpected ACL: ${aces.join('; ')}`);
    }
  } catch (err) {
    rmSync(file, { force: true });
    throw new Error(`could not make ${file} private to ${user}: ${err.message}`);
  }
}

function readTable(tablePath) {
  if (!existsSync(tablePath)) return {};
  const table = JSON.parse(readFileSync(tablePath, 'utf8'));
  if (!table || typeof table !== 'object' || Array.isArray(table)) throw new Error(`${tablePath} must be a JSON object`);
  for (const [hash, who] of Object.entries(table)) {
    if (!HASH.test(hash) || !isIdentity(who)) throw new Error(`${tablePath} has an invalid entry: ${hash}`);
  }
  return table;
}

export async function mint(argv, { newToken = () => `cp_${randomBytes(32).toString('base64url')}` } = {}) {
  const [identitiesPath] = argv;
  const tablePath = flag(argv, '--table');
  const tokensPath = flag(argv, '--tokens');
  if (!identitiesPath || identitiesPath.startsWith('--') || !tablePath || !tokensPath) throw new Error(USAGE);
  if (existsSync(tokensPath)) throw new Error(`refusing to overwrite ${tokensPath}`);
  if (insideGitTree(tokensPath)) throw new Error(`refusing to write raw tokens inside a git work tree: ${tokensPath}`);

  const identities = JSON.parse(readFileSync(identitiesPath, 'utf8'));
  if (!Array.isArray(identities) || identities.length === 0) throw new Error('identities must be a non-empty array');
  const bad = identities.find((who) => !isIdentity(who));
  if (bad) throw new Error(`invalid identity (check provider spelling and roles): ${JSON.stringify(bad)}`);

  const table = readTable(tablePath);
  const ids = [...Object.values(table).map((v) => v.agentId), ...identities.map((v) => v.agentId)];
  const dupe = ids.find((id, i) => ids.indexOf(id) !== i);
  // The Worker locks everyone out when two entries share an agentId; refuse here instead.
  if (dupe) throw new Error(`agentId ${dupe} appears twice; revoke the old entry from the table first`);

  const tokens = {};
  for (const who of identities) {
    const token = newToken();
    table[await sha256Hex(token)] = { agentId: who.agentId, harness: who.harness, provider: who.provider, roles: who.roles };
    tokens[who.agentId] = token;
  }

  // Table goes to a temp file first, so a failure at any step leaves neither live tokens without a
  // saved table nor a table naming tokens nobody holds.
  const tableTmp = `${tablePath}.${process.pid}.tmp`;
  writeFileSync(tableTmp, `${JSON.stringify(table)}\n`, { flag: 'wx' });
  let created = false;
  try {
    createPrivate(tokensPath);
    created = true;
    writeFileSync(tokensPath, `${JSON.stringify(tokens, null, 2)}\n`);
    renameSync(tableTmp, tablePath);
  } catch (err) {
    rmSync(tableTmp, { force: true });
    if (created) rmSync(tokensPath, { force: true });
    throw err;
  }
  return { minted: Object.keys(tokens), tableEntries: Object.keys(table).length, table: tablePath, tokens: tokensPath };
}

if (process.argv[1]?.endsWith('mint-tokens.mjs')) {
  try {
    process.stdout.write(`${JSON.stringify(await mint(process.argv.slice(2)), null, 2)}\n`);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(2);
  }
}
