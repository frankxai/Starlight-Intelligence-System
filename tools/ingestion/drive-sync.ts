/**
 * Drive Sync Pipeline — Starlight Ingestion Substrate
 *
 * Scans, synchronizes, and stages Google Drive downloads / folder drops
 * into `.intake/` and automatically passes them through `gdoc-converter`.
 *
 * Built on SIP — operational tier.
 */

import { readdirSync, lstatSync, existsSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, join, basename, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertDocumentSnapshot, readDocumentSnapshot } from './gdoc-converter.js';

export interface SyncOptions {
  sourceDir: string;
  targetDir?: string;
  autoConvert?: boolean;
  dryRun?: boolean;
  preserveRaw?: boolean;
}

export interface SyncReport {
  scanned: number;
  transferred: number;
  converted: number;
  files: {
    source: string;
    target: string;
    vault?: string;
    status: 'synced' | 'converted' | 'skipped' | 'failed' | 'planned';
    reason?: string;
    error?: string;
  }[];
}

/**
 * Stage local document exports. This performs no Google Drive API calls.
 */
export function syncDriveFolder(options: SyncOptions): SyncReport {
  const source = realpathSync(resolve(options.sourceDir));
  const target = resolve(options.targetDir || resolve(process.cwd(), '.intake'));
  const rawTarget = join(target, 'raw');

  if (!lstatSync(source).isDirectory()) throw new Error('Drive source must be a directory');
  // Resolve the existing ancestor so symlink aliases cannot hide an overlap.
  let ancestor = target;
  const suffix: string[] = [];
  while (!existsSync(ancestor)) {
    suffix.unshift(basename(ancestor));
    const parent = resolve(ancestor, '..');
    if (parent === ancestor) throw new Error('Cannot resolve target directory');
    ancestor = parent;
  }
  const canonicalTarget = join(realpathSync(ancestor), ...suffix);
  const within = (parent: string, child: string) => {
    const rel = relative(parent, child);
    return rel === '' || (rel !== '..' && !rel.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) && !isAbsolute(rel));
  };
  if (within(source, canonicalTarget) || within(canonicalTarget, source)) throw new Error('Source and target directories must not overlap');
  const directory = (name: string) => {
    if (existsSync(name) && (lstatSync(name).isSymbolicLink() || !lstatSync(name).isDirectory())) throw new Error(`Unsafe destination directory: ${name}`);
  };
  directory(target); directory(rawTarget);

  const entries = readdirSync(source).sort();
  const report: SyncReport = {
    scanned: entries.length,
    transferred: 0,
    converted: 0,
    files: [],
  };

  const allowedExtensions = new Set(['.html', '.htm', '.txt', '.md', '.json', '.pdf']);
  const claimedConversions = new Set<string>();

  for (const entry of entries) {
    const fullSourcePath = join(source, entry);
    const ext = extname(entry).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      continue;
    }

    const base = basename(entry, ext);
    const targetRawFile = join(rawTarget, entry);
    const convertedFile = join(target, `${base}.md`);

    const convert = options.autoConvert !== false && ['.html', '.htm', '.txt'].includes(ext);
    const preserve = options.preserveRaw !== false;
    const output = convert ? convertedFile : targetRawFile;
    try {
      if (!lstatSync(fullSourcePath).isFile() || lstatSync(fullSourcePath).isSymbolicLink()) {
        report.files.push({ source: fullSourcePath, target: output, status: 'skipped', reason: 'Non-regular source file' });
        continue;
      }
      if (!convert && !preserve) {
        report.files.push({ source: fullSourcePath, target: output, status: 'skipped', reason: 'Copy and conversion disabled' });
        continue;
      }
      const key = process.platform === 'win32' ? convertedFile.toLowerCase() : convertedFile;
      if (convert && claimedConversions.has(key)) throw new Error('Output name collision between source files');
      if (convert) claimedConversions.add(key);
      for (const destination of [targetRawFile, ...(convert ? [convertedFile] : [])]) {
        if (existsSync(destination) && (!lstatSync(destination).isFile() || lstatSync(destination).isSymbolicLink())) throw new Error('Unsafe existing destination');
      }
      const sourceBytes = readDocumentSnapshot(fullSourcePath);
      const rawExists = existsSync(targetRawFile);
      const rawMatches = rawExists && readDocumentSnapshot(targetRawFile).equals(sourceBytes);
      if (preserve && rawExists && !rawMatches) throw new Error('Raw destination already exists with different content');
      if (convert && existsSync(convertedFile)) {
        if (!rawMatches) throw new Error('Converted destination already exists; retained without overwrite');
        report.files.push({ source: fullSourcePath, target: output, status: 'skipped', reason: 'Existing conversion retained; matching raw source' });
        continue;
      }
      if (!convert && rawMatches) {
        report.files.push({ source: fullSourcePath, target: output, status: 'skipped', reason: 'Identical raw source already staged' });
        continue;
      }
      if (options.dryRun) {
        report.files.push({ source: fullSourcePath, target: output, status: 'planned', reason: convert ? 'Would convert local export' : 'Would copy raw file' });
        continue;
      }
      // Prepare conversion before creating output folders or copying source bytes.
      const result = convert ? convertDocumentSnapshot(sourceBytes, fullSourcePath, { prependFrontmatter: true, stripGoogleRedirects: true }) : undefined;
      directory(target); directory(rawTarget);
      if (preserve && !rawExists) {
        mkdirSync(rawTarget, { recursive: true });
        writeFileSync(targetRawFile, sourceBytes, { flag: 'wx' });
        report.transferred++;
      }
      if (result) {
        mkdirSync(target, { recursive: true });
        writeFileSync(convertedFile, result.markdown, { encoding: 'utf8', flag: 'wx' });
        report.converted++;
      }
      report.files.push({ source: fullSourcePath, target: output, vault: result?.metadata.vault, status: result ? 'converted' : 'synced' });
    } catch (err: unknown) {
      report.files.push({
        source: fullSourcePath,
        target: output,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return report;
}

// ── CLI Runner ─────────────────────────────────────────────
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const sourceIdx = args.indexOf('--source');
  const sourcePath = sourceIdx !== -1 && args[sourceIdx + 1] ? args[sourceIdx + 1] : process.env.GOOGLE_DRIVE_SYNC_PATH;

  if (!sourcePath) {
    console.error('Usage: npx tsx tools/ingestion/drive-sync.ts --source <path-to-drive-folder> [--dry-run]');
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');
  const report = syncDriveFolder({
    sourceDir: sourcePath,
    dryRun,
  });

  console.log(`${dryRun ? 'Local sync plan' : 'Local sync result'}: Scanned ${report.scanned}, Transferred ${report.transferred}, Converted ${report.converted}`);
  for (const item of report.files) {
    console.log(`  [${item.status.toUpperCase()}] ${basename(item.source)} -> ${basename(item.target)} (${item.vault || 'raw'})${item.error ? ': ' + item.error : ''}`);
  }
  if (report.files.some(item => item.status === 'failed')) process.exitCode = 1;
}
