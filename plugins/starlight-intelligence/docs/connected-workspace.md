# Connected workflow contract

Version 0.3 adds two read-only tools. `get_capability_catalog` accepts an optional brand and bounded query. It returns dated source observations, not connected-account status. `prepare_connected_workflow` accepts a workflow ID, owning brand and optional title. Unsupported brand/workflow combinations and unknown authority or credential fields fail validation.

| Workflow | Supported brands | Result |
| --- | --- | --- |
| `visual-release` | Starlight, GenCreator, Arcanea, FrankX | Website review packet with commit, deployment, route and viewport evidence fields |
| `creator-edition` | GenCreator, FrankX | Edition packet with source lineage, review state and export target |
| `world-production` | Arcanea | Asset packet with canon revision and generation provenance |
| `learn-build` | Starlight | Practice/build packet preserving attempt, critique, revision and transfer |

The core packet fields are `format`, `state`, `executes`, `title`, `brand`, `source_revision`, `observed_at`, `workflow`, `source_receipts`, `evidence`, `next_action` and `authority`. `format` is `starlight.workflow_packet.v1`, `state` is `prepared`, and `executes` is false. `evidence` starts with null values. Receipts retain exact inspected commits; an observation is not a current deployment claim. The public plugin includes only public repository receipts. A private workspace can include its own authorized source receipts without exporting them into this package.

Preparing a packet does not connect an account, dispatch a reviewer, generate an asset or publish a release. Actual work uses the user's existing authorization and must recheck the owning source and acceptance evidence. A saved packet can preserve the original brief and source revision; subsequent execution receipts must be attributed independently.

The private cloud Worker remains setup-required after a 404 health probe on 4 October 2026. Public Starlight initialize, four-tool discovery and package reading passed. Academy initialize and four-tool discovery passed; a learner practice loop was not tested. Local tests verify source behavior, not authenticated production service availability.
