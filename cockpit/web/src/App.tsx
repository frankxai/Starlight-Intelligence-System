import React, { useState, useMemo } from 'react';
import type {
  CanvasNode,
  CanvasEdge,
  VaultType,
  AgentNodeData,
  ExecutionGateData,
  VaultEntry,
} from './types/cockpit';
import { ALL_VAULT_METADATA, VAULT_METADATA } from './memory/vaultData';
import { SpatialCanvas } from './canvas/SpatialCanvas';
import { HeaderToolbar } from './components/HeaderToolbar';
import { DeliberationChamber } from './council/DeliberationChamber';
import { BenchmarkModal } from './components/BenchmarkModal';
import { NodeDetailModal } from './components/NodeDetailModal';

// Canonical Initial Nodes for Starlight Cockpit
const createInitialNodes = (): CanvasNode[] => {
  const nodes: CanvasNode[] = [];

  // 1. Six Memory Vault Nodes
  const vaultPositions: Record<VaultType, { x: number; y: number }> = {
    strategic: { x: 80, y: 60 },
    technical: { x: 500, y: 60 },
    creative: { x: 920, y: 60 },
    operational: { x: 80, y: 540 },
    wisdom: { x: 500, y: 540 },
    horizon: { x: 920, y: 540 },
  };

  ALL_VAULT_METADATA.forEach((meta) => {
    const pos = vaultPositions[meta.id];
    nodes.push({
      id: meta.id,
      type: 'memoryVault',
      x: pos.x,
      y: pos.y,
      width: 340,
      height: 320,
      data: meta,
    });
  });

  // 2. Active Agent Nodes
  const initialAgents: AgentNodeData[] = [
    {
      id: 'architect',
      name: 'Starlight Architect',
      role: 'System Design & API Contracts',
      domain: 'Code & Architecture',
      model: 'Claude 3.7 Sonnet',
      tier: 'Specialist',
      status: 'executing',
      voice: 'Architect (Primary)',
      activeVaults: ['technical', 'strategic'],
      avatarColor: '#50e3c2',
    },
    {
      id: 'sentinel',
      name: 'Starlight Sentinel',
      role: 'Security, Veil PII & Taste Audit',
      domain: 'Governance & Security',
      model: 'Gemini 2.5 Flash',
      tier: 'Specialist',
      status: 'deliberating',
      voice: 'Sentinel (Direct)',
      activeVaults: ['technical'],
      avatarColor: '#ff5e7e',
    },
    {
      id: 'orchestrator',
      name: 'Starlight Orchestrator',
      role: 'Multi-Agent Router & Workflows',
      domain: 'Orchestration Hub',
      model: 'Grok 4.3 Reasoning',
      tier: 'Core',
      status: 'executing',
      voice: 'Frank DNA',
      activeVaults: ['operational', 'strategic'],
      avatarColor: '#bf95fc',
    },
    {
      id: 'weaver',
      name: 'Starlight Weaver',
      role: 'Creative Synthesis & Aesthetics',
      domain: 'Creative Intelligence',
      model: 'Claude 3.7 Sonnet',
      tier: 'Specialist',
      status: 'idle',
      voice: 'Weaver (Poetic/Pattern)',
      activeVaults: ['creative'],
      avatarColor: '#f59e0b',
    },
  ];

  const agentPositions = [
    { x: 260, y: 320 },
    { x: 620, y: 320 },
    { x: 980, y: 320 },
    { x: 1340, y: 160 },
  ];

  initialAgents.forEach((agent, i) => {
    const pos = agentPositions[i] || { x: 300 + i * 280, y: 320 };
    nodes.push({
      id: agent.id,
      type: 'agent',
      x: pos.x,
      y: pos.y,
      width: 280,
      height: 220,
      data: agent,
    });
  });

  // 3. Execution Gate Node (Santa Review / SIP Consensus)
  const initialGate: ExecutionGateData = {
    id: 'santa_consensus_gate_01',
    name: 'Santa Review Gate',
    gateType: 'santa-review',
    status: 'ratified',
    criteria: [
      { name: 'taste.md Standard Verification', passed: true },
      { name: 'The Veil PII & Secret Scrub', passed: true },
      { name: 'SIP Invariant Verification', passed: true },
      { name: '120 FPS Viewport Transform', passed: true },
    ],
  };

  nodes.push({
    id: initialGate.id,
    type: 'executionGate',
    x: 620,
    y: 740,
    width: 300,
    height: 240,
    data: initialGate,
  });

  return nodes;
};

