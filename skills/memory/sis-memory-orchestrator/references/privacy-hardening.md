# Privacy + Hardening — threat model, redaction, anti-leak architecture

This is what makes SIS adoptable by anyone, not just Frank. Privacy is architectural, not policy.

## Threat model

Three classes of adversary, ordered by likelihood:

1. **Inadvertent leak via LLM call.** Most common. Vault content gets included in a system prompt or RAG payload that ships to OpenRouter / Anthropic / fal.ai / etc. The model provider sees Frank's private notes. **Mitigation: Privacy Guardian redacts BEFORE the call.**
2. **Compromised local process.** Malware on the machine reads `memory/`. **Mitigation: encryption-at-rest (age/yubikey opt-in for sovereign tier); audit log surfaces unusual read patterns.**
3. **Network adversary.** MITM on a sync call. **Mitigation: cross-project sync uses TLS + signed payloads + per-peer e2e encryption.**

## Privacy levels (policy_set)

Configure per workflow / per sovereign user:

| Level | Behavior | When |
|---|---|---|
| `default` | Redact obvious PII; allow with warning | Frank's daily flow on his sole machine |
| `strict` | Redact + log + require user confirmation for borderline cases | Alliance helping work with shared context |
| `sovereign` | Block ANY outbound call containing redactable data; full local mode | Public sovereign user adopting SIS for sensitive domain (legal, medical, comms) |

Policy set lives in `~/.starlight/privacy.toml`:

```toml
[default]
policy_set = "default"

[per_brand]
"frankx" = "default"
"arcanea" = "default"
"client-acme-legal" = "sovereign"   # alliance work — full local
```

## Redaction patterns

The Privacy Guardian runs these checks. Patterns are conservative — false-positives are acceptable, false-negatives are not.

### Regex patterns (always-on)

```
EMAIL          \b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b
PHONE_INTL     \+?\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}
SSN_US         \b\d{3}-\d{2}-\d{4}\b
CREDIT_CARD    \b(?:\d[ -]*?){13,19}\b   (then Luhn check)
API_KEY        \b(sk-[A-Za-z0-9_-]{20,}|gsk_[A-Za-z0-9]{40,}|xi-api-[A-Za-z0-9]{20,}|pk_[A-Za-z0-9]{30,})\b
JWT            \beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b
IP_PRIVATE     \b(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)\d+\.\d+\b
WIN_PATH_USER  C:\\Users\\([^\\]+)   (capture group 1 = user; flag if not current user)
```

### NER patterns (run only when content > 50 words, performance reason)

- Person names matched against `~/.starlight/private-contacts.txt` (user-maintained list of close circle whose names should never leak)
- Company names matched against `~/.starlight/private-clients.txt`

### Heuristics (post-NER pass)

- Sentences containing "I think X is" + person name + adjective → flag (private opinion about person)
- Sentences containing "$" + numbers > 1000 → flag (money figure, may be sensitive)
- Path patterns containing other-user home dirs

## Redaction action

For each match:

1. **Replace** with a typed token: `<email>`, `<phone>`, `<api-key>`, `<person:F1>`, `<money>`. The token preserves type info so the LLM understands semantics without seeing the literal.
2. **Log** the redaction in `memory/_audit/{date}.jsonl`: `{ ts, source, type, count }`. Never log the literal redacted value.
3. **Block** the entire call if `policy_set == "sovereign"` and any redaction fires. Return `blocked=true` to the caller.

## Anti-leak architecture

### Gate 1: never include full vaults in system prompts

Cognition router builds system prompts from `agents/starlight-voice-operator.md` + handoff skill content. **Never** include vault content in the system prompt itself. Retrieval is per-turn, top-k slice.

### Gate 2: top-k retrieval, not bulk dump

When Retriever serves an LLM call, it returns ≤5 slices, each ≤200 tokens. Total RAG payload ≤1000 tokens. Hard cap.

### Gate 3: separate redaction from retrieval

Don't trust the substrate to redact. Redaction runs in a separate pass after the substrate returns hits, before the payload is built for the LLM call.

