#!/usr/bin/env node

// skill-activation-prompt.ts
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
function loadRulesFile(path) {
  if (!existsSync(path)) {
    return null;
  }
  try {
    const content = readFileSync(path, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to parse ${path}:`, err);
    return null;
  }
}
function mergeRules(global, project) {
  if (!global && !project)
    return null;
  if (!global)
    return project;
  if (!project)
    return global;
  return {
    version: project.version || global.version,
    description: project.description || global.description,
    skills: { ...global.skills, ...project.skills },
    agents: { ...global.agents, ...project.agents }
  };
}
async function main() {
  try {
    let input = readFileSync(0, "utf-8").trim();
    if (!input) { process.exit(0); return; }
    // Robust: strip BOM, \r , try parse
    input = input.replace(/^\uFEFF/, '').replace(/\r/g, '');
    let data;
    try {
      data = JSON.parse(input);
    } catch (e) {
      // fallback: perhaps the harness passes different envelope
      console.error('skill-activation: JSON parse failed, trying loose', e.message);
      // attempt to extract prompt if present as string somewhere
      const match = input.match(/"prompt"\s*:\s*"([^"]+)"/i) || input.match(/"(prompt|user_prompt|message)"\s*:\s*"([^"]+)"/i);
      if (match) {
        data = { prompt: match[1] || match[2], cwd: process.cwd() };
      } else {
        process.exit(0); return;
      }
    }
    const promptText = (data.prompt || data.user_prompt || data.message || '').toLowerCase();
    if (!promptText) { process.exit(0); return; }
    const prompt = promptText;
    const currentFile = data.cwd || data.project_dir || "";
    // Portable via hook-env.sh (HARNESS, GLOBAL_SKILLS_DIR, PROJECT_ROOT exported to env)
    const harness = process.env.HARNESS || 'claude';
    const skillsBase = process.env.GLOBAL_SKILLS_DIR || join(homedir(), ".claude", "skills");
    const globalRulesPath = join(skillsBase.split(':')[0], "skill-rules.json");  // first in compat list
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.env.CODEX_PROJECT_DIR || process.env.PROJECT_ROOT || process.env.GROK_PROJECT_DIR || "";
    const projectRulesPath = projectDir ? join(projectDir, ".claude", "skills", "skill-rules.json") : "";
    const globalRules = loadRulesFile(globalRulesPath);
    const projectRules = projectRulesPath ? loadRulesFile(projectRulesPath) : null;
    const rules = mergeRules(globalRules, projectRules);
    if (!rules) {
      process.exit(0);
    }
    if (!rules.skills || typeof rules.skills !== "object") {
      console.error("skill-rules.json missing or invalid skills object");
      process.exit(0);
    }
    const matchedSkills = [];
    const matchedAgents = [];
    for (const [skillName, config] of Object.entries(rules.skills)) {
      const triggers = config.promptTriggers;
      if (triggers) {
        if (triggers.keywords) {
          const keywordMatch = triggers.keywords.some((kw) => {
            try {
              const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const regex = new RegExp(`\\b${escaped}\\b`, "i");
              return regex.test(prompt);
            } catch (err) {
              console.error(`Invalid keyword in ${skillName}: ${kw}`, err);
              return false;
            }
          });
          if (keywordMatch) {
            matchedSkills.push({ name: skillName, matchType: "keyword", config });
            continue;
          }
        }
        if (triggers.intentPatterns) {
          const intentMatch = triggers.intentPatterns.some((pattern) => {
            try {
              const regex = new RegExp(pattern, "i");
              return regex.test(prompt);
            } catch (err) {
              console.error(`Invalid intent pattern in ${skillName}: ${pattern}`, err);
              return false;
            }
          });
          if (intentMatch) {
            matchedSkills.push({ name: skillName, matchType: "intent", config });
            continue;
          }
        }
      }
      if (config.fileTriggers?.pathPatterns && currentFile) {
        const fileMatch = config.fileTriggers.pathPatterns.some((pattern) => {
          try {
            const globRegex = pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\?/g, ".");
            const regex = new RegExp(globRegex, "i");
            return regex.test(currentFile);
          } catch (err) {
            console.error(`Invalid file pattern in ${skillName}: ${pattern}`, err);
            return false;
          }
        });
        if (fileMatch) {
          matchedSkills.push({ name: skillName, matchType: "file", config });
        }
      }
    }
    if (rules.agents) {
      for (const [agentName, config] of Object.entries(rules.agents)) {
        const triggers = config.promptTriggers;
        if (!triggers) {
          continue;
        }
        if (triggers.keywords) {
          const keywordMatch = triggers.keywords.some((kw) => {
            try {
              const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const regex = new RegExp(`\\b${escaped}\\b`, "i");
              return regex.test(prompt);
            } catch (err) {
              console.error(`Invalid keyword in ${agentName}: ${kw}`, err);
              return false;
            }
          });
          if (keywordMatch) {
            matchedAgents.push({ name: agentName, matchType: "keyword", config });
            continue;
          }
        }
        if (triggers.intentPatterns) {
          const intentMatch = triggers.intentPatterns.some((pattern) => {
            try {
              const regex = new RegExp(pattern, "i");
              return regex.test(prompt);
            } catch (err) {
              console.error(`Invalid intent pattern in ${agentName}: ${pattern}`, err);
              return false;
            }
          });
          if (intentMatch) {
            matchedAgents.push({ name: agentName, matchType: "intent", config });
          }
        }
      }
    }
    if (matchedSkills.length > 0 || matchedAgents.length > 0) {
      const criticalSkills = matchedSkills.filter((s) => s.config.priority === "critical");
      const highSkills = matchedSkills.filter((s) => s.config.priority === "high");
      const mediumSkills = matchedSkills.filter((s) => s.config.priority === "medium");
      const lowSkills = matchedSkills.filter((s) => s.config.priority === "low");
      const criticalAgents = matchedAgents.filter((a) => a.config.priority === "critical");
      const highAgents = matchedAgents.filter((a) => a.config.priority === "high");
      const mediumAgents = matchedAgents.filter((a) => a.config.priority === "medium");
      const lowAgents = matchedAgents.filter((a) => a.config.priority === "low");
      const mustActivateSkills = [...criticalSkills, ...highSkills];
      const mustActivateAgents = [...criticalAgents, ...highAgents];
      const suggestedSkills = [...mediumSkills, ...lowSkills];
      const suggestedAgents = [...mediumAgents, ...lowAgents];
      let contextParts = [];
      if (mustActivateSkills.length > 0 || mustActivateAgents.length > 0) {
        contextParts.push("SKILL AUTO-ACTIVATION:");
        contextParts.push("");
        if (mustActivateSkills.length > 0) {
          const skillName = mustActivateSkills[0].name;
          const skillDisplay = skillName.replace(/-/g, " ");
          const otherSkills = mustActivateSkills.slice(1).map((s) => s.name.replace(/-/g, " "));
          contextParts.push(`Use the "${skillDisplay}" skill for this request.`);
          if (mustActivateSkills[0].config.description) {
            contextParts.push(`Purpose: ${mustActivateSkills[0].config.description}`);
          }
          if (otherSkills.length > 0) {
            contextParts.push(`Also reference: ${otherSkills.join(", ")} skills`);
          }
          contextParts.push("");
        }
        if (mustActivateAgents.length > 0) {
          const agentName = mustActivateAgents[0].name;
          const agentDisplay = agentName.replace(/-/g, " ");
          const description = mustActivateAgents[0].config.description;
          contextParts.push(`RECOMMENDED AGENT: "${agentDisplay}"`);
          if (description) {
            contextParts.push(`Specializes in: ${description}`);
          }
          contextParts.push("");
        }
      }
      if (suggestedSkills.length > 0 || suggestedAgents.length > 0) {
        if (mustActivateSkills.length === 0 && mustActivateAgents.length === 0) {
          contextParts.push("SKILL SUGGESTIONS:");
          contextParts.push("");
        }
        if (suggestedSkills.length > 0) {
          const skillNames = suggestedSkills.map((s) => s.name.replace(/-/g, " ")).join(", ");
          contextParts.push(`Consider: ${skillNames}`);
        }
        if (suggestedAgents.length > 0) {
          const agentNames = suggestedAgents.map((a) => a.name.replace(/-/g, " ")).join(", ");
          contextParts.push(`Agents available: ${agentNames}`);
        }
      }
      const hookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: contextParts.join(`
`)
        }
      };
      console.log(JSON.stringify(hookOutput));
    }
    process.exit(0);
  } catch (err) {
    console.error("Error in skill-activation-prompt hook:", err);
    process.exit(0);
  }
}
main().catch((err) => {
  console.error("Uncaught error:", err);
  process.exit(0);
});
