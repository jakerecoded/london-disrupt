// components/PathDrawer.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { Source, Layer } from 'react-map-gl';
import { PathPoint, TimelineMarker } from '../types/theft';
import { supabase } from '../lib/supabase';

interface PathDrawerProps {
  isActive: boolean;
  onPathComplete: (points: PathPoint[]) => void;
  onCancel: () => void;
}

export default function PathDrawer({ isActive, onPathComplete, onCancel }: PathDrawerProps) {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [lastEntryOrder, setLastEntryOrder] = useState<number | null>(null);
  
  // Use refs to maintain state references without causing re-renders
  const stateRef = useRef({
    isSelectingStart: true,
    points: [] as PathPoint[],
    lastEntryOrder: null as number | null
  });

  // Update ref values when state changes
  useEffect(() => {
    stateRef.current.isSelectingStart = isSelectingStart;
    stateRef.current.points = points;
    stateRef.current.lastEntryOrder = lastEntryOrder;
  }, [isSelectingStart, points, lastEntryOrder]);

  const resetState = useCallback(() => {
    setPoints([]);
    setIsSelectingStart(true);
    setLastEntryOrder(null);
    stateRef.current = {
      isSelectingStart: true,
      points: [],
      lastEntryOrder: null
    };
  }, []);

  // Handle keyboard events
  useEffect(() => {
    if (!isActive) {
      resetState();
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && stateRef.current.points.length > 0) {
        onPathComplete(stateRef.current.points);
        resetState();
      } else if (e.key === 'Escape') {
        onCancel();
        resetState();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, onPathComplete, onCancel, resetState]);

  // Define methods that will be exposed to parent
  const methods = useRef({
    addPathPoint: (latitude: number, longitude: number) => {
      if (stateRef.current.isSelectingStart) return;

      const nextEntryOrder = stateRef.current.points.length > 0 
        ? stateRef.current.points[stateRef.current.points.length - 1].entry_order + 1 
        : (stateRef.current.lastEntryOrder ?? 1);

      const newPoint: PathPoint = {
        latitude,
        longitude,
        entry_order: nextEntryOrder
      };

      setPoints(prevPoints => [...prevPoints, newPoint]);
    },
    handleStartMarkerSelect: async (marker: TimelineMarker) => {
      if (!stateRef.current.isSelectingStart) return;
      
      try {
        const { data, error } = await supabase
          .from('phone_theft_timeline_entries')
          .select('entry_order')
          .order('entry_order', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching entry_order:', error);
          return;
        }
        
        const nextEntryOrder = data?.[0]?.entry_order ? data[0].entry_order + 1 : 1;
        setLastEntryOrder(nextEntryOrder);
        
        setIsSelectingStart(false);
        setPoints([{
          latitude: marker.latitude,
          longitude: marker.longitude,
          entry_order: nextEntryOrder
        }]);
      } catch (error) {
        console.error('Error in handleStartMarkerSelect:', error);
      }
    },
    isSelectingStart: () => stateRef.current.isSelectingStart
  });

  // Expose methods to window when component is active
  useEffect(() => {
    if (isActive) {
      window.pathDrawerMethods = methods.current;
    }
    return () => {
      if (window.pathDrawerMethods === methods.current) {
        delete window.pathDrawerMethods;
      }
    };
  }, [isActive]);

  return (
    <>
      {points.length > 1 && (
        <Source
          type="geojson"
          data={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: points.map(p => [p.longitude, p.latitude])
            }
          }}
        >
          <Layer
            id="path-layer"
            type="line"
            paint={{
              'line-color': '#4a90e2',
              'line-width': 3,
              'line-dasharray': [3, 3]
            }}
          />
        </Source>
      )}
    </>
  );
}
