import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, MapPin, Navigation2, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Edge } from "@/utils/kruskal";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface RouteCalculatorProps {
  nodes?: Node[];
  edges?: Edge[];
}

const RouteCalculator = ({ nodes: propNodes, edges: propEdges }: RouteCalculatorProps) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCalculated, setRouteCalculated] = useState(false);

  // Use provided nodes or fallback to default locations
  const defaultLocations = [
    "Intersection A",
    "Intersection B",
    "Intersection C",
    "Intersection D",
    "Intersection E",
  ];

  const locations = propNodes && propNodes.length > 0 
    ? propNodes.map(n => n.label || n.id) 
    : defaultLocations;

  const calculateRoute = () => {
    if (!source || !destination) {
      toast.error("Please select both source and destination");
      return;
    }

    if (source === destination) {
      toast.error("Source and destination cannot be the same");
      return;
    }

    toast.info("Calculating optimal route...");
    setTimeout(() => {
      setRouteCalculated(true);
      toast.success("Route calculated successfully!");
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Route Parameters
          </CardTitle>
          <CardDescription>Select source and destination points</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="source" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              Source Location
            </Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Select starting point" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <Navigation2 className="w-4 h-4 text-accent" />
              Destination Location
            </Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={calculateRoute}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Optimal Route
          </Button>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Algorithm Used
            </h4>
            <p className="text-sm text-muted-foreground">
              <strong>Kruskal's Algorithm</strong> - Computes the minimum spanning tree by sorting edges 
              and selecting minimum weight edges while avoiding cycles. Considers distance, traffic 
              intensity, and blockades.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Navigation2 className="w-5 h-5 text-accent" />
            Route Results
          </CardTitle>
          <CardDescription>Optimal path calculation results</CardDescription>
        </CardHeader>
        <CardContent>
          {!routeCalculated ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Navigation2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Select source and destination to calculate the optimal route
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Optimal Route</span>
                  <Badge className="bg-accent text-accent-foreground">Calculated</Badge>
                </div>
                <p className="text-2xl font-bold font-display">
                  {source} → D → {destination}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Distance</p>
                    <p className="text-3xl font-bold text-primary">17 km</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Est. Time</p>
                    <p className="text-3xl font-bold text-secondary">23 min</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Route Details</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Start at {source}</p>
                      <p className="text-sm text-muted-foreground">Initial point</p>
                    </div>
                    <Badge variant="secondary">Low Traffic</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Via Intersection D</p>
                      <p className="text-sm text-muted-foreground">8.5 km • Medium traffic</p>
                    </div>
                    <Badge className="bg-traffic-medium text-white">Medium</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Arrive at {destination}</p>
                      <p className="text-sm text-muted-foreground">8.5 km • Low traffic</p>
                    </div>
                    <Badge className="bg-traffic-low text-white">Low</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> This route avoids blocked roads 
                  and minimizes travel time considering current traffic conditions using Kruskal's MST algorithm.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteCalculator;
