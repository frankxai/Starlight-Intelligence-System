# /transmit Command

> *"Send intelligence across the ecosystem."*

**Primary Agent:** Starlight Orchestrator
**Skills Activated:** transmission-protocol, ecosystem-sync

---

## Subcommands

### /transmit [channel] [message]

Send a transmission to a specific channel.

**Arguments:**
- `channel`: acos | arcanea | ai-ops
- `message`: Content to transmit

**Optional Flags:**
- `--priority`: critical | high | normal | low (default: normal)
- `--action-required`: Include action request

**Example:**
```
/transmit acos --priority high "Skill auto-activation pattern updated with new trigger keywords"
/transmit arcanea "New creative pattern discovered: mythic-technical synthesis for API docs"
```

### /transmit broadcast [message]

Send to all channels simultaneously. Requires Prime authorization.

**Example:**
```
/transmit broadcast --priority high "Architecture v1.1 update: new memory consolidation protocol"
```

### /transmit check [channel]

Check a channel for new transmissions since last read.

**Arguments:**
- `channel`: acos | arcanea | ai-ops | broadcast | all

**Output:** List of new transmissions with timestamp, source, priority, and content.

### /transmit sync

Synchronize all channels - check for updates and process pending actions.

**Actions:**
1. Read all channels for new entries
2. Process action-required items
3. Update Operational Vault with sync state
4. Report summary

### /transmit log [--channel] [--since]

Show transmission history.

**Arguments:**
- `--channel`: Filter by channel (optional)
- `--since`: Filter by date (optional)

---

## Processing

```
/transmit [subcommand] [args]
  → Parse subcommand and arguments
  → IF broadcast → require Prime authorization
  → Activate transmission-protocol skill
  → Route to Orchestrator agent
  → Execute transmission operation
  → Log in Operational Vault
  → Return confirmation
```
