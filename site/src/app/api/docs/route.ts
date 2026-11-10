import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * OpenAPI 3.1.0 specification for Starlight Intelligence System REST & Autonomic API
 * Attestation: Built on SIP § 3 — Starlight API Specification
 */
export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Starlight Intelligence System (SIS) API",
      version: "8.5.2",
      description:
        "Machine-readable OpenAPI schema for Starlight autonomous teammates, Firecracker microVM sandboxes, 6-vault memory substrate, governance approval gates, and genius execution paths.",
      contact: {
        name: "Starlight Intelligence Systems",
        url: "https://starlightintelligence.org",
      },
      license: {
        name: "Built on SIP § 3 — Sovereign Protocol",
        url: "https://starlightintelligence.org/protocol",
      },
    },
    servers: [
      {
        url: "https://starlightintelligence.org",
        description: "Production Sovereign Gateway",
      },
      {
        url: "http://localhost:3000",
        description: "Local Cockpit & API Engine",
      },
    ],
    tags: [
      { name: "Teammates", description: "Autonomous digital workers and model router" },
      { name: "Sandbox", description: "Isolated Firecracker microVM & empirical execution" },
      { name: "Vaults", description: "6-Vault sovereign memory substrate" },
      { name: "Genius", description: "Genius Profile and Freedom Path evaluation" },
      { name: "System", description: "Telemetry, autonomic heartbeat and OpenAPI docs" },
    ],
    paths: {
      "/api/teammates": {
        get: {
          summary: "List all autonomous teammates",
          description: "Returns the registry of active sovereign teammates including models, tools, and vault bindings.",
          operationId: "listTeammates",
          tags: ["Teammates"],
          responses: {
            "200": {
              description: "Teammate registry list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      teammates: {
                        type: "array",
                        items: { $ref: "#/components/schemas/TeammateManifest" },
                      },
                      count: { type: "integer" },
                      substrate: { type: "string" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                    required: ["teammates", "count", "substrate", "timestamp"],
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Dispatch task to autonomous teammate",
          description: "Dispatches a prompt to a teammate with frontier model routing, sanitization, and fail-closed governance checks.",
          operationId: "dispatchTeammate",
          tags: ["Teammates"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    teammateId: { type: "string", example: "starlight-queen" },
                    prompt: { type: "string", example: "Conduct an autonomic memory sweep" },
                    tier: {
                      type: "string",
                      enum: ["light", "standard", "frontier"],
                      default: "standard",
                    },
                    model: { type: "string", example: "claude-sonnet-5-5" },
                  },
                  required: ["teammateId", "prompt"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Execution response or governance approval gate",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          sender: { type: "string" },
                          content: { type: "string" },
                          timestamp: { type: "string" },
                          executionTree: {
                            type: "array",
                            items: { $ref: "#/components/schemas/ExecutionStepTrace" },
                          },
                          approvalRequest: { $ref: "#/components/schemas/ApprovalGate" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid dispatch parameters" },
          },
        },
      },
      "/api/teammates/stream": {
        post: {
          summary: "Stream teammate execution traces via SSE",
          description: "Initiates real-time Server-Sent Events stream delivering step updates, microVM output, and final message chunks.",
          operationId: "streamTeammate",
          tags: ["Teammates"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    teammateId: { type: "string" },
                    prompt: { type: "string" },
                    tier: { type: "string", enum: ["light", "standard", "frontier"] },
                    model: { type: "string" },
                  },
                  required: ["teammateId", "prompt"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Server-Sent Events event stream",
              content: {
                "text/event-stream": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
      "/api/teammates/heartbeat": {
        get: {
          summary: "Autonomic system telemetry and heartbeat",
          description: "Returns 1Hz autonomic cadence status, active workflows, latency, memory pressure, and subsystem diagnostics.",
          operationId: "getHeartbeat",
          tags: ["System"],
          responses: {
            "200": {
              description: "Telemetry payload",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      tick: { type: "integer" },
                      status: { type: "string", enum: ["healthy", "degraded", "evaluating"] },
                      latencyMs: { type: "number" },
                      pulse: { type: "string", enum: ["active", "pulsing", "idle"] },
                      lastHeartbeat: { type: "string" },
                      pendingApprovalsCount: { type: "integer" },
                      activeWorkflowsCount: { type: "integer" },
                      subsystems: { type: "object", additionalProperties: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/teammates/sandbox": {
        get: {
          summary: "List supported sandbox environments",
          description: "Returns available microVM execution engines and language runners.",
          operationId: "getSandboxInfo",
          tags: ["Sandbox"],
          responses: {
            "200": {
              description: "Sandbox router status and available runners",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      service: { type: "string" },
                      attestation: { type: "string" },
                      supportedLanguages: { type: "array", items: { type: "string" } },
                      supportedProviders: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            default: { type: "boolean" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Execute code in isolated sandbox",
          description: "Executes code securely inside isolated Firecracker microVM or empirical sandbox with resource caps and security scrub.",
          operationId: "executeSandbox",
          tags: ["Sandbox"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "string", example: "console.log('Hello, Starlight!');" },
                    language: {
                      type: "string",
                      enum: ["javascript", "typescript", "python", "bash"],
                      default: "javascript",
                    },
                    provider: {
                      type: "string",
                      enum: ["microvm", "firecracker", "local", "edge"],
                      default: "microvm",
                    },
                    timeoutMs: { type: "integer", default: 10000 },
                  },
                  required: ["code"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Execution result with stdout, stderr, and duration",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      output: { type: "string" },
                      durationMs: { type: "number" },
                      providerUsed: { type: "string" },
                      error: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/teammates/approve": {
        post: {
          summary: "Resolve governance approval gate",
          description: "Resolves a pending human approval gate (financial transaction, git merge, or deployment).",
          operationId: "resolveApproval",
          tags: ["Teammates"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    requestId: { type: "string" },
                    action: { type: "string", enum: ["approve", "reject"] },
                  },
                  required: ["requestId", "action"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Approval resolution confirmation",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      requestId: { type: "string" },
                      status: { type: "string", enum: ["approved", "rejected"] },
                      timestamp: { type: "string" },
                      receipt: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/vaults": {
        get: {
          summary: "List registered memory vaults",
          description: "Returns the 6-vault registry (Strategic, Technical, Creative, Operational, Wisdom, Horizon).",
          operationId: "listVaults",
          tags: ["Vaults"],
          responses: {
            "200": {
              description: "Registry of available vaults",
            },
          },
        },
        post: {
          summary: "Persist memory entry to vault",
          description: "Appends memory atom to specified or auto-classified vault.",
          operationId: "rememberVault",
          tags: ["Vaults"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                    vault: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    confidence: { type: "number" },
                  },
                  required: ["content"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Stored vault entry" },
          },
        },
      },
      "/api/vaults/{slug}": {
        get: {
          summary: "Get vault memories by slug",
          operationId: "getVaultBySlug",
          tags: ["Vaults"],
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Vault entries and metadata" },
            "404": { description: "Vault not found" },
          },
        },
      },
      "/api/docs": {
        get: {
          summary: "Retrieve OpenAPI 3.1.0 schema",
          description: "Returns this machine-readable specification document.",
          operationId: "getOpenApiSpec",
          tags: ["System"],
          responses: {
            "200": {
              description: "OpenAPI specification JSON",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        TeammateManifest: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
            domain: { type: "string" },
            voice: { type: "string" },
            status: { type: "string", enum: ["idle", "running", "waiting_approval"] },
            unreadCount: { type: "integer" },
            lastActive: { type: "string" },
            defaultTier: { type: "string", enum: ["light", "standard", "frontier"] },
            activeModels: { type: "array", items: { type: "string" } },
            connectedTools: { type: "array", items: { type: "string" } },
            activeVaults: { type: "array", items: { type: "string" } },
          },
          required: ["id", "name", "role", "domain", "status", "defaultTier"],
        },
        ExecutionStepTrace: {
          type: "object",
          properties: {
            id: { type: "string" },
            summary: { type: "string" },
            durationMs: { type: "number" },
            status: { type: "string", enum: ["success", "running", "error", "pending"] },
            command: { type: "string" },
            tool: { type: "string" },
            output: { type: "string" },
            diff: { type: "string" },
          },
          required: ["id", "summary", "durationMs", "status"],
        },
        ApprovalGate: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["FINANCIAL", "GIT_MERGE", "DEPLOYMENT", "PUBLIC_BROADCAST"] },
            title: { type: "string" },
            description: { type: "string" },
            consequences: { type: "string" },
            status: { type: "string", enum: ["pending", "approved", "rejected"] },
          },
          required: ["id", "type", "title", "description", "consequences", "status"],
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "X-Starlight-Substrate": "SIP-v8.3",
    },
  });
}
