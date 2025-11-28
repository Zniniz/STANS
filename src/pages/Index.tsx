import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Hero from "@/components/Hero";
import GraphVisualization from "@/components/GraphVisualization";
import ProjectInfo from "@/components/ProjectInfo";
import RouteCalculator from "@/components/RouteCalculator";
import GraphBuilder from "@/components/GraphBuilder";
import AlgorithmComparison from "@/components/AlgorithmComparison";
import ComplexityAnalysis from "@/components/ComplexityAnalysis";
import Graph3D from "@/components/Graph3D";
import VisualizationHistory from "@/components/VisualizationHistory";
import GraphImport from "@/components/GraphImport";
import EducationalMode from "@/components/EducationalMode";
import PerformanceBenchmark from "@/components/PerformanceBenchmark";
import AnimationRecorder from "@/components/AnimationRecorder";
import CollaborativeGraph from "@/components/CollaborativeGraph";
import GraphMetrics from "@/components/GraphMetrics";
import GraphTemplates from "@/components/GraphTemplates";
import { InteractiveTutorial } from "@/components/InteractiveTutorial";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapPin, Route, AlertTriangle, Hammer, BarChart3, Cpu, Box, Clock, Upload, GraduationCap, Zap, Video, Users, Network, Grid3x3, Sparkles } from "lucide-react";
import type { Edge } from "@/utils/kruskal";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Background mesh gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-40" 
           style={{ background: 'var(--gradient-mesh)' }} />
      
      {/* Theme toggle & Tutorial button */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg flex items-center gap-2 font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Start Tutorial
        </button>
        <ThemeToggle />
      </div>
      
      {/* Interactive Tutorial */}
      <InteractiveTutorial 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        nodes={nodes}
        edges={edges}
        currentTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="relative">
        <Hero 
          onExploreClick={() => setActiveTab("builder")}
          onViewAlgorithmClick={() => setActiveTab("visualization")}
        />
        
        <div className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto mb-8">
              <TabsList className="inline-flex w-full min-w-max justify-start lg:justify-center">
                <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap">
                  <MapPin className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="visualization" className="flex items-center gap-2 whitespace-nowrap">
                  <Route className="w-4 h-4" />
                  Kruskal's
                </TabsTrigger>
                <TabsTrigger value="calculator" className="flex items-center gap-2 whitespace-nowrap">
                  <AlertTriangle className="w-4 h-4" />
                  Route Calc
                </TabsTrigger>
                <TabsTrigger value="builder" className="flex items-center gap-2 whitespace-nowrap">
                  <Hammer className="w-4 h-4" />
                  Builder
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-2 whitespace-nowrap">
                  <Network className="w-4 h-4" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2 whitespace-nowrap">
                  <Grid3x3 className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2 whitespace-nowrap">
                  <BarChart3 className="w-4 h-4" />
                  Compare
                </TabsTrigger>
                <TabsTrigger value="complexity" className="flex items-center gap-2 whitespace-nowrap">
                  <Cpu className="w-4 h-4" />
                  Complexity
                </TabsTrigger>
                <TabsTrigger value="3d" className="flex items-center gap-2 whitespace-nowrap">
                  <Box className="w-4 h-4" />
                  3D View
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 whitespace-nowrap">
                  <Clock className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="import" className="flex items-center gap-2 whitespace-nowrap">
                  <Upload className="w-4 h-4" />
                  Import
                </TabsTrigger>
                <TabsTrigger value="educational" className="flex items-center gap-2 whitespace-nowrap">
                  <GraduationCap className="w-4 h-4" />
                  Learn
                </TabsTrigger>
                <TabsTrigger value="benchmark" className="flex items-center gap-2 whitespace-nowrap">
                  <Zap className="w-4 h-4" />
                  Benchmark
                </TabsTrigger>
                <TabsTrigger value="recorder" className="flex items-center gap-2 whitespace-nowrap">
                  <Video className="w-4 h-4" />
                  Record
                </TabsTrigger>
                <TabsTrigger value="collaborative" className="flex items-center gap-2 whitespace-nowrap">
                  <Users className="w-4 h-4" />
                  Collaborate
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8">
              <ProjectInfo />
            </TabsContent>

            <TabsContent value="visualization">
              <GraphVisualization nodes={nodes} edges={edges} />
            </TabsContent>

            <TabsContent value="calculator">
              <RouteCalculator nodes={nodes} edges={edges} />
            </TabsContent>

            <TabsContent value="builder">
              <GraphBuilder 
                nodes={nodes} 
                edges={edges} 
                setNodes={setNodes} 
                setEdges={setEdges} 
              />
            </TabsContent>

            <TabsContent value="metrics">
              <GraphMetrics nodes={nodes} edges={edges} />
            </TabsContent>

            <TabsContent value="templates">
              <GraphTemplates 
                onLoadTemplate={(templateNodes, templateEdges) => {
                  setNodes(templateNodes);
                  setEdges(templateEdges);
                  setActiveTab("builder");
                }} 
              />
            </TabsContent>

            <TabsContent value="comparison">
              <AlgorithmComparison nodes={nodes} edges={edges} />
            </TabsContent>

            <TabsContent value="complexity">
              <ComplexityAnalysis />
            </TabsContent>

            <TabsContent value="3d">
              <Graph3D graphData={{ 
                nodes, 
                edges: edges.map(e => ({
                  from: e.from,
                  to: e.to,
                  weight: e.weight,
                  traffic: e.traffic === 'low' ? 0.3 : e.traffic === 'medium' ? 0.6 : 0.9,
                  blocked: e.isBlocked
                }))
              }} />
            </TabsContent>

            <TabsContent value="history">
              <VisualizationHistory />
            </TabsContent>

            <TabsContent value="import">
              <GraphImport 
                onImportGraph={(data) => {
                  setNodes(data.nodes);
                  setEdges(data.edges.map(e => ({
                    from: e.from,
                    to: e.to,
                    weight: e.weight,
                    traffic: e.traffic > 0.6 ? 'high' : e.traffic > 0.3 ? 'medium' : 'low',
                    isBlocked: e.blocked
                  })));
                }}
                currentGraph={{
                  nodes,
                  edges: edges.map(e => ({
                    from: e.from,
                    to: e.to,
                    weight: e.weight,
                    traffic: e.traffic === 'low' ? 0.3 : e.traffic === 'medium' ? 0.6 : 0.9,
                    blocked: e.isBlocked
                  }))
                }}
              />
            </TabsContent>

            <TabsContent value="educational">
              <EducationalMode />
            </TabsContent>

            <TabsContent value="benchmark">
              <PerformanceBenchmark />
            </TabsContent>

            <TabsContent value="recorder">
              <AnimationRecorder />
            </TabsContent>

            <TabsContent value="collaborative">
              <CollaborativeGraph />
            </TabsContent>
          </Tabs>
        </div>

        <footer className="border-t border-border/50 mt-20 py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p className="text-sm">
              STANS © 2025 | Bahria University Karachi | Data Structures & Algorithms Project
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
