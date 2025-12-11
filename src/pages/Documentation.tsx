import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, BookOpen, Code, GitBranch, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ThemeToggle } from "@/components/ThemeToggle";

const dsaConcepts = [
  {
    name: "Graph (Weighted, Undirected)",
    purpose: "To represent the road network where nodes are locations and edges are roads with weights (distance, traffic).",
    files: ["src/utils/kruskal.ts", "src/components/GraphBuilder.tsx"],
  },
  {
    name: "Kruskal's Algorithm",
    purpose: "To find the Minimum Spanning Tree (MST) for optimal network connectivity, forming the project's backbone.",
    files: ["src/utils/kruskal.ts"],
  },
  {
    name: "Union-Find (Disjoint Set Union - DSU)",
    purpose: "A critical supporting data structure for Kruskal's Algorithm to efficiently detect cycles.",
    files: ["src/utils/unionFind.ts"],
  },
  {
    name: "Priority Queue / Sorting",
    purpose: "Used to always process the edge with the smallest weight (distance + traffic) first in algorithms.",
    files: ["src/utils/kruskal.ts", "src/utils/prim.ts"],
  },
  {
    name: "Dijkstra's Algorithm",
    purpose: "For finding the shortest path between two specific nodes, complementing MST for point-to-point routing.",
    files: ["src/utils/dijkstra.ts"],
  },
  {
    name: "Prim's Algorithm",
    purpose: "Alternative MST algorithm that grows the tree from a starting vertex by always adding the minimum weight edge.",
    files: ["src/utils/prim.ts"],
  },
];

