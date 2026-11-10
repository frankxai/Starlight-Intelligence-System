/**
 * Starlight Genius Core Architecture — Types
 *
 * Implements the core type definitions for Genius Profiling,
 * Freedom Path evaluation (Keep / Delegate / Automate / Eliminate),
 * and multi-teammate delegation planning.
 *
 * Attestation: Built on SIP § 5.7 — Sovereign Genius Grounding
 */

export type GeniusQuadrant = "architect" | "composer" | "builder" | "gencreator";

export type FreedomPathAction = "keep" | "delegate" | "automate" | "eliminate";

export interface GeniusQuadrantProfile {
  title: string;
  focus: string;
  coreDomains: string[];
  signatureMoves: string[];
}

export interface GeniusVoiceSignature {
  tone: string;
  vibe: string;
  mission: string;
  principles: string[];
  keyVocabulary: string[];
}

export interface GeniusProfile {
  name: string;
  archetype: string;
  formula: string;
  quadrants: Record<GeniusQuadrant, GeniusQuadrantProfile>;
  cognitiveSuperpowers: string[];
  nonWaivableInvariants: string[];
  flowTriggers: string[];
  antiPatterns: string[];
  voiceSignature: GeniusVoiceSignature;
  evaluationCriteria: string;
}

export interface FreedomPathEvaluation {
  action: FreedomPathAction;
  taskDescription: string;
  confidence: number;
  rationale: string;
  primaryQuadrant?: GeniusQuadrant;
  suggestedTeammate?: string;
  suggestedAutomation?: string;
  eliminationReason?: string;
}

export interface TaskDecomposition {
  id: string;
  title: string;
  description: string;
  assignedTeammate: string;
  teammateRole: string;
  recommendedModelTier: "light" | "standard" | "frontier";
  recommendedModel: string;
  action: FreedomPathAction;
  rationale: string;
  verificationCriteria?: string;
  dependencies?: string[];
}

export interface DelegationPlan {
  id: string;
  originalTask: string;
  primaryIntent: string;
  coordinatingTeammate: string;
  coordinatingModel: string;
  subtasks: TaskDecomposition[];
  estimatedGovernanceGates?: string[];
  timestamp: string;
}
