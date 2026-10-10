// src/wfg.rs
//! Wait-For-Graph (WFG) Cycle Detector & Deadlock Resolver
//! Detects circular wait states between autonomous agents competing for worktree paths
//! and resolves them deterministically via priority-based preemption.

use petgraph::algo::tarjan_scc;
use petgraph::graph::{DiGraph, NodeIndex};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Unique identifier for an agent instance (e.g. "agent-01-claude", "agent-02-hermes")
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AgentId(pub String);

/// Unique identifier for a resource or file lease path
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ResourcePath(pub String);

/// Agent execution priority (higher number = higher priority)
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct Priority(pub u32);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentDescriptor {
    pub id: AgentId,
    pub priority: Priority,
    pub held_resources: Vec<ResourcePath>,
    pub waiting_for: Option<ResourcePath>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeadlockCycle {
    pub participating_agents: Vec<AgentId>,
    pub contested_resources: Vec<ResourcePath>,
    pub preempted_agent: AgentId,
    pub reason: String,
}

pub struct WaitForGraph {
    agents: HashMap<AgentId, AgentDescriptor>,
    resource_owners: HashMap<ResourcePath, AgentId>,
}

impl Default for WaitForGraph {
    fn default() -> Self {
        Self::new()
    }
}

impl WaitForGraph {
    pub fn new() -> Self {
        Self {
            agents: HashMap::new(),
            resource_owners: HashMap::new(),
        }
    }

    /// Registers or updates an agent in the WFG
    pub fn register_agent(&mut self, agent: AgentDescriptor) {
        for res in &agent.held_resources {
            self.resource_owners.insert(res.clone(), agent.id.clone());
        }
        self.agents.insert(agent.id.clone(), agent);
    }

    /// Records that an agent is requesting and waiting for a resource
    pub fn request_resource(&mut self, agent_id: &AgentId, resource: ResourcePath) {
        if let Some(agent) = self.agents.get_mut(agent_id) {
            agent.waiting_for = Some(resource);
        }
    }

    /// Releases a resource held by an agent
    pub fn release_resource(&mut self, agent_id: &AgentId, resource: &ResourcePath) {
        if let Some(agent) = self.agents.get_mut(agent_id) {
            agent.held_resources.retain(|r| r != resource);
            if agent.waiting_for.as_ref() == Some(resource) {
                agent.waiting_for = None;
            }
        }
        self.resource_owners.remove(resource);
    }

    /// Detects deadlocks and resolves them by identifying the lowest-priority agent in the cycle to preempt
    pub fn detect_and_resolve_deadlocks(&mut self) -> Vec<DeadlockCycle> {
        let mut graph = DiGraph::<AgentId, ()>::new();
        let mut node_indices = HashMap::<AgentId, NodeIndex>::new();

        // Add nodes
        for agent_id in self.agents.keys() {
            let idx = graph.add_node(agent_id.clone());
            node_indices.insert(agent_id.clone(), idx);
        }

        // Add directed edges: Agent A -> Agent B (A is waiting for a resource owned by B)
        for (agent_id, descriptor) in &self.agents {
            if let Some(waiting_res) = &descriptor.waiting_for {
                if let Some(owner_id) = self.resource_owners.get(waiting_res) {
                    if owner_id != agent_id {
                        if let (Some(&u), Some(&v)) = (node_indices.get(agent_id), node_indices.get(owner_id)) {
                            graph.add_edge(u, v, ());
                        }
                    }
                }
            }
        }

        // Find Strongly Connected Components (SCCs)
        let sccs = tarjan_scc(&graph);
        let mut resolutions = Vec::new();

        for scc in sccs {
            // A cycle must have 2 or more nodes
            if scc.len() > 1 {
                let participating_agents: Vec<AgentId> = scc
                    .iter()
                    .map(|&idx| graph[idx].clone())
                    .collect();

                let mut contested = Vec::new();
                for aid in &participating_agents {
                    if let Some(agent) = self.agents.get(aid) {
                        if let Some(w) = &agent.waiting_for {
                            contested.push(w.clone());
                        }
                    }
                }

                // Determine lowest priority agent for preemption
                let mut victim = participating_agents[0].clone();
                let mut min_priority = self.agents.get(&victim).map(|a| a.priority).unwrap_or(Priority(0));

                for aid in &participating_agents[1..] {
                    let p = self.agents.get(aid).map(|a| a.priority).unwrap_or(Priority(0));
                    if p < min_priority {
                        min_priority = p;
                        victim = aid.clone();
                    }
                }

                resolutions.push(DeadlockCycle {
                    participating_agents,
                    contested_resources: contested,
                    preempted_agent: victim.clone(),
                    reason: format!(
                        "Priority preemption: agent '{}' (priority {:?}) preempted to resolve circular dependency",
                        victim.0, min_priority
                    ),
                });

                // Execute preemption: clear waiting status of victim so cycle breaks
                if let Some(victim_agent) = self.agents.get_mut(&victim) {
                    victim_agent.waiting_for = None;
                }
            }
        }

        resolutions
    }
}
