// components/PathDrawer.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { Source, Layer } from 'react-map-gl';
import { PathPoint, TimelineMarker } from '../types/theft';
import { supabase } from '../lib/supabase';

interface PathDrawerProps {
  isActive: boolean;
  incidentId: string | null; // Add incidentId prop
  onPathComplete: (points: PathPoint[]) => void;
  onCancel: () => void;
}

export default function PathDrawer({ isActive, incidentId, onPathComplete, onCancel }: PathDrawerProps) {
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

  // Create a mutable object to store methods
  const methodsObj = useRef({
    currentIncidentId: incidentId,
    addPathPoint: (latitude: number, longitude: number) => {
      if (stateRef.current.isSelectingStart || !methodsObj.current.currentIncidentId) return;

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
      console.log('handleStartMarkerSelect called with marker:', marker);
      console.log('Current state:', {
        isSelectingStart: stateRef.current.isSelectingStart,
        incidentId: methodsObj.current.currentIncidentId,
        pointsCount: stateRef.current.points.length
      });
      
      if (!stateRef.current.isSelectingStart || !methodsObj.current.currentIncidentId) {
        console.log('Exiting handleStartMarkerSelect early - conditions not met:', {
          isSelectingStart: stateRef.current.isSelectingStart,
          hasIncidentId: !!methodsObj.current.currentIncidentId
        });
        return;
      }
      
      console.log('Start marker selected:', marker);
      
      try {
        // Use the stored incidentId
        const currentId = methodsObj.current.currentIncidentId;
        console.log('Using incident ID for path:', currentId);
        
        // Get the highest entry_order for this specific incident
        const { data, error } = await supabase
          .from('phone_theft_timeline_entries')
          .select('entry_order')
          .eq('incident_id', currentId)
          .order('entry_order', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching entry_order:', error);
          return;
        }
        
        const nextEntryOrder = data?.[0]?.entry_order ? data[0].entry_order + 1 : 1;
        console.log('Next entry order will be:', nextEntryOrder);
        setLastEntryOrder(nextEntryOrder);
        
        setIsSelectingStart(false);
        setPoints([{
          latitude: marker.latitude,
          longitude: marker.longitude,
          entry_order: nextEntryOrder
        }]);
        
        console.log('Path drawing started from marker:', {
          latitude: marker.latitude,
          longitude: marker.longitude,
          entry_order: nextEntryOrder
        });
      } catch (error) {
        console.error('Error in handleStartMarkerSelect:', error);
      }
    },
    isSelectingStart: () => stateRef.current.isSelectingStart
  });
  
  // Update the incidentId in the methods object when it changes
  useEffect(() => {
    console.log('Updating incidentId in methods object:', incidentId);
    methodsObj.current.currentIncidentId = incidentId;
  }, [incidentId]);
  
  // Expose methods to window when component is active
  useEffect(() => {
    if (isActive) {
      console.log('PathDrawer activated with incidentId:', incidentId);
      console.log('Exposing methods to window with currentIncidentId:', methodsObj.current.currentIncidentId);
      window.pathDrawerMethods = methodsObj.current;
    }
    return () => {
      if (window.pathDrawerMethods === methodsObj.current) {
        console.log('PathDrawer deactivated, cleaning up methods');
        delete window.pathDrawerMethods;
      }
    };
  }, [isActive, incidentId]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('PathDrawer state updated:', {
      isActive,
      incidentId,
      isSelectingStart,
      pointsCount: points.length,
      lastEntryOrder
    });
  }, [isActive, incidentId, isSelectingStart, points.length, lastEntryOrder]);

  return (
    <>
      {/* Draw the path line if there are at least 2 points */}
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
      
      {/* Draw points as circles */}
      {points.length > 0 && (
        <Source
          type="geojson"
          data={{
            type: 'FeatureCollection',
            features: points.map((p, index) => ({
              type: 'Feature',
              properties: {
                index
              },
              geometry: {
                type: 'Point',
                coordinates: [p.longitude, p.latitude]
              }
            }))
          }}
        >
          <Layer
            id="path-points-layer"
            type="circle"
            paint={{
              'circle-radius': 5,
              'circle-color': '#4a90e2',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }}
          />
        </Source>
      )}
    </>
  );
}
