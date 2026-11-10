/**
 * Starlight Genius Core Engine
 *
 * Implements the sovereign Genius Profile grounded in Frank's DNA
 * (Systems Architect × Composer × Gamer × Builder × GenCreator),
 * the Freedom Path evaluation engine (keep, delegate, automate, eliminate),
 * and autonomous multi-teammate delegation planning.
 *
 * Attestation: Built on SIP § 5.7 — Sovereign Genius Grounding
 */

import type {
  GeniusProfile,
  FreedomPathEvaluation,
  TaskDecomposition,
  DelegationPlan,
} from "./types.js";

export class StarlightGeniusEngine {
  /**
   * Returns the canonical sovereign Genius Profile.
   */
  public getProfile(): GeniusProfile {
    return this.getFrankGeniusProfile();
  }

  /**
   * Evaluates task against Freedom Path (keep, delegate, automate, eliminate).
   */
  public evaluatePath(taskDescription: string): FreedomPathEvaluation {
    return this.evaluateFreedomPath(taskDescription);
  }

  /**
   * Returns Frank's canonical sovereign Genius Profile.
   * Grounded in: Systems Architect × Composer × Gamer × Builder × GenCreator.
   */
  public getFrankGeniusProfile(): GeniusProfile {
    return {
      name: "Frank Riemer",
      archetype: "Systems Architect × Composer × Gamer × Builder × GenCreator",
      formula: "Systems Architect x Composer x Gamer x Builder x GenCreator",
      quadrants: {
        architect: {
          title: "Systems Architect",
          focus:
            "High-order distributed topologies, sovereign substrate protocols, multi-agent frameworks, and fail-closed security invariants.",
          coreDomains: [
            "Protocol Architecture (SIP and SIS)",
            "Multi-Agent Fleet Topologies",
            "Event-Sourced SQLite Hybrid Storage",
            "Memory Palaces & Cognitive Graphs",
          ],
          signatureMoves: [
            "First-principles substrate design",
            "Fail-closed boundary enforcement",
            "Deep interface design with rich internals",
            "Connect-not-absorb memory bus contracts",
          ],
        },
        composer: {
          title: "Composer & Sonic Alchemist",
          focus:
            "Musical and sonic intelligence, harmonic patterning, aesthetic cadence, emotional resonance, and pattern recognition as poetry.",
          coreDomains: [
            "Music Composition & Production",
            "Harmonic Intelligence",
            "Sound System Design",
            "Aesthetic Cadence & Narrative Flow",
          ],
          signatureMoves: [
            "Pattern recognition as poetry",
            "Harmonic cadence structuring",
            "Voice signature calibration (zero generic slop)",
            "Aesthetic emotional resonance as high intellect",
          ],
        },
        builder: {
          title: "Pragmatic Builder & Operator",
          focus:
            "Empirically validated patterns, surgical code modifications, zero-bloat TypeScript/Rust tooling, and rapid shipping velocity.",
          coreDomains: [
            "TypeScript and Rust Systems Engineering",
            "CLI & Terminal Runtimes",
            "Empirical Sandboxes & Proving Grounds",
            "Local-First Autonomous Tooling",
          ],
          signatureMoves: [
            "Surgical changes: touching only what the task requires",
            "Verification before claiming",
            "Goal-driven test-first bug reproduction",
            "Simple interfaces with zero speculative abstraction",
          ],
        },
        gencreator: {
          title: "Generative Creator & Systems Multiplier",
          focus:
            "AI augmentation toolchains, multiplying sovereign builder agency, converting scattered expertise into reusable engines, and abundance creation.",
          coreDomains: [
            "Autonomous Swarm Orchestration",
            "GenAI Multi-Modal Pipelines",
            "Knowledge Reclamation & Excavation",
            "Sovereign Creator Toolkits",
          ],
          signatureMoves: [
            "Four-bucket Freedom Path sorting (keep, delegate, automate, eliminate)",
            "Excavating repeatable frameworks from scattered corpus",
            "Multiplying human creative leverage 100x",
            "Publishing open sovereign substrates",
          ],
        },
      },
      cognitiveSuperpowers: [
        "Cross-Domain Synthesis: Seamlessly connecting systems architecture, musical harmony, gaming mechanics, and AI agent swarms.",
        "Pattern Recognition as Poetry: Uncovering the structural framework underneath scattered artifacts in ≥3 occurrences.",
        "Sovereign Architecture: Designing local-first, privacy-by-default, fail-closed protocols that liberate operators.",
        "High-Leverage Compression: Boiling complex multi-agent fleets down to elegant, composable, minimal primitives.",
        "Creative-Technical Symbiosis: Merging premium artistic taste with bulletproof software engineering rigor.",
      ],
      nonWaivableInvariants: [
        "Money fails closed: No autonomous money movement or financial transactions without explicit human approval.",
        "Model, never diagnose: Observation stays separate from interpretation in mind and self systems.",
        "Canon locks are read-only to autonomous agents: Promotion requires formal governance protocol.",
        "Never delete, archive, or consolidate a repo, and never delete a registered agent without Frank.",
        "Never rename a working URL or delete a page with active traffic.",
        "Never commit secrets, credentials, API keys, or .env files.",
        "Verify before claiming: State changes and metrics require verified proof or unverified flag.",
      ],
      flowTriggers: [
        "Designing new system architectures or protocols from scratch",
        "Composing and producing music or sonic landscapes",
        "Excavating genius frameworks from complex bodies of work",
        "Building tools that dramatically empower creators and builders",
        "Synthesizing cross-disciplinary breakthroughs (code + music + AI)",
      ],
      antiPatterns: [
        "Speculative abstraction before concrete empirical demand",
        "Manual repetitive tasks that can be scripted or delegated to agents",
        "Bikeshedding low-impact cosmetic choices",
        "Unproductive meetings, calls, or passive consumption without building",
        "Vanity metrics that do not measure actual compounding value",
      ],
      voiceSignature: {
        tone: "Direct, technical, warm, playful.",
        vibe: "Cool, premium, high intellect, purpose-driven, fun.",
        mission: "Build abundance; help people build their own systems.",
        principles: [
          "Think before coding: state assumptions and surface trade-offs.",
          "Explain simply: name the mechanism, never 'streamline' or 'optimize'.",
          "Simplicity and deep design: minimum code that solves the problem.",
          "Surgical changes: touch only what the task requires.",
          "Goal-driven: turn vague asks into verifiable targets.",
        ],
        keyVocabulary: [
          "Substrate",
          "Sovereign",
          "Fail-closed",
          "Attestation",
          "Pattern recognition as poetry",
          "High intellect",
          "Empower builders",
          "Rich internals",
          "Compounding",
        ],
      },
      evaluationCriteria: "Does this help someone build rather than consume?",
    };
  }

