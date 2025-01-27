import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { NavigationControl, MapRef, Source, Layer } from 'react-map-gl';
import MapToolbar from './MapToolbar';
import LocationSearch from './LocationSearch';
import MapMarker from './MapMarker';
import { MapLayerMouseEvent } from 'mapbox-gl';
import TheftDetailsDialog from './TheftDetailsDialog';
import StopLocationDialog from './StopLocationDialog';
import FinalLocationDialog from './FinalLocationDialog';
import { InitialTheftReport, TimelineMarker, PathPoint } from '../types/theft';
import { createTheftReport, loadFullTimeline, createStopLocationEntry, createFinalLocationEntry, deleteHoldingLocation, deleteFinalLocation } from '../services/theftService';
import { supabase } from '../lib/supabase';
import PathDrawer from './PathDrawer';
import DeleteHoldingDialog from './DeleteHoldingDialog';
import DeleteFinalDialog from './DeleteFinalDialog';

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
  const [hasTheftLocation, setHasTheftLocation] = useState(false);
  const [hasFinalLocation, setHasFinalLocation] = useState(false);
  const [isDeleteHoldingDialogOpen, setIsDeleteHoldingDialogOpen] = useState(false);
  const [isDeleteFinalDialogOpen, setIsDeleteFinalDialogOpen] = useState(false);
  const [markerToDelete, setMarkerToDelete] = useState<TimelineMarker | null>(null);

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

  // Update location states whenever timeline changes
  useEffect(() => {
    setHasTheftLocation(theftLocations.some(marker => marker.type === 'THEFT'));
    setHasFinalLocation(theftLocations.some(marker => marker.type === 'FINAL'));
  }, [theftLocations]);

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

  const handleToolbarClick = (index: number) => {
    console.log('Toolbar clicked with index:', index);
    if (index === -1) {
      // Deactivation case
      setIsAddingLocation(false);
      setIsAddingStopLocation(false);
      return;
    }
    
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
          (isDrawingPath && (!window.pathDrawerMethods?.isSelectingStart || window.pathDrawerMethods.isSelectingStart() === false))
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
          onStartPathDrawing={() => setIsDrawingPath(!isDrawingPath)}
          onAddFinalLocation={() => setIsAddingFinalLocation(!isAddingFinalLocation)}
          hasTheftLocation={hasTheftLocation}
          hasFinalLocation={hasFinalLocation}
        />
        <NavigationControl position="bottom-right" />

        {/* 1. Render path lines (bottom layer) */}
        {(() => {
          const pathPoints = theftLocations.filter(m => m.type === 'PATH');
          if (pathPoints.length > 1) {
            const coordinates = pathPoints.map(p => [p.longitude, p.latitude]);
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
                  beforeId="road-label"  // Add before road labels
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round',
                    'visibility': 'visible'
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
                  beforeId="road-label"  // Add before road labels
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round',
                    'visibility': 'visible'
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

        {/* 2. Render path markers (middle layer) */}
        {theftLocations
          .filter(marker => marker.type === 'PATH')
          .map(marker => (
            <MapMarker
              key={marker.id}
              marker={marker}
              onClick={() => {
                if (isDrawingPath && window.pathDrawerMethods?.isSelectingStart?.()) {
                  window.pathDrawerMethods.handleStartMarkerSelect?.(marker);
                }
              }}
              onDelete={() => {
                if (marker.type === 'HOLDING') {
                  setMarkerToDelete(marker);
                  setIsDeleteHoldingDialogOpen(true);
                } else if (marker.type === 'FINAL') {
                  setMarkerToDelete(marker);
                  setIsDeleteFinalDialogOpen(true);
                }
              }}
            />
          ))}

        {/* 3. Render other markers (top layer) */}
        {theftLocations
          .filter(marker => marker.type !== 'PATH')
          .map(marker => (
            <MapMarker
              key={marker.id}
              marker={marker}
              onClick={() => {
                if (isDrawingPath && window.pathDrawerMethods?.isSelectingStart?.()) {
                  window.pathDrawerMethods.handleStartMarkerSelect?.(marker);
                }
              }}
              onDelete={() => {
                if (marker.type === 'HOLDING') {
                  setMarkerToDelete(marker);
                  setIsDeleteHoldingDialogOpen(true);
                } else if (marker.type === 'FINAL') {
                  setMarkerToDelete(marker);
                  setIsDeleteFinalDialogOpen(true);
                }
              }}
            />
          ))}

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

      <DeleteHoldingDialog
        isOpen={isDeleteHoldingDialogOpen}
        onClose={() => {
          setIsDeleteHoldingDialogOpen(false);
          setMarkerToDelete(null);
        }}
        onConfirm={async () => {
          try {
            setIsLoading(true);
            if (!markerToDelete || !currentIncidentId) {
              console.warn('No marker selected for deletion or no current incident');
              return;
            }

            console.log('Attempting to delete holding location:', {
              markerId: markerToDelete.id,
              markerType: markerToDelete.type,
              incidentId: currentIncidentId
            });
            
            await deleteHoldingLocation(markerToDelete.id);
            
            // After successful deletion, filter out the deleted marker immediately
            setTheftLocations(prev => prev.filter(marker => marker.id !== markerToDelete.id));
            
            // Then refresh the full timeline
            const timeline = await loadFullTimeline(currentIncidentId);
            setTheftLocations(timeline);
            
            setIsDeleteHoldingDialogOpen(false);
            setMarkerToDelete(null);
          } catch (error) {
            console.error('Failed to delete holding location:', error);
            setError('Failed to delete holding location');
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <DeleteFinalDialog
        isOpen={isDeleteFinalDialogOpen}
        onClose={() => {
          setIsDeleteFinalDialogOpen(false);
          setMarkerToDelete(null);
        }}
        onConfirm={async () => {
          try {
            setIsLoading(true);
            if (!markerToDelete || !currentIncidentId) {
              console.warn('No marker selected for deletion or no current incident');
              return;
            }

            console.log('Attempting to delete final location:', {
              markerId: markerToDelete.id,
              markerType: markerToDelete.type,
              incidentId: currentIncidentId
            });
            
            await deleteFinalLocation(markerToDelete.id);
            
            // After successful deletion, filter out the deleted marker immediately
            setTheftLocations(prev => prev.filter(marker => marker.id !== markerToDelete.id));
            
            // Then refresh the full timeline
            const timeline = await loadFullTimeline(currentIncidentId);
            setTheftLocations(timeline);
            
            setIsDeleteFinalDialogOpen(false);
            setMarkerToDelete(null);
          } catch (error) {
            console.error('Failed to delete final location:', error);
            setError('Failed to delete final location');
          } finally {
            setIsLoading(false);
          }
        }}
      />

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
