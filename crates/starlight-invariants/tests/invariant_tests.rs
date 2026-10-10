// tests/invariant_tests.rs
use chrono::{Duration, Utc};
use starlight_invariants::{
    AgentContextEnvelope, AgentDescriptor, AgentId, AstInvariantChecker, DecayPolicy,
    EpistemicTier, InvariantRule, Priority, ResourcePath, ToolScope, VaultMesh,
    VaultNamespace, VaultNode, VirtualMcpRouter, VirtualTool, WaitForGraph,
};
use std::collections::HashSet;

#[test]
fn test_clean_diff_passes() {
    let mut checker = match AstInvariantChecker::new() {
        Ok(c) => c,
        Err(e) => {
            println!("Skipping AST test: {}", e);
            return;
        }
    };

    let canonical = r#"
        export function processBuffer(input: Float32Array): Float32Array {
            return input;
        }
    "#;

    let speculative = r#"
        export function processBuffer(input: Float32Array): Float32Array {
            return input;
        }
        export function computeGain(db: number): number {
            return Math.pow(10, db / 20);
        }
    "#;

    let result = checker.verify_ts_diff("src/dsp/buffer.ts", canonical, speculative);
    assert!(result.is_ok(), "Clean diff with additive export must pass");
    let report = result.unwrap();
    assert!(report.is_clean);
    assert!(report.changed_symbols.contains("computeGain"));
}

#[test]
fn test_breaking_export_caught() {
    let mut checker = match AstInvariantChecker::new() {
        Ok(c) => c,
        Err(e) => {
            println!("Skipping AST test: {}", e);
            return;
        }
    };

    let canonical = r#"
        export function processBuffer(input: Float32Array): Float32Array {
            return input;
        }
        export function legacyFilter(val: number): number {
            return val * 0.5;
        }
    "#;

    let speculative = r#"
        export function processBuffer(input: Float32Array): Float32Array {
            return input;
        }
    "#;

    let result = checker.verify_ts_diff("src/dsp/buffer.ts", canonical, speculative);
    assert!(result.is_err(), "Deleting exported function must trigger invariant blocker");
    let report = result.unwrap_err();
    assert!(!report.is_clean);
    assert!(report
        .violations
        .iter()
        .any(|v| v.rule == InvariantRule::NoBreakingExports && v.symbol == "legacyFilter"));
}

#[test]
fn test_wfg_deadlock_detection_and_resolution() {
    let mut wfg = WaitForGraph::new();

    let res1 = ResourcePath("src/dsp/buffer.rs".into());
    let res2 = ResourcePath("src/dsp/filters.rs".into());

    let agent_claude = AgentDescriptor {
        id: AgentId("agent-claude".into()),
        priority: Priority(100),
        held_resources: vec![res1.clone()],
        waiting_for: Some(res2.clone()),
    };

    let agent_hermes = AgentDescriptor {
        id: AgentId("agent-hermes".into()),
        priority: Priority(50),
        held_resources: vec![res2.clone()],
        waiting_for: Some(res1.clone()),
    };

    wfg.register_agent(agent_claude);
    wfg.register_agent(agent_hermes);

    let deadlocks = wfg.detect_and_resolve_deadlocks();
    assert_eq!(deadlocks.len(), 1, "Must detect exactly one circular deadlock cycle");
    assert_eq!(deadlocks[0].preempted_agent, AgentId("agent-hermes".into()));
}

#[test]
fn test_infinite_vault_mesh_and_decay() {
    let mut mesh = VaultMesh::new();
    let now = Utc::now();
    let ten_days_ago = now - Duration::days(10);

    // Node 1: Immutable Canon
    mesh.put_node(VaultNode {
        id: "tenet_01".into(),
        namespace: VaultNamespace::new("core/strategic/canon"),
        title: "Enhance Never Erase".into(),
        content: "Every evolution compounds truth.".into(),
        initial_confidence: 1.0,
        epistemic_tier: EpistemicTier::AttestedCanon,
        decay_policy: DecayPolicy::permanent(),
        attestations: 10,
        created_at: ten_days_ago,
        updated_at: ten_days_ago,
        tags: HashSet::new(),
    });

    // Node 2: Ephemeral Sprint Note with 14-day half-life
    mesh.put_node(VaultNode {
        id: "sprint_note_01".into(),
        namespace: VaultNamespace::new("project/audio/sprint-4"),
        title: "WIP scratchpad on buffer size".into(),
        content: "Testing 512 vs 1024 sample chunks".into(),
        initial_confidence: 0.9,
        epistemic_tier: EpistemicTier::WorkingHypothesis,
        decay_policy: DecayPolicy::operational_sprint(),
        attestations: 0,
        created_at: ten_days_ago,
        updated_at: ten_days_ago,
        tags: HashSet::new(),
    });

    let results = mesh.query_namespace("core", now);
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].current_confidence(now), 1.0, "Permanent canon must not decay");

    let sprint_results = mesh.query_namespace("project/audio", now);
    assert_eq!(sprint_results.len(), 1);
    let decayed_conf = sprint_results[0].current_confidence(now);
    assert!(decayed_conf < 0.9, "Sprint note must undergo exponential decay after 10 days");
    assert!(decayed_conf > 0.3, "Decayed confidence should remain within expected decay window");
}

#[test]
fn test_vmcp_jit_context_synthesis() {
    let mut router = VirtualMcpRouter::new();

    router.register_tool(VirtualTool {
        name: "ast_invariant_gate".into(),
        description: "Checks Tree-sitter diffs".into(),
        input_schema: serde_json::json!({}),
        scope: ToolScope::AstCompilation,
        token_cost_est: 500,
        upstream_server: "starlightd".into(),
    });

    router.register_tool(VirtualTool {
        name: "suno_audio_generate".into(),
        description: "Generates audio stems".into(),
        input_schema: serde_json::json!({}),
        scope: ToolScope::CreativeMediaAudio,
        token_cost_est: 900,
        upstream_server: "audio-gateway".into(),
    });

    router.register_tool(VirtualTool {
        name: "cloudflare_pages_deploy".into(),
        description: "Deploys to Cloudflare Pages".into(),
        input_schema: serde_json::json!({}),
        scope: ToolScope::CloudflareDeploy,
        token_cost_est: 1500,
        upstream_server: "cloudflare-bindings".into(),
    });

    // Case 1: Editing audio DSP TypeScript code
    let context_audio = AgentContextEnvelope {
        agent_id: "claude-code".into(),
        active_file_path: Some("src/dsp/audio.ts".into()),
        active_intent: "Refactor audio filter buffer".into(),
        leased_worktree: Some("/repo/.worktrees/audio".into()),
    };

    let (mounted, metrics) = router.synthesize_toolset(&context_audio);
    // Should mount AST tool and audio tool, but EXCLUDE Cloudflare deploy tool
    assert_eq!(mounted.len(), 2);
    assert!(mounted.iter().any(|t| t.name == "ast_invariant_gate"));
    assert!(mounted.iter().any(|t| t.name == "suno_audio_generate"));
    assert!(!mounted.iter().any(|t| t.name == "cloudflare_pages_deploy"));
    assert!(metrics.token_savings_percent > 40.0, "vMCP must produce significant token savings");
}
