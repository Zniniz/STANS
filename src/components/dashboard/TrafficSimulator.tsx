import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Zap, 
  AlertTriangle, 
  RotateCcw,
  Car,
  Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Edge } from "@/utils/kruskal";

interface TrafficSimulatorProps {
  isSimulating: boolean;
  isPaused: boolean;
  speed: number;
  edges: Edge[];
  trafficMultipliers: { [key: string]: number };
  onToggleSimulation: () => void;
  onTogglePause: () => void;
  onSpeedChange: (speed: number) => void;
  onSimulateAccident: (edgeId: string) => void;
  onClearAccidents: () => void;
  onTrafficLevelChange: (edgeId: string, level: number) => void;
  selectedEdge: string | null;
}

const TrafficSimulator = ({
  isSimulating,
  isPaused,
  speed,
  edges,
  trafficMultipliers,
  onToggleSimulation,
  onTogglePause,
  onSpeedChange,
  onSimulateAccident,
  onClearAccidents,
  onTrafficLevelChange,
  selectedEdge,
}: TrafficSimulatorProps) => {
  const getEdgeId = (edge: Edge) => `${edge.from}-${edge.to}`;
  
  const congestedRoads = edges.filter(e => {
    const multiplier = trafficMultipliers[getEdgeId(e)] || 1;
    return multiplier > 1.5 || e.traffic === 'high';
  });

  return (
    <Card className="dashboard-card border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <Car className="w-5 h-5 text-primary" />
          </div>
          Live Traffic Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Live Simulation</span>
          </div>
          <Switch
            checked={isSimulating}
            onCheckedChange={onToggleSimulation}
          />
        </div>

        <AnimatePresence>
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Play/Pause Controls */}
              <div className="flex gap-2">
                <Button
                  variant={isPaused ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={onTogglePause}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-1" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-1" /> Pause
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAccidents}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
              </div>

              {/* Speed Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="w-4 h-4" /> Speed
                  </span>
                  <Badge variant="secondary">{speed}x</Badge>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => onSpeedChange(v)}
                  min={0.5}
                  max={3}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Accident Simulator */}
              {selectedEdge && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => onSimulateAccident(selectedEdge)}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Simulate Accident on Selected Road
                </Button>
              )}

              {/* Congested Roads Count */}
              {congestedRoads.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-destructive">
                      {congestedRoads.length} road(s) congested
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isSimulating && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Enable simulation to see live traffic changes
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TrafficSimulator;
