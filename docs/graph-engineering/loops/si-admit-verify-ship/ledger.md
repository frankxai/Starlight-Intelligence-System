# Ledger — si-admit-verify-ship

**workId:** `work_graph_engineering_v1`  
**correlationId:** `corr_sis_graph_engineering_20260824`  
**projectId:** `frankxai/Starlight-Intelligence-System`  
**executor:** `agent:hermes` (Yogabook / Starlight)  
**supervisor:** must not be `agent:hermes` on the same turn  
**shape:** chain  
**deployment required:** no

Scoreboard lives here. Chat is not the scoreboard.

| Item | Node | State | Evidence |
|---|---|---|---|
| Four-layer contract | artifact | open | `docs/graph-engineering/CONTRACT.md` |
| Compiled SI loop | artifact | open | `docs/graph-engineering/loops/si-admit-verify-ship.v1.json` |
| Work-graph kernel | artifact | open | `src/work-graph.ts` + CLI + tests |
| Local gates | checks | open | `npm run test:work-graph` and `npm run test:graph-engineering` |
| Draft PR | change | open | fill after `gh pr create --draft` |
| Independent verify | verify | blocked | supervisor ≠ executor; fill `supervisor.md` from disk |
| Complete | complete | blocked | all admitted proofs |

## Rules

- One item end-to-end per round.
- Blocked ≠ parked. A missing supervisor is blocked, not complete.
- Do not add a second loop or a Codegraph/GraphRAG install from this ledger.
- No private transcript bodies.

## Close states

`SHIPPED` · `HOLD` · `BLOCKED` · `FAILED` · `REPLACED`
