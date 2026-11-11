/**
 * Google Docs & Drive Clean Markdown Converter
 *
 * Converts Google Docs HTML exports and raw document text into clean,
 * Markdown for local review. Supports common paragraphs, headings, lists,
 * code and tables; it is not a complete HTML/CSS or Google Docs renderer.
 *
 * Built on SIP — operational tier.
 */

import { writeFileSync, existsSync, openSync, fstatSync, readSync, closeSync } from 'node:fs';
import { resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { enrichMetadata, formatFrontmatter, type DocumentMetadata } from './metadata-enricher.js';

export interface ConverterOptions {
  sourcePath?: string;
  documentTitle?: string;
  author?: string;
  targetVault?: DocumentMetadata['vault'];
  prependFrontmatter?: boolean;
  stripGoogleRedirects?: boolean;
  convertWikilinks?: boolean;
  preserveComments?: boolean;
}

export interface ConversionResult {
  markdown: string;
  metadata: DocumentMetadata;
  frontmatter: string;
  sourceFile?: string;
}

export const MAX_DOCUMENT_BYTES = 16 * 1024 * 1024;

/** Read one bounded UTF-8 snapshot so raw and converted copies share evidence. */
export function readDocumentSnapshot(filePath: string): Buffer {
  const fd = openSync(filePath, 'r');
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile()) throw new Error('Document must be a regular file');
    if (stat.size > MAX_DOCUMENT_BYTES) throw new Error('Document exceeds the 16 MiB local conversion limit');
    const bytes = Buffer.alloc(stat.size + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length !== stat.size) throw new Error('Document changed while reading; retry from the saved source');
    return bytes.subarray(0, length);
  } finally {
    closeSync(fd);
  }
}

/**
 * Clean zero-width characters, non-breaking spaces, and hidden whitespace noise.
 */
export function sanitizeWhitespace(text: string): string {
  return text
    // Replace non-breaking spaces with standard space
    .replace(/\u00A0/g, ' ')
    // Keep joiners/non-joiners used by emoji and writing systems.
    .replace(/[\u200B\uFEFF]/g, '')
    // Normalize Windows CRLF to LF
    .replace(/\r\n/g, '\n')
    // Normalize stray carriage returns
    .replace(/\r/g, '\n');
}

/**
 * Unwrap Google redirect tracking links:
 * e.g. https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fpath&sa=D&... -> https://example.com/path
 */
export function unwrapGoogleRedirect(url: string): string {
  try {
    const parsed = new URL(url);
    if (['google.com', 'www.google.com', 'google.de', 'www.google.de'].includes(parsed.hostname) && parsed.pathname === '/url') {
      const target = parsed.searchParams.get('q') || parsed.searchParams.get('url');
      if (target) {
        return target;
      }
    }
  } catch {
    // If URL parsing fails, return as-is
  }
  return url;
}

