// src/lib.rs
//! Starlight Sovereign Kernel: Deterministic Layer-0 Multi-Agent Substrate
//! Provides Tree-sitter AST Invariant Checking, WFG Deadlock Resolution,
//! Worktree Lease Arbitration, Infinite Vault Epistemic Mesh, and Virtual MCP Routing.

pub mod invariants;
pub mod lease;
pub mod vault;
pub mod vmcp;
pub mod wfg;

pub use invariants::{
    AstInvariantChecker, BlastRadiusReport, InvariantRule, InvariantViolation, ViolationSeverity,
};
pub use lease::{LeaseManager, WorktreeLease};
pub use vault::{
    DecayPolicy, EdgeKind, EpistemicTier, VaultEdge, VaultMesh, VaultNamespace, VaultNode,
};
pub use vmcp::{
    AgentContextEnvelope, ToolScope, VirtualMcpMetrics, VirtualMcpRouter, VirtualTool,
};
pub use wfg::{AgentDescriptor, AgentId, DeadlockCycle, Priority, ResourcePath, WaitForGraph};