  /**
   * Analyzes a task and classifies it into KEEP, DELEGATE, AUTOMATE, or ELIMINATE
   * with explicit rationale anchored in Frank's Genius Profile.
   */
  public evaluateFreedomPath(taskDescription: string): FreedomPathEvaluation {
    const raw = taskDescription.trim();
    const text = raw.toLowerCase();

    // 1. ELIMINATE Check
    const eliminateKeywords = [
      "bikeshed",
      "vanity metric",
      "vanity metrics",
      "doomscroll",
      "unproductive meeting",
      "endless meeting",
      "meeting without agenda",
      "busywork",
      "gossip",
      "passive scroll",
      "pointless",
      "distraction",
      "duplicate manual",
      "manual data entry",
      "low-leverage chore",
      "argue on twitter",
      "argue online",
    ];
    for (const kw of eliminateKeywords) {
      if (text.includes(kw)) {
        return {
          action: "eliminate",
          taskDescription: raw,
          confidence: 0.95,
          rationale: `This task yields zero compounding leverage and fails the core test ("Does this help someone build rather than consume?"). It represents unnecessary friction or distraction.`,
          eliminationReason: `Matches known zero-compound distraction pattern: "${kw}".`,
        };
      }
    }

    // 2. AUTOMATE Check
    const automateKeywords = [
      "ci/cd",
      "cron",
      "rebuild index",
      "shadow index",
      "lint",
      "format code",
      "auto-format",
      "nightly batch",
      "nightly build",
      "scheduled backup",
      "hourly sweep",
      "heartbeat sweep",
      "cache clear",
      "database shadow",
      "sync directory",
      "directory sync",
      "automated test suite",
      "run tests in loop",
      "rebuild sqlite",
    ];
    for (const kw of automateKeywords) {
      if (text.includes(kw)) {
        return {
          action: "automate",
          taskDescription: raw,
          confidence: 0.92,
          rationale: `This task is programmatic, recurring, and deterministic. It should run through background daemons, cron schedules, CI/CD runners, or SAGE autonomic loops.`,
          suggestedAutomation: `Autonomous SAGE or daemon or CI pipeline trigger for pattern "${kw}".`,
        };
      }
    }

    // 3. KEEP Check (Frank's Core Genius Quadrants)
    const keepArchitectKeywords = [
      "architect",
      "sovereign protocol",
      "sip protocol",
      "systems architect",
      "foundational architecture",
      "topology design",
      "fail-closed boundary",
      "security invariant",
      "master contract",
      "core data model",
      "memory substrate design",
    ];
    const keepComposerKeywords = [
      "compose music",
      "music production",
      "harmonic arrangement",
      "album direction",
      "sound design",
      "sonic signature",
      "mastering direction",
      "track melody",
    ];
    const keepGencreatorKeywords = [
      "founder vision",
      "brand philosophy",
      "genius excavation",
      "reclaim knowledge",
      "core thesis",
      "non-waivable decision",
      "first-principles decision",
      "strategic direction",
    ];
    const keepBuilderKeywords = [
      "core engine design",
      "breakthrough prototype",
      "master system",
      "first-principles engine",
    ];

    for (const kw of keepArchitectKeywords) {
      if (text.includes(kw)) {
        return {
          action: "keep",
          taskDescription: raw,
          confidence: 0.94,
          rationale: `Directly engages the Systems Architect quadrant. Designing sovereign substrates, fail-closed boundaries, and protocol topologies is Frank's unique high-leverage cognitive edge.`,
          primaryQuadrant: "architect",
        };
      }
    }

    for (const kw of keepComposerKeywords) {
      if (text.includes(kw)) {
        return {
          action: "keep",
          taskDescription: raw,
          confidence: 0.96,
          rationale: `Directly engages the Composer quadrant. Musical harmony, sonic texture, and emotional resonance require Frank's direct creative consciousness and artistic ear.`,
          primaryQuadrant: "composer",
        };
      }
    }

    for (const kw of keepGencreatorKeywords) {
      if (text.includes(kw)) {
        return {
          action: "keep",
          taskDescription: raw,
          confidence: 0.93,
          rationale: `Directly engages the GenCreator quadrant. Establishing founder vision, sovereign thesis, and genius frameworks is non-delegable creator leadership.`,
          primaryQuadrant: "gencreator",
        };
      }
    }

    for (const kw of keepBuilderKeywords) {
      if (text.includes(kw)) {
        return {
          action: "keep",
          taskDescription: raw,
          confidence: 0.9,
          rationale: `Engages the Pragmatic Builder quadrant for first-principles architecture and core breakthrough prototyping.`,
          primaryQuadrant: "builder",
        };
      }
    }

    // 4. DELEGATE Check (Sovereign Teammates Fleet)
    const delegateSearchKeywords = [
      "research",
      "market analysis",
      "competitor",
      "literature review",
      "search web",
      "ai lab updates",
      "scan arxiv",
      "find papers",
      "gather benchmarks",
      "survey",
    ];
    for (const kw of delegateSearchKeywords) {
      if (text.includes(kw)) {
        return {
          action: "delegate",
          taskDescription: raw,
          confidence: 0.91,
          rationale: `High-value research and information gathering that should be delegated to Search Manager using lightweight fast reasoning models (Gemini 4 Argon or GPT-6.1 Sol).`,
          suggestedTeammate: "search-manager",
        };
      }
    }

    const delegateGithubKeywords = [
      "pr review",
      "sentinel audit",
      "code review",
      "ci check",
      "run tests",
      "vulnerability scan",
      "secret scan",
      "verify build",
      "unit tests",
      "typecheck",
    ];
    for (const kw of delegateGithubKeywords) {
      if (text.includes(kw)) {
        return {
          action: "delegate",
          taskDescription: raw,
          confidence: 0.92,
          rationale: `Verification, test execution, Sentinel audits, and code review should be delegated to GitHub Officer (Claude Sonnet 5.5) with strict fail-closed standards.`,
          suggestedTeammate: "github-officer",
        };
      }
    }

    const delegateQueenKeywords = [
      "coordinate",
      "orchestrate",
      "manage swarm",
      "dispatch tasks",
      "workflow execution",
      "session handover",
      "multi-step execution",
    ];
    for (const kw of delegateQueenKeywords) {
      if (text.includes(kw)) {
        return {
          action: "delegate",
          taskDescription: raw,
          confidence: 0.9,
          rationale: `Multi-agent coordination and cross-repo operational execution should be delegated to Starlight Queen (Claude Sonnet 5.5 / Claude Opus 5.5).`,
          suggestedTeammate: "starlight-queen",
        };
      }
    }

    const delegateCommunityKeywords = [
      "community",
      "discord",
      "member feedback",
      "user outreach",
      "announcement draft",
      "newsletter draft",
      "audience poll",
    ];
    for (const kw of delegateCommunityKeywords) {
      if (text.includes(kw)) {
        return {
          action: "delegate",
          taskDescription: raw,
          confidence: 0.88,
          rationale: `Audience communication, community feedback synthesis, and engagement drafts should be delegated to Community Lead (Gemini 4 Argon).`,
          suggestedTeammate: "community-lead",
        };
      }
    }

    const delegateBuilderKeywords = [
      "compile skill",
      "scaffold agent",
      "build tool adapter",
      "foundry package",
      "mcp connector",
    ];
    for (const kw of delegateBuilderKeywords) {
      if (text.includes(kw)) {
        return {
          action: "delegate",
          taskDescription: raw,
          confidence: 0.9,
          rationale: `Skill compilation and tool adapter synthesis should be delegated to Teammate Builder studio (Claude Opus 5.5 / GPT-6 Astra).`,
          suggestedTeammate: "teammate-builder",
        };
      }
    }

    // Default classification:
    // If the task involves "build", "code", "implement", "create", "write" -> delegate to Queen or teammate fleet unless it has architectural keywords
    if (/build|implement|code|create|refactor|write|test|deploy|setup|fix/.test(text)) {
      return {
        action: "delegate",
        taskDescription: raw,
        confidence: 0.82,
        rationale: `Implementation and technical execution can be efficiently delegated to sovereign teammates under Starlight Queen's orchestration, preserving Frank's focus for architecture and vision.`,
        suggestedTeammate: "starlight-queen",
      };
    }

    // Fallback: evaluate as delegate to Queen for scoping
    return {
      action: "delegate",
      taskDescription: raw,
      confidence: 0.75,
      rationale: `Delegating this task to Starlight Queen allows the sovereign swarm to decompose, research, and execute the operational details while keeping Frank informed via structured handovers.`,
      suggestedTeammate: "starlight-queen",
    };
  }

