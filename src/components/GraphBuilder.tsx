import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Download, Undo2, Redo2, History } from "lucide-react";
import { toast } from "sonner";
import type { Edge } from "@/utils/kruskal";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface GraphSnapshot {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  description: string;
}

interface GraphBuilderProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

const GraphBuilder = ({ nodes, edges, setNodes, setEdges }: GraphBuilderProps) => {
  const [mode, setMode] = useState<"node" | "edge">("node");
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [edgeWeight, setEdgeWeight] = useState("5");
  const [edgeTraffic, setEdgeTraffic] = useState<"low" | "medium" | "high">("low");
  const [isBlocked, setIsBlocked] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Version history state
  const [history, setHistory] = useState<GraphSnapshot[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Save to history
  const saveToHistory = (description: string, newNodes: Node[], newEdges: Edge[]) => {
    const snapshot: GraphSnapshot = {
      nodes: JSON.parse(JSON.stringify(newNodes)),
      edges: JSON.parse(JSON.stringify(newEdges)),
      timestamp: Date.now(),
      description,
    };

    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const snapshot = history[newIndex];
      setNodes(JSON.parse(JSON.stringify(snapshot.nodes)));
      setEdges(JSON.parse(JSON.stringify(snapshot.edges)));
      setCurrentHistoryIndex(newIndex);
      toast.success("Undone");
    }
  };

  // Redo function
  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const snapshot = history[newIndex];
      setNodes(JSON.parse(JSON.stringify(snapshot.nodes)));
      setEdges(JSON.parse(JSON.stringify(snapshot.edges)));
      setCurrentHistoryIndex(newIndex);
      toast.success("Redone");
    }
  };

  // Restore from snapshot
  const restoreSnapshot = (index: number) => {
    const snapshot = history[index];
    setNodes(JSON.parse(JSON.stringify(snapshot.nodes)));
    setEdges(JSON.parse(JSON.stringify(snapshot.edges)));
    setCurrentHistoryIndex(index);
    toast.success("Snapshot restored");
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "node") return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodeId = String.fromCharCode(65 + nodes.length); // A, B, C, etc.
    const newNode: Node = {
      id: nodeId,
      x,
      y,
      label: `Node ${nodeId}`,
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveToHistory(`Added node ${nodeId}`, updatedNodes, edges);
    toast.success(`Node ${nodeId} added`);
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === "edge") {
      if (edgeStart === null) {
        setEdgeStart(nodeId);
        toast.info(`Edge starts at ${nodeId}. Click another node to complete.`);
      } else if (edgeStart === nodeId) {
        toast.error("Cannot create self-loop");
        setEdgeStart(null);
      } else {
        // Check if edge already exists
        const edgeExists = edges.some(
          (e) =>
            (e.from === edgeStart && e.to === nodeId) ||
            (e.from === nodeId && e.to === edgeStart)
        );

        if (edgeExists) {
          toast.error("Edge already exists");
          setEdgeStart(null);
          return;
        }

        const newEdge: Edge = {
          from: edgeStart,
          to: nodeId,
          weight: parseInt(edgeWeight) || 5,
          traffic: edgeTraffic,
          isBlocked: isBlocked,
        };

        const updatedEdges = [...edges, newEdge];
        setEdges(updatedEdges);
        saveToHistory(`Added edge ${edgeStart}-${nodeId}`, nodes, updatedEdges);
        toast.success(`Edge ${edgeStart}-${nodeId} created`);
        setEdgeStart(null);
      }
    } else {
      setSelectedNode(nodeId);
    }
  };

  const deleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    saveToHistory(`Deleted node ${nodeId}`, updatedNodes, updatedEdges);
    if (selectedNode === nodeId) setSelectedNode(null);
    if (edgeStart === nodeId) setEdgeStart(null);
    toast.success(`Node ${nodeId} deleted`);
  };

  const deleteEdge = (from: string, to: string) => {
    const updatedEdges = edges.filter((e) => !(e.from === from && e.to === to));
    setEdges(updatedEdges);
    saveToHistory(`Deleted edge ${from}-${to}`, nodes, updatedEdges);
    toast.success(`Edge ${from}-${to} deleted`);
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    saveToHistory("Cleared graph", [], []);
    setSelectedNode(null);
    setEdgeStart(null);
    toast.info("Graph cleared");
  };

  const exportGraph = () => {
    const graphData = { nodes, edges };
    const dataStr = JSON.stringify(graphData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "graph.json";
    link.click();
    toast.success("Graph exported");
  };

  const getNodePosition = (nodeId: string) => {
    return nodes.find((n) => n.id === nodeId);
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case "low":
        return "hsl(var(--traffic-low))";
      case "medium":
        return "hsl(var(--traffic-medium))";
      case "high":
        return "hsl(var(--traffic-high))";
      default:
        return "hsl(var(--border))";
    }
  };

  return (
    <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-display">Custom Graph Builder</CardTitle>
              <CardDescription>
                Click to add nodes, then create edges between them with custom weights and traffic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setMode("node");
                    setEdgeStart(null);
                  }}
                  variant={mode === "node" ? "default" : "outline"}
                  className={mode === "node" ? "bg-primary hover:bg-primary/90" : ""}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Nodes
                </Button>
                <Button
                  id="edge-mode-button"
                  onClick={() => setMode("edge")}
                  variant={mode === "edge" ? "default" : "outline"}
                  className={mode === "edge" ? "bg-secondary hover:bg-secondary/90" : ""}
                  disabled={nodes.length < 2}
                >
                  Connect Nodes
                </Button>
                <Button onClick={clearGraph} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={exportGraph} variant="outline" disabled={nodes.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="ml-auto flex gap-2">
                  <Button 
                    onClick={handleUndo} 
                    variant="outline" 
                    disabled={currentHistoryIndex <= 0}
                    size="icon"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={handleRedo} 
                    variant="outline" 
                    disabled={currentHistoryIndex >= history.length - 1}
                    size="icon"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

          {/* Edge Properties (shown when in edge mode) */}
          {mode === "edge" && (
            <Card className="bg-muted/50 border-secondary/50">
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2" id="edge-weight-slider">
                    <Label htmlFor="weight">Edge Weight (km)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="20"
                      value={edgeWeight}
                      onChange={(e) => setEdgeWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2" id="traffic-level-slider">
                    <Label htmlFor="traffic">Traffic Level</Label>
                    <Select value={edgeTraffic} onValueChange={(v: any) => setEdgeTraffic(v)}>
                      <SelectTrigger id="traffic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Traffic</SelectItem>
                        <SelectItem value="medium">Medium Traffic</SelectItem>
                        <SelectItem value="high">High Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => setIsBlocked(!isBlocked)}
                      variant={isBlocked ? "destructive" : "outline"}
                      className="w-full"
                    >
                      {isBlocked ? "Blocked" : "Not Blocked"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm">
            <p>
              {mode === "node" && "Click anywhere on the canvas to add nodes"}
              {mode === "edge" && edgeStart === null && "Click a node to start creating an edge"}
              {mode === "edge" && edgeStart !== null && `Creating edge from ${edgeStart}. Click another node to complete.`}
            </p>
          </div>

          {/* Canvas */}
          <div className="relative bg-card border-2 border-border rounded-lg p-4">
            <svg
              id="canvas"
              ref={svgRef}
              width="100%"
              height="400"
              className={`overflow-visible ${mode === "node" ? "cursor-crosshair" : "cursor-pointer"}`}
              onClick={handleSvgClick}
            >
              {/* Draw edges */}
              {edges.map((edge, index) => {
                const from = getNodePosition(edge.from);
                const to = getNodePosition(edge.to);
                if (!from || !to) return null;

                return (
                  <g key={index}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={edge.isBlocked ? "hsl(var(--destructive))" : getTrafficColor(edge.traffic)}
                      strokeWidth={edge.isBlocked ? 3 : 2}
                      strokeDasharray={edge.isBlocked ? "5,5" : "none"}
                    />
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 10}
                      fill="hsl(var(--foreground))"
                      fontSize="12"
                      fontWeight="600"
                      className="select-none"
                    >
                      {edge.weight}km
                    </text>
                    {/* Delete edge button */}
                    <circle
                      cx={(from.x + to.x) / 2}
                      cy={(from.y + to.y) / 2 + 10}
                      r="8"
                      fill="hsl(var(--destructive))"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEdge(edge.from, edge.to);
                      }}
                    />
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 + 10}
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                    >
                      ×
                    </text>
                  </g>
                );
              })}

              {/* Draw edge in progress */}
              {mode === "edge" && edgeStart !== null && (
                <line
                  x1={getNodePosition(edgeStart)?.x}
                  y1={getNodePosition(edgeStart)?.y}
                  x2={getNodePosition(edgeStart)?.x}
                  y2={getNodePosition(edgeStart)?.y}
                  stroke="hsl(var(--secondary))"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  className="animate-pulse"
                />
              )}

              {/* Draw nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="25"
                    fill={
                      edgeStart === node.id
                        ? "hsl(var(--secondary))"
                        : selectedNode === node.id
                        ? "hsl(var(--accent))"
                        : "hsl(var(--primary))"
                    }
                    stroke="hsl(var(--background))"
                    strokeWidth="3"
                    className="cursor-pointer drop-shadow-lg hover:opacity-80 transition-all"
                    onClick={(e) => handleNodeClick(node.id, e)}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    fill="hsl(var(--primary-foreground))"
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                  >
                    {node.id}
                  </text>
                  {/* Delete node button */}
                  <circle
                    cx={node.x + 20}
                    cy={node.y - 20}
                    r="10"
                    fill="hsl(var(--destructive))"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                  />
                  <text
                    x={node.x + 20}
                    y={node.y - 20}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                  >
                    ×
                  </text>
                </g>
              ))}
            </svg>
          </div>

              {/* Stats */}
              <div id="graph-stats" className="flex flex-wrap gap-4 text-sm">
                <Badge variant="outline">
                  <Plus className="w-3 h-3 mr-1" />
                  {nodes.length} Nodes
                </Badge>
                <Badge variant="outline">
                  {edges.length} Edges
                </Badge>
                <Badge variant="outline">
                  {edges.filter((e) => !e.isBlocked).length} Valid Edges
                </Badge>
                <Badge variant="outline">
                  {edges.filter((e) => e.isBlocked).length} Blocked Edges
                </Badge>
                {history.length > 0 && (
                  <Badge variant="outline">
                    <History className="w-3 h-3 mr-1" />
                    {currentHistoryIndex + 1}/{history.length} snapshots
                  </Badge>
                )}
              </div>

              {/* Version History Timeline */}
              {history.length > 0 && (
                <Card className="bg-muted/30 border-accent/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {history.map((snapshot, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            index === currentHistoryIndex
                              ? "bg-primary/20 border border-primary/30"
                              : "bg-card hover:bg-accent/10"
                          }`}
                          onClick={() => restoreSnapshot(index)}
                        >
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-medium">{snapshot.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(snapshot.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {snapshot.nodes.length}N / {snapshot.edges.length}E
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
    </Card>
  );
};

export default GraphBuilder;
