---
name: Bug report
about: Something doesn't work as the docs say it should
labels: bug
---

**What happened:**

[One paragraph. What you expected vs what actually happened.]

**Reproduction:**

```
1. Run `arc <command>`
2. Observe `<unexpected output>`
```

**Environment:**
- OS: [Windows 11 / macOS 14 / Ubuntu 22.04]
- PowerShell version: `$PSVersionTable.PSVersion` -> [output]
- Cockpit version: `arc version` -> [output]
- Terminal: [Windows Terminal 1.x / tmux 3.x / zellij 0.x]

**Doctor output:**

```
arc doctor
[paste output]
```

**Hook errors (if relevant):**

```
Get-Content ~/.starlight/cockpit/hook-errors.log -Tail 20
[paste output, redact any sensitive paths]
```

**Recent events (if relevant):**

```
arc events -Tail 20
[paste output]
```
