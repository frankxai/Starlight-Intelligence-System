// src/lease.rs
//! Worktree & Resource Lease Management
//! Provides lease acquisition, heartbeat renewal, prefix conflict checks, and zombie reaping.

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorktreeLease {
    pub lease_id: String,
    pub agent_id: String,
    pub worktree_root: String,
    pub paths: Vec<String>,
    pub ttl_secs: u64,
    pub acquired_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

pub struct LeaseManager {
    active_leases: HashMap<String, WorktreeLease>,
}

impl Default for LeaseManager {
    fn default() -> Self {
        Self::new()
    }
}

impl LeaseManager {
    pub fn new() -> Self {
        Self {
            active_leases: HashMap::new(),
        }
    }

    /// Attempts to acquire a worktree lease for an agent
    pub fn acquire_lease(
        &mut self,
        agent_id: &str,
        worktree_root: &str,
        paths: Vec<String>,
        ttl_secs: u64,
    ) -> Result<WorktreeLease, String> {
        let now = Utc::now();
        self.reap_expired(now);

        // Conflict check: Ensure no active lease covers the same paths or prefix
        for existing in self.active_leases.values() {
            if existing.agent_id != agent_id {
                for requested_path in &paths {
                    for held_path in &existing.paths {
                        if paths_conflict(requested_path, held_path) {
                            return Err(format!(
                                "Path conflict: requested path '{}' conflicts with path '{}' held by agent '{}'",
                                requested_path, held_path, existing.agent_id
                            ));
                        }
                    }
                }
            }
        }

        let lease_id = format!("lease_{}_{}", agent_id, now.timestamp_millis());
        let expires_at = now + Duration::seconds(ttl_secs as i64);

        let lease = WorktreeLease {
            lease_id: lease_id.clone(),
            agent_id: agent_id.to_string(),
            worktree_root: worktree_root.to_string(),
            paths,
            ttl_secs,
            acquired_at: now,
            expires_at,
        };

        self.active_leases.insert(lease_id, lease.clone());
        Ok(lease)
    }

    /// Heartbeat renewal: extends expiration time by ttl_secs
    pub fn heartbeat(&mut self, lease_id: &str) -> Result<DateTime<Utc>, String> {
        let now = Utc::now();
        if let Some(lease) = self.active_leases.get_mut(lease_id) {
            if lease.expires_at < now {
                return Err("Lease has already expired and cannot be renewed".into());
            }
            lease.expires_at = now + Duration::seconds(lease.ttl_secs as i64);
            Ok(lease.expires_at)
        } else {
            Err("Lease not found".into())
        }
    }

    /// Releases an existing lease
    pub fn release_lease(&mut self, lease_id: &str) -> bool {
        self.active_leases.remove(lease_id).is_some()
    }

    /// Reaps expired leases (zombie process cleanup)
    pub fn reap_expired(&mut self, now: DateTime<Utc>) -> Vec<WorktreeLease> {
        let mut reaped = Vec::new();
        self.active_leases.retain(|_, lease| {
            if lease.expires_at <= now {
                reaped.push(lease.clone());
                false
            } else {
                true
            }
        });
        reaped
    }

    /// Returns list of all active leases
    pub fn get_active_leases(&self) -> Vec<WorktreeLease> {
        self.active_leases.values().cloned().collect()
    }
}

/// Checks if two path patterns or exact paths conflict
fn paths_conflict(p1: &str, p2: &str) -> bool {
    let clean1 = p1.trim_end_matches("/*").trim_end_matches('*');
    let clean2 = p2.trim_end_matches("/*").trim_end_matches('*');

    clean1 == clean2 || clean1.starts_with(clean2) || clean2.starts_with(clean1)
}
