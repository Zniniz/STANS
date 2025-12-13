import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, BookOpen, Code, Clock, Cpu, Route, Navigation, TreeDeciduous } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const algorithms = [
  {
    id: "kruskal",
    name: "Kruskal's Algorithm",
    icon: Route,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    realWorldAnalogy: "Imagine you're a city planner tasked with connecting all neighborhoods with roads, but you have a limited budget. Kruskal's algorithm helps you build the cheapest possible road network that still connects every neighborhood. You start by listing all possible roads sorted by cost, then add the cheapest roads one by one—but only if they connect previously unconnected areas.",
    pseudoCode: `function Kruskal(Graph G):
    MST = empty set
    Sort all edges by weight (ascending)
    Initialize Union-Find structure
    
    for each edge (u, v) in sorted edges:
        if Find(u) ≠ Find(v):
            Add edge (u, v) to MST
            Union(u, v)
    
    return MST`,
    codeSnippet: `// From src/utils/kruskal.ts
const sortedEdges = [...edges]
  .filter(e => !e.isBlocked)
  .sort((a, b) => getEffectiveWeight(a) - getEffectiveWeight(b));

for (const edge of sortedEdges) {
  if (uf.find(edge.from) !== uf.find(edge.to)) {
    uf.union(edge.from, edge.to);
    currentMST.push(edge);
    // Edge accepted into MST
  }
}`,
    explanations: [
      { line: "Sort edges by weight", concept: "Greedy approach - always pick the smallest edge first" },
      { line: "find(edge.from) !== find(edge.to)", concept: "Union-Find check - ensures no cycles are formed" },
      { line: "union(edge.from, edge.to)", concept: "Merge the two components into one" },
    ],
    complexity: { time: "O(E log E)", space: "O(V)" },
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    icon: Navigation,
    color: "text-primary",
    bgColor: "bg-primary/10",
    realWorldAnalogy: "Think of GPS navigation. When you ask for directions, Dijkstra's algorithm explores outward from your location like ripples in a pond. It keeps track of the shortest known distance to each intersection, always expanding from the closest unvisited point. This guarantees finding the absolute shortest path to your destination.",
    pseudoCode: `function Dijkstra(Graph G, source s):
    dist[v] = ∞ for all v
    dist[s] = 0
    PriorityQueue Q = all vertices
    
    while Q is not empty:
        u = vertex with min dist in Q
        for each neighbor v of u:
            alt = dist[u] + weight(u, v)
            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u
    
    return dist, prev`,
    codeSnippet: `// From src/utils/dijkstra.ts
while (unvisited.size > 0) {
  // Find minimum distance node
  let minNode = null;
  let minDist = Infinity;
  for (const node of unvisited) {
    if (distances.get(node)! < minDist) {
      minDist = distances.get(node)!;
      minNode = node;
    }
  }
  
  // Update neighbor distances
  for (const { neighbor, edge } of getNeighbors(current, edges)) {
    const alt = distances.get(current)! + getEffectiveWeight(edge);
    if (alt < distances.get(neighbor)!) {
      distances.set(neighbor, alt);
      previous.set(neighbor, current);
    }
  }
}`,
    explanations: [
      { line: "Find minimum distance node", concept: "Greedy selection - always process closest node first" },
      { line: "alt = dist + weight", concept: "Relaxation - check if new path is shorter" },
      { line: "previous.set(neighbor, current)", concept: "Track path for reconstruction" },
    ],
    complexity: { time: "O(V² or O(E log V) with heap)", space: "O(V)" },
  },
  {
    id: "prim",
    name: "Prim's Algorithm",
    icon: TreeDeciduous,
    color: "text-warning",
    bgColor: "bg-warning/10",
    realWorldAnalogy: "Like growing a tree from a seed. You start at one intersection and grow your road network outward, always adding the cheapest road that connects a new neighborhood to your existing network. Unlike Kruskal's which considers all roads globally, Prim's grows from a single point.",
    pseudoCode: `function Prim(Graph G, start s):
    MST = empty set
    visited = {s}
    
    while visited ≠ all vertices:
        Find minimum edge (u,v) where:
            u ∈ visited AND v ∉ visited
        Add edge (u,v) to MST
        Add v to visited
    
    return MST`,
    codeSnippet: `// From src/utils/prim.ts
while (visited.size < nodes.length) {
  let minEdge = null;
  let minWeight = Infinity;
  
  for (const edge of edges) {
    const fromVisited = visited.has(edge.from);
    const toVisited = visited.has(edge.to);
    
    // One end visited, one not
    if (fromVisited !== toVisited) {
      const weight = getEffectiveWeight(edge);
      if (weight < minWeight) {
        minWeight = weight;
        minEdge = edge;
      }
    }
  }
  
  visited.add(newNode);
  currentMST.push(minEdge);
}`,
    explanations: [
      { line: "fromVisited !== toVisited", concept: "Edge must connect visited to unvisited" },
      { line: "Find minimum weight edge", concept: "Greedy - pick cheapest connection" },
      { line: "visited.add(newNode)", concept: "Grow the tree by one node" },
    ],
    complexity: { time: "O(V² or O(E log V) with heap)", space: "O(V)" },
  },
];

const Concepts = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <BookOpen className="w-3 h-3" />
              For Lab Evaluation
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">
            DSA Concepts Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding the core algorithms that power STANS Traffic Navigation System.
            Each algorithm is explained with real-world analogies and actual code from our implementation.
          </p>
        </div>

        {/* Algorithms */}
        <div className="space-y-8">
          {algorithms.map((algo) => (
            <Card key={algo.id} className="overflow-hidden">
              <CardHeader className={`${algo.bgColor} border-b`}>
                <CardTitle className="flex items-center gap-3">
                  <algo.icon className={`w-6 h-6 ${algo.color}`} />
                  {algo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Real World Analogy */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">🌍</span> Real-World Analogy
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {algo.realWorldAnalogy}
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {/* Pseudo Code */}
                  <AccordionItem value="pseudo">
                    <AccordionTrigger className="text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <Code className="w-4 h-4" /> Pseudo Code
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <SyntaxHighlighter
                        language="plaintext"
                        style={atomOneDark}
                        className="rounded-lg text-sm"
                      >
                        {algo.pseudoCode}
                      </SyntaxHighlighter>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Our Implementation */}
                  <AccordionItem value="code">
                    <AccordionTrigger className="text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> Our Implementation
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <SyntaxHighlighter
                        language="typescript"
                        style={atomOneDark}
                        className="rounded-lg text-sm"
                        showLineNumbers
                      >
                        {algo.codeSnippet}
                      </SyntaxHighlighter>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Key Lines Explained:</h4>
                        {algo.explanations.map((exp, i) => (
                          <div key={i} className="flex gap-3 p-2 rounded bg-muted/50 text-sm">
                            <code className="text-primary font-mono shrink-0">→</code>
                            <div>
                              <span className="font-medium">{exp.line}</span>
                              <span className="text-muted-foreground"> — {exp.concept}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Complexity */}
                <div className="flex gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <Badge variant="secondary">{algo.complexity.time}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Space:</span>
                    <Badge variant="secondary">{algo.complexity.space}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/10 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Note for Instructors:</strong> All code snippets shown above are from the actual implementation 
            in our <code className="px-1 py-0.5 rounded bg-muted">src/utils/</code> folder. 
            The interactive visualizations on the main dashboard demonstrate these algorithms in action.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Concepts;
