import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Move } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  traffic: "low" | "medium" | "high";
  isBlocked?: boolean;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  target?: string;
  validation?: (nodes: Node[], edges: Edge[]) => boolean;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to Graph Builder! 🎉",
    description: "Let's build your first traffic network graph together. I'll guide you through each step. Click 'Next' to begin!",
  },
  {
    id: 2,
    title: "Add Your First Node",
    description: "Click anywhere on the canvas below to create your first intersection node. This represents a location in your network.",
    validation: (nodes) => nodes.length >= 1,
    highlight: "canvas",
  },
  {
    id: 3,
    title: "Add a Second Node",
    description: "Great! Now add another node by clicking somewhere else on the canvas. This will be another location.",
    validation: (nodes) => nodes.length >= 2,
    highlight: "canvas",
  },
  {
    id: 4,
    title: "Switch to Edge Mode",
    description: "Now let's connect these nodes! Click the 'Add Edge' button to switch to edge creation mode.",
    target: "edge-mode-button",
    validation: () => true,
  },
  {
    id: 5,
    title: "Create a Connection",
    description: "Click on the first node, then click on the second node to create an edge (road) between them.",
    validation: (nodes, edges) => edges.length >= 1,
    highlight: "canvas",
  },
  {
    id: 6,
    title: "Adjust Edge Weight",
    description: "See the weight slider? This represents the distance or cost. Try adjusting it to see how it affects the edge label!",
    target: "edge-weight-slider",
    validation: () => true,
  },
  {
    id: 7,
    title: "Set Traffic Level",
    description: "Use the traffic level slider to simulate different traffic conditions. Watch the edge color change!",
    target: "traffic-level-slider",
    validation: () => true,
  },
  {
    id: 8,
    title: "Add More Nodes",
    description: "Switch back to 'Add Node' mode and create at least 2 more nodes. A good graph needs multiple connections!",
    validation: (nodes) => nodes.length >= 4,
    highlight: "canvas",
  },
  {
    id: 9,
    title: "Create More Edges",
    description: "Switch to 'Add Edge' mode and create at least 2 more connections. Try connecting different nodes!",
    validation: (nodes, edges) => edges.length >= 3,
    highlight: "canvas",
  },
  {
    id: 10,
    title: "Explore Graph Statistics",
    description: "Check out your graph stats below the canvas! You can see total nodes, edges, and average degree.",
    target: "graph-stats",
    validation: () => true,
  },
  {
    id: 11,
    title: "Tutorial Complete! 🎉",
    description: "Congratulations! You've built your first graph. Now explore the other tabs like 'Kruskal's Algorithm' to visualize how algorithms find optimal paths through your network!",
  },
];

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const InteractiveTutorial = ({
  isOpen,
  onClose,
  nodes,
  edges,
  currentTab,
  onTabChange,
}: InteractiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [arrowPath, setArrowPath] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const canProceed = () => {
    if (!step.validation) return true;
    return step.validation(nodes, edges);
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
      setArrowPath(null);
    }
  }, [isOpen]);

  // Calculate arrow path to target element
  useEffect(() => {
    if (!isOpen || !step.target) {
      setArrowPath(null);
      // Remove highlight from all elements
      document.querySelectorAll('.tutorial-highlight').forEach((el) => {
        el.classList.remove('tutorial-highlight');
      });
      return;
    }

    const calculateArrow = () => {
      const targetElement = document.getElementById(step.target!);
      const popup = popupRef.current;

      if (!targetElement || !popup) {
        setArrowPath(null);
        return;
      }

      // Add highlight class to target element
      document.querySelectorAll('.tutorial-highlight').forEach((el) => {
        el.classList.remove('tutorial-highlight');
      });
      targetElement.classList.add('tutorial-highlight');

      const targetRect = targetElement.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();

      // Calculate the center of the popup (left side for arrow origin)
      const popupX = popupRect.left;
      const popupY = popupRect.top + popupRect.height / 2;

      // Calculate the closest point on the target element
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      setArrowPath({
        x1: popupX,
        y1: popupY,
        x2: targetX,
        y2: targetY,
      });
    };

    calculateArrow();
    window.addEventListener("resize", calculateArrow);
    window.addEventListener("scroll", calculateArrow);

    const interval = setInterval(calculateArrow, 100);

    return () => {
      window.removeEventListener("resize", calculateArrow);
      window.removeEventListener("scroll", calculateArrow);
      clearInterval(interval);
      // Cleanup highlight
      document.querySelectorAll('.tutorial-highlight').forEach((el) => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [isOpen, step.target, currentStep]);

  useEffect(() => {
    if (currentTab !== "builder" && isOpen && currentStep > 0 && currentStep < tutorialSteps.length - 1) {
      onTabChange("builder");
    }
  }, [currentTab, isOpen, currentStep, onTabChange]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Arrow Pointer SVG Overlay */}
      {arrowPath && (
        <svg
          className="fixed inset-0 pointer-events-none z-40"
          style={{ width: "100vw", height: "100vh" }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill="hsl(var(--primary))"
                className="drop-shadow-lg"
              />
            </marker>
          </defs>
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            d={`M ${arrowPath.x1} ${arrowPath.y1} Q ${arrowPath.x1 - 100} ${
              (arrowPath.y1 + arrowPath.y2) / 2
            } ${arrowPath.x2} ${arrowPath.y2}`}
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="drop-shadow-[0_0_10px_hsl(var(--primary))]"
            style={{
              filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))",
            }}
          />
        </svg>
      )}

      {/* Highlight Target Element */}
      {step.target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-30"
          style={{
            background: "radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), transparent 150px, rgba(0,0,0,0.3) 300px)",
          }}
        />
      )}

      {/* Draggable Corner Tutorial Popup */}
      <motion.div
        ref={popupRef}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          left: 0,
          right: window.innerWidth - 400,
          top: 0,
          bottom: window.innerHeight - 400,
        }}
        initial={{ opacity: 0, x: 400, y: 100 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 400, y: 100 }}
        className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] cursor-move"
      >
        <Card className="shadow-2xl border-2 border-primary bg-background backdrop-blur-md cursor-auto">
          {/* Drag Handle Header */}
          <div className="p-4 pb-3 space-y-3 cursor-move" onPointerDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <div className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-grab active:cursor-grabbing flex-shrink-0 transition-colors">
                <Move className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="outline" className="mb-1 text-xs">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </Badge>
                  <h3 className="text-base font-bold text-foreground truncate">{step.title}</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="rounded-full hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Progress value={progress} className="h-1.5" />
            </div>

          {/* Content - Non-draggable */}
          <div className="px-4 pb-4 space-y-3 cursor-auto" onPointerDown={(e) => e.stopPropagation()}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Validation Status */}
            {step.validation && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                {canProceed() ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Done! Click Next →
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 animate-pulse flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Complete the action to proceed
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="sm"
                className="flex-1"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={step.validation && !canProceed()}
                size="sm"
                className="flex-1"
              >
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-muted-foreground hover:text-foreground text-xs"
              size="sm"
            >
              Close Tutorial
            </Button>
          </div>
        </Card>

        {/* Completion Celebration - Smaller */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-20 left-1/2 -translate-x-1/2"
            >
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: 2, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 text-primary mx-auto" />
                </motion.div>
                <p className="text-lg font-bold text-primary">Complete! 🎉</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
