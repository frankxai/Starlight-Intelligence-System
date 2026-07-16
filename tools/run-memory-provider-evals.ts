#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  HindsightProvider,
  HonchoProvider,
  InMemoryLocalCoreProvider,
  runMemoryProviderEval,
  type HindsightClient,
  type HindsightRecallInput,
  type HindsightRetainInput,
  type HonchoClient,
  type HonchoObservationInput,
  type HonchoSearchInput,
  type ProviderEvalFixture,
  type ProviderEvalResult,
} from '../src/memory-provider/index.js';

async function main(): Promise<void> {
  const fixturePath = resolve(process.cwd(), 'evals', 'memory', 'provider-contract.v1.json');
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8')) as ProviderEvalFixture;
  const requested = readProviderArg(process.argv.slice(2));
  const results: ProviderEvalResult[] = [];

  if (requested === 'all' || requested === 'local_core') {
    results.push(await runMemoryProviderEval(new InMemoryLocalCoreProvider(), fixture, {
      candidate: 'sis-local-core',
      execution_mode: 'local_engine',
      fixture_path: fixturePath,
    }));
  }

  if (requested === 'all' || requested === 'hindsight-contract') {
    results.push(await runMemoryProviderEval(
      new HindsightProvider({ client: new ContractHindsightClient() }),
      fixture,
      {
        candidate: 'hindsight-adapter-contract',
        execution_mode: 'adapter_contract',
        fixture_path: fixturePath,
      },
    ));
  }

  if (requested === 'all' || requested === 'honcho-contract') {
    results.push(await runMemoryProviderEval(
      new HonchoProvider({ client: new ContractHonchoClient() }),
      fixture,
      {
        candidate: 'honcho-adapter-contract',
        execution_mode: 'adapter_contract',
        fixture_path: fixturePath,
      },
    ));
  }

  if (results.length === 0) throw new Error(`Unknown --provider value: ${requested}`);

  process.stdout.write(JSON.stringify({
    schema: 'sis.memory.provider_eval_suite.v1',
    evaluated_at: new Date().toISOString(),
    comparison_policy: 'Only live_provider results on the same quality-eligible fixture may be used for native vendor ranking.',
    results,
  }, null, 2) + '\n');
}

function readProviderArg(args: string[]): string {
  const index = args.indexOf('--provider');
  return index >= 0 ? args[index + 1] ?? 'all' : 'all';
}

interface StoredHindsight {
  id: string;
  bankId: string;
  documentId: string;
  content: string;
  metadata: Record<string, unknown>;
}

class ContractHindsightClient implements HindsightClient {
  private rows: StoredHindsight[] = [];

  async retain(input: HindsightRetainInput): Promise<{ id: string; document_id: string }> {
    const id = `contract_hindsight_${this.rows.length + 1}`;
    this.rows.push({
      id,
      bankId: input.bank_id,
      documentId: input.document_id,
      content: input.content,
      metadata: input.metadata,
    });
    return { id, document_id: input.document_id };
  }

  async recall(input: HindsightRecallInput) {
    return this.rows
      .filter(row => row.bankId === input.bank_id)
      .filter(row => matchesFilters(row.metadata, input.filters))
      .map(row => ({ row, score: lexicalScore(input.query, row.content) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, input.top_k)
      .map(({ row, score }) => ({
        id: row.id,
        text: row.content,
        score,
        document_id: row.documentId,
        metadata: row.metadata,
      }));
  }

  async deleteDocument(input: { bank_id: string; document_id: string }): Promise<boolean> {
    const before = this.rows.length;
    this.rows = this.rows.filter(row => !(row.bankId === input.bank_id && row.documentId === input.document_id));
    return this.rows.length < before;
  }
}

interface StoredHoncho {
  id: string;
  workspaceId: string;
  peerId: string;
  sessionId: string;
  content: string;
  metadata: Record<string, unknown>;
}

class ContractHonchoClient implements HonchoClient {
  private rows: StoredHoncho[] = [];

  async addObservation(input: HonchoObservationInput): Promise<{ id: string }> {
    const id = `contract_honcho_${this.rows.length + 1}`;
    this.rows.push({
      id,
      workspaceId: input.workspace_id,
      peerId: input.peer_id,
      sessionId: input.session_id,
      content: input.content,
      metadata: input.metadata,
    });
    return { id };
  }

  async searchObservations(input: HonchoSearchInput) {
    return this.rows
      .filter(row => row.workspaceId === input.workspace_id && row.peerId === input.peer_id)
      .filter(row => input.session_id == null || row.sessionId === input.session_id)
      .map(row => ({ row, score: lexicalScore(input.query, row.content) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, input.limit)
      .map(({ row, score }) => ({ id: row.id, text: row.content, score, metadata: row.metadata }));
  }

  async deleteObservation(input: { workspace_id: string; observation_id: string }): Promise<boolean> {
    const before = this.rows.length;
    this.rows = this.rows.filter(row => !(row.workspaceId === input.workspace_id && row.id === input.observation_id));
    return this.rows.length < before;
  }
}

function matchesFilters(metadata: Record<string, unknown>, filters?: Record<string, unknown>): boolean {
  if (!filters) return true;
  return Object.entries(filters).every(([key, value]) => metadata[key] === value);
}

function lexicalScore(query: string, content: string): number {
  const terms = tokenize(query);
  if (terms.length === 0) return 0;
  const haystack = new Set(tokenize(content));
  return Number((terms.filter(term => haystack.has(term)).length / terms.length).toFixed(6));
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(term => term.length > 2);
}

await main();
