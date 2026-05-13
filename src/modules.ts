/**
 * SIS module registry v0.2 scaffold.
 *
 * Module definitions are code-canonical for now; enablement state is local
 * runtime state under memory/_audit so a clone can rebuild cleanly without
 * inheriting Frank's private operational toggles.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface IntelligenceModuleDefinition {
  id: string;
  name: string;
  kind: 'core' | 'universal-is' | 'domain-stack' | 'private-module' | 'future-module';
  description: string;
  defaultEnabled: boolean;
  dashboardViews: string[];
  permissions: string[];
}

export interface IntelligenceModuleState {
  enabled?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IntelligenceModule extends IntelligenceModuleDefinition {
  enabled: boolean;
  stateUpdatedAt?: string;
  stateUpdatedBy?: string;
}

const MODULES: IntelligenceModuleDefinition[] = [
  {
    id: 'code-is',
    name: 'Code Intelligence System',
    kind: 'universal-is',
    description: 'Repo context, coding agents, reviews, audits, harnesses, and implementation packets.',
    defaultEnabled: true,
    dashboardViews: ['mission-control', 'code-intelligence', 'tooling'],
    permissions: ['repo:read', 'repo:write-local'],
  },
  {
    id: 'second-brain-is',
    name: 'Second Brain Intelligence System',
    kind: 'universal-is',
    description: 'Notes, references, summaries, personal knowledge graph, and recall workflows.',
    defaultEnabled: true,
    dashboardViews: ['brain', 'vaults'],
    permissions: ['memory:read', 'memory:write'],
  },
  {
    id: 'business-is',
    name: 'Business Intelligence System',
    kind: 'universal-is',
    description: 'Company brain sprint, offers, operations, entities, revenue, and execution state.',
    defaultEnabled: true,
    dashboardViews: ['mission-control', 'decisions'],
    permissions: ['business:read', 'business:write-local'],
  },
  {
    id: 'wealth-is',
    name: 'Wealth Intelligence System',
    kind: 'universal-is',
    description: 'Finance, cost plane, revenue snapshots, budgets, and decision-grade money telemetry.',
    defaultEnabled: true,
    dashboardViews: ['tooling', 'decisions'],
    permissions: ['finance:read-local'],
  },
  {
    id: 'voice-video-is',
    name: 'Voice and Video Intelligence System',
    kind: 'universal-is',
    description: 'Voice Operator, command packets, recording plans, and media workflow support.',
    defaultEnabled: true,
    dashboardViews: ['mission-control', 'tooling'],
    permissions: ['voice:manual-activate'],
  },
  {
    id: 'people-is',
    name: 'People Intelligence System',
    kind: 'domain-stack',
    description: 'Hiring, performance, training, culture, talent, and organization sub-stack.',
    defaultEnabled: false,
    dashboardViews: ['packs', 'decisions'],
    permissions: ['people:private-records'],
  },
  {
    id: 'music-is',
    name: 'Music Intelligence System',
    kind: 'domain-stack',
    description: 'A&R, persona, production, distribution, royalties, and music-stack operations.',
    defaultEnabled: false,
    dashboardViews: ['packs'],
    permissions: ['creative:read', 'creative:write-local'],
  },
  {
    id: 'sound-is',
    name: 'Sound Intelligence System',
    kind: 'domain-stack',
    description: 'Composition, production, catalog, performance, audience, and sync workflows.',
    defaultEnabled: false,
    dashboardViews: ['packs'],
    permissions: ['creative:read', 'creative:write-local'],
  },
  {
    id: 'mis',
    name: 'Manifestation Intelligence System',
    kind: 'private-module',
    description: 'Daily ritual, gratitude, surrender, aligned action, evidence, outcome, and proof loops.',
    defaultEnabled: false,
    dashboardViews: ['vaults'],
    permissions: ['vault:private'],
  },
  {
    id: 'ris',
    name: 'Reality Intelligence System',
    kind: 'private-module',
    description: 'Attention, identity, environment, belief, action, and outcome experiments.',
    defaultEnabled: false,
    dashboardViews: ['vaults', 'brain'],
    permissions: ['vault:private'],
  },
  {
    id: 'sensory-companion',
    name: 'Sensory Companion',
    kind: 'future-module',
    description: 'Explicitly activated camera, microphone, screen, mood, and observation session scaffolds.',
    defaultEnabled: false,
    dashboardViews: ['tooling'],
    permissions: ['sensory:explicit-activation-only'],
  },
];

function statePath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'module-state.json');
}

function readState(repoRoot: string): Record<string, IntelligenceModuleState> {
  const path = statePath(repoRoot);
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, IntelligenceModuleState>;
  } catch {
    return {};
  }
}

function writeState(repoRoot: string, state: Record<string, IntelligenceModuleState>): void {
  const path = statePath(repoRoot);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

export function listModules(repoRoot: string): IntelligenceModule[] {
  const state = readState(repoRoot);
  return MODULES.map((mod) => ({
    ...mod,
    enabled: state[mod.id]?.enabled ?? mod.defaultEnabled,
    stateUpdatedAt: state[mod.id]?.updatedAt,
    stateUpdatedBy: state[mod.id]?.updatedBy,
  }));
}

/**
 * Permissions that require explicit acknowledgement before a module
 * can be enabled. Mirrors the sis.pack.install permissions_acked contract
 * from src/mcp-server-v01.ts so the substrate has one unified surface for
 * privacy-scoped consent.
 *
 * Catches IMPORTANT [82%] finding from code-review on 6f9703c: prior version
 * of setModuleEnabled silently flipped private-module entries on, breaking
 * the privacy substrate invariant.
 */
