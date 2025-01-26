import { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import { PathPoint, TimelineMarker } from '../types/theft';
import { supabase } from '../lib/supabase';

interface PathDrawerProps {
  isActive: boolean;
  onPathComplete: (points: PathPoint[]) => void;
  onCancel: () => void;
}

export default function PathDrawer({ isActive, onPathComplete, onCancel }: PathDrawerProps) {
  const [selectedStartMarker, setSelectedStartMarker] = useState<TimelineMarker | null>(null);
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [isSelectingStart, setIsSelectingStart] = useState(true);

  useEffect(() => {
    if (!isActive) {
      resetState();
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && points.length > 0) {
        onPathComplete(points);
        resetState();
      } else if (e.key === 'Escape') {
        onCancel();
        resetState();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, points, onPathComplete, onCancel]);

  const resetState = () => {
    setPoints([]);
    setSelectedStartMarker(null);
    setIsSelectingStart(true);
  };

  const addPathPoint = async (latitude: number, longitude: number) => {
    if (isSelectingStart) return;

    const nextEntryOrder = points.length > 0 
      ? points[points.length - 1].entry_order + 1 
      : selectedStartMarker!.entry_order + 1;

    const newPoint: PathPoint = {
      latitude,
      longitude,
      entry_order: nextEntryOrder
    };

    setPoints([...points, newPoint]);
  };

  const handleStartMarkerSelect = async (marker: TimelineMarker) => {
    if (!isSelectingStart) return;
    
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
    
    setSelectedStartMarker(marker);
    setIsSelectingStart(false);
    setPoints([{
      latitude: marker.latitude,
      longitude: marker.longitude,
      entry_order: nextEntryOrder
    }]);
  };

  useEffect(() => {
    if (isActive) {
      // Expose methods for the parent component to access
      window.pathDrawerMethods = {
        addPathPoint,
        handleStartMarkerSelect,
        isSelectingStart: () => isSelectingStart
      };
    }
    return () => {
      // Clean up methods when component is inactive
      delete window.pathDrawerMethods;
    };
  }, [isActive, isSelectingStart]);

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
              'line-dasharray': [2, 1]
            }}
          />
        </Source>
      )}
    </>
  );
}