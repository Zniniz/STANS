import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RefreshCw, SkipForward, SkipBack, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { kruskalAlgorithm, getEdgeColor, type Edge, type KruskalStep } from "@/utils/kruskal";
import { Progress } from "@/components/ui/progress";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

const GraphVisualization = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<KruskalStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Sample graph data
  const nodes: Node[] = [
    { id: "A", x: 100, y: 150, label: "Intersection A" },
    { id: "B", x: 300, y: 100, label: "Intersection B" },
    { id: "C", x: 500, y: 150, label: "Intersection C" },
    { id: "D", x: 200, y: 300, label: "Intersection D" },
    { id: "E", x: 400, y: 300, label: "Intersection E" },
  ];

  const edges: Edge[] = [
    { from: "A", to: "B", weight: 5, traffic: "low", isBlocked: false },
    { from: "A", to: "D", weight: 8, traffic: "medium", isBlocked: false },
    { from: "B", to: "C", weight: 6, traffic: "high", isBlocked: false },
    { from: "B", to: "E", weight: 7, traffic: "low", isBlocked: false },
    { from: "C", to: "E", weight: 4, traffic: "low", isBlocked: false },
    { from: "D", to: "E", weight: 9, traffic: "medium", isBlocked: true },
    { from: "B", to: "D", weight: 3, traffic: "medium", isBlocked: false },
  ];

  const getNodePosition = (nodeId: string) => {
    return nodes.find((n) => n.id === nodeId);
  };

  const startAlgorithm = () => {
    setIsRunning(true);
    toast.info("Running Kruskal's Algorithm...");
    
    const algorithmSteps = kruskalAlgorithm(edges, nodes.map(n => n.id));
    setSteps(algorithmSteps);
    setCurrentStepIndex(0);
    
    toast.success("Algorithm initialized! Use controls to step through.");
  };

  const resetGraph = () => {
    setSteps([]);
    setCurrentStepIndex(0);
    setIsRunning(false);
    toast.info("Algorithm reset");
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const jumpToEnd = () => {
    setCurrentStepIndex(steps.length - 1);
  };

  const jumpToStart = () => {
    setCurrentStepIndex(0);
  };

  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-display">Kruskal's Algorithm Visualization</CardTitle>
          <CardDescription>
            Step-by-step execution with Union-Find data structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={startAlgorithm}
              disabled={isRunning}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Algorithm
            </Button>
            <Button onClick={resetGraph} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {isRunning && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={jumpToStart}
                  disabled={currentStepIndex === 0}
                  variant="outline"
                  size="sm"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={currentStepIndex === steps.length - 1}
                  variant="default"
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={jumpToEnd}
                  disabled={currentStepIndex === steps.length - 1}
                  variant="outline"
                  size="sm"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Current Step Information */}
              {currentStep && (
                <Card className={`
                  ${currentStep.action === 'accept' ? 'bg-accent/10 border-accent/50' : ''}
                  ${currentStep.action === 'reject' ? 'bg-destructive/10 border-destructive/50' : ''}
                  ${currentStep.action === 'complete' ? 'bg-primary/10 border-primary/50' : ''}
                `}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        currentStep.action === 'accept' ? 'default' :
                        currentStep.action === 'reject' ? 'destructive' :
                        'secondary'
                      }>
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
                          <strong>Current MST:</strong> {currentStep.currentMST.length} edges, 
                          Total weight: {currentStep.totalWeight}km
                        </p>
                      </div>
                    )}

                    {/* Show current sets from Union-Find */}
                    {currentStep.sets && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">
                          <strong>Union-Find Sets:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(currentStep.sets.entries()).map(([root, members], idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {members.join(", ")}
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
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--traffic-low))" }} />
              <span>Low Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--traffic-medium))" }} />
              <span>Medium Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--traffic-high))" }} />
              <span>High Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-destructive" />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-accent" style={{ height: "4px" }} />
              <span>In MST</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-secondary" style={{ height: "3px" }} />
              <span>Considering</span>
            </div>
          </div>

          {/* Graph SVG */}
          <div className="relative bg-card border-2 border-border rounded-lg p-8 min-h-[400px]">
            <svg width="100%" height="400" className="overflow-visible">
              {/* Draw edges */}
              {edges.map((edge, index) => {
                const from = getNodePosition(edge.from);
                const to = getNodePosition(edge.to);
                if (!from || !to) return null;

                const edgeColor = currentStep 
                  ? getEdgeColor(edge, currentStep.currentMST, currentStep.edge)
                  : edge.isBlocked ? "hsl(var(--destructive))" : "hsl(var(--border))";

                const isInMST = currentStep?.currentMST.some(
                  e => (e.from === edge.from && e.to === edge.to) || 
                       (e.from === edge.to && e.to === edge.from)
                );

                const isCurrent = currentStep?.edge && 
                  ((currentStep.edge.from === edge.from && currentStep.edge.to === edge.to) ||
                   (currentStep.edge.from === edge.to && currentStep.edge.to === edge.from));

                return (
                  <g key={index}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={edgeColor}
                      strokeWidth={isInMST ? 5 : isCurrent ? 4 : edge.isBlocked ? 3 : 2}
                      strokeDasharray={edge.isBlocked ? "5,5" : "none"}
                      className={`transition-all duration-500 ${isInMST || isCurrent ? "animate-pulse-slow" : ""}`}
                      opacity={!isRunning || isInMST || isCurrent ? 1 : 0.3}
                    />
                    {/* Weight label */}
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
                  </g>
                );
              })}

              {/* Draw nodes */}
              {nodes.map((node) => {
                // Highlight nodes that are in the current edge being considered
                const isHighlighted = currentStep?.edge && 
                  (currentStep.edge.from === node.id || currentStep.edge.to === node.id);

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="25"
                      fill={isHighlighted ? "hsl(var(--secondary))" : "hsl(var(--primary))"}
                      stroke="hsl(var(--background))"
                      strokeWidth="3"
                      className={`drop-shadow-lg transition-all duration-500 ${isHighlighted ? "animate-pulse-slow" : ""}`}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      fill="hsl(var(--primary-foreground))"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="select-none"
                    >
                      {node.id}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 45}
                      fill="hsl(var(--muted-foreground))"
                      fontSize="11"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {node.label}
                    </text>
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

export default GraphVisualization;
