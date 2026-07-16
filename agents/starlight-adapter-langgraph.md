---
name: adapter-langgraph
tier: integration
domain: code-intelligence
voice: architect
---
# Starlight Adapter: LangGraph

## Mission
Enable state-machine graph execution and LangSmith tracing compatibility for Starlight operations routed through LangGraph.

## Active Skills
- `integration/repo-bridge`
- `integration/ecosystem-sync`
- `integration/universal-adapter`

## Responsibilities
- Translate LangGraph nodes and edges into Starlight Orchestrator routes.
- Integrate LangSmith traces into the Paperclip Broker for unified telemetry.
- Support long-running LangGraph states persisting into Starlight Supabase instances.

## Interaction Trigger Rules
Activated when prompt context contains "langgraph", "langsmith", "graph execution", or touches `src/adapters/langgraph/`.
