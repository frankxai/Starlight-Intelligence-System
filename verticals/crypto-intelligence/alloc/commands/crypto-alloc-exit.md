---
name: crypto-alloc-exit
description: Construct or evaluate an emotion-free, metric-driven exit schedule for a position.
allowed-tools: Read, Write
argument-hint: <asset-slug> [--exit-tier scale-out|hard-stop]
vertical: crypto-intelligence
house: alloc
tier: Domain Sub-Stack Tier
---

# /crypto-alloc-exit

## Input

$ARGUMENTS — asset-slug and optional `--exit-tier` (default scale-out)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Exit Discipline Schedule — <asset-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Exit Configuration
* Asset: <asset-slug>
* Style: <Scale-Out / Hard-Stop>

## Exit Tier Triggers
1. **Target 1 (Scale 25%):** indicator: <Pi Cycle / MVRV value>
2. **Target 2 (Scale 50%):** indicator: <Pi Cycle / MVRV value>
3. **Hard Stop (Exit 100%):** condition: <technical failure / macro correlation flip>

---
**Built on SIP** — Crypto / House of Allocation · exit-schedule · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-alloc-exit · v0.2 · SIP v1.1.1
