import { useState, useEffect, useCallback, useRef } from 'react';
import type { Edge } from '@/utils/kruskal';

interface TrafficMultipliers {
  [edgeId: string]: number;
}

interface UseTrafficSimulationProps {
  edges: Edge[];
  onEdgesUpdate: (edges: Edge[]) => void;
}

interface UseTrafficSimulationReturn {
  isSimulating: boolean;
  isPaused: boolean;
  speed: number;
  trafficMultipliers: TrafficMultipliers;
  startSimulation: () => void;
  stopSimulation: () => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  simulateAccident: (edgeId: string) => void;
  setTrafficLevel: (edgeId: string, level: number) => void;
  clearAccidents: () => void;
  getEffectiveWeight: (edge: Edge) => number;
}

export const useTrafficSimulation = ({
  edges,
  onEdgesUpdate,
}: UseTrafficSimulationProps): UseTrafficSimulationReturn => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [trafficMultipliers, setTrafficMultipliers] = useState<TrafficMultipliers>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getEdgeId = (edge: Edge) => `${edge.from}-${edge.to}`;

  const getEffectiveWeight = useCallback((edge: Edge) => {
    if (edge.isBlocked) return Infinity;
    const edgeId = getEdgeId(edge);
    const multiplier = trafficMultipliers[edgeId] || 1;
    const trafficBase = edge.traffic === 'low' ? 1 : edge.traffic === 'medium' ? 1.5 : 2;
    return edge.weight * trafficBase * multiplier;
  }, [trafficMultipliers]);

  const updateTrafficLevels = useCallback(() => {
    if (edges.length === 0) return;

    setTrafficMultipliers(prev => {
      const newMultipliers = { ...prev };
      
      edges.forEach(edge => {
        const edgeId = getEdgeId(edge);
        const currentMultiplier = newMultipliers[edgeId] || 1;
        
        // Random traffic fluctuation
        const change = (Math.random() - 0.5) * 0.3;
        let newMultiplier = currentMultiplier + change;
        
        // Clamp between 0.8 and 2.5
        newMultiplier = Math.max(0.8, Math.min(2.5, newMultiplier));
        
        newMultipliers[edgeId] = newMultiplier;
      });
      
      return newMultipliers;
    });

    // Update edge traffic levels based on multipliers
    const updatedEdges = edges.map(edge => {
      const edgeId = getEdgeId(edge);
      const multiplier = trafficMultipliers[edgeId] || 1;
      
      let newTraffic: 'low' | 'medium' | 'high' = 'low';
      if (multiplier > 1.8) newTraffic = 'high';
      else if (multiplier > 1.2) newTraffic = 'medium';
      
      return { ...edge, traffic: newTraffic };
    });

    onEdgesUpdate(updatedEdges);
  }, [edges, onEdgesUpdate, trafficMultipliers]);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setIsPaused(false);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const simulateAccident = useCallback((edgeId: string) => {
    setTrafficMultipliers(prev => ({
      ...prev,
      [edgeId]: 3.0, // Max congestion
    }));
  }, []);

  const setTrafficLevel = useCallback((edgeId: string, level: number) => {
    setTrafficMultipliers(prev => ({
      ...prev,
      [edgeId]: level,
    }));
  }, []);

  const clearAccidents = useCallback(() => {
    setTrafficMultipliers({});
  }, []);

  useEffect(() => {
    if (isSimulating && !isPaused) {
      intervalRef.current = setInterval(() => {
        updateTrafficLevels();
      }, 3000 / speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSimulating, isPaused, speed, updateTrafficLevels]);

  return {
    isSimulating,
    isPaused,
    speed,
    trafficMultipliers,
    startSimulation,
    stopSimulation,
    togglePause,
    setSpeed,
    simulateAccident,
    setTrafficLevel,
    clearAccidents,
    getEffectiveWeight,
  };
};