// Canonical Initial Cables (Edges)
const createInitialEdges = (): CanvasEdge[] => {
  return [
    {
      id: 'edge_arch_tech',
      source: 'architect',
      target: 'technical',
      active: true,
      color: '#50e3c2',
    },
    {
      id: 'edge_arch_strat',
      source: 'architect',
      target: 'strategic',
      active: true,
      color: '#78a6ff',
    },
    {
      id: 'edge_sent_tech',
      source: 'sentinel',
      target: 'technical',
      active: true,
      color: '#ff5e7e',
    },
    {
      id: 'edge_orch_ops',
      source: 'orchestrator',
      target: 'operational',
      active: true,
      color: '#f59e0b',
    },
    {
      id: 'edge_orch_strat',
      source: 'orchestrator',
      target: 'strategic',
      active: true,
      color: '#78a6ff',
    },
    {
      id: 'edge_weaver_creative',
      source: 'weaver',
      target: 'creative',
      active: true,
      color: '#bf95fc',
    },
    {
      id: 'edge_gate_arch',
      source: 'santa_consensus_gate_01',
      target: 'architect',
      active: true,
      color: '#bf95fc',
    },
    {
      id: 'edge_gate_sent',
      source: 'santa_consensus_gate_01',
      target: 'sentinel',
      active: true,
      color: '#50e3c2',
    },
  ];
};

