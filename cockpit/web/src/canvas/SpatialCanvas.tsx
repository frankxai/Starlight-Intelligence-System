import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type {
  CanvasNode,
  CanvasEdge,
  VaultMetadata,
  AgentNodeData,
  ExecutionGateData,
  VaultType,
  VaultEntry,
} from '../types/cockpit';
import { MemoryVaultNode } from './nodes/MemoryVaultNode';
import { AgentNode } from './nodes/AgentNode';
import { ExecutionGateNode } from './nodes/ExecutionGateNode';
import { CanvasMinimap } from './CanvasMinimap';
import { soundFX } from '../audio/soundFX';

interface SpatialCanvasProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: (nodes: CanvasNode[]) => void;
  onEdgesChange: (edges: CanvasEdge[]) => void;
  onSelectEntry?: (entry: VaultEntry) => void;
  onFpsUpdate?: (fps: number) => void;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onSelectEntry,
  onFpsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasBgRef = useRef<HTMLCanvasElement>(null);

  // Transform matrix: pan and zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 260, y: 120 });
  const [zoom, setZoom] = useState<number>(0.85);

  // Interaction states
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // In-progress connection dragging
  const [connectingFrom, setConnectingFrom] = useState<{
    portType: 'vault' | 'agent' | 'gate';
    nodeId: string;
    startX: number;
    startY: number;
  } | null>(null);
  const [currentMouseWorld, setCurrentMouseWorld] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Viewport size tracking
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // 120 FPS Animation loop for Bezier cable particles and FPS monitoring
  const frameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(performance.now());
  const particleOffsetRef = useRef<number>(0);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Screen to World coordinate conversion
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: screenX, y: screenY };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      return {
        x: (clientX - pan.x) / zoom,
        y: (clientY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // World to Screen coordinate conversion
  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      return {
        x: worldX * zoom + pan.x,
        y: worldY * zoom + pan.y,
      };
    },
    [pan, zoom]
  );

  // Mouse wheel zoom centered at cursor position
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Center point in world coords before zoom
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    // Smooth logarithmic zoom scale
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const nextZoom = Math.min(2.5, Math.max(0.2, zoom * zoomFactor));

    // New pan keeping cursor over the same world point
    const nextPanX = mouseX - worldX * nextZoom;
    const nextPanY = mouseY - worldY * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
    soundFX.playClick(3200);
  };

  // Pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on left click or middle click directly on canvas background
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      soundFX.playClick(1800);
    }
  };

  // Mouse move: handles panning, node dragging, and cable connection
  const handleMouseMove = (e: React.MouseEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setCurrentMouseWorld(worldPos);

    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (draggingNodeId) {
      const updatedNodes = nodes.map((node) => {
        if (node.id === draggingNodeId) {
          return {
            ...node,
            x: Math.round(worldPos.x - dragOffsetRef.current.x),
            y: Math.round(worldPos.y - dragOffsetRef.current.y),
          };
        }
        return node;
      });
      onNodesChange(updatedNodes);
    }
  };

  // Mouse up: releases pan, node drag, and finishes cable connection
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (draggingNodeId) {
      soundFX.playSnap();
      setDraggingNodeId(null);
    }

    if (connectingFrom) {
      const targetWorld = screenToWorld(e.clientX, e.clientY);
      // Find candidate node under drop point
      const targetNode = nodes.find((n) => {
        return (
          n.id !== connectingFrom.nodeId &&
          targetWorld.x >= n.x - 20 &&
          targetWorld.x <= n.x + n.width + 20 &&
          targetWorld.y >= n.y - 20 &&
          targetWorld.y <= n.y + n.height + 20
        );
      });

      if (targetNode) {
        // Create context link edge between Agent and Vault or Gate
        const newEdge: CanvasEdge = {
          id: `edge_${connectingFrom.nodeId}_${targetNode.id}_${Date.now()}`,
          source: connectingFrom.nodeId,
          target: targetNode.id,
          active: true,
          animated: true,
          color: connectingFrom.portType === 'vault' ? '#78a6ff' : '#50e3c2',
        };

        // Prevent duplicate edges
        const existing = edges.find(
          (ed) =>
            (ed.source === newEdge.source && ed.target === newEdge.target) ||
            (ed.source === newEdge.target && ed.target === newEdge.source)
        );

        if (!existing) {
          const updatedEdges = [...edges, newEdge];
          onEdgesChange(updatedEdges);
          soundFX.playConnect();

          // If connecting agent to vault, update Agent's activeVaults list
          const agentId = connectingFrom.portType === 'agent' ? connectingFrom.nodeId : targetNode.type === 'agent' ? targetNode.id : null;
          const vaultId = connectingFrom.portType === 'vault' ? connectingFrom.nodeId : targetNode.type === 'memoryVault' ? targetNode.id : null;

          if (agentId && vaultId) {
            const updatedNodes = nodes.map((node) => {
              if (node.id === agentId && node.type === 'agent') {
                const agentData = node.data as AgentNodeData;
                const vType = vaultId as VaultType;
                if (!agentData.activeVaults.includes(vType)) {
                  return {
                    ...node,
                    data: {
                      ...agentData,
                      activeVaults: [...agentData.activeVaults, vType],
                    },
                  };
                }
              }
              return node;
            });
            onNodesChange(updatedNodes);
          }
        }
      } else {
        soundFX.playClick(1400);
      }

      setConnectingFrom(null);
    }
  };

  // Node dragging start
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    soundFX.playClick(2400);
    setDraggingNodeId(nodeId);
    const worldPos = screenToWorld(e.clientX, e.clientY);
    dragOffsetRef.current = {
      x: worldPos.x - node.x,
      y: worldPos.y - node.y,
    };
  };

  // Handle port connection drag initiation
  const handleStartConnect = (portType: 'vault' | 'agent' | 'gate', nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setConnectingFrom({
      portType,
      nodeId,
      startX: worldPos.x,
      startY: worldPos.y,
    });
  };

  // Toggle Agent status cycle
  const handleToggleAgentStatus = (agentId: string) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === agentId && node.type === 'agent') {
        const d = node.data as AgentNodeData;
        const nextStatus = d.status === 'idle' ? 'deliberating' : d.status === 'deliberating' ? 'executing' : 'idle';
        return {
          ...node,
          data: {
            ...d,
            status: nextStatus,
          },
        };
      }
      return node;
    });
    onNodesChange(updatedNodes);
  };

  // Evaluate Execution Gate
  const handleEvaluateGate = (gateId: string) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === gateId && node.type === 'executionGate') {
        const d = node.data as ExecutionGateData;
        return {
          ...node,
          data: {
            ...d,
            status: 'ratified' as const,
            criteria: d.criteria.map((c) => ({ ...c, passed: true })),
          },
        };
      }
      return node;
    });
    onNodesChange(updatedNodes);
    soundFX.playConsensusChime();
  };

  // Disconnect cable on double click
  const handleEdgeDoubleClick = (edgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const edge = edges.find((ed) => ed.id === edgeId);
    if (!edge) return;

    soundFX.playDisconnect();
    const updatedEdges = edges.filter((ed) => ed.id !== edgeId);
    onEdgesChange(updatedEdges);

    // If severed connection was between Agent and Vault, remove from agent activeVaults
    const node1 = nodes.find((n) => n.id === edge.source);
    const node2 = nodes.find((n) => n.id === edge.target);
    const agentNode = node1?.type === 'agent' ? node1 : node2?.type === 'agent' ? node2 : null;
    const vaultNode = node1?.type === 'memoryVault' ? node1 : node2?.type === 'memoryVault' ? node2 : null;

    if (agentNode && vaultNode) {
      const vType = vaultNode.id as VaultType;
      const updatedNodes = nodes.map((node) => {
        if (node.id === agentNode.id) {
          const d = node.data as AgentNodeData;
          return {
            ...node,
            data: {
              ...d,
              activeVaults: d.activeVaults.filter((v) => v !== vType),
            },
          };
        }
        return node;
      });
      onNodesChange(updatedNodes);
    }
  };

  // 120 FPS High-Performance Canvas2D Render Loop for Grid & Cable Pulses
  useEffect(() => {
    let animId: number;

    const renderLoop = (time: number) => {
      // FPS measurement
      frameCountRef.current += 1;
      if (time - lastFpsTimeRef.current >= 500) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (time - lastFpsTimeRef.current));
        if (onFpsUpdate) onFpsUpdate(measuredFps);
        frameCountRef.current = 0;
        lastFpsTimeRef.current = time;
      }

      particleOffsetRef.current = (particleOffsetRef.current + 0.8) % 100;

      // Draw backdrop constellation grid
      const cvs = canvasBgRef.current;
      if (cvs) {
        const ctx = cvs.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, cvs.width, cvs.height);

          // Render subtle isometric background grid dots
          const gridSize = 40 * zoom;
          const offsetX = pan.x % gridSize;
          const offsetY = pan.y % gridSize;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          const dotRadius = Math.max(1, 1.2 * zoom);

          for (let x = offsetX; x < cvs.width; x += gridSize) {
            for (let y = offsetY; y < cvs.height; y += gridSize) {
              ctx.beginPath();
              ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [pan, zoom, onFpsUpdate]);

  // Compute node map for edge anchors
  const nodeMap = useMemo(() => {
    const map = new Map<string, CanvasNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  // Viewport Culling: calculate visible bounding box
  const isNodeVisible = useCallback(
    (node: CanvasNode) => {
      const screenPos = worldToScreen(node.x, node.y);
      const screenW = node.width * zoom;
      const screenH = node.height * zoom;

      return (
        screenPos.x + screenW >= -100 &&
        screenPos.x <= viewportSize.width + 100 &&
        screenPos.y + screenH >= -100 &&
        screenPos.y <= viewportSize.height + 100
      );
    },
    [worldToScreen, zoom, viewportSize]
  );

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full overflow-hidden bg-[#050509] select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Canvas for 120 FPS High-Speed Isometric Grid */}
      <canvas
        ref={canvasBgRef}
        width={viewportSize.width}
        height={viewportSize.height}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* SVG Layer for Cubic Bezier Cables and Pulse Particles */}
      <svg
        className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible"
        style={{
          width: viewportSize.width,
          height: viewportSize.height,
        }}
      >
        <defs>
          <linearGradient id="cableGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#50e3c2" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#78a6ff" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Established Edges */}
        {edges.map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          // Anchor points in world coordinates
          const sourceWorldX = sourceNode.x + sourceNode.width / 2;
          const sourceWorldY = sourceNode.y + sourceNode.height;
          const targetWorldX = targetNode.x + targetNode.width / 2;
          const targetWorldY = targetNode.y;

          // Transform to screen coordinates
          const sScreen = worldToScreen(sourceWorldX, sourceWorldY);
          const tScreen = worldToScreen(targetWorldX, targetWorldY);

          // Bezier control point calculation
          const dy = Math.abs(tScreen.y - sScreen.y) * 0.5 + 40;
          const c1x = sScreen.x;
          const c1y = sScreen.y + dy;
          const c2x = tScreen.x;
          const c2y = tScreen.y - dy;

          const pathD = `M ${sScreen.x} ${sScreen.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tScreen.x} ${tScreen.y}`;

          return (
            <g
              key={edge.id}
              className="pointer-events-auto cursor-pointer group"
              onDoubleClick={(e) => handleEdgeDoubleClick(edge.id, e)}
            >
              {/* Hit area */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                className="hover:stroke-white/10 transition-colors"
              />
              {/* Glow backdrop */}
              <path
                d={pathD}
                fill="none"
                stroke={edge.color || 'url(#cableGradCyan)'}
                strokeWidth={3 * zoom}
                strokeOpacity={0.3}
                filter="url(#glow)"
              />
              {/* Main Cable Line */}
              <path
                d={pathD}
                fill="none"
                stroke={edge.color || 'url(#cableGradCyan)'}
                strokeWidth={2 * zoom}
                strokeDasharray="6 4"
                className="group-hover:stroke-white transition-colors"
              />
              {/* Animated Token Pulse Particles */}
              <circle r={4 * zoom} fill="#ffffff" filter="url(#glow)">
                <animateMotion
                  path={pathD}
                  dur="2.5s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
              <circle r={2.5 * zoom} fill="#78a6ff">
                <animateMotion
                  path={pathD}
                  dur="2.5s"
                  begin="1.25s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
            </g>
          );
        })}

        {/* Temporary Dragging Cable */}
        {connectingFrom && (
          <path
            d={`M ${worldToScreen(connectingFrom.startX, connectingFrom.startY).x} ${
              worldToScreen(connectingFrom.startX, connectingFrom.startY).y
            } L ${worldToScreen(currentMouseWorld.x, currentMouseWorld.y).x} ${
              worldToScreen(currentMouseWorld.x, currentMouseWorld.y).y
            }`}
            fill="none"
            stroke="#50e3c2"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Transform Container for Spatial Nodes */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none z-20"
        style={{
          transform: `matrix(${zoom}, 0, 0, ${zoom}, ${pan.x}, ${pan.y})`,
        }}
      >
        {nodes.map((node) => {
          // Viewport frustum culling for smooth 120 FPS
          if (!isNodeVisible(node)) return null;

          return (
            <div
              key={node.id}
              className="absolute pointer-events-auto"
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                width: node.width,
                height: node.height,
              }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            >
              {node.type === 'memoryVault' && (
                <MemoryVaultNode
                  metadata={node.data as VaultMetadata}
                  connectedToAgents={edges
                    .filter((ed) => ed.source === node.id || ed.target === node.id)
                    .map((ed) => (ed.source === node.id ? ed.target : ed.source))}
                  onStartConnect={handleStartConnect}
                  onSelectEntry={onSelectEntry}
                />
              )}

              {node.type === 'agent' && (
                <AgentNode
                  data={node.data as AgentNodeData}
                  onStartConnect={handleStartConnect}
                  onToggleStatus={handleToggleAgentStatus}
                />
              )}

              {node.type === 'executionGate' && (
                <ExecutionGateNode
                  data={node.data as ExecutionGateData}
                  onStartConnect={handleStartConnect}
                  onEvaluateGate={handleEvaluateGate}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Tactical Canvas Minimap */}
      <CanvasMinimap
        nodes={nodes}
        pan={pan}
        zoom={zoom}
        viewportSize={viewportSize}
        onNavigate={(newPan) => setPan(newPan)}
      />
    </div>
  );
};