function safeLinkTarget(value: string): string | undefined {
  // Entity escapes and control characters can conceal active URL schemes.
  if (/[\u0000-\u0020<>]|&#|&colon;|&Tab;|&NewLine;/i.test(value)) return undefined;
  if (value.startsWith('#') || (/^(?:\/|\.\.?\/)/.test(value) && !value.startsWith('//'))) return value;
  try {
    const url = new URL(value);
    if (['https:', 'http:', 'mailto:'].includes(url.protocol) && !url.username && !url.password) return value;
  } catch { /* Keep malformed targets as plain labels. */ }
  return undefined;
}

function decodeCodeEntities(value: string): string {
  return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

/**
 * Parse inline HTML formatting tags (bold, italic, code, links, strikethrough).
 */
export function processInlineFormatting(html: string, options: ConverterOptions = {}): string {
  let text = html;

  // Process links first before bold/italics
  text = text.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis, (_, href, content) => {
    let cleanHref = href.trim();
    if (options.stripGoogleRedirects !== false) {
      cleanHref = unwrapGoogleRedirect(cleanHref);
    }

    const cleanContent = content.replace(/<[^>]+>/g, '').trim();

    // Check if this is an internal link that should be converted to an Obsidian/SIS wikilink
    if (options.convertWikilinks && (cleanHref.startsWith('#heading=') || cleanHref.startsWith('#bookmark='))) {
      return `[[#${cleanContent}]]`;
    }

    // Google Docs internal document cross-references
    if (options.convertWikilinks && cleanHref.includes('docs.google.com/document/d/')) {
      return `[[${cleanContent}]]`;
    }

    if (!cleanContent) return '';
    const target = safeLinkTarget(cleanHref);
    if (!target) return cleanContent;
    const label = cleanContent.replace(/([\\\[\]])/g, '\\$1');
    return `[${label}](${target.replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
  });

  // Inline code tags
  text = text.replace(/<code>(.*?)<\/code>/gis, (_, code) => {
    return `\`${code.replace(/<[^>]+>/g, '')}\``;
  });

  // Monospace spans often emitted by Google Docs
  text = text.replace(/<span\s+[^>]*style=["'][^"']*(?:Courier|Consolas|monospace)[^"']*["'][^>]*>(.*?)<\/span>/gis, (_, code) => {
    const clean = code.replace(/<[^>]+>/g, '');
    return `\`${clean}\``;
  });

  // Bold
  text = text.replace(/<(?:b|strong)(?:\s+[^>]*)?>(.*?)<\/(?:b|strong)>/gis, (_, content) => {
    const clean = content.trim();
    return clean ? `**${clean}**` : '';
  });
  text = text.replace(/<span\s+[^>]*style=["'][^"']*font-weight:\s*(?:700|800|900|bold)[^"']*["'][^>]*>(.*?)<\/span>/gis, (_, content) => {
    const clean = content.trim();
    return clean ? `**${clean}**` : '';
  });

  // Italic
  text = text.replace(/<(?:i|em)(?:\s+[^>]*)?>(.*?)<\/(?:i|em)>/gis, (_, content) => {
    const clean = content.trim();
    return clean ? `*${clean}*` : '';
  });
  text = text.replace(/<span\s+[^>]*style=["'][^"']*font-style:\s*italic[^"']*["'][^>]*>(.*?)<\/span>/gis, (_, content) => {
    const clean = content.trim();
    return clean ? `*${clean}*` : '';
  });

  // Strikethrough
  text = text.replace(/<(?:s|strike|del)(?:\s+[^>]*)?>(.*?)<\/(?:s|strike|del)>/gis, (_, content) => {
    const clean = content.trim();
    return clean ? `~~${clean}~~` : '';
  });

  // Clean out remaining inert spans and divs
  text = text.replace(/<\/?span[^>]*>/gi, '');

  return text;
}

/**
 * Convert HTML table elements into standard GitHub Flavored Markdown pipe tables.
 */
export function convertHtmlTableToMarkdown(tableHtml: string): string {
  const rows: string[][] = [];

  // Match all <tr> elements
  const trMatches = tableHtml.match(/<tr[^>]*>.*?<\/tr>/gis) || [];

  for (const tr of trMatches) {
    const cells: string[] = [];
    const cellMatches = tr.match(/<(?:td|th)[^>]*>.*?<\/(?:td|th)>/gis) || [];

    for (const cell of cellMatches) {
      let cellText = cell
        .replace(/<(?:td|th)[^>]*>/i, '')
        .replace(/<\/(?:td|th)>/i, '');
      cellText = processInlineFormatting(cellText);
      // Clean tags, collapse whitespace, escape vertical pipes
      cellText = cellText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      cellText = cellText.replace(/\|/g, '\\|');
      cells.push(cellText);
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) return '';

  const colCount = Math.max(...rows.map(r => r.length));
  // Normalize row lengths
  const normalizedRows = rows.map(row => {
    while (row.length < colCount) {
      row.push('');
    }
    return row;
  });

  const lines: string[] = [];

  // Header row
  const headerRow = normalizedRows[0];
  lines.push(`| ${headerRow.join(' | ')} |`);
  // Separator
  lines.push(`| ${headerRow.map(() => '---').join(' | ')} |`);

  // Data rows
  for (let i = 1; i < normalizedRows.length; i++) {
    lines.push(`| ${normalizedRows[i].join(' | ')} |`);
  }

  return `\n${lines.join('\n')}\n`;
}

/**
 * Main Google Docs HTML to Clean Markdown transformation pipeline.
 */
export function convertGDocHtmlToMarkdown(htmlContent: string, options: ConverterOptions = {}): ConversionResult {
  if (Buffer.byteLength(htmlContent, 'utf8') > MAX_DOCUMENT_BYTES) throw new Error('Document exceeds the 16 MiB local conversion limit');
  let doc = sanitizeWhitespace(htmlContent);
  // Random internal placeholders cannot be forged by literal document text.
  const tokenPrefix = `__STARLIGHT_${randomUUID()}_`;

  // Strip <style>, <script>, <head> entirely
  doc = doc.replace(/<head[^>]*>.*?<\/head>/gis, '');
  doc = doc.replace(/<style[^>]*>.*?<\/style>/gis, '');
  doc = doc.replace(/<script[^>]*>.*?<\/script>/gis, '');

  // Strip Google Docs comment sidebars if not preserved
  if (!options.preserveComments) {
    doc = doc.replace(/<div\s+[^>]*class=["'][^"']*comment[^"']*["'][^>]*>.*?<\/div>/gis, '');
    doc = doc.replace(/<a\s+[^>]*id=["']cmnt[^"']*["'][^>]*>.*?<\/a>/gis, '');
  }

  // Pre-process code blocks (<pre>, or Google Docs code block divs)
  const codeBlocks: string[] = [];
  doc = doc.replace(/<pre[^>]*>(.*?)<\/pre>/gis, (_, codeContent) => {
    const unescaped = decodeCodeEntities(codeContent.replace(/<[^>]+>/g, ''));
    const longestFence = Math.max(0, ...(unescaped.match(/`+/g) || []).map((run: string) => run.length));
    const fence = '`'.repeat(Math.max(3, longestFence + 1));
    const placeholder = `${tokenPrefix}CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`\n${fence}text\n${unescaped}\n${fence}\n`);
    return placeholder;
  });

  // Protect inline source before tag removal and entity decoding.
  const inlineCodes: string[] = [];
  doc = doc.replace(/<code(?:\s+[^>]*)?>(.*?)<\/code>/gis, (_, content) => {
    const clean = decodeCodeEntities(content.replace(/<[^>]+>/g, ''));
    const longest = Math.max(0, ...(clean.match(/`+/g) || []).map((run: string) => run.length));
    const fence = '`'.repeat(longest + 1);
    const padded = /^`|`$/.test(clean) ? ` ${clean} ` : clean;
    const placeholder = `${tokenPrefix}INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(`${fence}${padded}${fence}`);
    return placeholder;
  });

  // Pre-process HTML tables
  const tables: string[] = [];
  doc = doc.replace(/<table[^>]*>.*?<\/table>/gis, (tableMatch) => {
    const mdTable = convertHtmlTableToMarkdown(tableMatch);
    const placeholder = `${tokenPrefix}TABLE_${tables.length}__`;
    tables.push(mdTable);
    return placeholder;
  });

  // Convert Headings
  doc = doc.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gis, (_, level, content) => {
    const hashes = '#'.repeat(Number(level));
    const cleanText = processInlineFormatting(content, options).replace(/<[^>]+>/g, '').trim();
    return `\n\n${hashes} ${cleanText}\n\n`;
  });

  // Google Docs Title & Subtitle classes
  doc = doc.replace(/<p\s+[^>]*class=["'](?:[^"']*\s)?title(?:\s[^"']*)?["'][^>]*>(.*?)<\/p>/gis, (_, content) => {
    const cleanText = processInlineFormatting(content, options).replace(/<[^>]+>/g, '').trim();
    return `\n\n# ${cleanText}\n\n`;
  });
  doc = doc.replace(/<p\s+[^>]*class=["'][^"']*subtitle[^"']*["'][^>]*>(.*?)<\/p>/gis, (_, content) => {
    const cleanText = processInlineFormatting(content, options).replace(/<[^>]+>/g, '').trim();
    return `\n\n> *${cleanText}*\n\n`;
  });

  // Lists: Unordered and Ordered
  doc = doc.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_, listContent) => {
    const items = listContent.match(/<li[^>]*>.*?<\/li>/gis) || [];
    const mdItems = items.map((li: string) => {
      const inner = li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '');
      const formatted = processInlineFormatting(inner, options).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return `- ${formatted}`;
    });
    return `\n\n${mdItems.join('\n')}\n\n`;
  });

  doc = doc.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_, listContent) => {
    const items = listContent.match(/<li[^>]*>.*?<\/li>/gis) || [];
    const mdItems = items.map((li: string, idx: number) => {
      const inner = li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '');
      const formatted = processInlineFormatting(inner, options).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return `${idx + 1}. ${formatted}`;
    });
    return `\n\n${mdItems.join('\n')}\n\n`;
  });

  // Paragraphs & Blockquotes
  doc = doc.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, quoteContent) => {
    const formatted = processInlineFormatting(quoteContent, options).replace(/<[^>]+>/g, ' ').trim();
    return `\n\n> ${formatted}\n\n`;
  });

  doc = doc.replace(/<p[^>]*>(.*?)<\/p>/gis, (_, pContent) => {
    const formatted = processInlineFormatting(pContent, options).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!formatted) return '';
    return `\n\n${formatted}\n\n`;
  });

  // Horizontal rules
  doc = doc.replace(/<hr[^>]*>/gi, '\n\n---\n\n');

  // Strip any remaining unhandled HTML tags
  doc = doc.replace(/<[^>]+>/g, '');

  // Decode standard HTML entities
  doc = doc
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '\\<')
    .replace(/&gt;/g, '\\>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Normalize prose before restoring source code, whose whitespace is meaningful.
  doc = doc.replace(/\n{3,}/g, '\n\n').trim();
  // Restore tables and code blocks without replacement-string interpolation.
  tables.forEach((tbl, idx) => {
    doc = doc.replace(`${tokenPrefix}TABLE_${idx}__`, () => tbl);
  });
  codeBlocks.forEach((code, idx) => {
    doc = doc.replace(`${tokenPrefix}CODE_BLOCK_${idx}__`, () => code);
  });
  inlineCodes.forEach((code, idx) => {
    doc = doc.replace(`${tokenPrefix}INLINE_CODE_${idx}__`, () => code);
  });
  doc = doc.trim();

  // Enrich metadata
  const metadata = enrichMetadata(doc, {
    title: options.documentTitle,
    author: options.author,
    source: options.sourcePath,
    sourceSha256: createHash('sha256').update(htmlContent).digest('hex'),
    vault: options.targetVault,
  });

  const frontmatter = formatFrontmatter(metadata);
  const finalMarkdown = options.prependFrontmatter !== false ? `${frontmatter}${doc}\n` : `${doc}\n`;

  return {
    markdown: finalMarkdown,
    metadata,
    frontmatter,
    sourceFile: options.sourcePath,
  };
}

