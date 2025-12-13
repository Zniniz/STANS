import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Car, 
  BookOpen, 
  Activity,
  Radio
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  isSimulating: boolean;
  networkHealth: 'optimal' | 'strained' | 'congested';
}

const DashboardHeader = ({ isSimulating, networkHealth }: DashboardHeaderProps) => {
  const getHealthColor = () => {
    switch (networkHealth) {
      case 'optimal': return 'bg-secondary text-secondary-foreground';
      case 'strained': return 'bg-warning text-warning-foreground';
      case 'congested': return 'bg-destructive text-destructive-foreground';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-xl bg-primary/10">
              <Car className="w-6 h-6 text-primary" />
            </div>
            {isSimulating && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight">
              STANS
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Traffic Control Dashboard
            </p>
          </div>
        </div>

        {/* Center Status */}
        <div className="hidden md:flex items-center gap-4">
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10"
            >
              <Radio className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Live Simulation Active</span>
            </motion.div>
          )}
          
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Network:</span>
            <Badge className={getHealthColor()}>
              {networkHealth.charAt(0).toUpperCase() + networkHealth.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/concepts">
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">DSA Guide</span>
            </Button>
          </Link>
          <Link to="/docs">
            <Button variant="ghost" size="sm" className="gap-2">
              <span className="hidden sm:inline">Code Docs</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
