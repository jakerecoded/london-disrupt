// src/components/RouteMarker.tsx
import { Marker } from 'react-map-gl';
import { RoutePoint } from '../types/route';
import styles from './RouteDisplay.module.css';

interface RouteMarkerProps {
  point: RoutePoint;
}

function RouteMarker({ point }: RouteMarkerProps) {
  return (
    <Marker
      longitude={point.longitude}
      latitude={point.latitude}
      scale={0.3}
    >
      <div className={styles.routeMarker} />
    </Marker>
  );
}

export default RouteMarker;
