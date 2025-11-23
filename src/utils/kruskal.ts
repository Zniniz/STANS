import { UnionFind } from "./unionFind";

export interface Edge {
  from: string;
  to: string;
  weight: number;
  traffic: "low" | "medium" | "high";
  isBlocked: boolean;
}

export interface KruskalStep {
  stepNumber: number;
  action: "sort" | "consider" | "accept" | "reject" | "complete";
  edge?: Edge;
  currentMST: Edge[];
  totalWeight: number;
  explanation: string;
  sortedEdges?: Edge[];
  sets?: Map<string, string[]>;
}

/**
 * Calculate effective weight considering traffic and blockades
 */
function getEffectiveWeight(edge: Edge): number {
  if (edge.isBlocked) {
    return Infinity; // Blocked edges have infinite weight
  }

  const trafficMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2.5,
  };

  return edge.weight * trafficMultiplier[edge.traffic];
}

/**
 * Kruskal's Algorithm Implementation with step-by-step tracking
 */
export function kruskalAlgorithm(
  edges: Edge[],
  nodes: string[]
): KruskalStep[] {
  const steps: KruskalStep[] = [];
  const mst: Edge[] = [];
  let totalWeight = 0;

  // Step 1: Filter and sort edges by effective weight
  const validEdges = edges.filter(edge => !edge.isBlocked);
  const sortedEdges = [...validEdges].sort(
    (a, b) => getEffectiveWeight(a) - getEffectiveWeight(b)
  );

  steps.push({
    stepNumber: 0,
    action: "sort",
    currentMST: [],
    totalWeight: 0,
    explanation: `Step 0: Sort ${sortedEdges.length} valid edges by effective weight (distance × traffic multiplier). Blocked edges are excluded.`,
    sortedEdges: sortedEdges,
  });

  // Initialize Union-Find data structure
  const uf = new UnionFind(nodes);

  // Step 2-N: Process each edge
  sortedEdges.forEach((edge, index) => {
    const effectiveWeight = getEffectiveWeight(edge);
    
    // Consider this edge
    steps.push({
      stepNumber: steps.length,
      action: "consider",
      edge: edge,
      currentMST: [...mst],
      totalWeight: totalWeight,
      explanation: `Step ${steps.length}: Consider edge ${edge.from}-${edge.to} (weight: ${edge.weight}km, traffic: ${edge.traffic}, effective: ${effectiveWeight.toFixed(1)})`,
      sets: uf.getSets(),
    });

    // Try to add edge to MST using Union-Find
    const canAdd = uf.union(edge.from, edge.to);

    if (canAdd) {
      // Edge accepted - doesn't create cycle
      mst.push(edge);
      totalWeight += edge.weight;

      steps.push({
        stepNumber: steps.length,
        action: "accept",
        edge: edge,
        currentMST: [...mst],
        totalWeight: totalWeight,
        explanation: `✓ Edge ACCEPTED: ${edge.from} and ${edge.to} were in different sets. Add to MST. Total edges: ${mst.length}/${nodes.length - 1}`,
        sets: uf.getSets(),
      });
    } else {
      // Edge rejected - would create cycle
      steps.push({
        stepNumber: steps.length,
        action: "reject",
        edge: edge,
        currentMST: [...mst],
        totalWeight: totalWeight,
        explanation: `✗ Edge REJECTED: ${edge.from} and ${edge.to} already connected. Would create cycle.`,
        sets: uf.getSets(),
      });
    }

    // Check if MST is complete (n-1 edges for n nodes)
    if (mst.length === nodes.length - 1) {
      return; // Early termination
    }
  });

  // Final step
  steps.push({
    stepNumber: steps.length,
    action: "complete",
    currentMST: [...mst],
    totalWeight: totalWeight,
    explanation: `Algorithm Complete! MST has ${mst.length} edges with total weight ${totalWeight}km. Network fully connected with minimum cost.`,
    sets: uf.getSets(),
  });

  return steps;
}

/**
 * Get color for edge based on its status
 */
export function getEdgeColor(
  edge: Edge,
  currentMST: Edge[],
  currentEdge?: Edge
): string {
  if (edge.isBlocked) {
    return "hsl(var(--destructive))";
  }
  
  const isInMST = currentMST.some(
    e => (e.from === edge.from && e.to === edge.to) || 
         (e.from === edge.to && e.to === edge.from)
  );
  
  if (isInMST) {
    return "hsl(var(--accent))";
  }
  
  if (currentEdge && 
      ((currentEdge.from === edge.from && currentEdge.to === edge.to) ||
       (currentEdge.from === edge.to && currentEdge.to === edge.from))) {
    return "hsl(var(--secondary))";
  }
  
  // Color by traffic
  switch (edge.traffic) {
    case "low": return "hsl(var(--traffic-low))";
    case "medium": return "hsl(var(--traffic-medium))";
    case "high": return "hsl(var(--traffic-high))";
    default: return "hsl(var(--border))";
  }
}
