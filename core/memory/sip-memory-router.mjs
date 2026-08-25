#!/usr/bin/env node
/**
 * Starlight Intelligence Protocol (SIP) — Sovereign Memory Router
 * Canonical Location: Starlight-Intelligence-System/core/memory/sip-memory-router.mjs
 * 
 * High-performance, local-first, zero-cloud memory router and trajectory indexer.
 * Operates offline with deterministic sub-50ms retrieval over local JSONL / markdown graphs.
 * 
 * Standard: August 2026 Sovereign AI Architecture
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Estate memory paths
const REPO_ROOT = path.resolve(__dirname, '../..');
const LOCAL_STARLIGHT_DIR = path.join(process.env.USERPROFILE || process.env.HOME || '.', '.starlight');
const MEMORY_VAULT_DIR = path.join(REPO_ROOT, 'memory', 'indices');
const PRIVATE_MEMORY_DIR = path.join(LOCAL_STARLIGHT_DIR, 'memory');

/**
 * Ensure required directories exist
 */
function ensureDirectories() {
  for (const dir of [MEMORY_VAULT_DIR, PRIVATE_MEMORY_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Hash a string deterministically
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Memory Node Schema (SIP v2.6)
 */
export class MemoryNode {
  constructor({ id, type, source, title, content, tags = [], context = {}, timestamp = new Date().toISOString() }) {
    this.id = id || `mem-${hashContent(title + content + timestamp)}`;
    this.type = type; // 'decision' | 'trajectory' | 'canon' | 'architecture' | 'learning'
    this.source = source; // agent harness or repo path
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.context = context;
    this.timestamp = timestamp;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      source: this.source,
      title: this.title,
      content: this.content,
      tags: this.tags,
      context: this.context,
      timestamp: this.timestamp
    };
  }
}

/**
 * Memory Router Engine
 */
export class SIPMemoryRouter {
  constructor(options = {}) {
    ensureDirectories();
    this.storagePath = options.storagePath || path.join(PRIVATE_MEMORY_DIR, 'sip-memory-index.jsonl');
    this.nodes = new Map();
    this.loadIndex();
  }

  loadIndex() {
    if (!fs.existsSync(this.storagePath)) {
      fs.writeFileSync(this.storagePath, '', 'utf8');
      return;
    }

    const lines = fs.readFileSync(this.storagePath, 'utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        this.nodes.set(data.id, data);
      } catch (err) {
        // Skip malformed lines
      }
    }
  }

  remember(node) {
    const memoryNode = node instanceof MemoryNode ? node : new MemoryNode(node);
    this.nodes.set(memoryNode.id, memoryNode.toJSON());
    fs.appendFileSync(this.storagePath, JSON.stringify(memoryNode.toJSON()) + '\n', 'utf8');
    return memoryNode;
  }

  query(keyword, options = {}) {
    const startTime = performance.now();
    const queryTerm = keyword.toLowerCase();
    const results = [];

    for (const node of this.nodes.values()) {
      let score = 0;
      if (node.title && node.title.toLowerCase().includes(queryTerm)) score += 10;
      if (node.tags && node.tags.some(t => t.toLowerCase().includes(queryTerm))) score += 5;
      if (node.content && node.content.toLowerCase().includes(queryTerm)) score += 2;

      if (options.type && node.type !== options.type) continue;

      if (score > 0) {
        results.push({ node, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      query: keyword,
      count: results.length,
      latencyMs,
      results: results.slice(0, options.limit || 20).map(r => r.node)
    };
  }

  stats() {
    const typeDistribution = {};
    for (const node of this.nodes.values()) {
      typeDistribution[node.type] = (typeDistribution[node.type] || 0) + 1;
    }

    return {
      totalNodes: this.nodes.size,
      storagePath: this.storagePath,
      typeDistribution,
      status: 'operational',
      protocolVersion: 'SIP-2026.08'
    };
  }
}

// CLI Execution Support
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const router = new SIPMemoryRouter();
  const args = process.argv.slice(2);

  if (args.includes('--stats') || args.length === 0) {
    console.log(JSON.stringify(router.stats(), null, 2));
  } else if (args[0] === '--query' && args[1]) {
    const res = router.query(args[1]);
    console.log(`[SIP Memory Router] Query: "${args[1]}" found ${res.count} items in ${res.latencyMs}ms:`);
    console.log(JSON.stringify(res.results, null, 2));
  } else if (args[0] === '--remember') {
    const title = args[1] || 'Agent Memory Node';
    const content = args[2] || 'Default content';
    const type = args[3] || 'trajectory';
    const node = router.remember({ title, content, type, source: 'cli' });
    console.log(`[SIP Memory Router] Stored node: ${node.id}`);
  }
}