### Gate 4: outbound call inspector

Every fetch() to an external host (OpenRouter / Anthropic / fal.ai / ElevenLabs / Groq) goes through a wrapper that calls Privacy Guardian on the request body. The wrapper lives at `private/voice-operator/service/_outbound.py` (to be created) and replaces direct httpx.post calls in backends.

### Gate 5: audit log sampling

Auditor samples 5% of redacted payloads (post-redaction) into `memory/_audit/samples/` for manual review. If a leak happens, this is the forensic trail.

### Gate 6: no telemetry without explicit opt-in

The orchestrator does NOT send any telemetry to anyone. Mempalace / Letta / Mem0 may have telemetry — disable on install via their config.

## Encryption at rest (opt-in, sovereign tier)

When `policy_set = "sovereign"`:

1. Vault MD files encrypted with `age` (yubikey-backed identity)
2. mempalace / Qdrant data dir on encrypted volume (BitLocker on Windows; LUKS on Linux)
3. Embeddings cache encrypted (since embeddings can be inverted to recover content)
4. Knowledge-graph JSONL encrypted at rest; decrypted only into memory by trusted processes

Setup (manual, one-time):

```powershell
# Install age + yubikey plugin
winget install FiloSottile.age
winget install FiloSottile.age-plugin-yubikey

# Create identity
age-plugin-yubikey --generate

# Encrypt existing vault
age -r <recipient-pubkey> memory/vaults/strategic-vault.md > memory/vaults/strategic-vault.md.age
# (then delete the plaintext)
```

Frank's existing flow doesn't need this. Add when sovereign users come on board.

## Anti-hacker hardening

### Network surface

- Voice-operator FastAPI :7373 binds to 127.0.0.1 only by default (per `service/main.py::serve`)
- LCC dashboard :3007 — same
- Arcanea-voice :7777 — same
- Cloudflare Tunnel for phone access uses a one-time bearer token; no port exposed
- No multicast / broadcast listeners

### Auth

- Loopback bypasses auth (`_is_loopback` in `service/server.py`)
- Non-loopback requires `VOICE_OPERATOR_AUTH_TOKEN` bearer header — `secrets.compare_digest` for constant-time check (already implemented)
- WebSocket `/ws` requires token in query param

### File system

- Substrate paths under `~/.starlight/` and `private/voice-operator/` only — never write outside (existing PacketRouter has guards on this)
- File-write tools in arcanea-voice's `claude_prompt` / `file_write` confined to user home (per existing implementation)

### Process isolation

- One Memory Bus daemon arbitrates all DB access (per AgentDB constraint)
- Each Tab worktree should NOT spawn its own DB process — connect to Memory Bus instead

### Dependency hygiene

- Pin all Python deps in `pyproject.toml` / `requirements.txt`
- Pin all npm deps via `package-lock.json`
- Run `pip-audit` / `npm audit` on schedule (not yet wired)
- Avoid pulling random unaudited HF models for embeddings; use the curated list (sentence-transformers/all-MiniLM-L6-v2, BAAI/bge-large-en-v1.5)

### Update discipline

- Sub-skill `references/upstream-watch.md` (TODO) tracks upstream CVEs for: mempalace, Letta, Mem0, Qdrant, AgentDB, screenpipe, FastAPI, Next.js, ElevenLabs SDK
- Auditor flags when a watched dep is >90 days behind upstream

## What this skill explicitly does NOT promise

- **Defense against the model provider itself.** OpenRouter / Anthropic / Groq see whatever we send (post-redaction). If your threat model includes those providers as adversary, you must run local-only LLMs (llama.cpp / Ollama). The skill supports that path but doesn't verify it for you.
- **Defense against compromised app code.** If an attacker gets RCE on the machine, all bets are off. Encryption at rest helps. Process isolation helps. Air-gap helps more.
- **Forensics-grade audit.** The audit log is best-effort. If you need legally-defensible logs, integrate a tamper-evident log (e.g., Trillian).
