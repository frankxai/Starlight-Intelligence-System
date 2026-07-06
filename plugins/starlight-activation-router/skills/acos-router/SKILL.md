---
name: acos-router
description: Codex-native /acos router for the Agentic Creator Operating System, content, creator, music, video, publishing, social, and ACOS workflow routing without loading all Claude command files. Use when prompts mention /acos, the installed /acos prompt shortcut, mobile alias acos:, Agentic Creator Operating System, ACOS, creator/content operations, content calendar, video, Suno/music, blog/social publishing, or creator OS auto-routing.
---

# ACOS Router

Use this skill for Codex-native `/acos` behavior: route Agentic Creator Operating System work into the right narrow lane without loading every Claude command or project command file.

When the local prompt shortcut is installed, `/acos` expands into this skill and should be shown to the user as Agentic Creator Operating System or Agentic Creator OS. On mobile or remote ChatGPT surfaces where slash commands are unavailable, treat `acos:` at the start of a prompt as `/acos`.

## Operating Rules

1. Pick the narrow creator lane first.
2. Read only the specific ACOS command, skill, repo file, or prompt needed for the selected lane.
3. Do not spawn swarms or fanout from hooks. Explicit user wording is required for cross-agent dispatch.
4. Prefer Codex for repo implementation and validation; route media, motion, music, and publishing work to the relevant Starlight skills/plugins.
5. Return a compact receipt: selected lane, files read, next action, and any generated artifact path.
6. For large creator programs, ask `/so` or Starlight Swarm to coordinate worker waves while ACOS owns the creator lane definition and publishing logic.

## Creator Lanes

- Strategy: content pillars, launch narrative, positioning, calendar.
- Production: scripts, outlines, captions, thumbnails, briefs, landing-copy edits.
- Music/Suno: song concepts, release prompts, distribution checklists.
- Video/motion: storyboards, motion briefs, generated media, visual QA.
- Publishing: blog/social packaging, metadata, scheduling, cross-post variants.
- Analysis: performance review, audience learning, backlog prioritization.
- Implementation: repo changes, templates, automations, dashboards, data flows.

## Reference Files

Only read these when the selected lane needs them:

- `C:\Users\frank\starlight\repos\FrankX\.claude\commands\acos.md`
- `C:\Users\frank\starlight\repos\agentic-creator-os\.claude\commands\acos.md`
- `C:\Users\frank\starlight\repos\FrankX\.claude\commands\aco.md`

## Output Shape

```json
{
  "lane": "strategy|production|music|video|publishing|analysis|implementation",
  "repo": "detected repo or none",
  "filesRead": [],
  "nextAction": "single concrete next step",
  "dispatchNeeded": false
}
```
