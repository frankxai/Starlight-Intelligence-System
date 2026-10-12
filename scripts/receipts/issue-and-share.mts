#!/usr/bin/env -S node --experimental-strip-types
/**
 * Issue a signed run receipt from a draft, and hand back everything the phone
 * path needs: the envelope, the share link, and a printable card with the QR.
 *
 *   node --experimental-strip-types scripts/receipts/issue-and-share.mts <draft.json> \
 *       --key .starlight/keys/sip-signing.key [--out .starlight/receipts] \
 *       [--origin https://starlightintelligence.ai] [--issuer "Frank Riemer"] [--ledger]
 *
 * The draft carries run, subject, stages, and optionally issuer, decisions,
 * evidence, totals, verdict. `subject.path` names a file (relative to the current directory) whose sha256 becomes
 * the subject digest; `subject.digest.sha256` is accepted instead. Missing
 * run.startedAt / run.endedAt / run.id and decision timestamps are filled with
 * now. totals and verdict derive from the stages when absent.
 *
 * Refuses an incomplete receipt, refuses a key that is not Ed25519, and
 * verifies its own output with the public half before writing anything.
 * The private key never leaves the machine and is never written anywhere.
 *
 * Writes <out>/<receiptId>.envelope.json, <out>/<receiptId>.share.txt and
 * <out>/<receiptId>.card.html. --ledger also appends the signed envelope to
 * memory/_audit/receipts.jsonl as sis.receipt.issue does.
 *
 * Exit 0 on success, 1 when the receipt is incomplete or fails self-check,
 * 2 on a usage or read error.
 *
 * Built on SIP — operational tier
 */
import { createPrivateKey, createPublicKey } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { appendReceiptEnvelope } from '../../src/ledgers.ts';
import { qrSvgPath } from '../../src/qrcodegen.ts';
import { QR_MAX_CHARS, receiptShareUrl, SHARE_ORIGIN } from '../../src/receipt-share.ts';
import {
  keyIdOf,
  receiptProblems,
  RUN_RECEIPT_SCHEMA,
  sha256Hex,
  signRunReceipt,
  totalsFromStages,
  verdictFromStages,
  verifyRunReceipt,
  type RunReceipt,
} from '../../src/run-receipt.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const USAGE = `issue-and-share — sign a run receipt and produce its phone link and printable card

  node --experimental-strip-types scripts/receipts/issue-and-share.mts <draft.json> --key <sip-signing.key>
      [--out <dir>] [--origin <url>] [--issuer <name>] [--ledger]

  Example draft: scripts/receipts/examples/desk-brief.draft.json`;

function fail(code: number, message: string): never {
  console.error(`issue-and-share: ${message}`);
  process.exit(code);
}

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function euros(value: number): string {
  return `€${value.toFixed(4)}`;
}

function newReceiptId(): string {
  return `rcpt_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function cardHtml(receipt: RunReceipt, keyid: string, shareUrl: string, qr: { path: string; size: number } | null): string {
  const quiet = 4;
  const box = qr ? qr.size + quiet * 2 : 0;
  const stages = receipt.stages
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.model ?? '')}</td><td class="n">${s.costEur === undefined ? '' : euros(s.costEur)}</td><td class="n">${s.latencyMs === undefined ? '' : `${(s.latencyMs / 1000).toFixed(1)} s`}</td><td>${escapeHtml(s.status)}</td></tr>`,
    )
    .join('\n');
  const decisions = receipt.decisions.map((d) => `${escapeHtml(d.gate)} · ${escapeHtml(d.decidedBy)} · ${escapeHtml(d.outcome)}`).join('<br>');
  const qrBlock = qr
    ? `<svg viewBox="${-quiet} ${-quiet} ${box} ${box}" width="64mm" height="64mm" role="img" aria-label="QR: verify this receipt"><rect x="${-quiet}" y="${-quiet}" width="${box}" height="${box}" fill="#fff"/><path d="${qr.path}" fill="#000" shape-rendering="crispEdges"/></svg>`
    : `<p class="muted">The link is ${shareUrl.length} characters, past what a QR holds (${QR_MAX_CHARS}). Type the link or use the ledger id.</p>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Run receipt ${escapeHtml(receipt.receiptId)}</title>
