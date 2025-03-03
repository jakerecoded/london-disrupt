// src/components/RouteDisplay.tsx
import { useEffect } from 'react';
import { Source, Layer, MapRef } from 'react-map-gl';
import { Route } from '../types/route';
import RouteMarker from './RouteMarker';

interface RouteDisplayProps {
  routes: Route[];
  mapRef: React.RefObject<MapRef>;
}

export default function RouteDisplay({ routes, mapRef }: RouteDisplayProps) {
  // Animation setup for route lines
  useEffect(() => {
    // Using the exact same dash array sequence from the Map component
    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5]
    ];

    let step = 0;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!mapRef.current) return;
      
      // Change step every 50ms like in the Map component
      const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);
      
      if (newStep !== step) {
        // Update all route lines
        routes.forEach(route => {
          const map = mapRef.current?.getMap();
          if (map && map.getLayer(`route-line-dashed-${route.id}`)) {
            map.setPaintProperty(
              `route-line-dashed-${route.id}`,
              'line-dasharray',
              dashArraySequence[newStep]
            );
          }
        });
        step = newStep;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation if we have routes
    if (routes.length > 0) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [routes, mapRef]);

  return (
    <>
      {routes.map(route => (
        <div key={route.id}>
          {/* Render route line */}
          <Source
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.points.map(p => [p.longitude, p.latitude])
              }
            }}
          >
            {/* Background line (thinner than in Map.tsx) */}
            <Layer
              id={`route-line-background-${route.id}`}
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
              }}
              paint={{
                'line-color': '#4a90e2',
                'line-width': 2, // Thinner than the 6px in Map.tsx
                'line-opacity': 0.4
              }}
            />
            {/* Animated dashed line (thinner) */}
            <Layer
              id={`route-line-dashed-${route.id}`}
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
              }}
              paint={{
                'line-color': '#4a90e2',
                'line-width': 2, // Thinner than the 6px in Map.tsx
                'line-dasharray': [0, 4, 3]
              }}
            />
          </Source>
          
          {/* Render route points as small markers */}
          {route.points.map(point => (
            <RouteMarker key={point.id} point={point} />
          ))}
        </div>
      ))}
    </>
  );
}
