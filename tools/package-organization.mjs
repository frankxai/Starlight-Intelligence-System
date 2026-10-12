/** Repackage an already built candidate under the existing organization identity.
 * No code is forked, and no registry credentials or publication are involved. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const [input, destination] = process.argv.slice(2);
if (!input || !destination || process.argv.length !== 4) throw new Error('Expected candidate tarball and output directory');
const output = resolve(destination);
if (readFileSync(resolve(input)).length > 5_242_880) throw new Error('Candidate archive exceeds 5 MiB');
const entries = execFileSync('tar', ['-tzf', resolve(input)], { encoding: 'utf8', maxBuffer: 1_048_576 }).trim().split('\n');
if (entries.some(entry => !entry.startsWith('package/') || /[\\:]/.test(entry) || entry.split('/').includes('..'))) {
  throw new Error('Unsafe candidate archive path');
}
const listing = execFileSync('tar', ['-tvzf', resolve(input)], { encoding: 'utf8', maxBuffer: 1_048_576 }).trim().split('\n');
if (listing.some(entry => !['-', 'd'].includes(entry[0]))) throw new Error('Candidate archive contains links or special files');
mkdirSync(output, { recursive: true });
const unpacked = join(output, 'source');
mkdirSync(unpacked);
execFileSync('tar', ['-xzf', resolve(input), '-C', unpacked]);
const root = join(unpacked, 'package');
const manifestPath = join(root, 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.name !== '@arcanea/starlight-intelligence-system') throw new Error('Unexpected source package');
manifest.name = '@starlight-intelligence/system';
// The source tarball already contains built dist and its source tests ran before packing.
// Repacking must not invoke inherited source-directory release lifecycle scripts.
delete manifest.scripts;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
const report = execFileSync('npm', ['pack', '--json', '--pack-destination', output], { cwd: root, encoding: 'utf8' });
writeFileSync(join(output, 'package-report.json'), report);
console.log(report);
