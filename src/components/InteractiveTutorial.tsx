import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react";
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

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentTab !== "builder" && isOpen && currentStep > 0 && currentStep < tutorialSteps.length - 1) {
      onTabChange("builder");
    }
  }, [currentTab, isOpen, currentStep, onTabChange]);

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const canProceed = () => {
    if (!step.validation) return true;
    return step.validation(nodes, edges);
  };

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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
        {/* Overlay with spotlight effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={handleSkip}
        />

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative z-10 pointer-events-auto"
        >
          <Card className="w-[500px] max-w-[90vw] shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur">
            {/* Header */}
            <div className="p-6 pb-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Step {currentStep + 1} of {tutorialSteps.length}
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="rounded-full hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Progress value={progress} className="h-2" />
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Validation Status */}
              {step.validation && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  {canProceed() ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Step completed! Click Next to continue.
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 animate-pulse" />
                      <span className="text-sm text-muted-foreground">
                        Complete the action above to proceed
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
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={step.validation && !canProceed()}
                  className="flex-1"
                >
                  {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-muted-foreground hover:text-foreground"
                size="sm"
              >
                Skip Tutorial
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Completion Celebration */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-20 h-20 text-primary mx-auto" />
                </motion.div>
                <h2 className="text-4xl font-bold text-primary">Tutorial Complete!</h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
