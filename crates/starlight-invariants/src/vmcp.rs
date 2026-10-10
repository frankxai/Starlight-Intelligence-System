// src/vmcp.rs
//! Virtual Model Context Protocol (vMCP) Mesh Router
//! Resolves the N×M MCP tool explosion and context-rot crisis.
//! Dynamically synthesizes, scopes, and filters tool definitions based on active AST nodes and worktree intent.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Scope of execution context determining which tools are JIT-mounted
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ToolScope {
    AstCompilation,
    FileSystemEdit,
    GitLeaseOps,
    CloudflareDeploy,
    CreativeMediaAudio,
    CreativeMediaVisual,
    EpistemicMemory,
    GlobalAlwaysOn,
}

/// Metadata describing an MCP tool definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualTool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
    pub scope: ToolScope,
    pub token_cost_est: usize,
    pub upstream_server: String,
}

/// Context state representing what an agent is currently working on
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentContextEnvelope {
    pub agent_id: String,
    pub active_file_path: Option<String>,
    pub active_intent: String,
    pub leased_worktree: Option<String>,
}

/// The Virtual MCP Router providing JIT tool filtering and token reduction
pub struct VirtualMcpRouter {
    registered_tools: HashMap<String, VirtualTool>,
}

impl Default for VirtualMcpRouter {
    fn default() -> Self {
        Self::new()
    }
}

impl VirtualMcpRouter {
    pub fn new() -> Self {
        Self {
            registered_tools: HashMap::new(),
        }
    }

    /// Registers an upstream tool into the virtual catalog
    pub fn register_tool(&mut self, tool: VirtualTool) {
        self.registered_tools.insert(tool.name.clone(), tool);
    }

    /// Determines active scopes based on file path and user intent
    pub fn infer_scopes(&self, context: &AgentContextEnvelope) -> HashSet<ToolScope> {
        let mut scopes = HashSet::new();
        scopes.insert(ToolScope::GlobalAlwaysOn);
        scopes.insert(ToolScope::EpistemicMemory);

        let intent_lower = context.active_intent.to_lowercase();
        let path_lower = context.active_file_path.as_deref().unwrap_or("").to_lowercase();

        if path_lower.ends_with(".ts") || path_lower.ends_with(".tsx") || path_lower.ends_with(".rs") {
            scopes.insert(ToolScope::AstCompilation);
            scopes.insert(ToolScope::FileSystemEdit);
            scopes.insert(ToolScope::GitLeaseOps);
        }

        if path_lower.contains("audio") || intent_lower.contains("music") || intent_lower.contains("suno") {
            scopes.insert(ToolScope::CreativeMediaAudio);
        }

        if path_lower.contains("image") || intent_lower.contains("visual") || intent_lower.contains("comfy") {
            scopes.insert(ToolScope::CreativeMediaVisual);
        }

        if intent_lower.contains("deploy") || intent_lower.contains("worker") || intent_lower.contains("cloudflare") {
            scopes.insert(ToolScope::CloudflareDeploy);
        }

        scopes
    }

    /// Returns the filtered, JIT-synthesized list of tools for the agent
    pub fn synthesize_toolset(&self, context: &AgentContextEnvelope) -> (Vec<&VirtualTool>, VirtualMcpMetrics) {
        let active_scopes = self.infer_scopes(context);
        let mut selected = Vec::new();
        let mut total_unfiltered_tokens = 0;
        let mut filtered_tokens = 0;

        for tool in self.registered_tools.values() {
            total_unfiltered_tokens += tool.token_cost_est;
            if active_scopes.contains(&tool.scope) {
                filtered_tokens += tool.token_cost_est;
                selected.push(tool);
            }
        }

        let savings_percent = if total_unfiltered_tokens > 0 {
            ((total_unfiltered_tokens.saturating_sub(filtered_tokens)) as f64 / total_unfiltered_tokens as f64) * 100.0
        } else {
            0.0
        };

        let metrics = VirtualMcpMetrics {
            total_registered_tools: self.registered_tools.len(),
            active_tools_mounted: selected.len(),
            unfiltered_token_cost: total_unfiltered_tokens,
            filtered_token_cost: filtered_tokens,
            token_savings_percent: savings_percent,
        };

        (selected, metrics)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualMcpMetrics {
    pub total_registered_tools: usize,
    pub active_tools_mounted: usize,
    pub unfiltered_token_cost: usize,
    pub filtered_token_cost: usize,
    pub token_savings_percent: f64,
}
