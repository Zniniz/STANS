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
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapPin, Route, AlertTriangle, Hammer, BarChart3, Cpu, Box, Clock, Upload, GraduationCap, Zap, Video, Users } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Background mesh gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-40" 
           style={{ background: 'var(--gradient-mesh)' }} />
      
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
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
              <GraphVisualization />
            </TabsContent>

            <TabsContent value="calculator">
              <RouteCalculator />
            </TabsContent>

            <TabsContent value="builder">
              <GraphBuilder />
            </TabsContent>

            <TabsContent value="comparison">
              <AlgorithmComparison />
            </TabsContent>

            <TabsContent value="complexity">
              <ComplexityAnalysis />
            </TabsContent>

            <TabsContent value="3d">
              <Graph3D />
            </TabsContent>

            <TabsContent value="history">
              <VisualizationHistory />
            </TabsContent>

            <TabsContent value="import">
              <GraphImport />
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