/**
 * Convert a file directly from disk.
 */
export function convertGDocFile(filePath: string, options: ConverterOptions = {}): ConversionResult {
  const fullPath = resolve(filePath);
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  return convertDocumentSnapshot(readDocumentSnapshot(fullPath), fullPath, options);
}

export function convertDocumentSnapshot(bytes: Buffer, filePath: string, options: ConverterOptions = {}): ConversionResult {
  if (bytes.length > MAX_DOCUMENT_BYTES) throw new Error('Document exceeds the 16 MiB local conversion limit');
  const fullPath = resolve(filePath);
  // Reject invalid UTF-8 rather than silently substituting replacement characters.
  const rawContent = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  if (rawContent.includes('\u0000')) throw new Error('Unsupported binary document content');
  const fileExt = extname(fullPath).toLowerCase();
  if (fileExt === '.gdoc') throw new Error('A .gdoc shortcut contains no document text. Export the document as HTML before conversion.');
  if (!['.html', '.htm', '.txt', '.md'].includes(fileExt)) throw new Error(`Unsupported document format: ${fileExt || '(none)'}`);
  const docTitle = options.documentTitle || basename(fullPath, fileExt).replace(/[-_]/g, ' ');

  if (fileExt === '.html' || fileExt === '.htm') {
    return convertGDocHtmlToMarkdown(rawContent, {
      ...options,
      sourcePath: fullPath,
      documentTitle: docTitle,
    });
  }

  // If already plain text or markdown, sanitize and enrich
  const sanitized = sanitizeWhitespace(rawContent);
  const metadata = enrichMetadata(sanitized, {
    title: docTitle,
    author: options.author,
    source: fullPath,
    sourceSha256: createHash('sha256').update(rawContent).digest('hex'),
    vault: options.targetVault,
  });
  const frontmatter = formatFrontmatter(metadata);
  const finalMarkdown = options.prependFrontmatter !== false ? `${frontmatter}${sanitized}\n` : `${sanitized}\n`;

  return {
    markdown: finalMarkdown,
    metadata,
    frontmatter,
    sourceFile: fullPath,
  };
}

