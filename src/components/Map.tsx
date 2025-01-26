import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, MapRef, Source, Layer } from 'react-map-gl';
import MapToolbar from './MapToolbar';
import LocationSearch from './LocationSearch';
import { faCircle, faPersonFallingBurst, faWarehouse, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MapLayerMouseEvent } from 'mapbox-gl';
import TheftDetailsDialog from './TheftDetailsDialog';
import StopLocationDialog from './StopLocationDialog';
import FinalLocationDialog from './FinalLocationDialog';
import { InitialTheftReport, TimelineMarker, PathPoint, TimelineEntryType } from '../types/theft';
import { createTheftReport, loadFullTimeline, createStopLocationEntry, createFinalLocationEntry } from '../services/theftService';
import { supabase } from '../lib/supabase';
import PathDrawer from './PathDrawer';

function MapComponent() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -0.1276,
    latitude: 51.5072,
    zoom: 12
  });
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isAddingStopLocation, setIsAddingStopLocation] = useState(false);
  const [isAddingFinalLocation, setIsAddingFinalLocation] = useState(false);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [theftLocations, setTheftLocations] = useState<TimelineMarker[]>([]);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isStopLocationDialogOpen, setIsStopLocationDialogOpen] = useState(false);
  const [isFinalLocationDialogOpen, setIsFinalLocationDialogOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<{longitude: number; latitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserIncidents = async () => {
      try {
        setIsLoading(true);
        const { data: incidents, error } = await supabase
          .from('phone_theft_incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

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
  }, []);

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
          const initialTheft = timeline.find(marker => marker.type === 'THEFT');
          
          if (initialTheft) {
            console.log('Centering map on initial theft location:', initialTheft);
            setViewState({
              longitude: initialTheft.longitude,
              latitude: initialTheft.latitude,
              zoom: 14
            });
            
            mapRef.current?.flyTo({
              center: [initialTheft.longitude, initialTheft.latitude],
              zoom: 14,
              duration: 2000
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
    if (isAddingLocation) {
      console.log('Map clicked at:', event.lngLat);
      
      const newLocation = {
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat
      };

      setTempLocation(newLocation);
      setDialogOpen(true);
      setIsAddingLocation(false);
      return;
    }

    if (isAddingStopLocation) {
      console.log('Adding stop location at:', event.lngLat);
      
      const newLocation = {
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat
      };

      setTempLocation(newLocation);
      setIsStopLocationDialogOpen(true);
      setIsAddingStopLocation(false);
      return;
    }

    if (isAddingFinalLocation) {
      console.log('Adding final location at:', event.lngLat);
      
      const newLocation = {
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat
      };

      setTempLocation(newLocation);
      setIsFinalLocationDialogOpen(true);
      setIsAddingFinalLocation(false);
      return;
    }

    if (isDrawingPath && window.pathDrawerMethods?.addPathPoint) {
      const isSelecting = window.pathDrawerMethods.isSelectingStart();
      
      if (!isSelecting) {
        window.pathDrawerMethods.addPathPoint(event.lngLat.lat, event.lngLat.lng);
      }
    }
  }, [isAddingLocation, isAddingStopLocation, isAddingFinalLocation, isDrawingPath]);

  const handlePathComplete = async (points: PathPoint[]) => {
    try {
      setIsLoading(true);
      console.log('Saving path points:', points);
      
      const { error } = await supabase
        .from('phone_theft_timeline_entries')
        .insert(
          points.map(point => ({
            incident_id: currentIncidentId,
            latitude: point.latitude,
            longitude: point.longitude,
            timestamp: new Date().toISOString(),
            type: 'PATH' as const,
            entry_order: point.entry_order
          }))
        );

      if (error) {
        console.error('Error inserting path points:', error);
        throw error;
      }

      // Refresh timeline
      const timeline = await loadFullTimeline(currentIncidentId!);
      setTheftLocations(timeline);
      
    } catch (error) {
      console.error('Failed to save path:', error);
      setError('Failed to save path');
    } finally {
      setIsLoading(false);
      setIsDrawingPath(false);
    }
  };

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

  const handleStopLocationSubmit = async (details: {
    timestamp: string;
    duration: string;
    location: { longitude: number; latitude: number };
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!currentIncidentId) {
        throw new Error('No active incident');
      }

      await createStopLocationEntry({
        ...details,
        incident_id: currentIncidentId
      });

      // Refresh timeline
      const timeline = await loadFullTimeline(currentIncidentId);
      setTheftLocations(timeline);
      setIsStopLocationDialogOpen(false);

    } catch (error) {
      console.error('Failed to create stop location:', error);
      setError('Failed to create stop location');
    } finally {
      setIsLoading(false);
      setTempLocation(null);
    }
  };

  const handleFinalLocationSubmit = async (details: {
    timestamp: string;
    location: { longitude: number; latitude: number };
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!currentIncidentId) {
        throw new Error('No active incident');
      }

      await createFinalLocationEntry({
        ...details,
        incident_id: currentIncidentId
      });

      // Refresh timeline
      const timeline = await loadFullTimeline(currentIncidentId);
      setTheftLocations(timeline);
      setIsFinalLocationDialogOpen(false);

    } catch (error) {
      console.error('Failed to create final location:', error);
      setError('Failed to create final location');
    } finally {
      setIsLoading(false);
      setTempLocation(null);
    }
  };

  const getMarkerStyle = (type: TimelineEntryType) => {
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
          icon: faWarehouse,
          bgColor: 'bg-yellow-500',
        };
      case 'FINAL':
        return {
          icon: faPhoneSlash,
          bgColor: 'bg-green-700',
        };
      case 'PATH':
        return {
          icon: faCircle,
          bgColor: 'bg-blue-300',
        };
    }
  };

  const handleToolbarClick = (index: number) => {
    console.log('Toolbar clicked with index:', index);
    if (index === 0) {
      setIsAddingLocation(!isAddingLocation);
    } else if (index === 2) {
      setIsAddingStopLocation(!isAddingStopLocation);
    }
  };

  // Animation setup for path lines
  useEffect(() => {
    const dashArraySequence = [
      [0, 4, 3],
      [1, 4, 2],
      [2, 4, 1],
      [3, 4, 0],
      [0, 1, 3, 3],
      [0, 2, 3, 2],
      [0, 3, 3, 1]
    ];

    let step = 0;
    let animationTimer: number;

    const animate = () => {
      if (!mapRef.current) return;
      step = (step + 1) % dashArraySequence.length;
      mapRef.current.getMap().setPaintProperty(
        'path-line-dashed',
        'line-dasharray',
        dashArraySequence[step]
      );
      animationTimer = window.setTimeout(animate, 100);
    };

    // Start animation if we have path points
    const pathPoints = theftLocations.filter(m => m.type === 'PATH');
    if (pathPoints.length > 1) {
      animate();
    }

    return () => {
      if (animationTimer) {
        clearTimeout(animationTimer);
      }
    };
  }, [theftLocations]);

  // Update path when map moves
  useEffect(() => {
    const pathPoints = theftLocations.filter(m => m.type === 'PATH');
    if (pathPoints.length > 1 && mapRef.current) {
      // Force re-render of SVG path
      setViewState(prev => ({...prev}));
    }
  }, [viewState.longitude, viewState.latitude, viewState.zoom, theftLocations]);

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
        cursor={
          isAddingLocation || isAddingStopLocation || isAddingFinalLocation || 
          (isDrawingPath && window.pathDrawerMethods?.isSelectingStart?.() === false) 
            ? 'crosshair' 
            : 'grab'
        }
        onClick={handleMapClick}
      >
        <LocationSearch />
        <MapToolbar 
          onAddLocation={(index) => handleToolbarClick(index)} 
          isAddingLocation={isAddingLocation}
          hasActiveIncident={!!currentIncidentId}
          onStartPathDrawing={() => setIsDrawingPath(true)}
          onAddFinalLocation={() => setIsAddingFinalLocation(true)}
        />
        <NavigationControl position="bottom-right" />

        {/* Path lines */}
        {(() => {
          const pathPoints = theftLocations.filter(m => m.type === 'PATH');
          console.log('Path points:', pathPoints);
          if (pathPoints.length > 1) {
            const coordinates = pathPoints.map(p => [p.longitude, p.latitude]);
            console.log('Path coordinates:', coordinates);
            return (
              <Source
                type="geojson"
                data={{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates
                  }
                }}
              >
                {/* Background line */}
                <Layer
                  id="path-line-background"
                  type="line"
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                  }}
                  paint={{
                    'line-color': '#4a90e2',
                    'line-width': 4,
                    'line-opacity': 0.4
                  }}
                />
                {/* Animated dashed line */}
                <Layer
                  id="path-line-dashed"
                  type="line"
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                  }}
                  paint={{
                    'line-color': '#4a90e2',
                    'line-width': 3,
                    'line-dasharray': [0, 4, 3]
                  }}
                />
              </Source>
            );
          }
          return null;
        })()}

        {/* Render path points first (underneath) */}
        {theftLocations
          .filter(marker => marker.type === 'PATH')
          .map(marker => (
            <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            scale={0.5}
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-sm" />
          </Marker>
          ))}

        {/* Render all other markers on top */}
        {theftLocations
          .filter(marker => marker.type !== 'PATH')
          .map(marker => {
            const style = getMarkerStyle(marker.type);
            return (
              <Marker
                key={marker.id}
                longitude={marker.longitude}
                latitude={marker.latitude}
                scale={1.05}
                onClick={() => {
                  if (isDrawingPath && window.pathDrawerMethods?.isSelectingStart?.()) {
                    window.pathDrawerMethods.handleStartMarkerSelect?.(marker);
                  }
                }}
              >
                <div className="relative group">
                  <div className={`w-9 h-9 ${style.bgColor} rounded-full`}>
                    <FontAwesomeIcon 
                      icon={style.icon} 
                      className="text-white text-base absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white p-2 rounded shadow-lg text-xs z-50">
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

        <PathDrawer
          isActive={isDrawingPath}
          onPathComplete={handlePathComplete}
          onCancel={() => setIsDrawingPath(false)}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              Loading...
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </Map>

      {tempLocation && (
        <>
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
          <StopLocationDialog
            isOpen={isStopLocationDialogOpen}
            onClose={() => {
              console.log('Closing stop location dialog');
              setIsStopLocationDialogOpen(false);
              setTempLocation(null);
            }}
            onSubmit={handleStopLocationSubmit}
            location={tempLocation}
          />
          <FinalLocationDialog
            isOpen={isFinalLocationDialogOpen}
            onClose={() => {
              console.log('Closing final location dialog');
              setIsFinalLocationDialogOpen(false);
              setTempLocation(null);
            }}
            onSubmit={handleFinalLocationSubmit}
            location={tempLocation}
          />
        </>
      )}
    </>
  );
}

export default MapComponent;
