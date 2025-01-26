import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, MapRef } from 'react-map-gl';
import MapToolbar from './MapToolbar';
import LocationSearch from './LocationSearch';
import { faCircle, faFlag, faPersonFallingBurst } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MapLayerMouseEvent } from 'mapbox-gl';
import TheftDetailsDialog from './TheftDetailsDialog';
import { InitialTheftReport, TimelineMarker } from '../types/theft';
import { createTheftReport, loadFullTimeline } from '../services/theftService';
import { supabase } from '../lib/supabase';

function MapComponent() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -0.1276, // Default London coordinates
    latitude: 51.5072,
    zoom: 12
  });
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [theftLocations, setTheftLocations] = useState<TimelineMarker[]>([]);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<{longitude: number; latitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial data loading - check for user and their most recent incident
  useEffect(() => {
    const loadUserIncidents = async () => {
      try {
        setIsLoading(true);
        console.log('Checking for authenticated user...');
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          setError('Authentication failed');
          return;
        }

        if (!user) {
          console.log('No authenticated user found');
          setError('No authenticated user');
          return;
        }

        console.log('User authenticated:', user.id);

        // Get user's most recent incident
        const { data: incidents, error: incidentsError } = await supabase
          .from('phone_theft_incidents')
          .select('id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (incidentsError) {
          console.error('Error fetching incidents:', incidentsError);
          setError('Failed to fetch incidents');
          return;
        }

        if (incidents && incidents.length > 0) {
          console.log('Found most recent incident:', incidents[0]);
          setCurrentIncidentId(incidents[0].id);
        } else {
          console.log('No existing incidents found for user');
        }

      } catch (error) {
        console.error('Error in loadUserIncidents:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserIncidents();
  }, []); // Run once on component mount

  // Load timeline when currentIncidentId changes
  useEffect(() => {
    const loadTimeline = async () => {
      if (!currentIncidentId) {
        console.log('No current incident ID, skipping timeline load');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Loading timeline for incident:', currentIncidentId);
        
        const timeline = await loadFullTimeline(currentIncidentId);
        console.log('Loaded timeline data:', timeline);
        
        if (timeline.length > 0) {
          // Get the initial theft location (first point in timeline)
          const initialTheft = timeline.find(marker => marker.type === 'THEFT');
          
          if (initialTheft) {
            console.log('Centering map on initial theft location:', initialTheft);
            setViewState({
              longitude: initialTheft.longitude,
              latitude: initialTheft.latitude,
              zoom: 14 // You can adjust this zoom level
            });
            
            // Smoothly animate to the location
            mapRef.current?.flyTo({
              center: [initialTheft.longitude, initialTheft.latitude],
              zoom: 14,
              duration: 2000 // Animation duration in milliseconds
            });
          }
        }
        
        setTheftLocations(timeline);
      } catch (error) {
        console.error('Failed to load timeline:', error);
        setError('Failed to load timeline data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeline();
  }, [currentIncidentId]);

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    if (!isAddingLocation) return;

    console.log('Map clicked at:', event.lngLat);
    
    const newLocation = {
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    };

    setTempLocation(newLocation);
    setDialogOpen(true);
    setIsAddingLocation(false);
  }, [isAddingLocation]);

  const handleTheftDetailsSubmit = async (details: InitialTheftReport) => {
    console.log('Submitting theft details:', details);
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newMarker = await createTheftReport(details);
      console.log('Created new theft report:', newMarker);
      
      setCurrentIncidentId(newMarker.id);
      setTheftLocations([newMarker]);
      setDialogOpen(false);

      // Center map on new theft location
      setViewState({
        longitude: newMarker.longitude,
        latitude: newMarker.latitude,
        zoom: 14
      });
      
      mapRef.current?.flyTo({
        center: [newMarker.longitude, newMarker.latitude],
        zoom: 14,
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to create theft report:', error);
      setError('Failed to create theft report');
    } finally {
      setIsLoading(false);
      setTempLocation(null);
    }
  };

  const getMarkerStyle = (type: TimelineMarker['type']) => {
    switch (type) {
      case 'THEFT':
        return {
          icon: faPersonFallingBurst,
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
    console.log('Toolbar clicked, toggling location add mode');
    setIsAddingLocation(!isAddingLocation);
  };

  return (
    <>
      <Map
        ref={mapRef}
        id="mainMap"
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
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
          console.log('Rendering marker:', marker);
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

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              Loading...
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </Map>

      {tempLocation && (
        <TheftDetailsDialog
          isOpen={dialogOpen}
          onClose={() => {
            console.log('Closing theft details dialog');
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
