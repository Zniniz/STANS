import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import GraphVisualization from "@/components/GraphVisualization";
import ProjectInfo from "@/components/ProjectInfo";
import RouteCalculator from "@/components/RouteCalculator";
import GraphBuilder from "@/components/GraphBuilder";
import AlgorithmComparison from "@/components/AlgorithmComparison";
import Graph3D from "@/components/Graph3D";
import VisualizationHistory from "@/components/VisualizationHistory";
import GraphImport from "@/components/GraphImport";
import EducationalMode from "@/components/EducationalMode";
import CollaborativeGraph from "@/components/CollaborativeGraph";
import GraphTemplates from "@/components/GraphTemplates";
import DijkstraVisualization from "@/components/DijkstraVisualization";
import PrimVisualization from "@/components/PrimVisualization";
import { InteractiveTutorial } from "@/components/InteractiveTutorial";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapPin, Route, AlertTriangle, Hammer, BarChart3, Box, Clock, Upload, GraduationCap, Users, Grid3x3, Sparkles, Navigation, TreeDeciduous, BookOpen } from "lucide-react";
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
      
      {/* Top Right Actions */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link to="/docs">
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Code Docs</span>
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      
      {/* Tutorial Button - Bottom Left */}
      <button
        onClick={() => setIsTutorialOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 font-medium hover:scale-105"
      >
        <Sparkles className="w-4 h-4" />
        Start Tutorial
      </button>
      
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
          onViewAlgorithmClick={() => setActiveTab("kruskal")}
        />
        
        <div className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 flex justify-center">
              <TabsList className="flex flex-wrap justify-center max-w-6xl gap-1">
                <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap">
                  <MapPin className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="kruskal" className="flex items-center gap-2 whitespace-nowrap">
                  <Route className="w-4 h-4" />
                  Kruskal's
                </TabsTrigger>
                <TabsTrigger value="dijkstra" className="flex items-center gap-2 whitespace-nowrap">
                  <Navigation className="w-4 h-4" />
                  Dijkstra's
                </TabsTrigger>
                <TabsTrigger value="prim" className="flex items-center gap-2 whitespace-nowrap">
                  <TreeDeciduous className="w-4 h-4" />
                  Prim's
                </TabsTrigger>
                <TabsTrigger value="calculator" className="flex items-center gap-2 whitespace-nowrap">
                  <AlertTriangle className="w-4 h-4" />
                  Route Calc
                </TabsTrigger>
                <TabsTrigger value="builder" className="flex items-center gap-2 whitespace-nowrap">
                  <Hammer className="w-4 h-4" />
                  Builder
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2 whitespace-nowrap">
                  <Grid3x3 className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2 whitespace-nowrap">
                  <BarChart3 className="w-4 h-4" />
                  Compare
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
                <TabsTrigger value="collaborative" className="flex items-center gap-2 whitespace-nowrap">
                  <Users className="w-4 h-4" />
                  Collaborate
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8">
              <ProjectInfo />
            </TabsContent>

            <TabsContent value="kruskal">
              <GraphVisualization nodes={nodes} edges={edges} />
            </TabsContent>

            <TabsContent value="dijkstra">
              <DijkstraVisualization nodes={nodes} edges={edges} />
            </TabsContent>

            <TabsContent value="prim">
              <PrimVisualization nodes={nodes} edges={edges} />
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