export const App: React.FC = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>(createInitialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(createInitialEdges);
  const [fps, setFps] = useState<number>(120);

  // Modals & Panels
  const [isCouncilOpen, setIsCouncilOpen] = useState<boolean>(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);

  // Extract connected vaults for the deliberation chamber
  const connectedVaults = useMemo(() => {
    const vaults = new Set<VaultType>();
    edges.forEach((ed) => {
      if (ALL_VAULT_METADATA.some((v) => v.id === ed.source)) vaults.add(ed.source as VaultType);
      if (ALL_VAULT_METADATA.some((v) => v.id === ed.target)) vaults.add(ed.target as VaultType);
    });
    return Array.from(vaults);
  }, [edges]);

  const activeAgentIds = useMemo(() => {
    return nodes.filter((n) => n.type === 'agent').map((n) => n.id);
  }, [nodes]);

  // Add a new specialist agent node
  const handleAddAgent = () => {
    const agentPool: Array<{ id: string; name: string; role: string; color: string }> = [
      { id: `prime_${Date.now()}`, name: 'Starlight Prime', role: 'Unified Voice & Consensus', color: '#bf95fc' },
      { id: `navigator_${Date.now()}`, name: 'Starlight Navigator', role: 'Horizon & Roadmap Planning', color: '#38bdf8' },
      { id: `hermes_${Date.now()}`, name: 'Starlight Hermes', role: 'Cross-Repo Search & Provenance', color: '#50e3c2' },
    ];
    const candidate = agentPool[Math.floor(Math.random() * agentPool.length)];

    const newNode: CanvasNode = {
      id: candidate.id,
      type: 'agent',
      x: 300 + Math.random() * 400,
      y: 200 + Math.random() * 200,
      width: 280,
      height: 220,
      data: {
        id: candidate.id,
        name: candidate.name,
        role: candidate.role,
        domain: 'Specialist Council',
        model: 'Claude 3.7 Sonnet',
        tier: 'Specialist',
        status: 'idle',
        voice: 'Direct & Technical',
        activeVaults: [],
        avatarColor: candidate.color,
      } as AgentNodeData,
    };

    setNodes((prev) => [...prev, newNode]);
  };

  // Add a new Execution Gate node
  const handleAddGate = () => {
    const gateId = `sip_gate_${Date.now()}`;
    const newGate: CanvasNode = {
      id: gateId,
      type: 'executionGate',
      x: 400 + Math.random() * 200,
      y: 600 + Math.random() * 150,
      width: 300,
      height: 240,
      data: {
        id: gateId,
        name: 'SIP Consensus Gate',
        gateType: 'sip-consensus',
        status: 'pending',
        criteria: [
          { name: 'Model Council Convergence', passed: false },
          { name: 'Cryptographic Signature', passed: false },
        ],
      } as ExecutionGateData,
    };

    setNodes((prev) => [...prev, newGate]);
  };

  // 100+ Nodes Stress Test Topology Generator
  const handleSpawn100Nodes = () => {
    const stressNodes: CanvasNode[] = [];
    const stressEdges: CanvasEdge[] = [];

    // Keep initial 6 vaults
    ALL_VAULT_METADATA.forEach((meta, idx) => {
      stressNodes.push({
        id: meta.id,
        type: 'memoryVault',
        x: (idx % 3) * 440 + 100,
        y: Math.floor(idx / 3) * 400 + 80,
        width: 340,
        height: 320,
        data: meta,
      });
    });

    // Add 96 Agent nodes in a spatial matrix
    const agentRoles = ['Architect', 'Sentinel', 'Orchestrator', 'Weaver', 'Sage', 'Navigator', 'Hermes', 'Envoy'];
    const colors = ['#50e3c2', '#ff5e7e', '#bf95fc', '#f59e0b', '#78a6ff', '#38bdf8', '#50e3c2'];

    for (let i = 0; i < 96; i++) {
      const col = i % 12;
      const row = Math.floor(i / 12);
      const roleName = agentRoles[i % agentRoles.length];
      const agentId = `stress_agent_${i}`;

      stressNodes.push({
        id: agentId,
        type: 'agent',
        x: col * 320 - 400,
        y: row * 260 + 900,
        width: 280,
        height: 220,
        data: {
          id: agentId,
          name: `${roleName} Node #${i + 1}`,
          role: 'Swarm Worker Node',
          domain: 'Parallel Mesh',
          model: 'Gemini 2.5 Flash',
          tier: 'Specialist',
          status: i % 3 === 0 ? 'executing' : i % 3 === 1 ? 'deliberating' : 'idle',
          voice: 'Telemetry Worker',
          activeVaults: [(ALL_VAULT_METADATA[i % 6].id)],
          avatarColor: colors[i % colors.length],
        } as AgentNodeData,
      });

      // Link to one of the 6 vaults
      stressEdges.push({
        id: `stress_edge_${i}`,
        source: agentId,
        target: ALL_VAULT_METADATA[i % 6].id,
        active: true,
        color: colors[i % colors.length],
      });
    }

    setNodes(stressNodes);
    setEdges(stressEdges);
  };

  const handleRestoreDefaultNodes = () => {
    setNodes(createInitialNodes());
    setEdges(createInitialEdges());
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050509] text-white">
      {/* Top Header & Metrics Toolbar */}
      <HeaderToolbar
        fps={fps}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onOpenCouncil={() => setIsCouncilOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onAddAgent={handleAddAgent}
        onAddGate={handleAddGate}
        onResetView={handleRestoreDefaultNodes}
        onSelectEntry={(entry) => setSelectedEntry(entry)}
      />

      {/* Infinite 120 FPS Spatial Canvas Engine */}
      <SpatialCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onSelectEntry={(entry) => setSelectedEntry(entry)}
        onFpsUpdate={setFps}
      />

      {/* Slide-Out Streaming Council Deliberation Chamber */}
      <DeliberationChamber
        isOpen={isCouncilOpen}
        onClose={() => setIsCouncilOpen(false)}
        connectedVaults={connectedVaults}
        activeAgentIds={activeAgentIds}
      />

      {/* Verification & Benchmark Modal */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        currentFps={fps}
        nodeCount={nodes.length}
        onSpawn100Nodes={handleSpawn100Nodes}
        onRestoreDefaultNodes={handleRestoreDefaultNodes}
      />

      {/* Vault Entry Detail Modal */}
      <NodeDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
};
