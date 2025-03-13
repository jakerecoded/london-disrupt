import { useRef, useState, useEffect } from 'react';
import Map, { NavigationControl, MapRef } from 'react-map-gl';
import { Loader } from '@mantine/core';
import 'mapbox-gl/dist/mapbox-gl.css';
import { loadRoutes } from '../services/routeService';
import { Route } from '../types/route';
import RouteDisplay from './RouteDisplay';
import AnalyticsToolbar from './AnalyticsToolbar';
import styles from './RouteDisplay.module.css';

export default function Analytics() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -0.1276,
    latitude: 51.5072,
    zoom: 12
  });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // This state will be used in future tickets to control what is displayed on the map
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeView, setActiveView] = useState(0); // 0: routes, 1: heatmap, 2: storage sites
  
  // Fetch routes on component mount and periodically refresh
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        const routesData = await loadRoutes();
        setRoutes(routesData);
        setError(null);
      } catch (error) {
        console.error('Failed to load routes:', error);
        setError('Failed to load routes');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchRoutes();
    
    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(fetchRoutes, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="bottom-right" />
      
      {/* Render routes */}
      <RouteDisplay routes={routes} mapRef={mapRef} />
      
      {/* Analytics Toolbar */}
      <AnalyticsToolbar onViewChange={setActiveView} />
      
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
    </Map>
  );
}