const codeSnippets = [
  {
    id: "union-find",
    title: "Union-Find Data Structure",
    concept: "Union-Find (DSU) is used to efficiently track connected components and detect cycles in Kruskal's algorithm.",
    filePath: "src/utils/unionFind.ts",
    code: `export class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(nodes: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    // Initialize: each node is its own parent (separate set)
    nodes.forEach(node => {
      this.parent.set(node, node);
      this.rank.set(node, 0);
    });
  }

  // Find the root of the set containing node x
  // Uses path compression for optimization
  find(x: string): string {
    if (this.parent.get(x) !== x) {
      // Path compression: make every node point directly to root
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  // Union two sets containing nodes x and y
  // Uses union by rank for optimization
  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    // Already in same set - would create cycle
    if (rootX === rootY) return false;

    // Union by rank: attach smaller tree under larger tree
    const rankX = this.rank.get(rootX)!;
    const rankY = this.rank.get(rootY)!;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
    return true;
  }
}`,
    explanations: [
      { line: "constructor", text: "Initializes each node as its own parent (self-loop), creating n separate sets. Rank is used for union optimization." },
      { line: "find(x)", text: "Recursively finds the root representative of x's set. Path compression flattens the tree by making every visited node point directly to root, achieving near O(1) amortized time." },
      { line: "union(x, y)", text: "Merges two sets. If roots are same, returns false (cycle detected). Union by rank ensures the smaller tree attaches under the larger one, keeping trees balanced." },
      { line: "return false", text: "This is crucial for Kruskal's - if union returns false, adding this edge would create a cycle in the MST." },
    ],
  },
  {
    id: "kruskal",
    title: "Kruskal's Algorithm",
    concept: "Kruskal's finds MST by sorting edges by weight and greedily adding edges that don't create cycles.",
    filePath: "src/utils/kruskal.ts",
    code: `export function kruskalAlgorithm(edges: Edge[], nodes: string[]): KruskalStep[] {
  const steps: KruskalStep[] = [];
  const mst: Edge[] = [];
  let totalWeight = 0;

  // Create Union-Find for cycle detection
  const uf = new UnionFind(nodes);

  // Sort edges by effective weight (considering traffic)
  const sortedEdges = [...edges]
    .filter(e => !e.isBlocked)
    .sort((a, b) => getEffectiveWeight(a) - getEffectiveWeight(b));

  // Process each edge in order of weight
  for (const edge of sortedEdges) {
    // Check if adding this edge would create a cycle
    if (uf.union(edge.from, edge.to)) {
      // Edge accepted - add to MST
      mst.push(edge);
      totalWeight += edge.weight;
      
      steps.push({
        action: "add",
        edge: edge,
        currentMST: [...mst],
        totalWeight,
        explanation: \`✓ Added edge \${edge.from}-\${edge.to}\`
      });

      // MST complete when we have n-1 edges
      if (mst.length === nodes.length - 1) break;
    } else {
      // Edge rejected - would create cycle
      steps.push({
        action: "reject",
        edge: edge,
        explanation: \`✗ Rejected edge \${edge.from}-\${edge.to} (cycle)\`
      });
    }
  }
  return steps;
}`,
    explanations: [
      { line: "new UnionFind(nodes)", text: "Initialize DSU with all nodes in separate sets. This allows O(α(n)) ≈ O(1) cycle detection." },
      { line: ".sort((a, b) => ...)", text: "GREEDY STEP: Sort all edges by weight ascending. This ensures we always consider the cheapest available edge first." },
      { line: "uf.union(edge.from, edge.to)", text: "Attempt to merge the sets containing the edge's endpoints. Returns true if they were in different sets (safe to add)." },
      { line: "mst.length === nodes.length - 1", text: "MST property: A tree with n nodes has exactly n-1 edges. We can stop early once MST is complete." },
      { line: "Time Complexity", text: "O(E log E) for sorting + O(E × α(V)) for union-find operations ≈ O(E log E) overall." },
    ],
  },
  {
    id: "dijkstra",
    title: "Dijkstra's Algorithm",
    concept: "Dijkstra's finds the shortest path from a source to all other vertices using a greedy approach with a priority queue.",
    filePath: "src/utils/dijkstra.ts",
    code: `export function dijkstraAlgorithm(
  edges: Edge[], nodes: string[], sourceNode: string
): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  // Initialize distances: source = 0, others = Infinity
  nodes.forEach(node => {
    distances.set(node, node === sourceNode ? 0 : Infinity);
    previous.set(node, null);
  });

  while (visited.size < nodes.length) {
    // Find unvisited node with minimum distance (Priority Queue)
    let minNode: string | null = null;
    let minDist = Infinity;
    
    for (const node of nodes) {
      if (!visited.has(node) && distances.get(node)! < minDist) {
        minDist = distances.get(node)!;
        minNode = node;
      }
    }

    if (minNode === null || minDist === Infinity) break;
    
    visited.add(minNode);

    // Relaxation: Update distances to neighbors
    const neighbors = getNeighbors(minNode, edges);
    for (const { neighbor, edge } of neighbors) {
      if (visited.has(neighbor)) continue;
      
      const newDist = distances.get(minNode)! + getEffectiveWeight(edge);
      if (newDist < distances.get(neighbor)!) {
        distances.set(neighbor, newDist);
        previous.set(neighbor, minNode);
        
        steps.push({
          action: "update",
          currentNode: minNode,
          explanation: \`Updated distance to \${neighbor}: \${newDist}\`
        });
      }
    }
  }
  return steps;
}`,
    explanations: [
      { line: "distances.set(node, ...)", text: "Initialize source distance to 0, all others to Infinity. This represents 'unknown' shortest path." },
      { line: "Find minimum distance node", text: "GREEDY STEP: Always process the unvisited node with smallest known distance. A min-heap would optimize this to O(log V)." },
      { line: "Relaxation step", text: "Core of Dijkstra's: If going through current node gives a shorter path to neighbor, update it. This is the 'relaxation' operation." },
      { line: "previous.set(neighbor, minNode)", text: "Track the path by remembering which node we came from. Used to reconstruct the actual shortest path." },
      { line: "Time Complexity", text: "O(V²) with array, O((V + E) log V) with min-heap priority queue." },
    ],
  },
  {
    id: "prim",
    title: "Prim's Algorithm",
    concept: "Prim's grows MST from a starting vertex by always adding the minimum weight edge connecting the tree to a new vertex.",
    filePath: "src/utils/prim.ts",
    code: `export function primAlgorithm(
  edges: Edge[], nodes: string[], startNode: string
): PrimStep[] {
  const steps: PrimStep[] = [];
  const mst: Edge[] = [];
  let totalWeight = 0;
  const visitedNodes = new Set<string>([startNode]);

  // Continue until all nodes are visited
  while (visitedNodes.size < nodes.length) {
    // Find all edges connecting visited to unvisited nodes
    const candidateEdges = edges.filter(edge =>
      !edge.isBlocked &&
      ((visitedNodes.has(edge.from) && !visitedNodes.has(edge.to)) ||
       (visitedNodes.has(edge.to) && !visitedNodes.has(edge.from)))
    );

    if (candidateEdges.length === 0) break; // Disconnected graph

    // Sort by weight and select minimum
    candidateEdges.sort((a, b) => 
      getEffectiveWeight(a) - getEffectiveWeight(b)
    );

    const minEdge = candidateEdges[0];
    const newNode = visitedNodes.has(minEdge.from) 
      ? minEdge.to : minEdge.from;

    mst.push(minEdge);
    totalWeight += minEdge.weight;
    visitedNodes.add(newNode);

    steps.push({
      action: "add",
      edge: minEdge,
      explanation: \`Added edge \${minEdge.from}-\${minEdge.to}, new node: \${newNode}\`
    });
  }
  return steps;
}`,
    explanations: [
      { line: "visitedNodes = new Set([startNode])", text: "Initialize with starting vertex. Prim's grows the tree from this single node." },
      { line: "candidateEdges filter", text: "Find all 'cut edges' - edges with exactly one endpoint in the current tree. These are the only edges we can safely add." },
      { line: "sort and select minimum", text: "GREEDY STEP: Among all cut edges, pick the one with minimum weight. This ensures MST property." },
      { line: "visitedNodes.add(newNode)", text: "Expand the tree by adding the new vertex. Now more edges become candidates." },
      { line: "Difference from Kruskal's", text: "Prim's grows ONE tree from a start node. Kruskal's builds a forest that eventually connects. Both produce valid MSTs." },
    ],
  },
  {
    id: "graph-representation",
    title: "Graph Data Structure",
    concept: "The graph is represented using an edge list with traffic-aware weights, suitable for sparse road networks.",
    filePath: "src/utils/kruskal.ts",
    code: `// Edge interface for weighted graph
export interface Edge {
  from: string;      // Source node ID
  to: string;        // Destination node ID
  weight: number;    // Base weight (distance in km)
  traffic: "low" | "medium" | "high";  // Traffic condition
  isBlocked: boolean; // Road blockade status
}

// Calculate effective weight considering traffic
function getEffectiveWeight(edge: Edge): number {
  if (edge.isBlocked) return Infinity;

  const trafficMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2.5,
  };

  return edge.weight * trafficMultiplier[edge.traffic];
}

// Node interface for graph visualization
interface Node {
  id: string;
  x: number;        // X coordinate for visualization
  y: number;        // Y coordinate for visualization
  label: string;    // Display name (e.g., city name)
}`,
    explanations: [
      { line: "Edge interface", text: "Edge list representation - each edge stores source, destination, and weight. Efficient for sparse graphs like road networks." },
      { line: "traffic property", text: "Real-world extension: traffic conditions dynamically affect edge weights, making this a time-dependent graph." },
      { line: "getEffectiveWeight()", text: "Transforms static distances into dynamic costs. A 10km road with high traffic costs 25km equivalent in routing." },
      { line: "isBlocked", text: "Supports real-time updates - blocked roads are excluded from pathfinding by returning Infinity weight." },
      { line: "Node interface", text: "Stores both graph topology (id) and visualization data (coordinates). Separation of concerns for UI." },
    ],
  },
];

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">STANS Documentation</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline">View on GitHub</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-6xl mx-auto">
        {/* Instructor Notice */}
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Badge variant="default" className="shrink-0">For Evaluation</Badge>
              <p className="text-sm text-muted-foreground">
                <strong>Instructor's Note:</strong> This section provides a complete breakdown of DSA concepts implemented in STANS. 
                Cross-reference these implementations with the interactive visualizations on the main page - run Kruskal's, 
                Dijkstra's, or Prim's algorithm to see these concepts in action.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Title & Introduction */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center gap-3">
            <Code className="h-8 w-8 text-primary" />
            STANS: Technical Implementation & DSA Concepts
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            This section provides a detailed breakdown of the key Data Structures and Algorithms concepts 
            implemented in this project, along with code walkthroughs. It is designed to facilitate direct 
            project evaluation without external dependencies.
          </p>
        </div>

        {/* Architecture Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Project Architecture Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre text-xs sm:text-sm">
{`┌─────────────────────────────────────────────────────────────────────┐
│                        STANS Architecture                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│   │ GraphBuilder │───▶│ Graph Data   │───▶│ Algorithm Engine     │  │
│   │    (UI)      │    │  Structure   │    │ ┌──────────────────┐ │  │
│   │              │    │              │    │ │ Kruskal's + DSU  │ │  │
│   │ • Add Nodes  │    │ • Nodes[]    │    │ ├──────────────────┤ │  │
│   │ • Add Edges  │    │ • Edges[]    │    │ │ Dijkstra's       │ │  │
│   │ • Set Weight │    │ • Traffic    │    │ ├──────────────────┤ │  │
│   └──────────────┘    └──────────────┘    │ │ Prim's           │ │  │
│                              │            │ └──────────────────┘ │  │
│                              ▼            └──────────┬───────────┘  │
│   ┌──────────────┐    ┌──────────────┐              │               │
│   │  Templates   │───▶│ Shared State │◀─────────────┘               │
│   │              │    │   (Index)    │                              │
│   │ • Karachi    │    │              │    ┌──────────────────────┐  │
│   │ • Custom     │    │ nodes/edges  │───▶│ Visualization        │  │
│   └──────────────┘    └──────────────┘    │ • SVG Rendering      │  │
│                                           │ • Step Animation     │  │
│   Data Flow: User Input → Graph → Algo → Visualization            │  │
│                                           └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-primary/10">
                <strong className="text-primary">Input Layer</strong>
                <p className="text-muted-foreground mt-1">GraphBuilder UI and Templates provide graph data</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <strong className="text-primary">Processing Layer</strong>
                <p className="text-muted-foreground mt-1">DSA algorithms process graph with traffic weights</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <strong className="text-primary">Output Layer</strong>
                <p className="text-muted-foreground mt-1">Step-by-step visualization with animations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DSA Concepts Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Core DSA Concepts Summary</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Data Structure / Algorithm</TableHead>
                  <TableHead className="min-w-[250px]">Purpose in STANS</TableHead>
                  <TableHead className="min-w-[200px]">Key Code File(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dsaConcepts.map((concept, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{concept.name}</TableCell>
                    <TableCell className="text-muted-foreground">{concept.purpose}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {concept.files.map((file, i) => (
                          <Badge key={i} variant="secondary" className="font-mono text-xs">
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detailed Code Snippets */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Code className="h-6 w-6" />
            Detailed Code Implementation
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {codeSnippets.map((snippet) => (
              <AccordionItem key={snippet.id} value={snippet.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
                    <span className="font-semibold">{snippet.title}</span>
                    <Badge variant="outline" className="font-mono text-xs w-fit">
                      {snippet.filePath}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {/* Concept Recap */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm"><strong>Concept:</strong> {snippet.concept}</p>
                  </div>

                  {/* Code Block */}
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <SyntaxHighlighter
                      language="typescript"
                      style={oneDark}
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>

                  {/* Line-by-Line Explanation */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Line-by-Line Explanation:</h4>
                    {snippet.explanations.map((exp, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <Badge variant="secondary" className="shrink-0 h-fit font-mono">
                          {exp.line}
                        </Badge>
                        <p className="text-muted-foreground">{exp.text}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Complexity Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Time & Space Complexity Summary</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Time Complexity</TableHead>
                  <TableHead>Space Complexity</TableHead>
                  <TableHead>Best For</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Kruskal's + DSU</TableCell>
                  <TableCell><code className="text-primary">O(E log E)</code></TableCell>
                  <TableCell><code className="text-primary">O(V + E)</code></TableCell>
                  <TableCell className="text-muted-foreground">Sparse graphs, edge-centric</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Prim's</TableCell>
                  <TableCell><code className="text-primary">O(E log V)</code></TableCell>
                  <TableCell><code className="text-primary">O(V)</code></TableCell>
                  <TableCell className="text-muted-foreground">Dense graphs, vertex-centric</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dijkstra's</TableCell>
                  <TableCell><code className="text-primary">O((V+E) log V)</code></TableCell>
                  <TableCell><code className="text-primary">O(V)</code></TableCell>
                  <TableCell className="text-muted-foreground">Single-source shortest path</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Union-Find</TableCell>
                  <TableCell><code className="text-primary">O(α(n)) ≈ O(1)</code></TableCell>
                  <TableCell><code className="text-primary">O(n)</code></TableCell>
                  <TableCell className="text-muted-foreground">Cycle detection, connectivity</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground mb-4">
            STANS - Smart Traffic-Aware Navigation System | University DSA Project
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button variant="default" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Try Interactive Demo
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Complete Source
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
