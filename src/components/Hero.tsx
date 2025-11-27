import { Button } from "@/components/ui/button";
import { Navigation, Zap, GitBranch } from "lucide-react";

interface HeroProps {
  onExploreClick: () => void;
  onViewAlgorithmClick: () => void;
}

const Hero = ({ onExploreClick, onViewAlgorithmClick }: HeroProps) => {
  return (
    <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-6 animate-slide-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <GitBranch className="w-4 h-4" />
            Powered by Kruskal's Algorithm
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight">
            Smart Traffic-Aware
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Navigation System
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            An intelligent navigation system utilizing graph algorithms to compute optimal routes 
            considering real-time traffic conditions, blockades, and distance metrics.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={onExploreClick}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Explore System
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 hover:bg-accent/10 hover:border-accent transition-all duration-300"
              onClick={onViewAlgorithmClick}
            >
              <Zap className="w-4 h-4 mr-2" />
              View Algorithm
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold">Real-Time Traffic</h3>
              <p className="text-sm text-muted-foreground">Dynamic traffic intensity analysis</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold">MST Optimization</h3>
              <p className="text-sm text-muted-foreground">Kruskal's algorithm implementation</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold">Blockade Detection</h3>
              <p className="text-sm text-muted-foreground">Obstacle-aware path calculation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
