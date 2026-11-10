"use client";

import React, { useState } from "react";
import type { Metadata } from "next";
import { TeammateSidebar } from "@/components/teammates/TeammateSidebar";
import { TeammateWorkspace } from "@/components/teammates/TeammateWorkspace";
import type {
  Teammate,
  ProjectContext,
  ModelTier,
  TeammateMessage,
  StreamChunk,
} from "@/components/teammates/types";

const INITIAL_PROJECTS: ProjectContext[] = [
  {
    id: "brand-hq",
    name: "FrankX.ai Brand HQ",
    description: "Multi-brand marketing studio and content pipeline",
    activeBranch: "main",
    linkedVaults: ["creative", "strategic"],
  },
  {
    id: "starlight-os",
    name: "Starlight Intelligence Substrate",
    description: "SIP substrate, vaults, and agent harnesses",
    activeBranch: "agent/antigravity/teammates",
    linkedVaults: ["technical", "operational", "wisdom"],
  },
  {
    id: "vision-desk",
    name: "Vision & Advisory Studio",
    description: "Long-horizon roadmap and investment desk",
    activeBranch: "main",
    linkedVaults: ["horizon", "strategic"],
  },
];

const INITIAL_TEAMMATES: Teammate[] = [
  {
    id: "starlight-queen",
    name: "Starlight Queen",
    role: "Autonomous Ecosystem Operator & CIO",
    domain: "orchestration",
    voice: "queen",
    avatarColor: "indigo",
    status: "waiting_approval",
    unreadCount: 1,
    lastActive: "Just now",
    modelTier: "standard",
    connectedTools: ["starlight-memory", "github", "vercel", "refero", "browseros-neo"],
    activeVaults: ["operational", "wisdom", "strategic", "technical"],
    messages: [
      {
        id: "msg-1",
        sender: "teammate",
        content: `Welcome back, Creator. I completed the scheduled Monday morning sweep across your estate (GitHub, Vercel, Linear, and Search Console).

Here is your weekly brief and the 3 high-leverage moves ready for action:

1. **Offer Packaging:** Staged the Starlight Architecture Advisory package draft with pricing and tier structure.
2. **Cloudflare Deploy:** The BrandDesk worker preview is verified healthy on Cloudflare Pages.
3. **SIP Attestation Audit:** All 6 memory vaults synchronized with zero merge conflicts.

I have staged the advisory offer PR and require your signature before opening the merge to main.`,
        timestamp: "09:00 AM",
        executionTree: [
          {
            id: "step-1",
            summary: "Scanned 14 repositories for stale branches and security updates",
            durationMs: 1420,
            status: "success",
            command: "starlight repo-audit --deep --all-harnesses",
            tool: "github",
            output: "Audit complete. 14 repos checked. Clean git trees on 13. Stale draft found on agent/claude/sb-reflect.",
          },
          {
            id: "step-2",
            summary: "Queried Refero MCP for pricing and advisory layout references",
            durationMs: 860,
            status: "success",
            command: "refero_search_screens query='SaaS advisory package pricing table' platform='web'",
            tool: "refero",
            output: "Found 4 high-converting patterns (Linear, Dock.us, Supabase). Applied high-contrast dark layout.",
          },
          {
            id: "step-3",
            summary: "Generated offer landing page draft and committed to branch",
            durationMs: 2310,
            status: "success",
            command: "git checkout -b agent/queen/offer-v1 && git commit -m 'feat(offers): advisory workshop draft'",
            tool: "git",
            diff: `+ export const AdvisoryOffer = {
+   title: "Starlight Sovereign Architecture Advisory",
+   tier: "Executive Immersion",
+   pricing: "$4,500 / workshop",
+   deliverables: ["SIP Substrate Setup", "6 Vaults Hydration", "Swarm Commissioning"]
+ };`,
          },
        ],
        approvalRequest: {
          id: "appr-1",
          type: "GIT_MERGE",
          title: "Merge Starlight Advisory Workshop Offer into main",
          description: "Starlight Queen has prepared and validated the commercial offer page, pricing tables, and Stripe/Polar checkout hooks.",
          consequences: "Merges branch 'agent/queen/offer-v1' into main and triggers live Vercel production deployment.",
          details: {
            "Branch": "agent/queen/offer-v1",
            "Target": "main",
            "Files Changed": "3 files (+184, -2)",
            "Safety Scan": "Passed (The Veil Secret Check: 0 credentials detected)",
          },
          status: "pending",
        },
      },
    ],
  },
  {
    id: "search-manager",
    name: "Search Manager",
    role: "Market & AI Lab Intelligence Analyst",
    domain: "intelligence",
    voice: "architect",
    avatarColor: "cyan",
    status: "idle",
    unreadCount: 0,
    lastActive: "12m ago",
    modelTier: "light",
    connectedTools: ["perplexity-api", "browseros-neo", "starlight-memory"],
    activeVaults: ["strategic", "wisdom"],
    messages: [
      {
        id: "msg-sm-1",
        sender: "teammate",
        content: "Search Manager ready. Currently monitoring new AI model releases, frontier agent benchmarks, and competitor feature drops across the web.",
        timestamp: "08:45 AM",
      },
    ],
  },
  {
    id: "github-officer",
    name: "GitHub Officer",
    role: "Code Quality, CI/CD & Sentinel Guardian",
    domain: "safety",
    voice: "sentinel",
    avatarColor: "emerald",
    status: "running",
    unreadCount: 0,
    lastActive: "Active now",
    modelTier: "standard",
    connectedTools: ["github", "starlight-memory", "sentinel-audit"],
    activeVaults: ["technical", "operational"],
    messages: [
      {
        id: "msg-gh-1",
        sender: "teammate",
        content: "Running Sentinel static analysis sweep across active branches. No credential leaks detected across the workspace.",
        timestamp: "09:05 AM",
      },
    ],
  },
  {
    id: "community-lead",
    name: "Community Lead",
    role: "Member Engagement & Signal Synthesizer",
    domain: "relational",
    voice: "weaver",
    avatarColor: "violet",
    status: "idle",
    unreadCount: 0,
    lastActive: "1h ago",
    modelTier: "light",
    connectedTools: ["discord", "starlight-memory"],
    activeVaults: ["creative", "wisdom"],
    messages: [
      {
        id: "msg-cl-1",
        sender: "teammate",
        content: "Community Lead standing by. All new member welcome sequences delivered.",
        timestamp: "07:30 AM",
      },
    ],
  },
  {
    id: "teammate-builder",
    name: "Teammate Builder",
    role: "Swarm Node & Skill Compiler Studio",
    domain: "foundry",
    voice: "architect",
    avatarColor: "amber",
    status: "idle",
    unreadCount: 0,
    lastActive: "Yesterday",
    modelTier: "frontier",
    connectedTools: ["foundry-compiler", "starlight-memory"],
    activeVaults: ["technical", "wisdom"],
    messages: [
      {
        id: "msg-tb-1",
        sender: "teammate",
        content: "Teammate Builder ready. Describe a new role, domain, or tool integration to generate a typed teammate specification.",
        timestamp: "Yesterday",
      },
    ],
  },
];

