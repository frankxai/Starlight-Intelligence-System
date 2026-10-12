// src/invariants.rs
//! Deterministic AST Invariant & Blast-Radius Engine
//! Intercepts speculative code mutations prior to Git commit or worktree merge.
//! Uses Tree-sitter parsers to calculate the structural dependency delta:
//! \Delta G = G_{speculative} \setminus G_{canonical}

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use tree_sitter::{Parser, Query, QueryCursor, Tree};

/// Types of invariant rules evaluated by the engine
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum InvariantRule {
    NoSyntaxErrors,
    NoBreakingExports,
    NoMutatedSignatures,
    NoUnresolvedImports,
    NoLeakedSecrets,
    Custom(String),
}

impl std::fmt::Display for InvariantRule {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            InvariantRule::NoSyntaxErrors => write!(f, "NO_SYNTAX_ERRORS"),
            InvariantRule::NoBreakingExports => write!(f, "NO_BREAKING_EXPORTS"),
            InvariantRule::NoMutatedSignatures => write!(f, "NO_MUTATED_SIGNATURES"),
            InvariantRule::NoUnresolvedImports => write!(f, "NO_UNRESOLVED_IMPORTS"),
            InvariantRule::NoLeakedSecrets => write!(f, "NO_LEAKED_SECRETS"),
            InvariantRule::Custom(name) => write!(f, "{}", name),
        }
    }
}

/// A structured violation returned when an agent's diff breaks an invariant
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct InvariantViolation {
    pub rule: InvariantRule,
    pub symbol: String,
    pub file_path: Option<String>,
    pub line_number: Option<usize>,
    pub message: String,
    pub severity: ViolationSeverity,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ViolationSeverity {
    Warning,
    Blocker,
    Fatal,
}

/// Blast radius report summarizing the impact of an AST change across the codebase
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlastRadiusReport {
    pub changed_symbols: HashSet<String>,
    pub deleted_symbols: HashSet<String>,
    pub mutated_signatures: HashMap<String, (String, String)>,
    pub violations: Vec<InvariantViolation>,
    pub is_clean: bool,
}

pub struct AstInvariantChecker {
    ts_parser: Parser,
}

impl AstInvariantChecker {
    /// Creates a new checker initialized with tree-sitter TypeScript grammar
    pub fn new() -> Result<Self, String> {
        let mut parser = Parser::new();
        let language = tree_sitter_typescript::language_typescript();
        parser
            .set_language(language)
            .map_err(|e| format!("Failed to load TypeScript grammar: {}", e))?;
        Ok(Self { ts_parser: parser })
    }

    /// Validates if an incoming speculative code diff breaks any AST invariants
    pub fn verify_ts_diff(
        &mut self,
        file_path: &str,
        canonical_source: &str,
        speculative_source: &str,
    ) -> Result<BlastRadiusReport, BlastRadiusReport> {
        let mut violations = Vec::new();

        let canon_tree = self.ts_parser.parse(canonical_source, None).ok_or_else(|| {
            let v = vec![InvariantViolation {
                rule: InvariantRule::NoSyntaxErrors,
                symbol: "CANONICAL_ROOT".into(),
                file_path: Some(file_path.to_string()),
                line_number: None,
                message: "Canonical source code failed to parse".into(),
                severity: ViolationSeverity::Fatal,
            }];
            BlastRadiusReport {
                changed_symbols: HashSet::new(),
                deleted_symbols: HashSet::new(),
                mutated_signatures: HashMap::new(),
                violations: v,
                is_clean: false,
            }
        })?;

        let spec_tree = self.ts_parser.parse(speculative_source, None).ok_or_else(|| {
            let v = vec![InvariantViolation {
                rule: InvariantRule::NoSyntaxErrors,
                symbol: "SPECULATIVE_ROOT".into(),
                file_path: Some(file_path.to_string()),
                line_number: None,
                message: "Speculative source code failed to parse into AST".into(),
                severity: ViolationSeverity::Fatal,
            }];
            BlastRadiusReport {
                changed_symbols: HashSet::new(),
                deleted_symbols: HashSet::new(),
                mutated_signatures: HashMap::new(),
                violations: v,
                is_clean: false,
            }
        })?;

        // Check 1: InvariantRule::NoSyntaxErrors
        if spec_tree.root_node().has_error() {
            violations.push(InvariantViolation {
                rule: InvariantRule::NoSyntaxErrors,
                symbol: "ROOT".into(),
                file_path: Some(file_path.to_string()),
                line_number: None,
                message: "Speculative code contains unresolved syntax or grammar errors".into(),
                severity: ViolationSeverity::Blocker,
            });
        }

        // Check 2: Extract exported functions and compare signatures
        let canon_exports = self.extract_exported_functions(canonical_source, &canon_tree);
        let spec_exports = self.extract_exported_functions(speculative_source, &spec_tree);

        let mut deleted_symbols = HashSet::new();
        let mut mutated_signatures = HashMap::new();
        let mut changed_symbols = HashSet::new();

        for (fn_name, canon_sig) in &canon_exports {
            match spec_exports.get(fn_name) {
                None => {
                    deleted_symbols.insert(fn_name.clone());
                    violations.push(InvariantViolation {
                        rule: InvariantRule::NoBreakingExports,
                        symbol: fn_name.clone(),
                        file_path: Some(file_path.to_string()),
                        line_number: None,
                        message: format!(
                            "Exported function '{}' was deleted without a deprecation window",
                            fn_name
                        ),
                        severity: ViolationSeverity::Blocker,
                    });
                }
                Some(spec_sig) if spec_sig != canon_sig => {
                    mutated_signatures
                        .insert(fn_name.clone(), (canon_sig.clone(), spec_sig.clone()));
                    violations.push(InvariantViolation {
                        rule: InvariantRule::NoMutatedSignatures,
                        symbol: fn_name.clone(),
                        file_path: Some(file_path.to_string()),
                        line_number: None,
                        message: format!(
                            "Signature of exported symbol '{}' modified from '{}' to '{}'",
                            fn_name, canon_sig, spec_sig
                        ),
                        severity: ViolationSeverity::Blocker,
                    });
                }
                _ => {}
            }
        }

        for (fn_name, _) in &spec_exports {
            if !canon_exports.contains_key(fn_name) {
                changed_symbols.insert(fn_name.clone());
            }
        }

        let is_clean = violations.is_empty();
        let report = BlastRadiusReport {
            changed_symbols,
            deleted_symbols,
            mutated_signatures,
            violations,
            is_clean,
        };

        if is_clean {
            Ok(report)
        } else {
            Err(report)
        }
    }

    /// Extracts exported functions from a parsed tree using Tree-sitter query patterns
    fn extract_exported_functions(
        &self,
        source: &str,
        tree: &Tree,
    ) -> HashMap<String, String> {
        let mut exports = HashMap::new();
        let query_str = r#"
            (export_statement
              declaration: (function_declaration
                name: (identifier) @fn_name
                parameters: (formal_parameters) @params))
        "#;

        let language = tree_sitter_typescript::language_typescript();
        if let Ok(query) = Query::new(language, query_str) {
            let mut cursor = QueryCursor::new();
            let matches = cursor.matches(&query, tree.root_node(), source.as_bytes());

            for m in matches {
                let mut name = String::new();
                let mut params = String::new();

                for capture in m.captures {
                    let text = &source[capture.node.byte_range()];
                    if capture.index == 0 {
                        name = text.to_string();
                    } else if capture.index == 1 {
                        params = text.to_string();
                    }
                }

                if !name.is_empty() {
                    exports.insert(name, params);
                }
            }
        }

        exports
    }
}