// ── CLI Runner ─────────────────────────────────────────────
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Starlight Google Docs / Drive Markdown Converter
Usage:
  npx tsx tools/ingestion/gdoc-converter.ts <input-file> [options]

Options:
  --out <path>        Path to write output markdown
  --vault <vault>     Force semantic vault (strategic|technical|creative|operational|wisdom|horizon)
  --no-frontmatter    Skip prepending YAML frontmatter
  --no-redirect-strip Do not decode Google URL redirects
  --wikilinks         Convert intra-doc links to [[WikiLinks]]
`);
    process.exit(0);
  }

  const inputPath = args[0];
  const outIdx = args.indexOf('--out');
  const outputPath = outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : null;

  const vaultIdx = args.indexOf('--vault');
  const targetVault = vaultIdx !== -1 && args[vaultIdx + 1] ? (args[vaultIdx + 1] as DocumentMetadata['vault']) : undefined;

  const prependFrontmatter = !args.includes('--no-frontmatter');
  const stripGoogleRedirects = !args.includes('--no-redirect-strip');
  const convertWikilinks = args.includes('--wikilinks');

  try {
    const result = convertGDocFile(inputPath, {
      targetVault,
      prependFrontmatter,
      stripGoogleRedirects,
      convertWikilinks,
    });

    if (outputPath) {
      writeFileSync(resolve(outputPath), result.markdown, { encoding: 'utf-8', flag: 'wx' });
      console.log(`Converted: ${inputPath} -> ${outputPath} (Vault: ${result.metadata.vault}, ${result.metadata.wordCount} words)`);
    } else {
      process.stdout.write(result.markdown);
    }
  } catch (err: any) {
    console.error(`Conversion failed: ${err.message}`);
    process.exit(1);
  }
}
