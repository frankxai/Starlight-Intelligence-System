// src/vault.rs
//! Infinite Hyper-Vault Mesh Engine
//! Moves beyond static 6-vault ontologies into an infinite-dimensional, dynamically
//! namespaced epistemic memory mesh with mathematical confidence decay and cross-vault graph edges.

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Verification and epistemic certainty levels for vault nodes
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum EpistemicTier {
    Draft,
    WorkingHypothesis,
    VerifiedByTests,
    AttestedCanon,
    Deprecated,
}

/// Dynamic Vault Namespace (e.g. "core/strategic", "repo/frankx-prod", "lore/starbound", "agent/hermes")
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct VaultNamespace(pub String);

impl VaultNamespace {
    pub fn new(ns: &str) -> Self {
        Self(ns.trim().to_lowercase())
    }

    pub fn parent(&self) -> Option<VaultNamespace> {
        self.0.rfind('/').map(|idx| VaultNamespace(self.0[..idx].to_string()))
    }
}

/// Mathematical decay rate parameters for memory retention
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct DecayPolicy {
    /// Half-life in days (0.0 means infinite permanence / immutable canon)
    pub half_life_days: f64,
    /// Minimum floor confidence below which the record is archived
    pub retention_floor: f64,
}

impl DecayPolicy {
    pub fn permanent() -> Self {
        Self { half_life_days: 0.0, retention_floor: 1.0 }
    }

    pub fn operational_sprint() -> Self {
        Self { half_life_days: 14.0, retention_floor: 0.2 }
    }

    pub fn technical_contract() -> Self {
        Self { half_life_days: 180.0, retention_floor: 0.5 }
    }

    pub fn compute_confidence(&self, initial_confidence: f64, created_at: DateTime<Utc>, now: DateTime<Utc>, attestations: u32) -> f64 {
        if self.half_life_days <= 0.0 {
            return initial_confidence.clamp(0.0, 1.0);
        }
        let elapsed_seconds = (now - created_at).num_seconds().max(0) as f64;
        let elapsed_days = elapsed_seconds / 86400.0;
        let lambda = std::f64::consts::LN_2 / self.half_life_days;
        
        // Attestation boost: each cryptographic attestation slows down decay
        let attestation_multiplier = 1.0 + (attestations as f64 * 0.15);
        let decayed = initial_confidence * (-lambda * elapsed_days).exp() * attestation_multiplier;
        decayed.clamp(0.0, 1.0)
    }
}

/// Relationships between vault entities across namespaces
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EdgeKind {
    DependsOn,
    Validates,
    Contradicts,
    Extends,
    Implements,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultEdge {
    pub source_id: String,
    pub target_id: String,
    pub kind: EdgeKind,
    pub notes: Option<String>,
}

/// An individual memory unit in the Infinite Vault Mesh
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultNode {
    pub id: String,
    pub namespace: VaultNamespace,
    pub title: String,
    pub content: String,
    pub initial_confidence: f64,
    pub epistemic_tier: EpistemicTier,
    pub decay_policy: DecayPolicy,
    pub attestations: u32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: HashSet<String>,
}

impl VaultNode {
    pub fn current_confidence(&self, now: DateTime<Utc>) -> f64 {
        self.decay_policy.compute_confidence(
            self.initial_confidence,
            self.updated_at,
            now,
            self.attestations,
        )
    }

    pub fn is_active(&self, now: DateTime<Utc>) -> bool {
        self.current_confidence(now) >= self.decay_policy.retention_floor
    }
}

/// The Infinite Vault Mesh managing dynamic namespaces, queries, and contradiction audits
pub struct VaultMesh {
    nodes: HashMap<String, VaultNode>,
    edges: Vec<VaultEdge>,
}

impl Default for VaultMesh {
    fn default() -> Self {
        Self::new()
    }
}

impl VaultMesh {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            edges: Vec::new(),
        }
    }

    /// Inserts or updates a node in the mesh
    pub fn put_node(&mut self, node: VaultNode) {
        self.nodes.insert(node.id.clone(), node);
    }

    /// Links two nodes with a semantic relationship
    pub fn link(&mut self, source_id: &str, target_id: &str, kind: EdgeKind, notes: Option<String>) -> Result<(), String> {
        if !self.nodes.contains_key(source_id) {
            return Err(format!("Source node '{}' not found", source_id));
        }
        if !self.nodes.contains_key(target_id) {
            return Err(format!("Target node '{}' not found", target_id));
        }
        self.edges.push(VaultEdge {
            source_id: source_id.to_string(),
            target_id: target_id.to_string(),
            kind,
            notes,
        });
        Ok(())
    }

    /// Finds all contradictions detected in the graph
    pub fn detect_contradictions(&self) -> Vec<&VaultEdge> {
        self.edges
            .iter()
            .filter(|e| e.kind == EdgeKind::Contradicts)
            .collect()
    }

    /// Queries nodes by namespace prefix (e.g. "repo/frankx" matches "repo/frankx/auth" and "repo/frankx/ui")
    pub fn query_namespace(&self, prefix: &str, now: DateTime<Utc>) -> Vec<&VaultNode> {
        let clean = prefix.trim().to_lowercase();
        self.nodes
            .values()
            .filter(|n| n.namespace.0.starts_with(&clean) && n.is_active(now))
            .collect()
    }

    /// Returns the total active node count and namespace distribution
    pub fn stats(&self, now: DateTime<Utc>) -> (usize, HashMap<String, usize>) {
        let mut distribution = HashMap::new();
        let mut active_count = 0;

        for node in self.nodes.values() {
            if node.is_active(now) {
                active_count += 1;
                let root_ns = node.namespace.0.split('/').next().unwrap_or("unknown").to_string();
                *distribution.entry(root_ns).or_insert(0) += 1;
            }
        }

        (active_count, distribution)
    }
}
