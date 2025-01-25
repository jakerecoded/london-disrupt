import { useState, useCallback, useEffect } from 'react';
import Map, { NavigationControl, Marker } from 'react-map-gl';
import MapToolbar from './MapToolbar';
import LocationSearch from './LocationSearch';
import { faExclamation, faCircle, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MapLayerMouseEvent } from 'mapbox-gl';
import TheftDetailsDialog from './TheftDetailsDialog';
import { InitialTheftReport, TimelineMarker } from '../types/theft';
import { createTheftReport, loadFullTimeline } from '../services/theftService';

function MapComponent() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [theftLocations, setTheftLocations] = useState<TimelineMarker[]>([]);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<{longitude: number; latitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing timeline when incident ID is set
  useEffect(() => {
    const loadTimeline = async () => {
      if (!currentIncidentId) return;
      
      try {
        setIsLoading(true);
        const timeline = await loadFullTimeline(currentIncidentId);
        setTheftLocations(timeline);
      } catch (error) {
        console.error('Failed to load timeline:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeline();
  }, [currentIncidentId]);

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    if (!isAddingLocation) return;

    const newLocation = {
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    };

    setTempLocation(newLocation);
    setDialogOpen(true);
    setIsAddingLocation(false);
  }, [isAddingLocation]);

  const handleTheftDetailsSubmit = async (details: InitialTheftReport) => {
    console.log('Received details:', details); // Check what data is coming in
    try {
      setIsLoading(true);
      const newMarker = await createTheftReport(details);
      setCurrentIncidentId(newMarker.id);
      setTheftLocations([newMarker]);
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to create theft report:', error);
    } finally {
      setIsLoading(false);
      setTempLocation(null);
    }
  };

  // Helper function to determine marker style based on type
  const getMarkerStyle = (type: TimelineMarker['type']) => {
    switch (type) {
      case 'THEFT':
        return {
          icon: faExclamation,
          bgColor: 'bg-red-700',
        };
      case 'MOVEMENT':
        return {
          icon: faCircle,
          bgColor: 'bg-blue-500',
        };
      case 'HOLDING':
        return {
          icon: faCircle,
          bgColor: 'bg-yellow-500',
        };
      case 'FINAL':
        return {
          icon: faFlag,
          bgColor: 'bg-green-700',
        };
    }
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
        <MapToolbar 
          onAddLocation={handleToolbarClick} 
          isAddingLocation={isAddingLocation}
          hasActiveIncident={!!currentIncidentId}
        />
        <NavigationControl position="bottom-right" />
      
        {theftLocations.map(marker => {
          const style = getMarkerStyle(marker.type);
          return (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              scale={0.7} 
            >
             <div className="relative group">
              <div className={`w-6 h-6 ${style.bgColor} rounded-full`}>
                <FontAwesomeIcon 
                  icon={style.icon} 
                  className="text-white text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white p-2 rounded shadow-lg text-xs">
                <p>Type: {marker.type}</p>
                <p>Time: {new Date(marker.timestamp).toLocaleString()}</p>
                {marker.duration_at_location && (
                  <p>Duration: {marker.duration_at_location}</p>
                )}
              </div>
             </div> 
            </Marker>
          );
        })}

        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              Loading...
            </div>
          </div>
        )}
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
