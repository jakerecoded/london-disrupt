// src/components/StorageSitesDisplay.tsx
import { useEffect, useState } from 'react';
import { Marker, MapRef } from 'react-map-gl';
import { Loader } from '@mantine/core';
import { loadStorageSitesData } from '../services/theftService';
import styles from './RouteDisplay.module.css';
import { LngLatBounds } from 'mapbox-gl';

interface StorageSitesDisplayProps {
  mapRef: React.RefObject<MapRef>;
}

export default function StorageSitesDisplay({ mapRef }: StorageSitesDisplayProps) {
  const [storageSites, setStorageSites] = useState<{
    longitude: number;
    latitude: number;
    timestamp: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorageSites = async () => {
      try {
        setIsLoading(true);
        const data = await loadStorageSitesData();
        setStorageSites(data);
        setError(null);
        
        // Fit map to storage sites bounds
        if (data.length > 0 && mapRef.current) {
          const bounds = new LngLatBounds();
          
          data.forEach(site => {
            bounds.extend([site.longitude, site.latitude]);
          });
          
          mapRef.current.fitBounds(bounds, {
            padding: 50,
            duration: 1000
          });
        }
      } catch (error) {
        console.error('Failed to load storage sites data:', error);
        setError('Failed to load storage sites data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStorageSites();
  }, [mapRef]);

  return (
    <>
      {storageSites.map((site, index) => (
        <Marker
          key={`storage-site-${index}`}
          longitude={site.longitude}
          latitude={site.latitude}
          scale={0.5}
        >
          <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm" />
        </Marker>
      ))}
      
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
