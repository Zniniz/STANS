import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useCanvasZoom } from "@/hooks/useCanvasZoom";
import CanvasZoomControls from "@/components/CanvasZoomControls";
import type { Edge } from "@/utils/kruskal";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface TrafficMapCanvasProps {
  nodes: Node[];
  edges: Edge[];
  trafficMultipliers: { [key: string]: number };
  highlightedPath?: string[];
  selectedEdge: string | null;
  onEdgeSelect: (edgeId: string | null) => void;
  onNodeSelect?: (nodeId: string) => void;
  mstEdges?: Edge[];
  visitedNodes?: Set<string>;
  currentNode?: string;
}

const TrafficMapCanvas = ({
  nodes,
  edges,
  trafficMultipliers,
  highlightedPath = [],
  selectedEdge,
  onEdgeSelect,
  onNodeSelect,
  mstEdges = [],
  visitedNodes = new Set(),
  currentNode,
}: TrafficMapCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const {
    zoom,
    setZoom,
    viewBox,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
  } = useCanvasZoom({ baseWidth: 900, baseHeight: 500 });

  const getEdgeId = (edge: Edge) => `${edge.from}-${edge.to}`;

  const isEdgeInPath = (edge: Edge) => {
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      if (
        (edge.from === highlightedPath[i] && edge.to === highlightedPath[i + 1]) ||
        (edge.to === highlightedPath[i] && edge.from === highlightedPath[i + 1])
      ) {
        return true;
      }
    }
    return false;
  };

  const isEdgeInMST = (edge: Edge) => {
    return mstEdges.some(
      mstEdge =>
        (mstEdge.from === edge.from && mstEdge.to === edge.to) ||
        (mstEdge.from === edge.to && mstEdge.to === edge.from)
    );
  };

  const getEdgeColor = (edge: Edge) => {
    if (edge.isBlocked) return "hsl(var(--road))";
    if (isEdgeInPath(edge)) return "hsl(var(--primary))";
    if (isEdgeInMST(edge)) return "hsl(var(--secondary))";
    
    const multiplier = trafficMultipliers[getEdgeId(edge)] || 1;
    const baseTraffic = edge.traffic === 'high' ? 2 : edge.traffic === 'medium' ? 1.5 : 1;
    const effectiveTraffic = baseTraffic * multiplier;
    
    if (effectiveTraffic > 2.5) return "hsl(var(--traffic-heavy))";
    if (effectiveTraffic > 1.5) return "hsl(var(--traffic-moderate))";
    return "hsl(var(--traffic-clear))";
  };

  const getEdgeWidth = (edge: Edge) => {
    if (isEdgeInPath(edge)) return 5;
    if (isEdgeInMST(edge)) return 4;
    if (selectedEdge === getEdgeId(edge)) return 4;
    return 3;
  };

  const getNodeColor = (nodeId: string) => {
    if (currentNode === nodeId) return "hsl(var(--primary))";
    if (highlightedPath.includes(nodeId)) return "hsl(var(--primary))";
    if (visitedNodes.has(nodeId)) return "hsl(var(--secondary))";
    return "hsl(var(--muted-foreground))";
  };

  const getNodeRadius = (nodeId: string) => {
    if (currentNode === nodeId) return 14;
    if (highlightedPath.length > 0 && (highlightedPath[0] === nodeId || highlightedPath[highlightedPath.length - 1] === nodeId)) {
      return 12;
    }
    return 10;
  };

  // Traffic flow animation particles
  const renderTrafficFlow = (edge: Edge, x1: number, y1: number, x2: number, y2: number) => {
    if (edge.isBlocked) return null;
    
    const multiplier = trafficMultipliers[getEdgeId(edge)] || 1;
    const speed = multiplier > 2 ? 6 : multiplier > 1.5 ? 4 : 2;
    
    return (
      <g key={`flow-${getEdgeId(edge)}`}>
        {[0, 1, 2].map(i => (
          <motion.circle
            key={i}
            r={2}
            fill="hsl(var(--foreground))"
            opacity={0.6}
            initial={{ 
              cx: x1, 
              cy: y1,
              opacity: 0
            }}
            animate={{
              cx: [x1, x2],
              cy: [y1, y2],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: speed,
              repeat: Infinity,
              delay: i * (speed / 3),
              ease: "linear",
            }}
          />
        ))}
      </g>
    );
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border bg-card city-grid">
      {/* Canvas Controls */}
      <CanvasZoomControls
        zoom={zoom}
        setZoom={setZoom}
        resetView={resetView}
      />

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Pattern Overlay */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 40 0 L 0 0 0 40" 
              fill="none" 
              stroke="hsl(var(--border))" 
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges (Roads) */}
        {edges.map(edge => {
          const fromPos = getNodePosition(edge.from);
          const toPos = getNodePosition(edge.to);
          const edgeId = getEdgeId(edge);
          const isSelected = selectedEdge === edgeId;
          const inPath = isEdgeInPath(edge);
          
          return (
            <g key={edgeId}>
              {/* Road shadow */}
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke="hsl(var(--foreground))"
                strokeWidth={getEdgeWidth(edge) + 4}
                strokeLinecap="round"
                opacity={0.1}
              />
              
              {/* Main road */}
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={getEdgeColor(edge)}
                strokeWidth={getEdgeWidth(edge)}
                strokeLinecap="round"
                className={`cursor-pointer transition-all duration-300 ${inPath ? 'animate-route-pulse' : ''}`}
                onClick={() => onEdgeSelect(isSelected ? null : edgeId)}
              />
              
              {/* Traffic flow particles */}
              {!edge.isBlocked && renderTrafficFlow(edge, fromPos.x, fromPos.y, toPos.x, toPos.y)}
              
              {/* Weight label */}
              <g transform={`translate(${(fromPos.x + toPos.x) / 2}, ${(fromPos.y + toPos.y) / 2})`}>
                <rect
                  x={-15}
                  y={-10}
                  width={30}
                  height={20}
                  rx={4}
                  fill="hsl(var(--background))"
                  stroke={getEdgeColor(edge)}
                  strokeWidth={1}
                  opacity={0.95}
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  className="text-xs font-medium fill-foreground"
                >
                  {edge.weight}m
                </text>
              </g>
            </g>
          );
        })}

        {/* Nodes (Intersections) */}
        {nodes.map(node => {
          const isInPath = highlightedPath.includes(node.id);
          const isStart = highlightedPath[0] === node.id;
          const isEnd = highlightedPath[highlightedPath.length - 1] === node.id;
          const isCurrent = currentNode === node.id;
          
          return (
            <g 
              key={node.id}
              className="cursor-pointer"
              onClick={() => onNodeSelect?.(node.id)}
            >
              {/* Ripple effect for current node */}
              {isCurrent && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={getNodeRadius(node.id)}
                  fill="none"
                  stroke={getNodeColor(node.id)}
                  strokeWidth={2}
                  initial={{ r: getNodeRadius(node.id), opacity: 0.8 }}
                  animate={{ r: getNodeRadius(node.id) * 2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              
              {/* Node shadow */}
              <circle
                cx={node.x}
                cy={node.y + 2}
                r={getNodeRadius(node.id)}
                fill="hsl(var(--foreground))"
                opacity={0.15}
              />
              
              {/* Main node */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={getNodeRadius(node.id)}
                fill={getNodeColor(node.id)}
                stroke="hsl(var(--background))"
                strokeWidth={3}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              
              {/* Start/End indicators */}
              {isStart && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={5}
                  fill="hsl(var(--background))"
                />
              )}
              {isEnd && (
                <polygon
                  points={`${node.x},${node.y - 4} ${node.x + 4},${node.y + 3} ${node.x - 4},${node.y + 3}`}
                  fill="hsl(var(--background))"
                />
              )}
              
              {/* Label */}
              <text
                x={node.x}
                y={node.y + getNodeRadius(node.id) + 16}
                textAnchor="middle"
                className="text-xs font-medium fill-foreground"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Empty state */}
        {nodes.length === 0 && (
          <text
            x="450"
            y="250"
            textAnchor="middle"
            className="text-lg fill-muted-foreground"
          >
            Load a road network to begin
          </text>
        )}
      </svg>
    </div>
  );
};

export default TrafficMapCanvas;
