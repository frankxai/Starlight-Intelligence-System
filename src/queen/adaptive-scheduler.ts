/**
 * Starlight Queen — Adaptive Micro-Lane Scheduler & Task Auto-Healing Engine
 *
 * Provides intelligent, memory-bounded task scheduling across 3 adaptive tiers:
 *   1. Micro-Lane (< 150 MB footprint): Runs even under memory pressure (< 1.8 GiB RAM).
 *      Performs schema repair, self-contained prompt synthesis, ledger reconciliation,
 *      and dreaming consolidation without heavy model child processes.
 *   2. Medium-Lane (150 MB - 500 MB footprint): Runs at 1.8 - 4.0 GiB RAM.
 *      Executes serial single-agent tasks safely without risking host OOM.
 *   3. High-Lane (> 1 GB footprint): Runs when RAM >= 4.0 GiB.
 *      Dispatches full parallel swarms, browser automation, and compiler builds.
 *
 * Also provides automated card healing for held Queen inbox tasks:
 *   - Repairs cards lacking self-contained prompts by synthesizing `what` + `why` + `do`.
 *   - Fixes omitted agent and child repository targets to protect placement gates.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { freemem, totalmem, homedir } from 'node:os';

export type AdaptiveLaneTier = 'micro' | 'medium' | 'high';

export interface AdaptiveLaneStatus {
  freeRamGiB: number;
  totalRamGiB: number;
  freeRamRatio: number;
  currentLane: AdaptiveLaneTier;
  maxRecommendedConcurrency: number;
  allowsParallelSwarm: boolean;
  allowsBrowserAutomation: boolean;
  allowsMicroDrain: boolean;
}

export interface HeldCardSummary {
  id: string;
  category: string;
  filePath: string;
  agent?: string;
  repo?: string;
  what?: string;
  why?: string;
  do?: string;
  prompt?: string;
  hasReasonFile: boolean;
  reasonText?: string;
  repairable: boolean;
  repairRationale?: string;
}

export interface HeldQueueInspection {
  estateRoot: string;
  inboxPath: string;
  totalHeld: number;
  categories: Array<{ name: string; count: number }>;
  repairableCount: number;
  cards: HeldCardSummary[];
}

export interface DrainReport {
  timestamp: string;
  laneStatus: AdaptiveLaneStatus;
  scannedCount: number;
  repairedCount: number;
  drainedCount: number;
  remainingHeld: number;
  actions: Array<{
    cardId: string;
    action: 'repaired' | 'promoted-to-inbox' | 'skipped' | 'held-by-agent-policy';
    details: string;
  }>;
}

export class QueenAdaptiveScheduler {
  private readonly estateRoot: string;
  private readonly inboxRoot: string;

  constructor(estateRoot?: string) {
    this.estateRoot = estateRoot || process.env.STARLIGHT_ESTATE_ROOT || join(homedir(), 'starlight');
    this.inboxRoot = join(this.estateRoot, 'queen', 'inbox');
  }

  /**
   * Determine current adaptive lane based on live physical memory.
   */
  public getLaneStatus(): AdaptiveLaneStatus {
    const free = freemem();
    const total = totalmem();
    const freeGiB = Math.round((free / (1024 * 1024 * 1024)) * 10) / 10;
    const totalGiB = Math.round((total / (1024 * 1024 * 1024)) * 10) / 10;
    const ratio = Math.round((free / total) * 100) / 100;

    let currentLane: AdaptiveLaneTier;
    let maxConcurrency = 1;
    let allowsParallel = false;
    let allowsBrowser = false;

    if (freeGiB >= 4.0) {
      currentLane = 'high';
      maxConcurrency = 6;
      allowsParallel = true;
      allowsBrowser = true;
    } else if (freeGiB >= 1.8) {
      currentLane = 'medium';
      maxConcurrency = 2;
      allowsParallel = false;
      allowsBrowser = false;
    } else {
      currentLane = 'micro';
      maxConcurrency = 1;
      allowsParallel = false;
      allowsBrowser = false;
    }

    return {
      freeRamGiB: freeGiB,
      totalRamGiB: totalGiB,
      freeRamRatio: ratio,
      currentLane,
      maxRecommendedConcurrency: maxConcurrency,
      allowsParallelSwarm: allowsParallel,
      allowsBrowserAutomation: allowsBrowser,
      allowsMicroDrain: true,
    };
  }

  /**
   * Inspect all held tasks across Queen inbox `_hold*` directories.
   */
  public inspectHeldQueue(): HeldQueueInspection {
    if (!existsSync(this.inboxRoot)) {
      return {
        estateRoot: this.estateRoot,
        inboxPath: this.inboxRoot,
        totalHeld: 0,
        categories: [],
        repairableCount: 0,
        cards: [],
      };
    }

    const entries = readdirSync(this.inboxRoot, { withFileTypes: true });
    const holdDirs = entries.filter((e) => e.isDirectory() && e.name.startsWith('_hold'));

    const cards: HeldCardSummary[] = [];
    const categories: Array<{ name: string; count: number }> = [];

    for (const d of holdDirs) {
      const dirPath = join(this.inboxRoot, d.name);
      const files = readdirSync(dirPath).filter((f) => f.endsWith('.json') && !f.endsWith('.reason.txt'));
      categories.push({ name: d.name, count: files.length });

      for (const f of files) {
        const fullPath = join(dirPath, f);
        try {
          const raw = JSON.parse(readFileSync(fullPath, 'utf8'));
          const reasonFilePath = fullPath + '.reason.txt';
          const hasReason = existsSync(reasonFilePath);
          const reasonText = hasReason ? readFileSync(reasonFilePath, 'utf8').trim() : undefined;

          let repairable = false;
          let repairRationale = '';

          // Check if card has missing prompt but has what/why/do
          if (!raw.prompt && (raw.what || raw.do)) {
            repairable = true;
            repairRationale = 'Can synthesize prompt from what, why, and do fields.';
          } else if (!raw.agent || !raw.repo) {
            repairable = true;
            repairRationale = 'Can assign default specialist agent and child repo target.';
          }

          cards.push({
            id: raw.id || f.replace('.json', ''),
            category: d.name,
            filePath: fullPath,
            agent: raw.agent,
            repo: raw.repo,
            what: raw.what,
            why: raw.why,
            do: raw.do,
            prompt: raw.prompt,
            hasReasonFile: hasReason,
            reasonText,
            repairable,
            repairRationale,
          });
        } catch {
          // Ignore unparseable files
        }
      }
    }

    const repairableCount = cards.filter((c) => c.repairable).length;

    return {
      estateRoot: this.estateRoot,
      inboxPath: this.inboxRoot,
      totalHeld: cards.length,
      categories,
      repairableCount,
      cards,
    };
  }

  /**
   * Auto-repair a single card content.
   */
  public repairCardContent(cardData: Record<string, any>): { repaired: boolean; changes: string[] } {
    const changes: string[] = [];
    let repaired = false;

    // 1. Synthesize self-contained prompt if missing
    if (!cardData.prompt && (cardData.what || cardData.do)) {
      const parts: string[] = [];
      if (cardData.what) parts.push(`Task: ${cardData.what}`);
      if (cardData.why) parts.push(`\nContext:\n${cardData.why}`);
      if (cardData.do) parts.push(`\nExecution:\n${cardData.do}`);
      if (cardData.evidence) parts.push(`\nEvidence Reference:\n${cardData.evidence}`);

      cardData.prompt = parts.join('\n');
      changes.push('Synthesized self-contained prompt from what/why/do/evidence');
      repaired = true;
    }

    // 2. Assign missing agent or repo
    if (!cardData.agent) {
      const taskStr = ((cardData.what || '') + ' ' + (cardData.prompt || '')).toLowerCase();
      if (taskStr.includes('code') || taskStr.includes('refactor') || taskStr.includes('upgrade') || taskStr.includes('test')) {
        cardData.agent = 'codex';
      } else if (taskStr.includes('system') || taskStr.includes('harness') || taskStr.includes('architecture')) {
        cardData.agent = 'antigravity';
      } else {
        cardData.agent = 'claude';
      }
      changes.push(`Assigned default agent: ${cardData.agent}`);
      repaired = true;
    }

    if (!cardData.repo) {
      cardData.repo = 'Starlight-Intelligence-System';
      changes.push('Assigned default child repo: Starlight-Intelligence-System');
      repaired = true;
    }

    return { repaired, changes };
  }

  /**
   * Execute drain of held tasks through the adaptive micro-lane.
   * Promotes auto-repaired admission cards into ready inbox.
   */
  public drainHeldTasks(options: {
    maxTasks?: number;
    dryRun?: boolean;
    autoPromoteAdmissionCards?: boolean;
  } = {}): DrainReport {
    const max = options.maxTasks ?? 10;
    const dryRun = options.dryRun ?? false;
    const autoPromote = options.autoPromoteAdmissionCards ?? true;
    const laneStatus = this.getLaneStatus();

    const inspection = this.inspectHeldQueue();
    const actions: DrainReport['actions'] = [];

    let repairedCount = 0;
    let drainedCount = 0;

    // Filter cards in _hold-admission that are repairable
    const admissionCards = inspection.cards.filter(
      (c) => c.category === '_hold-admission' && c.repairable
    );

    for (const card of admissionCards.slice(0, max)) {
      try {
        const raw = JSON.parse(readFileSync(card.filePath, 'utf8'));
        const repairResult = this.repairCardContent(raw);

        if (repairResult.repaired) {
          repairedCount++;

          if (!dryRun) {
            // Write back repaired card
            writeFileSync(card.filePath, JSON.stringify(raw, null, 2) + '\n', 'utf8');

            // If auto-promote is enabled and RAM is at least medium/micro ready
            if (autoPromote) {
              const targetPath = join(this.inboxRoot, `${card.id}.json`);
              renameSync(card.filePath, targetPath);

              // Remove corresponding reason file if present
              const reasonFile = card.filePath + '.reason.txt';
              if (existsSync(reasonFile)) {
                try {
                  unlinkSync(reasonFile);
                } catch {
                  // ignore
                }
              }

              drainedCount++;
              actions.push({
                cardId: card.id,
                action: 'promoted-to-inbox',
                details: `Repaired (${repairResult.changes.join(', ')}) and promoted from ${card.category} to active inbox.`,
              });
            } else {
              actions.push({
                cardId: card.id,
                action: 'repaired',
                details: `Repaired in-place (${repairResult.changes.join(', ')}).`,
              });
            }
          } else {
            actions.push({
              cardId: card.id,
              action: 'repaired',
              details: `[DRY-RUN] Would repair (${repairResult.changes.join(', ')}) and promote to inbox.`,
            });
          }
        }
      } catch (err) {
        actions.push({
          cardId: card.id,
          action: 'skipped',
          details: `Failed to repair: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // Cards in _hold-demand-doors or _hold-frank require Frank human decision/credentials
    const frankGated = inspection.cards.filter(
      (c) => c.category === '_hold-demand-doors' || c.category === '_hold-frank-20261006'
    );
    for (const c of frankGated.slice(0, 3)) {
      actions.push({
        cardId: c.id,
        action: 'held-by-agent-policy',
        details: `Held in ${c.category}: requires Frank credentials/human decision (${c.what || c.id}).`,
      });
    }

    return {
      timestamp: new Date().toISOString(),
      laneStatus,
      scannedCount: inspection.totalHeld,
      repairedCount,
      drainedCount,
      remainingHeld: inspection.totalHeld - drainedCount,
      actions,
    };
  }
}
