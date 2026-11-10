"use client";

import React, { useState } from "react";
import type { Metadata } from "next";
import { TeammateSidebar } from "@/components/teammates/TeammateSidebar";
import { TeammateWorkspace } from "@/components/teammates/TeammateWorkspace";
import type { Teammate, ProjectContext } from "@/components/teammates/types";

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

  const handleSendMessage = (teammateId: string, content: string) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      content,
      timestamp: "Just now",
    };

    // Simulated responsive Queen loop
    const teammateReply = {
      id: `reply-${Date.now()}`,
      sender: "teammate" as const,
      content: `Acknowledged. I am decomposing "${content}" into an autonomous execution tree. Checking relevant vaults and staging changes on a safe branch.`,
      timestamp: "Just now",
      executionTree: [
        {
          id: `step-run-${Date.now()}`,
          summary: `Decomposed goal into subtasks via ${currentTeammate.modelTier} tier (${
            currentTeammate.modelTier === "frontier"
              ? "Claude Opus 5.5 / GPT-6 Astra"
              : currentTeammate.modelTier === "standard"
              ? "Claude Sonnet 5.5"
              : "Gemini 4 Argon / Sol"
          })`,
          durationMs: 450,
          status: "success" as const,
          command: "si-dispatch --intent=autonomous-plan",
          tool: "orchestrator",
          output: "Plan formulated with 0 financial impact. Execution dispatched to sandbox worker.",
        },
      ],
    };

    setTeammates((prev) =>
      prev.map((t) =>
        t.id === teammateId
          ? {
              ...t,
              unreadCount: 0,
              messages: [...t.messages, userMsg, teammateReply],
            }
          : t
      )
    );
  };

  const handleApproveAction = (requestId: string) => {
    setTeammates((prev) =>
      prev.map((t) => ({
        ...t,
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
  };

  const handleRejectAction = (requestId: string) => {
    setTeammates((prev) =>
      prev.map((t) => ({
        ...t,
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