const PRIVACY_SCOPED_PERMISSIONS: ReadonlySet<string> = new Set([
  'vault:private',
  'sensory:explicit-activation-only',
  'people:private-records',
]);

const ACKNOWLEDGEMENT_REQUIRED_KINDS: ReadonlySet<IntelligenceModuleDefinition['kind']> = new Set([
  'private-module',
  'future-module',
]);

export class ModuleAcknowledgementRequiredError extends Error {
  readonly moduleId: string;
  readonly requiredPermissions: readonly string[];
  constructor(moduleId: string, requiredPermissions: readonly string[]) {
    super(
      `Module ${moduleId} requires explicit permissions_acked: true to enable ` +
        `(privacy-scoped permissions: ${requiredPermissions.join(', ') || '<kind-default>'})`,
    );
    this.name = 'ModuleAcknowledgementRequiredError';
    this.moduleId = moduleId;
    this.requiredPermissions = requiredPermissions;
  }
}

export interface SetModuleEnabledOptions {
  permissionsAcked?: boolean;
  updatedBy?: string;
}

export function setModuleEnabled(
  repoRoot: string,
  id: string,
  enabled: boolean,
  optionsOrUpdatedBy: SetModuleEnabledOptions | string = {},
): IntelligenceModule {
  // Backwards-compat: prior signature took `updatedBy` as 4th positional arg.
  const options: SetModuleEnabledOptions =
    typeof optionsOrUpdatedBy === 'string'
      ? { updatedBy: optionsOrUpdatedBy }
      : optionsOrUpdatedBy;
  const updatedBy = options.updatedBy ?? 'starlight-cli';

  const def = MODULES.find((mod) => mod.id === id);
  if (!def) {
    throw new Error(`Unknown module: ${id}`);
  }

  // Privacy gate: enabling a module with privacy-scoped permissions OR
  // private-module/future-module kind requires explicit ack. Disabling is
  // always permitted (turning OFF a private surface is always safe).
  if (enabled) {
    const privacyPerms = def.permissions.filter((p) =>
      PRIVACY_SCOPED_PERMISSIONS.has(p),
    );
    const kindRequiresAck = ACKNOWLEDGEMENT_REQUIRED_KINDS.has(def.kind);
    if ((privacyPerms.length > 0 || kindRequiresAck) && options.permissionsAcked !== true) {
      throw new ModuleAcknowledgementRequiredError(id, privacyPerms);
    }
  }

  const state = readState(repoRoot);
  state[id] = {
    enabled,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  writeState(repoRoot, state);
  return listModules(repoRoot).find((mod) => mod.id === id)!;
}

