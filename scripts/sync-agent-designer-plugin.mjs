import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const plugin = join(root, 'plugins/starlight-agent-designer');
const check = process.argv.includes('--check');
const sources = new Map([
  ['starlight-agent-designer', 'foundry/designer/skill'],
  ...['skill-forge', 'agent-forge', 'system-forge', 'taste-engine'].map(name => [name, `skills/foundry/${name}`]),
]);
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  if (e.isSymbolicLink()) throw new Error(`Symlink refused: ${e.name}`);
  const path = join(dir, e.name);
  return e.isDirectory() ? files(path) : [path];
}).sort();
for (const [name, path] of sources) {
  const source = join(root, path), target = join(plugin, 'skills', name);
  if (check) {
    if (!existsSync(target)) throw new Error(`Missing packaged skill: ${name}`);
    const left = files(source).map(p => relative(source, p));
    const right = files(target).map(p => relative(target, p));
    if (JSON.stringify(left) !== JSON.stringify(right) || left.some(p => !readFileSync(join(source, p)).equals(readFileSync(join(target, p))))) throw new Error(`Plugin drift: ${name}`);
  } else {
    if (existsSync(target)) rmSync(target, { recursive: true });
    mkdirSync(target, { recursive: true });
    cpSync(source, target, { recursive: true });
  }
}
// Existing Foundry schema helpers and contracts are reused without edits.
const projections = [
  ['tools/foundry/lib/schema.mjs', 'scripts/schema.mjs'],
  ['tools/foundry/lib/io.mjs', 'scripts/io.mjs'],
  ...['task-envelope', 'agent-pack', 'skill-pack'].map(n => [`foundry/contracts/${n}.schema.json`, `assets/${n}.schema.json`]),
];
for (const [source, target] of projections) {
  if (!readFileSync(join(root, source)).equals(readFileSync(join(root, 'foundry/designer/skill', target)))) throw new Error(`Foundry projection drift: ${target}`);
}
console.log(check ? 'Five packaged skills and Foundry projections match canonical source.' : 'Agent Designer plugin skills synchronized.');