  /**
   * Generates a complete multi-teammate delegation plan for a complex task,
   * decomposing it into structured subtasks assigned to specific sovereign Teammates
   * with recommended model tiers (Sonnet 5.5, Gemini 4 Argon, Opus 5.5, etc.) and governance gates.
   */
  public planDelegation(taskDescription: string): DelegationPlan {
    const raw = taskDescription.trim();
    const text = raw.toLowerCase();
    const planId = `plan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = new Date().toISOString();

    const subtasks: TaskDecomposition[] = [];
    const governanceGates: string[] = [];

    // Analyze task requirements
    const needsResearch = /research|market|competitor|explore|survey|analysis|find|scan|compare/i.test(text);
    const needsDesign = /design|ui|layout|tailwind|theme|screen|ux|refero|frontend|visual/i.test(text);
    const needsFoundry = /skill|foundry|agent|tool|mcp|adapter|scaffold/i.test(text);
    const needsCommunity = /community|newsletter|announcement|feedback|discord|social/i.test(text);
    const needsVerification = /verify|test|audit|sentinel|ci|pr|check|security|gate/i.test(text) || true; // verification always recommended

    let taskIndex = 1;

    // Subtask 1: Coordination & Scoping (Always Starlight Queen)
    subtasks.push({
      id: `task-${taskIndex++}`,
      title: "Orchestrate Execution & Context Synthesis",
      description: `Ingest goal, inspect relevant memory vaults (Operational, Technical, Strategic), and establish execution topology for: "${raw}".`,
      assignedTeammate: "starlight-queen",
      teammateRole: "Autonomous Ecosystem Operator & CIO",
      recommendedModelTier: "standard",
      recommendedModel: "Claude Sonnet 5.5",
      action: "delegate",
      rationale: "Starlight Queen coordinates multi-agent dependencies and maintains session state.",
      verificationCriteria: "Context hydrated and goal checklist initialized in SAGE.",
    });

    // Subtask 2: Research & Market Intelligence (Search Manager)
    if (needsResearch || subtasks.length === 1) {
      subtasks.push({
        id: `task-${taskIndex++}`,
        title: "Market Intelligence & Technical Fact Retrieval",
        description: `Conduct targeted semantic searches, verify partner API specifications, and cross-reference documentation for: "${raw}".`,
        assignedTeammate: "search-manager",
        teammateRole: "Market & AI Lab Intelligence Analyst",
        recommendedModelTier: "light",
        recommendedModel: "Gemini 4 Argon",
        action: "delegate",
        rationale: "Search Manager uses ultra-fast high-throughput search routing across web and vaults.",
        verificationCriteria: "Curated research brief with verifiable citations and source links.",
        dependencies: ["task-1"],
      });
    }

    // Subtask 3: Tool or skill compilation (Teammate Builder)
    if (needsFoundry) {
      subtasks.push({
        id: `task-${taskIndex++}`,
        title: "Foundry Studio Tooling & Skill Compilation",
        description: `Compile typed schemas, test fixtures, and validation contracts for custom skills/agents required by: "${raw}".`,
        assignedTeammate: "teammate-builder",
        teammateRole: "Swarm Node & Skill Compiler Studio",
        recommendedModelTier: "frontier",
        recommendedModel: "Claude Opus 5.5",
        action: "delegate",
        rationale: "Deep reasoning required for robust contract compilation and zero-hallucination type safety.",
        verificationCriteria: "Foundry conformance validation passes with zero errors.",
        dependencies: ["task-1"],
      });
    }

    // Subtask 4: Code implementation or refactor (Assigned under Queen/Builder)
    subtasks.push({
      id: `task-${taskIndex++}`,
      title: "Surgical Implementation & Integration",
      description: `Implement the core changes with minimal code surface, adhering to surrounding architectural styles and SIP invariants.`,
      assignedTeammate: "starlight-queen",
      teammateRole: "Autonomous Ecosystem Operator & CIO",
      recommendedModelTier: "standard",
      recommendedModel: "Claude Sonnet 5.5",
      action: "delegate",
      rationale: "Surgical code writing guided by Frank DNA guardrails and deep design principles.",
      verificationCriteria: "Zero unused imports, clean TypeScript compilation, and target functionality operational.",
      dependencies: [subtasks[subtasks.length - 1].id],
    });

    // Subtask 5: Verification & Sentinel Audit (GitHub Officer)
    if (needsVerification) {
      subtasks.push({
        id: `task-${taskIndex++}`,
        title: "CI/CD, Sentinel Security Audit & Test Verification",
        description: `Execute test suites, perform secret detection, audit against fail-closed rules, and prepare verified PR commit.`,
        assignedTeammate: "github-officer",
        teammateRole: "Code Quality, CI/CD & Sentinel Guardian",
        recommendedModelTier: "standard",
        recommendedModel: "Claude Sonnet 5.5",
        action: "delegate",
        rationale: "Sentinel audits and empirical tests prevent silent regression and protect main branch integrity.",
        verificationCriteria: "Zero test failures, clean typecheck, zero secret leaks.",
        dependencies: [subtasks[subtasks.length - 1].id],
      });
    }

    // Subtask 6: Community & Comms (Community Lead)
    if (needsCommunity) {
      subtasks.push({
        id: `task-${taskIndex++}`,
        title: "Community Signal Synthesis & Brief Preparation",
        description: `Draft community update or release notes in alignment with Frank's authentic voice and brand pack.`,
        assignedTeammate: "community-lead",
        teammateRole: "Member Engagement & Signal Synthesizer",
        recommendedModelTier: "light",
        recommendedModel: "Gemini 4 Argon",
        action: "delegate",
        rationale: "Warm, empathetic communication synthesis calibrated against voice guidelines.",
        verificationCriteria: "Editorial gate passed, zero corporate slop.",
        dependencies: [subtasks[subtasks.length - 1].id],
      });
    }

    // Detect governance gates
    if (/money|fund|payment|billing|stripe|invoice|transfer|purchase/i.test(text)) {
      governanceGates.push("FINANCIAL: Money fails closed. Autonomous payment or fund transfer is blocked. Requires Frank explicit sign-off.");
    }
    if (/merge|main branch|production release|deploy|cloudflare|vercel/i.test(text)) {
      governanceGates.push("GIT_MERGE_AND_DEPLOYMENT: Direct push to main or production environment requires human approval gate.");
    }
    if (/public|broadcast|tweet|post|newsletter send|mass email/i.test(text)) {
      governanceGates.push("PUBLIC_BROADCAST: Outbound public communication requires voice and facts verification.");
    }

    return {
      id: planId,
      originalTask: raw,
      primaryIntent: needsDesign
        ? "UI & Design Architecture"
        : needsFoundry
        ? "Foundry Skill & Agent Tooling"
        : needsResearch
        ? "Intelligence & Exploration"
        : "Autonomous Systems Engineering",
      coordinatingTeammate: "starlight-queen",
      coordinatingModel: "Claude Sonnet 5.5",
      subtasks,
      estimatedGovernanceGates: governanceGates.length > 0 ? governanceGates : undefined,
      timestamp,
    };
  }
}

/**
 * Singleton instance of the Starlight Genius Engine.
 */
export const geniusEngine = new StarlightGeniusEngine();
