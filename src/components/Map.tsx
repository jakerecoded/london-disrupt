import { useState, useCallback } from 'react';
import Map, { NavigationControl, Marker } from 'react-map-gl';
import MapToolbar from './MapToolbar';
import LocationSearch from './LocationSearch';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MapLayerMouseEvent } from 'mapbox-gl';
import TheftDetailsDialog from './TheftDetailsDialog';
import { InitialTheftReport, TheftMarker } from '../types/theft';

function MapComponent() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [theftLocations, setTheftLocations] = useState<TheftMarker[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<{longitude: number; latitude: number} | null>(null);

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    console.log('Map clicked!');
    console.log('isAddingLocation:', isAddingLocation);
    console.log('Click coordinates:', event.lngLat);

    if (!isAddingLocation) return;

    const newLocation = {
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    };

    setTempLocation(newLocation);
    setDialogOpen(true);
    setIsAddingLocation(false);
  }, [isAddingLocation]);

  const handleTheftDetailsSubmit = (details: InitialTheftReport) => {
    // For now, create a temporary TheftMarker
    // This will be replaced with actual Supabase data later
    const newMarker: TheftMarker = {
        id: String(Date.now()), // temporary ID until we integrate with Supabase
        longitude: details.location.longitude,
        latitude: details.location.latitude,
        type: 'THEFT'
    };
    
    setTheftLocations(prev => [...prev, newMarker]);
    setTempLocation(null);
  };

  const handleToolbarClick = () => {
    setIsAddingLocation(!isAddingLocation);
  };

  return (
    <>
      <Map
        id="mainMap"
        initialViewState={{
          longitude: -0.1276,
          latitude: 51.5072,
          zoom: 12
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        cursor={isAddingLocation ? 'crosshair' : 'grab'}
        onClick={handleMapClick}
      >
        <LocationSearch />
        <MapToolbar onAddLocation={handleToolbarClick} isAddingLocation={isAddingLocation} />
        <NavigationControl position="bottom-right" />
      
        {theftLocations.map(marker => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            scale={0.7} 
          >
           <div className="relative">
            <div className="w-6 h-6 bg-red-700 rounded-full">
              <FontAwesomeIcon 
                icon={faExclamation} 
                className="text-white text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div> 
          </Marker>
        ))}
    </Map>

    {tempLocation && (
        <TheftDetailsDialog
          isOpen={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setTempLocation(null);
          }}
          onSubmit={handleTheftDetailsSubmit}
          location={tempLocation}
        />
      )}
    </>
  );
}

export default MapComponent;
