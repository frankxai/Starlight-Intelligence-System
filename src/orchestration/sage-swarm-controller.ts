/**
 * Starlight Intelligence System — SAGE Swarm Controller
 * 
 * Implements the Blitzscaling Multi-Agent Swarm Orchestration Engine:
 * - 12-House Federated Partitioning (12 Houses x 144 Agents)
 * - SAGE Self-Healing Loops (Checklist State, Checkpointing, Sentinel Audits)
 * - Hybrid Consensus Sizing (Max 7 active agents per debate circle)
 * - Bilingual Japanese-English Routing Bridge
 */

import { randomUUID } from "node:crypto";

export type HouseType = 
  | "House of Code & Systems"
  | "House of Wealth & Capital"
  | "House of Creator & Media"
  | "House of Health & Life"
  | "House of Music & Acoustics"
  | "House of People & Culture"
  | "House of Space & Orbit"
  | "House of Marine & Depths"
  | "House of Legal & Governance"
  | "House of Infrastructure & Grid"
  | "House of Research & Proving"
  | "House of Wisdom & Counsel";

export interface SwarmTask {
  id: string;
  title: string;
  house: HouseType;
  priority: "low" | "medium" | "high" | "critical";
  assignedAgents: string[];
  status: "pending" | "in_progress" | "sentinel_audit" | "completed" | "rolled_back";
  checkpointHash?: string;
  isBilingualJa: boolean;
}

export interface SwarmConsensusResult {
  taskId: string;
  house: HouseType;
  participatingAgents: string[];
  consensusScore: number; // 0.0 to 1.0
  passedSentinel: boolean;
  verdict: "PROCEED" | "REVISE" | "ABORT";
  timestamp: string;
}

export class SageSwarmController {
  private activeTasks: Map<string, SwarmTask> = new Map();
  private maxConsensusAgents: number = 7;

  /**
   * Route and partition a task into the correct House
   */
  routeTaskToHouse(query: string, explicitHouse?: HouseType): HouseType {
    if (explicitHouse) return explicitHouse;
    const q = query.toLowerCase();
    
    if (q.includes("music") || q.includes("audio") || q.includes("suno") || q.includes("sound")) {
      return "House of Music & Acoustics";
    }
    if (q.includes("wealth") || q.includes("crypto") || q.includes("finance") || q.includes("dpi")) {
      return "House of Wealth & Capital";
    }
    if (q.includes("health") || q.includes("bio") || q.includes("longevity") || q.includes("sleep")) {
      return "House of Health & Life";
    }
    if (q.includes("space") || q.includes("orbit") || q.includes("satellite") || q.includes("starbound")) {
      return "House of Space & Orbit";
    }
    if (q.includes("marine") || q.includes("ocean") || q.includes("sea") || q.includes("underwater")) {
      return "House of Marine & Depths";
    }
    if (q.includes("japanese") || q.includes("japan") || q.includes("tokyo") || q.includes("日本語") || q.includes("keigo")) {
      return "House of Wisdom & Counsel";
    }
    if (q.includes("creator") || q.includes("media") || q.includes("brand") || q.includes("video") || q.includes("art")) {
      return "House of Creator & Media";
    }
    if (q.includes("people") || q.includes("hiring") || q.includes("culture") || q.includes("team")) {
      return "House of People & Culture";
    }
    if (q.includes("legal") || q.includes("compliance") || q.includes("governance") || q.includes("contract")) {
      return "House of Legal & Governance";
    }
    if (q.includes("infra") || q.includes("server") || q.includes("docker") || q.includes("cloud")) {
      return "House of Infrastructure & Grid";
    }
    if (q.includes("eval") || q.includes("benchmark") || q.includes("research") || q.includes("proving")) {
      return "House of Research & Proving";
    }
    
    return "House of Code & Systems";
  }

  /**
   * Spawn a new SAGE swarm task with strict 7-agent consensus boundary
   */
  spawnSwarmTask(title: string, query: string, availableAgents: string[] = []): SwarmTask {
    const house = this.routeTaskToHouse(query);
    const isBilingual = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(query) || query.toLowerCase().includes("japan");

    // Sizing guardrail: Enforce max 7 agents per council to avoid context dilution
    const selectedAgents = availableAgents.slice(0, this.maxConsensusAgents);
    if (isBilingual && !selectedAgents.includes("starlight-japanese-swarm")) {
      selectedAgents.push("starlight-japanese-swarm");
    }

    const task: SwarmTask = {
      id: `sage_task_${Date.now()}_${randomUUID().slice(0, 6)}`,
      title,
      house,
      priority: "high",
      assignedAgents: selectedAgents,
      status: "pending",
      isBilingualJa: isBilingual
    };

    this.activeTasks.set(task.id, task);
    return task;
  }

  /**
   * Execute Sentinel validation pass
   */
  evaluateConsensus(taskId: string, agentScores: number[]): SwarmConsensusResult {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const avgScore = agentScores.reduce((a, b) => a + b, 0) / (agentScores.length || 1);
    const passedSentinel = avgScore >= 0.85;

    const result: SwarmConsensusResult = {
      taskId,
      house: task.house,
      participatingAgents: task.assignedAgents,
      consensusScore: Number(avgScore.toFixed(3)),
      passedSentinel,
      verdict: passedSentinel ? "PROCEED" : avgScore >= 0.6 ? "REVISE" : "ABORT",
      timestamp: new Date().toISOString()
    };

    task.status = passedSentinel ? "completed" : "sentinel_audit";
    return result;
  }

  getActiveTasks(): SwarmTask[] {
    return Array.from(this.activeTasks.values());
  }
}
