import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeWhitespace,
  unwrapGoogleRedirect,
  processInlineFormatting,
  convertHtmlTableToMarkdown,
  convertGDocHtmlToMarkdown,
} from '../tools/ingestion/gdoc-converter.js';
import { classifyVault, extractHeadings } from '../tools/ingestion/metadata-enricher.js';
import { enrichMetadata } from '../tools/ingestion/metadata-enricher.js';

describe('Local document recovery regressions', () => {
  test('preserves encoded markup and backticks inside exported code', () => {
    const result = convertGDocHtmlToMarkdown('<pre>&lt;Widget&gt;\n```example\n&lt;/Widget&gt;</pre>', { prependFrontmatter: false });
    assert.ok(result.markdown.includes('<Widget>'));
    assert.ok(result.markdown.includes('</Widget>'));
    assert.match(result.markdown, /^`{4,}text\n/);
  });
  test('does not decode an already-decoded redirect target twice', () => {
    const target = 'https://example.com/a%2Fb?value=%25';
    assert.equal(unwrapGoogleRedirect('https://www.google.com/url?q=' + encodeURIComponent(target)), target);
    const lookalike = 'https://evil.example/google.com/url?q=https://other.example';
    assert.equal(unwrapGoogleRedirect(lookalike), lookalike);
  });
  test('drops active link schemes and preserves the label', () => {
    assert.equal(processInlineFormatting('<a href="javascript:alert(1)">Read this</a>'), 'Read this');
    assert.equal(processInlineFormatting('<a href="java&#x73;cript:alert(1)">Read this</a>'), 'Read this');
  });
  test('keeps the subtitle distinct from the document title', () => {
    const result = convertGDocHtmlToMarkdown('<p class="subtitle">Source notes</p>', { prependFrontmatter: false });
    assert.equal(result.markdown.trim(), '> *Source notes*');
  });
  test('preserves meaningful Unicode joiners', () => {
    assert.equal(sanitizeWhitespace('👩\u200d💻'), '👩\u200d💻');
  });
  test('does not invent authorship or infer certainty from no evidence', () => {
    const metadata = enrichMetadata('An ordinary sentence.');
    assert.equal(metadata.author, undefined);
    assert.equal(classifyVault('An ordinary sentence.').confidence, 0);
  });
  test('ignores headings inside fenced source code', () => {
    assert.deepEqual(extractHeadings('```sh\n# not a title\n```\n## Real heading').map(h => h.text), ['Real heading']);
  });
  test('preserves inline markup, literal placeholder text and replacement tokens', () => {
    const result = convertGDocHtmlToMarkdown('<p>__STARLIGHT_CODE_BLOCK_0__</p><code>&lt;Widget&gt;</code><pre>    $&\n\n\n$1</pre>', { prependFrontmatter: false });
    assert.ok(result.markdown.includes('__STARLIGHT_CODE_BLOCK_0__'));
    assert.ok(result.markdown.includes('`<Widget>`'));
    assert.ok(result.markdown.includes('    $&\n\n\n$1'));
  });
  test('encoded HTML remains inert in prose', () => {
    const result = convertGDocHtmlToMarkdown('<p>&lt;script&gt;example&lt;/script&gt;</p>', { prependFrontmatter: false });
    assert.ok(!result.markdown.includes('<script>'));
    assert.ok(result.markdown.includes('\\<script\\>'));
  });
});

describe('Google Docs & Drive Markdown Ingestion Converter', () => {
  test('sanitizeWhitespace strips zero-width chars and normalizes newlines', () => {
    const dirty = 'Hello\u200B\uFEFF World\u00A0!\r\nLine 2\rLine 3';
    const clean = sanitizeWhitespace(dirty);
    assert.equal(clean, 'Hello World !\nLine 2\nLine 3');
  });

  test('unwrapGoogleRedirect decodes target URL', () => {
    const googleUrl = 'https://www.google.com/url?q=https%3A%2F%2Fgithub.com%2Ffrankxai%2Farcanea&sa=D&sntz=1';
    const clean = unwrapGoogleRedirect(googleUrl);
    assert.equal(clean, 'https://github.com/frankxai/arcanea');
  });

  test('processInlineFormatting handles bold, italic, code, and links', () => {
    const html = 'This is <b>bold</b> and <i>italic</i> and <code>console.log()</code> and <a href="https://example.com">Link</a>';
    const md = processInlineFormatting(html);
    assert.equal(md, 'This is **bold** and *italic* and `console.log()` and [Link](https://example.com)');
  });

  test('convertHtmlTableToMarkdown creates clean GFM pipe table', () => {
    const tableHtml = `
      <table>
        <tr><th>Header A</th><th>Header B</th></tr>
        <tr><td>Cell 1</td><td>Cell 2</td></tr>
        <tr><td>Cell 3</td><td>Cell 4 | with pipe</td></tr>
      </table>
    `;
    const mdTable = convertHtmlTableToMarkdown(tableHtml);
    assert.ok(mdTable.includes('| Header A | Header B |'));
    assert.ok(mdTable.includes('| --- | --- |'));
    assert.ok(mdTable.includes('| Cell 1 | Cell 2 |'));
    assert.ok(mdTable.includes('Cell 4 \\| with pipe'));
  });

  test('convertGDocHtmlToMarkdown converts complete GDoc export with frontmatter', () => {
    const fullHtml = `
      <html>
        <head><title>System Architecture Guide</title></head>
        <body>
          <p class="title">Autonomous Swarm Architecture</p>
          <p class="subtitle">Next-Generation Cognitive Substrate</p>
          <h2>Core Principles</h2>
          <p>Every autonomous system must fail closed on security and maintain strict data sovereignty.</p>
          <pre>const mesh = new CognitiveMesh({ tier: 1 });</pre>
          <table>
            <tr><th>Tier</th><th>Role</th></tr>
            <tr><td>Tier 0</td><td>Sovereign Git Truth</td></tr>
            <tr><td>Tier 1</td><td>Local Swarm Memory</td></tr>
          </table>
          <p>See documentation at <a href="https://www.google.com/url?q=https%3A%2F%2Farcanea.ai%2Fdocs&sa=D">Arcanea Docs</a>.</p>
        </body>
      </html>
    `;

    const res = convertGDocHtmlToMarkdown(fullHtml, {
      prependFrontmatter: true,
      documentTitle: 'Autonomous Swarm Architecture',
    });

    assert.ok(res.markdown.startsWith('---'));
    assert.ok(res.markdown.includes('title: "Autonomous Swarm Architecture"'));
    assert.ok(res.markdown.includes('vault: technical') || res.markdown.includes('vault: strategic'));
    assert.ok(res.markdown.includes('# Autonomous Swarm Architecture'));
    assert.ok(res.markdown.includes('## Core Principles'));
    assert.ok(res.markdown.includes('```text\nconst mesh = new CognitiveMesh({ tier: 1 });\n```'));
    assert.ok(res.markdown.includes('| Tier | Role |'));
    assert.ok(res.markdown.includes('[Arcanea Docs](https://arcanea.ai/docs)'));
  });

  test('classifyVault accurately routes content', () => {
    const techText = 'We deploy typescript api schemas and sqlite vector benchmarks to cloudflare workers';
    const c1 = classifyVault(techText);
    assert.equal(c1.vault, 'technical');

    const stratText = 'Our multi-tier monetization roadmap aligns with the strategic brand architecture';
    const c2 = classifyVault(stratText);
    assert.equal(c2.vault, 'strategic');
  });
});
