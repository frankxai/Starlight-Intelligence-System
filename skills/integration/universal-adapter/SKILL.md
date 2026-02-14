# Universal Adapter

> *"Connect to anything. Integrate with everything."*

## When This Skill Activates

- Connecting to external systems, APIs, or MCP servers
- Keywords: "external", "API", "MCP", "integration", "connect", "third-party"
- Default for: Starlight Orchestrator, Starlight Architect

## What This Skill Does

Provides a standardized way to integrate with external systems, MCP servers, and APIs. Acts as the universal connector between Starlight and the outside world.

## Procedures

### Procedure 1: MCP Server Integration

1. Identify the required MCP server from the Integration Map
2. Check availability and authentication status
3. Activate the MCP server connection
4. Execute the required operation
5. Parse and normalize the response
6. Deactivate when complete (if not needed further)
7. Log usage in Operational Vault

### Procedure 2: API Integration

1. Identify the target API and required endpoints
2. Check for existing adapter configuration
3. If no adapter exists:
   - Research the API documentation
   - Create adapter configuration
   - Store in integrations/apis/
4. Execute API call with proper authentication
5. Handle errors gracefully
6. Parse and normalize response

### Procedure 3: New Integration Setup

1. Document the external system's capabilities
2. Define the integration points (what data flows where)
3. Create adapter configuration
4. Define error handling and retry logic
5. Test the integration
6. Store configuration in integrations/
7. Update INTEGRATION_MAP.md

## Integration Points

- **Vault:** Operational Vault (integration logs), Technical Vault (integration patterns)
- **Integrations:** integrations/ directory (configurations)
- **Agents:** Orchestrator (coordination), Architect (integration design)

## Quality Criteria

- Is the integration properly authenticated?
- Are errors handled gracefully?
- Is the response properly normalized?
- Is the integration documented and reusable?
