import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Network, Maximize2, Target } from "lucide-react";
import type { Edge } from "@/utils/kruskal";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface GraphMetricsProps {
  nodes: Node[];
  edges: Edge[];
}

const GraphMetrics = ({ nodes, edges }: GraphMetricsProps) => {
  // Calculate degree distribution
  const calculateDegrees = () => {
    const degrees: Record<string, number> = {};
    nodes.forEach(node => degrees[node.id] = 0);
    edges.forEach(edge => {
      if (!edge.isBlocked) {
        degrees[edge.from] = (degrees[edge.from] || 0) + 1;
        degrees[edge.to] = (degrees[edge.to] || 0) + 1;
      }
    });
    return degrees;
  };

  // Calculate clustering coefficient
  const calculateClusteringCoefficient = () => {
    const degrees = calculateDegrees();
    let totalCoeff = 0;
    let nodeCount = 0;

    nodes.forEach(node => {
      const neighbors = new Set<string>();
      edges.forEach(edge => {
        if (!edge.isBlocked) {
          if (edge.from === node.id) neighbors.add(edge.to);
          if (edge.to === node.id) neighbors.add(edge.from);
        }
      });

      const k = neighbors.size;
      if (k < 2) return;

      let triangles = 0;
      const neighborArray = Array.from(neighbors);
      for (let i = 0; i < neighborArray.length; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
          const hasEdge = edges.some(e => 
            !e.isBlocked && (
              (e.from === neighborArray[i] && e.to === neighborArray[j]) ||
              (e.from === neighborArray[j] && e.to === neighborArray[i])
            )
          );
          if (hasEdge) triangles++;
        }
      }

      const coeff = (2 * triangles) / (k * (k - 1));
      totalCoeff += coeff;
      nodeCount++;
    });

    return nodeCount > 0 ? (totalCoeff / nodeCount).toFixed(3) : "0.000";
  };

  // Calculate graph diameter using Floyd-Warshall
  const calculateDiameter = () => {
    if (nodes.length === 0) return 0;
    
    const dist: Record<string, Record<string, number>> = {};
    const INF = 999999;

    // Initialize distances
    nodes.forEach(node => {
      dist[node.id] = {};
      nodes.forEach(other => {
        dist[node.id][other.id] = node.id === other.id ? 0 : INF;
      });
    });

    // Set edge distances
    edges.forEach(edge => {
      if (!edge.isBlocked) {
        dist[edge.from][edge.to] = Math.min(dist[edge.from][edge.to], edge.weight);
        dist[edge.to][edge.from] = Math.min(dist[edge.to][edge.from], edge.weight);
      }
    });

    // Floyd-Warshall
    nodes.forEach(k => {
      nodes.forEach(i => {
        nodes.forEach(j => {
          if (dist[i.id][k.id] + dist[k.id][j.id] < dist[i.id][j.id]) {
            dist[i.id][j.id] = dist[i.id][k.id] + dist[k.id][j.id];
          }
        });
      });
    });

    // Find maximum distance
    let maxDist = 0;
    nodes.forEach(i => {
      nodes.forEach(j => {
        if (dist[i.id][j.id] !== INF && dist[i.id][j.id] > maxDist) {
          maxDist = dist[i.id][j.id];
        }
      });
    });

    return maxDist;
  };

  // Calculate betweenness centrality (simplified version)
  const calculateCentrality = () => {
    const centrality: Record<string, number> = {};
    nodes.forEach(node => centrality[node.id] = 0);

    // For each pair of nodes, find shortest path and count intermediate nodes
    nodes.forEach(source => {
      const dist: Record<string, number> = {};
      const prev: Record<string, string[]> = {};
      const visited = new Set<string>();
      
      nodes.forEach(n => {
        dist[n.id] = Infinity;
        prev[n.id] = [];
      });
      dist[source.id] = 0;

      while (visited.size < nodes.length) {
        let minNode: string | null = null;
        let minDist = Infinity;
        
        nodes.forEach(node => {
          if (!visited.has(node.id) && dist[node.id] < minDist) {
            minDist = dist[node.id];
            minNode = node.id;
          }
        });

        if (minNode === null) break;
        visited.add(minNode);

        edges.forEach(edge => {
          if (edge.isBlocked) return;
          
          const neighbor = edge.from === minNode ? edge.to : 
                          edge.to === minNode ? edge.from : null;
          if (!neighbor) return;

          const newDist = dist[minNode] + edge.weight;
          if (newDist < dist[neighbor]) {
            dist[neighbor] = newDist;
            prev[neighbor] = [minNode];
          } else if (newDist === dist[neighbor]) {
            prev[neighbor].push(minNode);
          }
        });
      }

      // Count paths through each node
      nodes.forEach(target => {
        if (target.id === source.id) return;
        const pathNodes = new Set<string>();
        const findPaths = (current: string) => {
          if (current === source.id) return;
          prev[current].forEach(p => {
            pathNodes.add(p);
            findPaths(p);
          });
        };
        findPaths(target.id);
        pathNodes.forEach(n => {
          if (n !== source.id && n !== target.id) {
            centrality[n]++;
          }
        });
      });
    });

    // Find top 3 central nodes
    return Object.entries(centrality)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  const degrees = calculateDegrees();
  const avgDegree = nodes.length > 0 
    ? (Object.values(degrees).reduce((a, b) => a + b, 0) / nodes.length).toFixed(2)
    : "0.00";
  const maxDegree = Math.max(...Object.values(degrees), 0);
  const clusteringCoeff = calculateClusteringCoefficient();
  const diameter = calculateDiameter();
  const topCentral = calculateCentrality();

  if (nodes.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-display">Graph Metrics Dashboard</CardTitle>
          <CardDescription>
            Build a graph to see detailed metrics and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No graph data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-display">Graph Metrics Dashboard</CardTitle>
          <CardDescription>
            Comprehensive analysis of your graph structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Degree Distribution */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Degree Distribution</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{avgDegree}</div>
                  <div className="text-sm text-muted-foreground">Average Degree</div>
                </CardContent>
              </Card>
              <Card className="bg-secondary/5 border-secondary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-secondary">{maxDegree}</div>
                  <div className="text-sm text-muted-foreground">Maximum Degree</div>
                </CardContent>
              </Card>
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-accent">{nodes.length}</div>
                  <div className="text-sm text-muted-foreground">Total Nodes</div>
                </CardContent>
              </Card>
              <Card className="bg-muted border-border">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">{edges.filter(e => !e.isBlocked).length}</div>
                  <div className="text-sm text-muted-foreground">Active Edges</div>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(degrees).map(([node, degree]) => (
                <Badge key={node} variant="outline" className="font-mono">
                  {node}: {degree}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clustering Coefficient */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-lg">Clustering Coefficient</h3>
            </div>
            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="pt-6">
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-bold text-secondary">{clusteringCoeff}</div>
                  <div className="text-sm text-muted-foreground">
                    Measures how nodes tend to cluster together. Higher values indicate more tight-knit communities.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graph Diameter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-lg">Graph Diameter</h3>
            </div>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-bold text-accent">{diameter}</div>
                  <div className="text-sm text-muted-foreground">
                    The longest shortest path between any two nodes. Indicates how "wide" the graph is.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Centrality Measures */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Betweenness Centrality</h3>
            </div>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Nodes with highest betweenness centrality (act as bridges):
                  </p>
                  {topCentral.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {topCentral.map(([node, score], index) => (
                        <Badge 
                          key={node} 
                          className={
                            index === 0 
                              ? "bg-primary text-primary-foreground"
                              : index === 1
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-accent text-accent-foreground"
                          }
                        >
                          {node}: {score} paths
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No significant central nodes detected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraphMetrics;
