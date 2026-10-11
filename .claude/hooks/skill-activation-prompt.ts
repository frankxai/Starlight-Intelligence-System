#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    prompt: string;
}

interface PromptTriggers {
    keywords?: string[];
    intentPatterns?: string[];
}

interface FileTriggers {
    pathPatterns?: string[];
    contentPatterns?: string[];
}

interface PostToolUseTriggers {
    enabled: boolean;
    tools: string[];
    minEdits: number;
    withinMinutes: number;
    description?: string;
}

interface SkillRule {
    type: 'guardrail' | 'domain';
    enforcement: 'block' | 'suggest' | 'warn';
    priority: 'critical' | 'high' | 'medium' | 'low';
    description?: string;
    promptTriggers?: PromptTriggers;
    fileTriggers?: FileTriggers;
}

interface AgentRule {
    type: 'workflow';
    activation: 'suggest' | 'auto';
    priority: 'critical' | 'high' | 'medium' | 'low';
    description?: string;
    promptTriggers?: PromptTriggers;
    postToolUseTriggers?: PostToolUseTriggers;
}

interface SkillRules {
    version: string;
    description?: string;
    skills: Record<string, SkillRule>;
    agents?: Record<string, AgentRule>;
}

interface MatchedSkill {
    name: string;
    matchType: 'keyword' | 'intent' | 'file';
    config: SkillRule;
}

interface MatchedAgent {
    name: string;
    matchType: 'keyword' | 'intent';
    config: AgentRule;
}

function loadRulesFile(path: string): SkillRules | null {
    if (!existsSync(path)) {
        return null;
    }
    try {
        const content = readFileSync(path, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`Failed to parse ${path}:`, err);
        return null;
    }
}