<style>
  @page { size: A5; margin: 12mm; }
  body { font: 11pt/1.4 ui-monospace, "JetBrains Mono", Menlo, monospace; color: #000; background: #fff; margin: 0; }
  .card { max-width: 128mm; margin: 0 auto; padding: 8mm 0; }
  h1 { font-size: 13pt; margin: 0 0 2mm; letter-spacing: .02em; }
  .eyebrow { font-size: 8pt; text-transform: uppercase; letter-spacing: .12em; color: #444; margin: 0 0 4mm; }
  table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 9.5pt; }
  td, th { text-align: left; padding: 1mm 0; border-bottom: 1px solid #ddd; vertical-align: top; }
  th { font-size: 8pt; text-transform: uppercase; letter-spacing: .08em; color: #444; }
  .n { text-align: right; white-space: nowrap; }
  .totals { display: flex; gap: 8mm; margin: 3mm 0; font-size: 12pt; }
  .totals b { display: block; font-size: 8pt; font-weight: normal; text-transform: uppercase; letter-spacing: .08em; color: #444; }
  .qr { display: flex; gap: 6mm; align-items: flex-start; margin-top: 4mm; }
  .qr svg { flex: 0 0 64mm; }
  .qr p { margin: 0; font-size: 9pt; }
  .muted { color: #444; font-size: 8.5pt; word-break: break-all; }
  .verdict { font-weight: bold; }
  @media screen { body { padding: 12mm; background: #eee; } .card { background: #fff; padding: 10mm; box-shadow: 0 1mm 4mm rgba(0,0,0,.15); } }
</style></head><body><div class="card">
<p class="eyebrow">Starlight run receipt · ${escapeHtml(RUN_RECEIPT_SCHEMA)}</p>
<h1>${escapeHtml(receipt.run.kind)} · <span class="verdict">${escapeHtml(receipt.verdict)}</span></h1>
<p class="muted">${escapeHtml(receipt.receiptId)}<br>issued ${escapeHtml(receipt.issuedAt)} by ${escapeHtml(receipt.issuer.name)} on ${escapeHtml(receipt.run.host)}<br>subject ${escapeHtml(receipt.subject.name)}<br>sha256 ${escapeHtml(receipt.subject.digest.sha256)}</p>
<table><thead><tr><th>stage</th><th>model</th><th class="n">cost</th><th class="n">time</th><th>status</th></tr></thead><tbody>
${stages}
</tbody></table>
<div class="totals"><span><b>cost</b>${euros(receipt.totals.costEur)}</span><span><b>time</b>${(receipt.totals.latencyMs / 1000).toFixed(1)} s</span><span><b>tokens</b>${receipt.totals.tokens.input.toLocaleString('en-US')} in · ${receipt.totals.tokens.output.toLocaleString('en-US')} out</span></div>
${decisions ? `<p class="muted">decisions: ${decisions}</p>` : ''}
<div class="qr">${qrBlock}<div><p><strong>Scan to verify.</strong></p><p>The QR carries the signed receipt. The site checks the Ed25519 signature against the Starlight key registry and shows the verdict.</p><p class="muted">keyid ${escapeHtml(keyid)}</p><p class="muted">${escapeHtml(new URL(shareUrl).host)}/verify</p></div></div>
</div></body></html>
`;
}

function main(argv: string[]): number {
  const args: { draft?: string; key?: string; out?: string; origin?: string; issuer?: string; ledger?: boolean } = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--key') args.key = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--origin') args.origin = argv[++i];
    else if (a === '--issuer') args.issuer = argv[++i];
    else if (a === '--ledger') args.ledger = true;
    else if (a === '--help' || a === '-h') {
      console.log(USAGE);
      return 0;
    } else if (!args.draft) args.draft = a;
  }
  if (!args.draft || !args.key) {
    console.log(USAGE);
    return 2;
  }

  let draft: Record<string, unknown>;
  try {
    draft = JSON.parse(readFileSync(resolve(args.draft), 'utf8'));
  } catch (err) {
    fail(2, `cannot read draft ${args.draft}: ${(err as Error).message}`);
  }
  let privatePem: string;
  try {
    privatePem = readFileSync(resolve(args.key), 'utf8');
    const key = createPrivateKey(privatePem);
    if (key.asymmetricKeyType !== 'ed25519') fail(2, `${args.key} is not an Ed25519 key`);
  } catch (err) {
    fail(2, `cannot read key ${args.key}: ${(err as Error).message}`);
  }

  const now = new Date().toISOString();
  const run = { ...((draft.run as Record<string, unknown>) ?? {}) } as Record<string, unknown>;
  run.id ??= `run_${Date.now().toString(36)}`;
  run.startedAt ??= now;
  run.endedAt ??= now;

  const subjectDraft = (draft.subject as Record<string, unknown>) ?? {};
  let subject: RunReceipt['subject'];
  if (typeof subjectDraft.path === 'string') {
    const subjectPath = resolve(subjectDraft.path);
    if (!existsSync(subjectPath)) fail(2, `subject.path not found: ${subjectPath}`);
    subject = { name: String(subjectDraft.name ?? subjectDraft.path), digest: { sha256: sha256Hex(readFileSync(subjectPath)) } };
  } else {
    subject = subjectDraft as RunReceipt['subject'];
  }

  const stages = (draft.stages as RunReceipt['stages']) ?? [];
  const decisions = ((draft.decisions as RunReceipt['decisions']) ?? []).map((d) => ({ ...d, at: d.at ?? now }));
  const receipt: RunReceipt = {
    schema: RUN_RECEIPT_SCHEMA,
    receiptId: newReceiptId(),
    issuedAt: now,
    issuer: { name: args.issuer ?? (typeof draft.issuer === 'string' ? draft.issuer : 'Starlight Intelligence System') },
    run: run as RunReceipt['run'],
    subject,
    stages,
    totals: (draft.totals as RunReceipt['totals']) ?? totalsFromStages(stages),
    decisions,
    evidence: (draft.evidence as RunReceipt['evidence']) ?? [],
    verdict: (draft.verdict as RunReceipt['verdict']) ?? verdictFromStages(stages),
  };
  const problems = receiptProblems(receipt);
  if (problems.length > 0) fail(1, `receipt is incomplete:\n  - ${problems.join('\n  - ')}`);

  const publicPem = createPublicKey(createPrivateKey(privatePem)).export({ type: 'spki', format: 'pem' }) as string;
  const keyid = keyIdOf(publicPem);
  const envelope = signRunReceipt({ ...receipt, issuer: { ...receipt.issuer, keyid } }, privatePem);
  const check = verifyRunReceipt(envelope, [publicPem]);
  if (!check.ok) fail(1, `self-check failed: ${check.reasons.join('; ')}`);

  const origin = (args.origin ?? SHARE_ORIGIN).replace(/\/$/, '');
  const shareUrl = receiptShareUrl(envelope, origin);
  let qr: { path: string; size: number } | null = null;
  try {
    qr = shareUrl.length <= QR_MAX_CHARS ? qrSvgPath(shareUrl, 'M') : null;
  } catch {
    qr = null;
  }

  const outDir = resolve(args.out ?? join(REPO_ROOT, '.starlight', 'receipts'));
  mkdirSync(outDir, { recursive: true });
  const base = join(outDir, receipt.receiptId);
  writeFileSync(`${base}.envelope.json`, JSON.stringify(envelope, null, 2) + '\n');
  writeFileSync(`${base}.share.txt`, `${shareUrl}\n`);
  writeFileSync(`${base}.card.html`, cardHtml(check.receipt ?? receipt, keyid, shareUrl, qr));

  if (args.ledger) {
    const write = appendReceiptEnvelope(REPO_ROOT, { kind: 'signed', receiptId: receipt.receiptId, keyid, envelope, appendedAt: now });
    if (!write.ok) fail(1, `ledger append failed: ${write.error}`);
  }

  console.log(`  receipt      ${receipt.receiptId}  ${receipt.verdict}  ${euros(receipt.totals.costEur)}  ${(receipt.totals.latencyMs / 1000).toFixed(1)} s`);
  console.log(`  keyid        ${keyid}`);
  console.log(`  envelope     ${base}.envelope.json`);
  console.log(`  card         ${base}.card.html  (print: A5, QR 64 mm${qr ? `, version ${(qr.size - 17) / 4}` : ', none: link too long'})`);
  console.log(`  share link   ${shareUrl.length} chars, ${shareUrl.startsWith(`${origin}/verify?r=z:`) ? 'compact' : 'plain'}`);
  console.log(`               ${shareUrl}`);
  if (args.ledger) console.log(`  ledger       memory/_audit/receipts.jsonl`);
  return 0;
}

process.exit(main(process.argv.slice(2)));
