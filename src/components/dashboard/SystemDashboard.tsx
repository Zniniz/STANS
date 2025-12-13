import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Route, 
  MapPin, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import type { Edge } from "@/utils/kruskal";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface SystemDashboardProps {
  nodes: Node[];
  edges: Edge[];
  trafficMultipliers: { [key: string]: number };
  algorithmStatus?: {
    name: string;
    step: string;
    progress: number;
    details?: string[];
  };
}

const SystemDashboard = ({
  nodes,
  edges,
  trafficMultipliers,
  algorithmStatus,
}: SystemDashboardProps) => {
  const getEdgeId = (edge: Edge) => `${edge.from}-${edge.to}`;

  const stats = useMemo(() => {
    const totalRoads = edges.length;
    const totalIntersections = nodes.length;
    
    const congestedRoads = edges.filter(e => {
      const multiplier = trafficMultipliers[getEdgeId(e)] || 1;
      return multiplier > 1.5 || e.traffic === 'high';
    }).length;
    
    const blockedRoads = edges.filter(e => e.isBlocked).length;
    
    const avgWeight = edges.length > 0
      ? Math.round(edges.reduce((sum, e) => sum + e.weight, 0) / edges.length)
      : 0;
    
    // Calculate network health (0-100)
    const congestionRatio = totalRoads > 0 ? congestedRoads / totalRoads : 0;
    const blockedRatio = totalRoads > 0 ? blockedRoads / totalRoads : 0;
    const healthScore = Math.max(0, 100 - (congestionRatio * 40) - (blockedRatio * 60));
    
    let healthStatus: 'optimal' | 'strained' | 'congested' = 'optimal';
    if (healthScore < 50) healthStatus = 'congested';
    else if (healthScore < 75) healthStatus = 'strained';
    
    return {
      totalRoads,
      totalIntersections,
      congestedRoads,
      blockedRoads,
      avgWeight,
      healthScore,
      healthStatus,
    };
  }, [nodes, edges, trafficMultipliers]);

  const getHealthColor = () => {
    switch (stats.healthStatus) {
      case 'optimal': return 'text-secondary';
      case 'strained': return 'text-warning';
      case 'congested': return 'text-destructive';
    }
  };

  const getHealthBg = () => {
    switch (stats.healthStatus) {
      case 'optimal': return 'bg-secondary/10 border-secondary/20';
      case 'strained': return 'bg-warning/10 border-warning/20';
      case 'congested': return 'bg-destructive/10 border-destructive/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Network Health */}
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-primary" />
            Network Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border ${getHealthBg()}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getHealthColor()}`}>
                {Math.round(stats.healthScore)}%
              </span>
              <Badge 
                variant="outline" 
                className={`${getHealthColor()} border-current`}
              >
                {stats.healthStatus.charAt(0).toUpperCase() + stats.healthStatus.slice(1)}
              </Badge>
            </div>
            <Progress 
              value={stats.healthScore} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Stats */}
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            Live Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Route className="w-3 h-3" />
                Total Roads
              </div>
              <span className="text-xl font-bold">{stats.totalRoads}</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <MapPin className="w-3 h-3" />
                Intersections
              </div>
              <span className="text-xl font-bold">{stats.totalIntersections}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 text-warning text-xs mb-1">
                <AlertTriangle className="w-3 h-3" />
                Congested
              </div>
              <span className="text-xl font-bold text-warning">
                {stats.congestedRoads}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Clock className="w-3 h-3" />
                Avg. Time
              </div>
              <span className="text-xl font-bold">{stats.avgWeight}m</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Status */}
      {algorithmStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="dashboard-card border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-primary animate-pulse" />
                DSA in Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{algorithmStatus.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(algorithmStatus.progress)}%
                  </Badge>
                </div>
                <Progress value={algorithmStatus.progress} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {algorithmStatus.step}
                </p>
              </div>
              
              {algorithmStatus.details && algorithmStatus.details.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {algorithmStatus.details.slice(-5).map((detail, i) => (
                    <div 
                      key={i}
                      className="text-xs p-2 rounded bg-muted/50 font-mono"
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Legend */}
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-primary" />
            Traffic Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-secondary" />
              <span className="text-xs text-muted-foreground">Clear (1x speed)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground">Moderate (1.5x slower)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Heavy (2x+ slower)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-road" />
              <span className="text-xs text-muted-foreground">Blocked (No access)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDashboard;
