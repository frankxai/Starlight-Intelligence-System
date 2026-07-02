# /invest-snapshot

Compose the cross-asset portfolio snapshot — ground truth before any decision. Reads (as available): Ghostfolio API (T0), DPI ledger state (`/wealth-dpi`), operator instance data (private, aggregate-only off-T0), Crypto IS House of Allocation outputs.

## Usage

```
/invest-snapshot [--aggregate]   # --aggregate is forced automatically off-T0
```

## Contract

Load `verticals/investment-intelligence/SKILL.md` and execute `verticals/investment-intelligence/engine/commands/portfolio-snapshot.md` under it:

- R5 non-advisory clause opens the output.
- Output validates against `engine/schemas/portfolio-snapshot.schema.json`.
- **Data classification enforced:** real balances/positions are T0-only per `ROUTING.md`. On T1/T2 models, emit percentage weights and band-labels, never raw amounts.
- A snapshot is not a strategy session — no recommendations from this command.

**Built on SIP** — invest-snapshot wrapper · v0.1
