import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { RetrievalIndex } from '../src/retrieval.js';

test('scoped recall includes company memories and only the requested unit', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'sis-scoped-recall-'));
  const index = new RetrievalIndex(join(dir, 'index.sqlite'));
  const createdAt = '2026-10-03T00:00:00.000Z';

  try {
    index.indexEntry({
      id: 'company-row',
      vault: 'strategic',
      content: 'Shared launch plan for the company.',
      category: 'context',
      tags: ['company'],
      createdAt,
    });
    index.indexEntry({
      id: 'gencreator-row',
      vault: 'strategic',
      content: 'Launch plan for GenCreator.',
      category: 'claim',
      tags: ['unit:gencreator'],
      createdAt,
    });
    index.indexEntry({
      id: 'arcanea-row',
      vault: 'strategic',
      content: 'Launch plan for Arcanea.',
      category: 'context',
      tags: ['unit:arcanea'],
      createdAt,
    });

    const lexical = index.search('launch plan', { scope: 'unit:gencreator' });
    assert.deepEqual(
      new Set(lexical.map(result => result.entry.id)),
      new Set(['company-row', 'gencreator-row']),
    );
    assert.equal(
      lexical.find(result => result.entry.id === 'gencreator-row')?.entry.category,
      'claim',
    );

    await index.buildVectorIndex();
    const hybrid = await index.hybridSearch('launch plan', {
      scope: 'unit:gencreator',
      limit: 2,
    });
    assert.deepEqual(
      new Set(hybrid.map(result => result.entry.id)),
      new Set(['company-row', 'gencreator-row']),
    );
    assert.equal(
      hybrid.find(result => result.entry.id === 'gencreator-row')?.entry.category,
      'claim',
    );
  } finally {
    index.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('hybrid scope is applied before the top slice', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'sis-scoped-recall-slice-'));
  const index = new RetrievalIndex(join(dir, 'index.sqlite'));
  const createdAt = '2026-10-03T00:00:00.000Z';

  try {
    // Eight closer Arcanea rows would fill a slice-then-filter window of 6
    // and drop the claim. Filtering first keeps the claim.
    for (let i = 0; i < 8; i++) {
      index.indexEntry({
        id: `arcanea-${i}`,
        vault: 'strategic',
        content: 'launch plan',
        category: 'context',
        confidence: 'high',
        tags: ['unit:arcanea'],
        createdAt,
      });
    }
    index.indexEntry({
      id: 'gencreator-claim',
      vault: 'strategic',
      content: 'launch plan notes',
      category: 'claim',
      confidence: 'low',
      tags: ['unit:gencreator'],
      createdAt,
    });

    await index.buildVectorIndex();
    const hybrid = await index.hybridSearch('launch plan', {
      scope: 'unit:gencreator',
      minConfidence: 'high',
      limit: 1,
      rrfWeights: [1, 0],
    });

    assert.deepEqual(hybrid.map(result => result.entry.id), ['gencreator-claim']);
    assert.equal(hybrid[0]?.entry.category, 'claim');
  } finally {
    index.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
