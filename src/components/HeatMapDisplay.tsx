// src/components/HeatMapDisplay.tsx
import { useEffect, useState } from 'react';
import { Source, Layer, MapRef } from 'react-map-gl';
import { Loader } from '@mantine/core';
import { loadTheftHeatMapData } from '../services/theftService';
import styles from './RouteDisplay.module.css';

interface HeatMapDisplayProps {
  mapRef: React.RefObject<MapRef>;
}

export default function HeatMapDisplay({ mapRef }: HeatMapDisplayProps) {
  // We're not directly using mapRef in this component, but it's passed in
  // for potential future use, such as fitting the map to the data bounds
  // or for other map interactions
  const [theftData, setTheftData] = useState<{
    longitude: number;
    latitude: number;
    timestamp: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheftData = async () => {
      try {
        setIsLoading(true);
        const data = await loadTheftHeatMapData();
        setTheftData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to load theft data:', error);
        setError('Failed to load theft data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTheftData();
  }, []);

  // Convert theft data to GeoJSON format
  const geoJsonData = {
    type: 'FeatureCollection',
    features: theftData.map(point => ({
      type: 'Feature',
      properties: {
        timestamp: point.timestamp
      },
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude]
      }
    }))
  };

  return (
    <>
      {theftData.length > 0 && (
        <Source
          id="theft-data"
          type="geojson"
          data={geoJsonData}
        >
          <Layer
            id="theft-heat"
            type="heatmap"
            paint={{
              // Increase the heatmap weight based on frequency
              'heatmap-weight': 1,
              // Increase the heatmap color weight by zoom level
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                1,
                9,
                3
              ],
              // Color ramp for heatmap
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)'
              ],
              // Adjust the heatmap radius by zoom level
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                2,
                9,
                20
              ],
              // Transition from heatmap to circle layer by zoom level
              'heatmap-opacity': 0.8
            }}
          />
        </Source>
      )}
      
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader type="oval" color="blue" size="md" />
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </>
  );
}
