import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RefreshCw, SkipForward, SkipBack, ChevronRight, ChevronLeft, Pause } from "lucide-react";
import { toast } from "sonner";
import { primAlgorithm, type PrimStep } from "@/utils/prim";
import type { Edge } from "@/utils/kruskal";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface PrimVisualizationProps {
  nodes?: Node[];
  edges?: Edge[];
}

const PrimVisualization = ({ nodes: propNodes, edges: propEdges }: PrimVisualizationProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<PrimStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [startNode, setStartNode] = useState<string>("");
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const defaultNodes: Node[] = [
    { id: "A", x: 100, y: 150, label: "Intersection A" },
    { id: "B", x: 300, y: 100, label: "Intersection B" },
    { id: "C", x: 500, y: 150, label: "Intersection C" },
    { id: "D", x: 200, y: 300, label: "Intersection D" },
    { id: "E", x: 400, y: 300, label: "Intersection E" },
  ];

  const defaultEdges: Edge[] = [
    { from: "A", to: "B", weight: 5, traffic: "low", isBlocked: false },
    { from: "A", to: "D", weight: 8, traffic: "medium", isBlocked: false },
    { from: "B", to: "C", weight: 6, traffic: "high", isBlocked: false },
    { from: "B", to: "E", weight: 7, traffic: "low", isBlocked: false },
    { from: "C", to: "E", weight: 4, traffic: "low", isBlocked: false },
    { from: "D", to: "E", weight: 9, traffic: "medium", isBlocked: true },
    { from: "B", to: "D", weight: 3, traffic: "medium", isBlocked: false },
  ];

  const nodes = propNodes && propNodes.length > 0 ? propNodes : defaultNodes;
  const edges = propEdges && propEdges.length > 0 ? propEdges : defaultEdges;

  useEffect(() => {
    if (nodes.length > 0 && !startNode) {
      setStartNode(nodes[0].id);
    }
  }, [nodes, startNode]);

  const getNodePosition = (nodeId: string) => {
    return nodes.find((n) => n.id === nodeId);
  };

  const startAlgorithm = () => {
    if (!startNode) {
      toast.error("Please select a starting node");
      return;
    }
    setIsRunning(true);
    toast.info("Running Prim's Algorithm...");
    
    const algorithmSteps = primAlgorithm(edges, nodes.map(n => n.id), startNode);
    setSteps(algorithmSteps);
    setCurrentStepIndex(0);
    
    toast.success("Algorithm initialized! Use controls to step through.");
  };

  const resetGraph = () => {
    stopAutoPlay();
    setSteps([]);
    setCurrentStepIndex(0);
    setIsRunning(false);
    toast.info("Algorithm reset");
  };

  const startAutoPlay = () => {
    if (!isRunning || currentStepIndex >= steps.length - 1) return;
    setIsAutoPlaying(true);
    toast.success("Auto-play started");
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
      toast.info("Auto-play paused");
    } else {
      startAutoPlay();
    }
  };

  useEffect(() => {
    if (isAutoPlaying && currentStepIndex < steps.length - 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            stopAutoPlay();
            toast.success("Auto-play complete!");
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (currentStepIndex >= steps.length - 1) {
      stopAutoPlay();
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlaying, currentStepIndex, steps.length, playbackSpeed]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
  };

  const prevStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  const jumpToEnd = () => setCurrentStepIndex(steps.length - 1);
  const jumpToStart = () => setCurrentStepIndex(0);

  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  const getEdgeColor = (edge: Edge) => {
    if (edge.isBlocked) return "hsl(var(--destructive))";
    if (!currentStep) return "hsl(var(--border))";

    const isInMST = currentStep.currentMST.some(
      e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
    );
    if (isInMST) return "hsl(var(--accent))";

    const isCurrent = currentStep.edge && 
      ((currentStep.edge.from === edge.from && currentStep.edge.to === edge.to) ||
       (currentStep.edge.from === edge.to && currentStep.edge.to === edge.from));
    if (isCurrent) return "hsl(var(--secondary))";

    const isCandidate = currentStep.candidateEdges?.some(
      e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
    );
    if (isCandidate) return "hsl(var(--primary)/0.5)";

    return "hsl(var(--border))";
  };

  const getNodeColor = (nodeId: string) => {
    if (!currentStep) return "hsl(var(--muted))";
    if (nodeId === startNode && currentStep.action === "initialize") return "hsl(var(--primary))";
    if (currentStep.visitedNodes.has(nodeId)) return "hsl(142 76% 36%)";
    return "hsl(var(--muted))";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-display">Prim's Algorithm Visualization</CardTitle>
          <CardDescription>
            Build MST by growing a tree from a starting node
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Start Node Selection */}
          <div className="max-w-xs">
            <Label htmlFor="start-select">Starting Node</Label>
            <Select value={startNode} onValueChange={setStartNode} disabled={isRunning}>
              <SelectTrigger id="start-select">
                <SelectValue placeholder="Select start node" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>{node.id} - {node.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={startAlgorithm} disabled={isRunning} className="bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" />
              Start Algorithm
            </Button>
            {isRunning && (
              <Button onClick={toggleAutoPlay} variant={isAutoPlaying ? "destructive" : "secondary"}>
                {isAutoPlaying ? <><Pause className="w-4 h-4 mr-2" />Pause</> : <><Play className="w-4 h-4 mr-2" />Auto-Play</>}
              </Button>
            )}
            <Button onClick={resetGraph} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Speed Control */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Playback Speed</Label>
                <span className="text-sm text-muted-foreground">
                  {playbackSpeed === 2000 ? "Slow" : playbackSpeed === 1000 ? "Normal" : playbackSpeed === 500 ? "Fast" : "Very Fast"}
                </span>
              </div>
              <Slider min={250} max={2000} step={250} value={[playbackSpeed]} onValueChange={(v) => setPlaybackSpeed(v[0])} />
            </div>
          )}

          {isRunning && (
            <>
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button onClick={jumpToStart} disabled={currentStepIndex === 0 || isAutoPlaying} variant="outline" size="sm">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button onClick={prevStep} disabled={currentStepIndex === 0 || isAutoPlaying} variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button onClick={nextStep} disabled={currentStepIndex === steps.length - 1 || isAutoPlaying} variant="default" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button onClick={jumpToEnd} disabled={currentStepIndex === steps.length - 1 || isAutoPlaying} variant="outline" size="sm">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Current Step Info */}
              {currentStep && (
                <Card className={`
                  ${currentStep.action === 'add' ? 'bg-accent/10 border-accent/50' : ''}
                  ${currentStep.action === 'consider' ? 'bg-secondary/10 border-secondary/50' : ''}
                  ${currentStep.action === 'complete' ? 'bg-primary/10 border-primary/50' : ''}
                `}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={currentStep.action === 'add' ? 'default' : currentStep.action === 'complete' ? 'secondary' : 'outline'}>
                        {currentStep.action.toUpperCase()}
                      </Badge>
                      {currentStep.edge && (
                        <span className="text-sm font-mono text-muted-foreground">
                          Edge: {currentStep.edge.from} → {currentStep.edge.to} ({currentStep.edge.weight}km)
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{currentStep.explanation}</p>
                    
                    {currentStep.currentMST.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                          <strong>Current MST:</strong> {currentStep.currentMST.length} edges, Total weight: {currentStep.totalWeight}km
                        </p>
                      </div>
                    )}

                    {/* Visited Nodes */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2"><strong>Visited Nodes:</strong></p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(currentStep.visitedNodes).map(node => (
                          <Badge key={node} variant="default" className="text-xs">{node}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Candidate Edges */}
                    {currentStep.candidateEdges && currentStep.candidateEdges.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2"><strong>Candidate Edges:</strong></p>
                        <div className="flex flex-wrap gap-2">
                          {currentStep.candidateEdges.map((e, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {e.from}-{e.to}: {e.weight}km
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <span>Start Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(142 76% 36%)" }} />
              <span>In Tree</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-accent" style={{ height: "4px" }} />
              <span>In MST</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-secondary" style={{ height: "3px" }} />
              <span>Current Edge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-destructive" />
              <span>Blocked</span>
            </div>
          </div>

          {/* Graph SVG */}
          <div className="relative bg-card border-2 border-border rounded-lg p-4 sm:p-8 overflow-x-auto">
            <svg width="100%" height="400" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" className="min-w-[300px]">
              {/* Draw edges */}
              {edges.map((edge, index) => {
                const from = getNodePosition(edge.from);
                const to = getNodePosition(edge.to);
                if (!from || !to) return null;

                const edgeColor = getEdgeColor(edge);
                const isInMST = currentStep?.currentMST.some(
                  e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
                );
                const isCurrent = currentStep?.edge && 
                  ((currentStep.edge.from === edge.from && currentStep.edge.to === edge.to) ||
                   (currentStep.edge.from === edge.to && currentStep.edge.to === edge.from));

                return (
                  <g key={index}>
                    {isInMST && (
                      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={edgeColor} strokeWidth={12} opacity={0.3} />
                    )}
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={edgeColor}
                      strokeWidth={isInMST ? 5 : isCurrent ? 4 : edge.isBlocked ? 3 : 2}
                      strokeDasharray={edge.isBlocked ? "5,5" : isCurrent ? "10,5" : "none"}
                      opacity={edge.isBlocked ? 0.5 : 1}
                      className="transition-all duration-500"
                    />
                    {isCurrent && isAutoPlaying && (
                      <circle r="6" fill={edgeColor} opacity={0.9}>
                        <animateMotion dur="2s" repeatCount="indefinite" path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} />
                      </circle>
                    )}
                    <rect x={(from.x + to.x) / 2 - 18} y={(from.y + to.y) / 2 - 12}
                      width="36" height="24" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 4}
                      textAnchor="middle" fontSize="12" fill="hsl(var(--foreground))" fontWeight="bold">
                      {edge.weight}km
                    </text>
                  </g>
                );
              })}

              {/* Draw nodes */}
              {nodes.map((node) => {
                const nodeColor = getNodeColor(node.id);
                const isVisited = currentStep?.visitedNodes.has(node.id);

                return (
                  <g key={node.id} className="transition-all duration-300">
                    <circle cx={node.x} cy={node.y} r={28} fill={nodeColor}
                      className="transition-all duration-500"
                      style={{ filter: isVisited ? 'drop-shadow(0 0 6px currentColor)' : 'none' }} />
                    <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize="16"
                      fill="hsl(var(--foreground))" fontWeight="bold">{node.id}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrimVisualization;
