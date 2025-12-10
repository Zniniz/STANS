import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RefreshCw, SkipForward, SkipBack, ChevronRight, ChevronLeft, Pause } from "lucide-react";
import { toast } from "sonner";
import { kruskalAlgorithm, getEdgeColor, type Edge, type KruskalStep } from "@/utils/kruskal";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface GraphVisualizationProps {
  nodes?: Node[];
  edges?: Edge[];
}

const GraphVisualization = ({ nodes: propNodes, edges: propEdges }: GraphVisualizationProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<KruskalStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds per step
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use provided nodes/edges or fallback to sample data
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
    stopAutoPlay();
    setSteps([]);
    setCurrentStepIndex(0);
    setIsRunning(false);
    toast.info("Algorithm reset");
  };

  const startAutoPlay = () => {
    if (!isRunning || currentStepIndex >= steps.length - 1) {
      return;
    }
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

  // Auto-play effect
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
            {isRunning && (
              <Button
                onClick={toggleAutoPlay}
                variant={isAutoPlaying ? "destructive" : "secondary"}
                className={isAutoPlaying ? "" : "bg-secondary hover:bg-secondary/90"}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Auto-Play
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Auto-Play
                  </>
                )}
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
                <Label htmlFor="speed-slider" className="text-sm font-medium">
                  Playback Speed
                </Label>
                <span className="text-sm text-muted-foreground">
                  {playbackSpeed === 2000 ? "Slow" : playbackSpeed === 1000 ? "Normal" : playbackSpeed === 500 ? "Fast" : "Very Fast"}
                </span>
              </div>
              <Slider
                id="speed-slider"
                min={250}
                max={2000}
                step={250}
                value={[playbackSpeed]}
                onValueChange={(value) => setPlaybackSpeed(value[0])}
                className="w-full"
              />
            </div>
          )}

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
                  disabled={currentStepIndex === 0 || isAutoPlaying}
                  variant="outline"
                  size="sm"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0 || isAutoPlaying}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={currentStepIndex === steps.length - 1 || isAutoPlaying}
                  variant="default"
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={jumpToEnd}
                  disabled={currentStepIndex === steps.length - 1 || isAutoPlaying}
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
          <div className="relative bg-card border-2 border-border rounded-lg p-4 sm:p-8 overflow-x-auto">
            <svg width="100%" height="400" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" className="min-w-[300px]">
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

                // Calculate edge path for particles
                const pathId = `edge-path-${index}`;
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                return (
                  <g key={index}>
                    {/* Define path for particle animation */}
                    <defs>
                      <path
                        id={pathId}
                        d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                      />
                    </defs>

                    {/* Background glow for MST edges */}
                    {isInMST && (
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={edgeColor}
                        strokeWidth={12}
                        opacity={0.3}
                        className="animate-glow-pulse"
                        style={{ color: edgeColor }}
                      />
                    )}

                    {/* Main edge line */}
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={edgeColor}
                      strokeWidth={isInMST ? 5 : isCurrent ? 4 : edge.isBlocked ? 3 : 2}
                      strokeDasharray={
                        edge.isBlocked ? "5,5" : 
                        isCurrent ? "10,5" : 
                        isInMST ? `${length}` : "none"
                      }
                      className={`transition-all duration-700 ease-in-out ${
                        isCurrent ? "animate-edge-flow" : ""
                      } ${isInMST ? "animate-edge-draw" : ""}`}
                      opacity={!isRunning || isInMST || isCurrent ? 1 : 0.3}
                      style={{
                        strokeDashoffset: isInMST ? 0 : undefined,
                        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />

                    {/* Animated particle traveling along current edge */}
                    {isCurrent && isAutoPlaying && (
                      <>
                        <circle
                          r="6"
                          fill={edgeColor}
                          opacity={0.9}
                          className="animate-particle-flow"
                        >
                          <animateMotion
                            dur="2s"
                            repeatCount="indefinite"
                            path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                          />
                        </circle>
                        <circle
                          r="4"
                          fill="hsl(var(--background))"
                          opacity={0.8}
                          className="animate-particle-flow"
                          style={{ animationDelay: '0.3s' }}
                        >
                          <animateMotion
                            dur="2s"
                            repeatCount="indefinite"
                            path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                          />
                        </circle>
                      </>
                    )}

                    {/* Weight label with background */}
                    <g>
                      <rect
                        x={(from.x + to.x) / 2 - 20}
                        y={(from.y + to.y) / 2 - 22}
                        width="40"
                        height="18"
                        fill="hsl(var(--background))"
                        opacity={0.9}
                        rx="4"
                      />
                      <text
                        x={(from.x + to.x) / 2}
                        y={(from.y + to.y) / 2 - 10}
                        fill="hsl(var(--foreground))"
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                        className="select-none"
                      >
                        {edge.weight}km
                      </text>
                    </g>
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
                    {/* Ripple effect for highlighted nodes */}
                    {isHighlighted && isAutoPlaying && (
                      <>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          fill="none"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="3"
                          opacity={0}
                          className="animate-node-ripple"
                        />
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          fill="none"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="3"
                          opacity={0}
                          className="animate-node-ripple"
                          style={{ animationDelay: '0.5s' }}
                        />
                      </>
                    )}

                    {/* Outer glow for highlighted nodes */}
                    {isHighlighted && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="35"
                        fill="hsl(var(--secondary))"
                        opacity={0.2}
                        className="animate-pulse-slow"
                      />
                    )}

                    {/* Main node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="25"
                      fill={isHighlighted ? "hsl(var(--secondary))" : "hsl(var(--primary))"}
                      stroke="hsl(var(--background))"
                      strokeWidth="3"
                      className="drop-shadow-lg transition-all duration-500"
                      style={{
                        transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
                        transformOrigin: `${node.x}px ${node.y}px`,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />

                    {/* Node ID text */}
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

                    {/* Node label */}
                    <text
                      x={node.x}
                      y={node.y + 45}
                      fill="hsl(var(--muted-foreground))"
                      fontSize="11"
                      textAnchor="middle"
                      className="select-none transition-all duration-300"
                      style={{
                        fontWeight: isHighlighted ? '600' : '400'
                      }}
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