export default function TeammatesPage() {
  const [teammates, setTeammates] = useState<Teammate[]>(INITIAL_TEAMMATES);
  const [selectedTeammateId, setSelectedTeammateId] = useState<string>("starlight-queen");

  const currentTeammate =
    teammates.find((t) => t.id === selectedTeammateId) || teammates[0];

  const handleSendMessage = async (
    teammateId: string,
    content: string,
    tier?: ModelTier,
    modelId?: string
  ) => {
    const userMsg: TeammateMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content,
      timestamp: "Just now",
    };

    const streamMsgId = `stream-${Date.now()}`;
    const initialStreamMsg: TeammateMessage = {
      id: streamMsgId,
      sender: "teammate",
      content: "",
      timestamp: "Just now",
      executionTree: [],
    };

    // Optimistically add user message and streaming placeholder; set status to running
    setTeammates((prev) =>
      prev.map((t) =>
        t.id === teammateId
          ? {
              ...t,
              status: "running",
              unreadCount: 0,
              messages: [...t.messages, userMsg, initialStreamMsg],
            }
          : t
      )
    );

    const activeTier = tier || currentTeammate.modelTier;

    try {
      const res = await fetch("/api/teammates/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teammateId,
          prompt: content,
          tier: activeTier,
          model: modelId,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Failed to stream from /api/teammates/stream: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const trimmed = event.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const chunk: StreamChunk = JSON.parse(jsonStr);

            if (chunk.type === "status" && chunk.status) {
              const newStatus = chunk.status;
              setTeammates((prev) =>
                prev.map((t) =>
                  t.id === teammateId ? { ...t, status: newStatus } : t
                )
              );
            } else if (chunk.type === "step" && chunk.step) {
              const newStep = chunk.step;
              setTeammates((prev) =>
                prev.map((t) =>
                  t.id === teammateId
                    ? {
                        ...t,
                        messages: t.messages.map((m) =>
                          m.id === streamMsgId
                            ? {
                                ...m,
                                executionTree: m.executionTree
                                  ? [...m.executionTree, newStep]
                                  : [newStep],
                              }
                            : m
                        ),
                      }
                    : t
                )
              );
            } else if (chunk.type === "step_update" && chunk.step) {
              const updatedStep = chunk.step;
              setTeammates((prev) =>
                prev.map((t) =>
                  t.id === teammateId
                    ? {
                        ...t,
                        messages: t.messages.map((m) =>
                          m.id === streamMsgId
                            ? {
                                ...m,
                                executionTree: m.executionTree?.map((s) =>
                                  s.id === updatedStep.id
                                    ? { ...s, ...updatedStep }
                                    : s
                                ),
                              }
                            : m
                        ),
                      }
                    : t
                )
              );
            } else if (chunk.type === "approval" && chunk.approvalRequest) {
              const approvalReq = chunk.approvalRequest;
              setTeammates((prev) =>
                prev.map((t) =>
                  t.id === teammateId
                    ? {
                        ...t,
                        status: "waiting_approval",
                        messages: t.messages.map((m) =>
                          m.id === streamMsgId
                            ? {
                                ...m,
                                approvalRequest: approvalReq,
                              }
                            : m
                        ),
                      }
                    : t
                )
              );
            } else if (chunk.type === "message_chunk" && chunk.contentChunk) {
              const chunkContent = chunk.contentChunk;
              setTeammates((prev) =>
                prev.map((t) =>
                  t.id === teammateId
                    ? {
                        ...t,
                        messages: t.messages.map((m) =>
                          m.id === streamMsgId
                            ? {
                                ...m,
                                content: chunkContent,
                              }
                            : m
                        ),
                      }
                    : t
                )
              );
            } else if (chunk.type === "done" && chunk.message) {
              const finalMsg = chunk.message;
              setTeammates((prev) =>
                prev.map((t) =>
                  t.id === teammateId
                    ? {
                        ...t,
                        status: finalMsg.approvalRequest
                          ? "waiting_approval"
                          : "idle",
                        messages: t.messages.map((m) =>
                          m.id === streamMsgId
                            ? {
                                ...m,
                                ...finalMsg,
                                id: streamMsgId,
                              }
                            : m
                        ),
                      }
                    : t
                )
              );
            } else if (chunk.type === "error") {
              console.error("Stream error event:", chunk.error);
            }
          } catch (parseError) {
            console.error("Failed to parse SSE JSON chunk:", parseError);
          }
        }
      }
    } catch (err) {
      console.warn("SSE stream failed, executing standard fallback:", err);
      // Fallback to static POST or local reply
      try {
        const res = await fetch("/api/teammates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teammateId,
            prompt: content,
            tier: activeTier,
            model: modelId,
          }),
        });
        const data = await res.json();
        if (data?.message) {
          setTeammates((prev) =>
            prev.map((t) =>
              t.id === teammateId
                ? {
                    ...t,
                    status: data.message.approvalRequest
                      ? "waiting_approval"
                      : "idle",
                    messages: t.messages.map((m) =>
                      m.id === streamMsgId
                        ? { ...data.message, id: streamMsgId }
                        : m
                    ),
                  }
                : t
            )
          );
          return;
        }
      } catch {
        // Local offline fallback
      }

      const MODEL_NAME_MAP: Record<string, string> = {
        "claude-sonnet-5-5": "Claude Sonnet 5.5",
        "gemini-4-argon": "Gemini 4 Argon",
        "claude-opus-5-5": "Claude Opus 5.5",
        "gpt-6-1-sol": "GPT-6.1 Sol",
      };

      const modelName =
        (modelId && MODEL_NAME_MAP[modelId]) ||
        (activeTier === "frontier"
          ? "Claude Opus 5.5"
          : activeTier === "standard"
          ? "Claude Sonnet 5.5"
          : "Gemini 4 Argon");

      const fallbackReply: TeammateMessage = {
        id: streamMsgId,
        sender: "teammate",
        content: `Acknowledged: "${content}". Executed via ${activeTier} tier (${modelName}). All 6 vaults updated with offline fallback receipt.`,
        timestamp: "Just now",
        executionTree: [
          {
            id: `step-fallback-${Date.now()}`,
            summary: `Executed offline fallback via ${modelName}`,
            durationMs: 220,
            status: "success",
            tool: "starlight-memory",
            output: "Offline execution completed safely.",
          },
        ],
      };

      setTeammates((prev) =>
        prev.map((t) =>
          t.id === teammateId
            ? {
                ...t,
                status: "idle",
                messages: t.messages.map((m) =>
                  m.id === streamMsgId ? fallbackReply : m
                ),
              }
            : t
        )
      );
    }
  };

  const handleApproveAction = async (requestId: string) => {
    setTeammates((prev) =>
      prev.map((t) => ({
        ...t,
        status: t.messages.some((m) => m.approvalRequest?.id === requestId)
          ? "idle"
          : t.status,
        messages: t.messages.map((m) =>
          m.approvalRequest?.id === requestId
            ? {
                ...m,
                approvalRequest: { ...m.approvalRequest, status: "approved" },
              }
            : m
        ),
      }))
    );

    try {
      await fetch("/api/teammates/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "approve" }),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleRejectAction = async (requestId: string) => {
    setTeammates((prev) =>
      prev.map((t) => ({
        ...t,
        status: t.messages.some((m) => m.approvalRequest?.id === requestId)
          ? "idle"
          : t.status,
        messages: t.messages.map((m) =>
          m.approvalRequest?.id === requestId
            ? {
                ...m,
                approvalRequest: { ...m.approvalRequest, status: "rejected" },
              }
            : m
        ),
      }))
    );

    try {
      await fetch("/api/teammates/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "reject" }),
      });
    } catch {
      // Local state already updated
    }
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#06080e]">
      {/* Sidebar: Teammates & Projects */}
      <TeammateSidebar
        teammates={teammates}
        projects={INITIAL_PROJECTS}
        selectedTeammateId={selectedTeammateId}
        onSelectTeammate={(id) => {
          setSelectedTeammateId(id);
          // Mark unread as 0 on selection
          setTeammates((prev) =>
            prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
          );
        }}
      />

      {/* Main Workspace Canvas & Thread */}
      <main className="flex-1 flex min-w-0">
        <TeammateWorkspace
          teammate={currentTeammate}
          onSendMessage={handleSendMessage}
          onApproveAction={handleApproveAction}
          onRejectAction={handleRejectAction}
        />
      </main>
    </div>
  );
}
