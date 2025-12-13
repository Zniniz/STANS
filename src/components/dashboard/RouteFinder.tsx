import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  Clock, 
  Route,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dijkstraAlgorithm } from "@/utils/dijkstra";
import type { Edge } from "@/utils/kruskal";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface RouteFinderProps {
  nodes: Node[];
  edges: Edge[];
  onRouteCalculated: (path: string[]) => void;
  trafficMultipliers: { [key: string]: number };
}

const RouteFinder = ({
  nodes,
  edges,
  onRouteCalculated,
  trafficMultipliers,
}: RouteFinderProps) => {
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [route, setRoute] = useState<{
    path: string[];
    totalTime: number;
    steps: { from: string; to: string; time: number; traffic: string }[];
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = () => {
    if (!startLocation || !endLocation) {
      setError("Please select both start and destination");
      return;
    }

    if (startLocation === endLocation) {
      setError("Start and destination cannot be the same");
      return;
    }

    setIsCalculating(true);
    setError(null);

    setTimeout(() => {
      const nodeIds = nodes.map(n => n.id);
      const steps = dijkstraAlgorithm(edges, nodeIds, startLocation, endLocation);
      
      const lastStep = steps[steps.length - 1];
      
      if (!lastStep || !lastStep.shortestPath || lastStep.shortestPath.length === 0) {
        setError("No route found between these locations");
        setRoute(null);
        setIsCalculating(false);
        return;
      }

      const path = lastStep.shortestPath;
      const totalTime = lastStep.distances.get(endLocation) || 0;

      // Build step-by-step directions
      const routeSteps: { from: string; to: string; time: number; traffic: string }[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = edges.find(
          e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
        );
        if (edge) {
          routeSteps.push({
            from,
            to,
            time: edge.weight,
            traffic: edge.traffic,
          });
        }
      }

      setRoute({ path, totalTime, steps: routeSteps });
      onRouteCalculated(path);
      setIsCalculating(false);
    }, 500);
  };

  const getTrafficBadge = (traffic: string) => {
    switch (traffic) {
      case 'low':
        return <Badge className="bg-secondary text-secondary-foreground">Clear</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Moderate</Badge>;
      case 'high':
        return <Badge className="bg-destructive text-destructive-foreground">Heavy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="dashboard-card border-t-4 border-t-secondary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Navigation className="w-5 h-5 text-secondary" />
          </div>
          Route Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Selectors */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Start Location
            </label>
            <Select value={startLocation} onValueChange={setStartLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select start point" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-secondary" /> Destination
            </label>
            <Select value={endLocation} onValueChange={setEndLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={calculateRoute}
            disabled={isCalculating || nodes.length === 0}
            className="flex-1 bg-secondary hover:bg-secondary/90"
          >
            {isCalculating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Route className="w-4 h-4 mr-2" />
            )}
            Get Route
          </Button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Route Result */}
        <AnimatePresence>
          {route && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-3"
            >
              {/* Total Time */}
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Travel Time</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-2xl font-bold text-secondary">
                      {route.totalTime}
                    </span>
                    <span className="text-sm text-muted-foreground">mins</span>
                  </div>
                </div>
              </div>

              {/* Step by Step */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Step-by-Step Directions
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {route.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span>
                          {step.from} → {step.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{step.time}m</span>
                        {getTrafficBadge(step.traffic)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Algorithm Info */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Calculated using <strong>Dijkstra's Shortest Path Algorithm</strong></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {nodes.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Build or load a road network first
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteFinder;
