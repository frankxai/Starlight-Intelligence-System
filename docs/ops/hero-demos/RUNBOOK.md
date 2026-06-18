# Estate Hero Demo — Runbook (R5)

**Title:** Speak to my estate. It remembers. It acts. It attests.

## 90-second narrative (for screen recording)

1. **Setup (10s)** — Show `4-layer-blueprint.md` + `prior-atoms.jsonl` + `voice-handoff-packet.json`
2. **Voice trigger (15s)** — Read transcript from handoff packet
3. **Routing (20s)** — Run `scripts/run-estate-hero-demo.ps1` (grok + codex fanout via si-dispatch)
4. **Output + attestation (15s)** — Open generated `synthesis-*.md` with Built on SIP footer
5. **Receipt (10s)** — Show `receipt-*.json` metrics block

## Execute (scripted replay)

```powershell
cd C:\Users\frank\Starlight-Intelligence-System
./scripts/run-estate-hero-demo.ps1
# optional third lane (agy DB recovery — longer timeout):
./scripts/run-estate-hero-demo.ps1 -IncludeAntigravity -TimeoutSec 300
```

## Success metrics

- `metrics.routingAccuracy` = pass (≥2 lanes activated)
- `metrics.firstAttemptSuccess` = pass (failed = 0)
- `metrics.attestationPresent` = true
- `metrics.humanMidFlight` = false (scripted dispatch only)
- Prior atoms cited in synthesis output

## Board gate

Public README hero / site positioning remains gated until R1–R5 full board verification per `docs/strategic/hero-demo-plan-estate-army.md`.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1