function mergeRules(global: SkillRules | null, project: SkillRules | null): SkillRules | null {
    if (!global && !project) return null;
    if (!global) return project;
    if (!project) return global;

    // Merge: project-specific rules override global rules
    return {
        version: project.version || global.version,
        description: project.description || global.description,
        skills: { ...global.skills, ...project.skills },
        agents: { ...global.agents, ...project.agents }
    };
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);
        const prompt = data.prompt.toLowerCase();
        const currentFile = data.cwd || '';

        // Load rules from both global and project-specific locations (portable via hook-env)
        const harness = process.env.HARNESS || 'claude';
        const skillsBase = (process.env.GLOBAL_SKILLS_DIR || join(homedir(), '.claude', 'skills')).split(':')[0];
        const globalRulesPath = join(skillsBase, 'skill-rules.json');
        const projectDir = process.env.CLAUDE_PROJECT_DIR || process.env.CODEX_PROJECT_DIR || process.env.PROJECT_ROOT || process.env.GROK_PROJECT_DIR || '';
        const projectRulesPath = projectDir
            ? join(projectDir, '.claude', 'skills', 'skill-rules.json')
            : '';

        const globalRules = loadRulesFile(globalRulesPath);
        const projectRules = projectRulesPath ? loadRulesFile(projectRulesPath) : null;

        // Merge rules (project overrides global)
        const rules = mergeRules(globalRules, projectRules);

        if (!rules) {
            // No rules files found
            process.exit(0);
        }

        // Validate rules structure
        if (!rules.skills || typeof rules.skills !== 'object') {
            console.error('skill-rules.json missing or invalid skills object');
            process.exit(0);
        }

        const matchedSkills: MatchedSkill[] = [];
        const matchedAgents: MatchedAgent[] = [];

        // Check each skill for matches
        for (const [skillName, config] of Object.entries(rules.skills)) {
            const triggers = config.promptTriggers;

            // Prompt triggers
            if (triggers) {
                // Keyword matching (with word boundaries)
                if (triggers.keywords) {
                    const keywordMatch = triggers.keywords.some(kw => {
                        try {
                            // Escape special regex characters in keyword
                            const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
                            return regex.test(prompt);
                        } catch (err) {
                            console.error(`Invalid keyword in ${skillName}: ${kw}`, err);
                            return false;
                        }
                    });
                    if (keywordMatch) {
                        matchedSkills.push({ name: skillName, matchType: 'keyword', config });
                        continue;
                    }
                }

                // Intent pattern matching with error handling
                if (triggers.intentPatterns) {
                    const intentMatch = triggers.intentPatterns.some(pattern => {
                        try {
                            const regex = new RegExp(pattern, 'i');
                            return regex.test(prompt);
                        } catch (err) {
                            console.error(`Invalid intent pattern in ${skillName}: ${pattern}`, err);
                            return false;
                        }
                    });
                    if (intentMatch) {
                        matchedSkills.push({ name: skillName, matchType: 'intent', config });
                        continue;
                    }
                }
            }

            // File triggers (path-based activation)
            if (config.fileTriggers?.pathPatterns && currentFile) {
                const fileMatch = config.fileTriggers.pathPatterns.some(pattern => {
                    try {
                        // Convert glob pattern to regex
                        const globRegex = pattern
                            .replace(/\*\*/g, '.*')  // ** matches any directory depth
                            .replace(/\*/g, '[^/]*') // * matches anything except /
                            .replace(/\?/g, '.');     // ? matches single char
                        const regex = new RegExp(globRegex, 'i');
                        return regex.test(currentFile);
                    } catch (err) {
                        console.error(`Invalid file pattern in ${skillName}: ${pattern}`, err);
                        return false;
                    }
                });
                if (fileMatch) {
                    matchedSkills.push({ name: skillName, matchType: 'file', config });
                }
            }
        }

        // Check each agent for matches
        if (rules.agents) {
            for (const [agentName, config] of Object.entries(rules.agents)) {
                const triggers = config.promptTriggers;
                if (!triggers) {
                    continue;
                }

                // Keyword matching (with word boundaries)
                if (triggers.keywords) {
                    const keywordMatch = triggers.keywords.some(kw => {
                        try {
                            // Escape special regex characters in keyword
                            const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
                            return regex.test(prompt);
                        } catch (err) {
                            console.error(`Invalid keyword in ${agentName}: ${kw}`, err);
                            return false;
                        }
                    });
                    if (keywordMatch) {
                        matchedAgents.push({ name: agentName, matchType: 'keyword', config });
                        continue;
                    }
                }

                // Intent pattern matching with error handling
                if (triggers.intentPatterns) {
                    const intentMatch = triggers.intentPatterns.some(pattern => {
                        try {
                            const regex = new RegExp(pattern, 'i');
                            return regex.test(prompt);
                        } catch (err) {
                            console.error(`Invalid intent pattern in ${agentName}: ${pattern}`, err);
                            return false;
                        }
                    });
                    if (intentMatch) {
                        matchedAgents.push({ name: agentName, matchType: 'intent', config });
                    }
                }
            }
        }

        // Generate output if matches found
        if (matchedSkills.length > 0 || matchedAgents.length > 0) {
            // Group skills by priority
            const criticalSkills = matchedSkills.filter(s => s.config.priority === 'critical');
            const highSkills = matchedSkills.filter(s => s.config.priority === 'high');
            const mediumSkills = matchedSkills.filter(s => s.config.priority === 'medium');
            const lowSkills = matchedSkills.filter(s => s.config.priority === 'low');

            // Group agents by priority
            const criticalAgents = matchedAgents.filter(a => a.config.priority === 'critical');
            const highAgents = matchedAgents.filter(a => a.config.priority === 'high');
            const mediumAgents = matchedAgents.filter(a => a.config.priority === 'medium');
            const lowAgents = matchedAgents.filter(a => a.config.priority === 'low');

            // Determine if we have critical/high priority items that MUST be activated
            const mustActivateSkills = [...criticalSkills, ...highSkills];
            const mustActivateAgents = [...criticalAgents, ...highAgents];
            const suggestedSkills = [...mediumSkills, ...lowSkills];
            const suggestedAgents = [...mediumAgents, ...lowAgents];

            let contextParts: string[] = [];

            // REQUIRED activations (critical + high priority)
            if (mustActivateSkills.length > 0 || mustActivateAgents.length > 0) {
                contextParts.push('SKILL AUTO-ACTIVATION:');
                contextParts.push('');

                if (mustActivateSkills.length > 0) {
                    const skillName = mustActivateSkills[0].name;
                    const skillDisplay = skillName.replace(/-/g, ' ');
                    const otherSkills = mustActivateSkills.slice(1).map(s => s.name.replace(/-/g, ' '));

                    contextParts.push(`Use the "${skillDisplay}" skill for this request.`);
                    if (mustActivateSkills[0].config.description) {
                        contextParts.push(`Purpose: ${mustActivateSkills[0].config.description}`);
                    }

                    if (otherSkills.length > 0) {
                        contextParts.push(`Also reference: ${otherSkills.join(', ')} skills`);
                    }
                    contextParts.push('');
                }

                if (mustActivateAgents.length > 0) {
                    const agentName = mustActivateAgents[0].name;
                    const agentDisplay = agentName.replace(/-/g, ' ');
                    const description = mustActivateAgents[0].config.description;

                    contextParts.push(`RECOMMENDED AGENT: "${agentDisplay}"`);
                    if (description) {
                        contextParts.push(`Specializes in: ${description}`);
                    }
                    contextParts.push('');
                }
            }

            // SUGGESTED activations (medium + low priority)
            if (suggestedSkills.length > 0 || suggestedAgents.length > 0) {
                if (mustActivateSkills.length === 0 && mustActivateAgents.length === 0) {
                    contextParts.push('SKILL SUGGESTIONS:');
                    contextParts.push('');
                }

                if (suggestedSkills.length > 0) {
                    const skillNames = suggestedSkills.map(s => s.name.replace(/-/g, ' ')).join(', ');
                    contextParts.push(`Consider: ${skillNames}`);
                }
                if (suggestedAgents.length > 0) {
                    const agentNames = suggestedAgents.map(a => a.name.replace(/-/g, ' ')).join(', ');
                    contextParts.push(`Agents available: ${agentNames}`);
                }
            }

            // Output in official JSON format for UserPromptSubmit hooks
            const hookOutput = {
                hookSpecificOutput: {
                    hookEventName: 'UserPromptSubmit',
                    additionalContext: contextParts.join('\n')
                }
            };

            console.log(JSON.stringify(hookOutput));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error in skill-activation-prompt hook:', err);
        process.exit(0);  // Exit gracefully to not block user
    }
}

main().catch(err => {
    console.error('Uncaught error:', err);
    process.exit(0);  // Exit gracefully
});
