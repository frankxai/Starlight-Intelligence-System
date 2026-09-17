import React from 'react';
import type { CanvasNode } from '../types/cockpit';

interface CanvasMinimapProps {
  nodes: CanvasNode[];
  pan: { x: number; y: number };
  zoom: number;
  viewportSize: { width: number; height: number };
  onNavigate: (targetPan: { x: number; y: number }) => void;
}

export const CanvasMinimap: React.FC<CanvasMinimapProps> = ({
  nodes,
  pan,
  zoom,
  viewportSize,
  onNavigate,
}) => {
  const mapWidth = 200;
  const mapHeight = 140;

  // Compute world bounding box of all nodes
  let minX = -1200;
  let maxX = 2400;
  let minY = -800;
  let maxY = 1800;

  if (nodes.length > 0) {
    minX = Math.min(-600, ...nodes.map((n) => n.x - 200));
    maxX = Math.max(1600, ...nodes.map((n) => n.x + n.width + 200));
    minY = Math.min(-400, ...nodes.map((n) => n.y - 200));
    maxY = Math.max(1200, ...nodes.map((n) => n.y + n.height + 200));
  }

  const worldWidth = maxX - minX;
  const worldHeight = maxY - minY;

  const toMapX = (worldX: number) => ((worldX - minX) / worldWidth) * mapWidth;
  const toMapY = (worldY: number) => ((worldY - minY) / worldHeight) * mapHeight;

  // Visible viewport bounding box in world space
  const visibleWorldX = -pan.x / zoom;
  const visibleWorldY = -pan.y / zoom;
  const visibleWorldW = viewportSize.width / zoom;
  const visibleWorldH = viewportSize.height / zoom;

  const vpBoxX = toMapX(visibleWorldX);
  const vpBoxY = toMapY(visibleWorldY);
  const vpBoxW = (visibleWorldW / worldWidth) * mapWidth;
  const vpBoxH = (visibleWorldH / worldHeight) * mapHeight;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = minX + (clickX / mapWidth) * worldWidth;
    const targetWorldY = minY + (clickY / mapHeight) * worldHeight;

    const newPanX = -(targetWorldX * zoom) + viewportSize.width / 2;
    const newPanY = -(targetWorldY * zoom) + viewportSize.height / 2;

    onNavigate({ x: newPanX, y: newPanY });
  };

  const getNodeColor = (node: CanvasNode) => {
    switch (node.type) {
      case 'memoryVault':
        return '#78a6ff';
      case 'agent':
        return '#50e3c2';
      case 'executionGate':
        return '#bf95fc';
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      onClick={handleMinimapClick}
      className="absolute bottom-6 right-6 z-20 rounded-lg border border-white/10 bg-[#08080e]/85 backdrop-blur-md p-2 shadow-2xl cursor-pointer select-none overflow-hidden group hover:border-cyan-500/40 transition-all"
      style={{ width: mapWidth + 16, height: mapHeight + 16 }}
      title="Click to pan canvas"
    >
      <div className="relative w-full h-full bg-black/40 rounded border border-white/5 overflow-hidden">
        {/* Nodes representations */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute rounded-sm pointer-events-none"
            style={{
              left: Math.max(0, Math.min(mapWidth - 4, toMapX(node.x))),
              top: Math.max(0, Math.min(mapHeight - 4, toMapY(node.y))),
              width: Math.max(3, (node.width / worldWidth) * mapWidth),
              height: Math.max(3, (node.height / worldHeight) * mapHeight),
              backgroundColor: getNodeColor(node),
              opacity: 0.85,
            }}
          />
        ))}

        {/* Viewport boundary rect */}
        <div
          className="absolute border border-cyan-400 bg-cyan-400/10 pointer-events-none rounded transition-all"
          style={{
            left: Math.max(0, vpBoxX),
            top: Math.max(0, vpBoxY),
            width: Math.min(mapWidth, Math.max(12, vpBoxW)),
            height: Math.min(mapHeight, Math.max(10, vpBoxH)),
          }}
        />
      </div>

      <div className="absolute bottom-2.5 left-3 text-[9px] font-mono text-slate-500 pointer-events-none">
        MAP {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
};
