import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIncident } from '../contexts/IncidentContext';
import Map, { NavigationControl, MapRef, Source, Layer } from 'react-map-gl';
import MapToolbar from './MapToolbar';
import LocationSearch from './LocationSearch';
import MapMarker from './MapMarker';
import { MapLayerMouseEvent } from 'mapbox-gl';
import TheftDetailsDialog from './TheftDetailsDialog';
import StopLocationDialog from './StopLocationDialog';
import FinalLocationDialog from './FinalLocationDialog';
import PerpetratorInformationDialog from './PerpetratorInformationDialog';
import NewIncidentDialog from './NewIncidentDialog';
import { InitialTheftReport, TimelineMarker, PathPoint } from '../types/theft';
import { 
  createTheftReport, 
  loadFullTimeline, 
  createStopLocationEntry, 
  createFinalLocationEntry, 
  deleteTimelineEntry,
  savePerpetratorInformation,
  loadPerpetratorInformation,
  deleteInitialTheftLocation,
  createNewIncident
} from '../services/theftService';
import { notifications } from '@mantine/notifications';
import { Loader } from '@mantine/core';
import { supabase } from '../lib/supabase';
import PathDrawer from './PathDrawer';
import DeleteMarkerDialog from './DeleteMarkerDialog';
import DeleteInitialDialog from './DeleteInitialDialog';

export default function MapComponent() {
  const { user } = useAuth();
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
  const { currentIncidentId, setCurrentIncidentId } = useIncident();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isStopLocationDialogOpen, setIsStopLocationDialogOpen] = useState(false);
  const [isFinalLocationDialogOpen, setIsFinalLocationDialogOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<{longitude: number; latitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTheftLocation, setHasTheftLocation] = useState(false);
  const [hasFinalLocation, setHasFinalLocation] = useState(false);
  const [isDeleteMarkerDialogOpen, setIsDeleteMarkerDialogOpen] = useState(false);
  const [markerToDelete, setMarkerToDelete] = useState<TimelineMarker | null>(null);
  const [isDeleteInitialDialogOpen, setIsDeleteInitialDialogOpen] = useState(false);
  const [isPerpetratorDialogOpen, setIsPerpetratorDialogOpen] = useState(false);
  const [isNewIncidentDialogOpen, setIsNewIncidentDialogOpen] = useState(false);
  const [perpetratorInfo, setPerpetratorInfo] = useState({
    vehicleInformation: '',
    clothingInformation: '',
    groupInformation: '',
    otherInformation: ''
  });
  const [hasPerpetratorInfo, setHasPerpetratorInfo] = useState(false);

  // Update path when map moves
  useEffect(() => {
    const pathPoints = theftLocations.filter(m => m.type === 'PATH');
    if (pathPoints.length > 1 && mapRef.current) {
      // Force re-render of SVG path
      setViewState(prev => ({...prev}));
    }
  }, [viewState.longitude, viewState.latitude, viewState.zoom, theftLocations]);

  // Clear map data when user signs out
  useEffect(() => {
    if (!user) {
      setTheftLocations([]);
      setCurrentIncidentId(null);
      setTempLocation(null);
      setIsDrawingPath(false);
      setIsAddingLocation(false);
      setIsAddingStopLocation(false);
      setIsAddingFinalLocation(false);
    }
  }, [user]);

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

  // Load perpetrator information when an incident is loaded
  useEffect(() => {
    const loadPerpetratorInfo = async () => {
      if (!currentIncidentId) {
        console.log('No current incident ID, skipping perpetrator info load');
        return;
      }
      
      try {
        console.log('Loading perpetrator information for incident:', currentIncidentId);
        const info = await loadPerpetratorInformation(currentIncidentId);
        
        if (info) {
          console.log('Found perpetrator information:', info);
          setPerpetratorInfo(info);
          
          // Check if any field has content
          const hasInfo = !!(
            info.vehicleInformation || 
            info.clothingInformation || 
            info.groupInformation || 
            info.otherInformation
          );
          
          setHasPerpetratorInfo(hasInfo);
        } else {
          console.log('No perpetrator information found');
          setHasPerpetratorInfo(false);
        }
      } catch (error) {
        console.error('Failed to load perpetrator information:', error);
        // Don't set an error state here, as it's not critical to the app
      }
    };

    loadPerpetratorInfo();
  }, [currentIncidentId]);

  // Handle perpetrator information save
  const handlePerpetratorInfoSave = async (info: {
    vehicleInformation: string;
    clothingInformation: string;
    groupInformation: string;
    otherInformation: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentIncidentId) {
        throw new Error('No active incident');
      }
      
      console.log('Saving perpetrator information:', info);
      await savePerpetratorInformation(currentIncidentId, info);
      
      setPerpetratorInfo(info);
      
      // Check if any field has content
      const hasInfo = !!(
        info.vehicleInformation || 
        info.clothingInformation || 
        info.groupInformation || 
        info.otherInformation
      );
      
      setHasPerpetratorInfo(hasInfo);
      setIsPerpetratorDialogOpen(false);
      
    } catch (error) {
      console.error('Failed to save perpetrator information:', error);
      setError('Failed to save perpetrator information');
    } finally {
      // Add a delay to ensure the modal transition completes before updating state
      setTimeout(() => {
        setIsLoading(false);
      }, 400); // Slightly longer than the transition duration
    }
  };

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    // Log the current state for debugging
    console.log('Map clicked with state:', {
      isAddingLocation,
      isAddingStopLocation,
      isAddingFinalLocation,
      isDrawingPath,
      currentIncidentId,
      hasActiveIncident: !!currentIncidentId
    });
    
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

    if (isAddingStopLocation && currentIncidentId) {
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

    if (isAddingFinalLocation && currentIncidentId) {
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

    if (isDrawingPath && currentIncidentId && window.pathDrawerMethods?.addPathPoint) {
      const isSelecting = window.pathDrawerMethods.isSelectingStart();
      
      console.log('Path drawing state:', {
        isDrawingPath,
        currentIncidentId,
        isSelectingStart: isSelecting,
        hasPathDrawerMethods: !!window.pathDrawerMethods,
        clickCoordinates: [event.lngLat.lat, event.lngLat.lng]
      });
      
      if (!isSelecting) {
        console.log('Adding path point at:', [event.lngLat.lat, event.lngLat.lng]);
        window.pathDrawerMethods.addPathPoint(event.lngLat.lat, event.lngLat.lng);
      } else {
        console.log('Not adding path point because isSelectingStart is true. Select a marker first.');
      }
    }
  }, [isAddingLocation, isAddingStopLocation, isAddingFinalLocation, isDrawingPath, currentIncidentId]);

  const handlePathComplete = async (points: PathPoint[]) => {
    try {
      setIsLoading(true);
      console.log('Saving path points:', points);
      
      if (!currentIncidentId) {
        console.error('No active incident ID when trying to save path points');
        throw new Error('No active incident');
      }
      
      console.log('Using incident ID for path points:', currentIncidentId);
      
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
      console.log('Refreshing timeline after adding path points');
      const timeline = await loadFullTimeline(currentIncidentId);
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

  const handleNewIncidentConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a new incident
      const newIncidentId = await createNewIncident();
      
      // Update state to reflect the new incident
      setCurrentIncidentId(newIncidentId);
      setTheftLocations([]); // Clear existing markers
      
      // Reset state for a new incident
      setHasTheftLocation(false);
      setHasFinalLocation(false);
      setHasPerpetratorInfo(false);
      
      // Close the dialog
      setIsNewIncidentDialogOpen(false);
      
      // Show success notification
      notifications.show({
        title: 'Success',
        message: 'New incident created successfully',
        color: 'green',
        autoClose: 8000, // Increased duration to 8 seconds
      });
      
      console.log('Created new incident with ID:', newIncidentId);
    } catch (error) {
      console.error('Failed to create new incident:', error);
      setError('Failed to create new incident');
      
      // Show error notification
      notifications.show({
        title: 'Error',
        message: 'Failed to create new incident',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolbarClick = (index: number) => {
    console.log('Toolbar clicked with index:', index, 'Current incident ID:', currentIncidentId);
    
    if (index === -1) {
      // Deactivation case
      setIsAddingLocation(false);
      setIsAddingStopLocation(false);
      return;
    }
    
    if (index === 0) {
      // Initial theft location - only allow if no active incident
      if (!hasTheftLocation) {
        console.log('Activating add theft location mode');
        setIsAddingLocation(!isAddingLocation);
      }
    } else if (index === 1 && currentIncidentId) {
      // Path drawing - only allow if we have an active incident
      console.log('Toggling path drawing mode');
      const newIsDrawingPath = !isDrawingPath;
      setIsDrawingPath(newIsDrawingPath);
      
      if (newIsDrawingPath) {
        // Show notification to inform user about path drawing process
        notifications.show({
          title: 'Path Drawing Mode',
          message: 'First click on a marker to start the path, then click on the map to add points. Press Enter when done.',
          color: 'blue',
          autoClose: 8000,
        });
      }
    } else if (index === 2 && currentIncidentId) {
      // Stop location - only allow if we have an active incident
      console.log('Activating add stop location mode');
      setIsAddingStopLocation(!isAddingStopLocation);
    }
  };

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Current state updated:', {
      currentIncidentId,
      hasTheftLocation,
      hasFinalLocation,
      theftLocationsCount: theftLocations.length
    });
  }, [currentIncidentId, hasTheftLocation, hasFinalLocation, theftLocations.length]);

  // Animation setup for path lines
  useEffect(() => {
    // Using the exact same dash array sequence from the example
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
      
      // Change step every 50ms like in the example
      const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);
      
      if (newStep !== step) {
        mapRef.current.getMap().setPaintProperty(
          'path-line-dashed',
          'line-dasharray',
          dashArraySequence[newStep]
        );
        step = newStep;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation if we have path points
    const pathPoints = theftLocations.filter(m => m.type === 'PATH');
    if (pathPoints.length > 1) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [theftLocations]);

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
          isAddingStopLocation={isAddingStopLocation}
          isAddingFinalLocation={isAddingFinalLocation}
          isDrawingPath={isDrawingPath}
          hasActiveIncident={!!currentIncidentId}
          onStartPathDrawing={() => setIsDrawingPath(!isDrawingPath)}
          onAddFinalLocation={() => setIsAddingFinalLocation(!isAddingFinalLocation)}
          onAddPerpetratorInfo={() => setIsPerpetratorDialogOpen(true)}
          onStartNewIncident={() => setIsNewIncidentDialogOpen(true)}
          isAddingPerpetratorInfo={isPerpetratorDialogOpen}
          isNewIncidentDialogOpen={isNewIncidentDialogOpen}
          hasTheftLocation={hasTheftLocation}
          hasFinalLocation={hasFinalLocation}
          hasPerpetratorInfo={hasPerpetratorInfo}
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
                    'line-width': 6,
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
                    'line-width': 6,
                    'line-dasharray': [0, 4, 3]
                  }}
                />
              </Source>
            );
          }
          return null;
        })()}

        {/* 2. Render path markers (middle layer) */}
        {(() => {
          const pathMarkers = theftLocations.filter(marker => marker.type === 'PATH');
          const lastPathMarkerIndex = pathMarkers.length - 1;
          
          return pathMarkers.map((marker, index) => (
            <MapMarker
              key={marker.id}
              marker={marker}
              isLastPathPoint={index === lastPathMarkerIndex}
              isDrawingPath={isDrawingPath}
              onClick={() => {
                if (isDrawingPath && window.pathDrawerMethods?.isSelectingStart?.()) {
                  window.pathDrawerMethods.handleStartMarkerSelect?.(marker);
                }
              }}
              onDelete={() => {
                if (marker.type === 'THEFT') {
                  setMarkerToDelete(marker);
                  setIsDeleteInitialDialogOpen(true);
                } else {
                  setMarkerToDelete(marker);
                  setIsDeleteMarkerDialogOpen(true);
                }
              }}
            />
          ));
        })()}

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
                if (marker.type === 'THEFT') {
                  setMarkerToDelete(marker);
                  setIsDeleteInitialDialogOpen(true);
                } else {
                  setMarkerToDelete(marker);
                  setIsDeleteMarkerDialogOpen(true);
                }
              }}
            />
          ))}

        <PathDrawer
          isActive={isDrawingPath}
          incidentId={currentIncidentId}
          onPathComplete={handlePathComplete}
          onCancel={() => setIsDrawingPath(false)}
        />

        {isDrawingPath && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-10">
            {window.pathDrawerMethods?.isSelectingStart?.() 
              ? "Select where you want the route to start, and then press Enter to finish."
              : "Select where you want the route to start, and then press Enter to finish."}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Loader type="oval" color="blue" size="md" />
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </Map>

      <DeleteInitialDialog
        isOpen={isDeleteInitialDialogOpen}
        onClose={() => {
          setIsDeleteInitialDialogOpen(false);
          setMarkerToDelete(null);
        }}
        onConfirm={async () => {
          try {
            setIsLoading(true);
            if (!markerToDelete || !currentIncidentId) {
              console.warn('No marker selected for deletion or no current incident');
              return;
            }

            console.log('Attempting to delete initial theft location:', {
              markerId: markerToDelete.id,
              incidentId: currentIncidentId
            });
            
            await deleteInitialTheftLocation(currentIncidentId);
            
            // Clear all markers and reset state
            setTheftLocations([]);
            setCurrentIncidentId(null);
            setIsDeleteInitialDialogOpen(false);
            setMarkerToDelete(null);
            
          } catch (error) {
            console.error('Failed to delete initial theft location:', error);
            setError('Failed to delete initial theft location');
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <DeleteMarkerDialog
        isOpen={isDeleteMarkerDialogOpen}
        onClose={() => {
          setIsDeleteMarkerDialogOpen(false);
          setMarkerToDelete(null);
        }}
        onConfirm={async () => {
          try {
            setIsLoading(true);
            if (!markerToDelete || !currentIncidentId) {
              console.warn('No marker selected for deletion or no current incident');
              return;
            }

            console.log('Attempting to delete marker:', {
              markerId: markerToDelete.id,
              markerType: markerToDelete.type,
              incidentId: currentIncidentId
            });
            
            await deleteTimelineEntry(markerToDelete.id);
            
            // After successful deletion, filter out the deleted marker immediately
            setTheftLocations(prev => prev.filter(marker => marker.id !== markerToDelete.id));
            
            // Then refresh the full timeline
            const timeline = await loadFullTimeline(currentIncidentId);
            setTheftLocations(timeline);
            
            setIsDeleteMarkerDialogOpen(false);
            setMarkerToDelete(null);
          } catch (error) {
            console.error('Failed to delete marker:', error);
            setError('Failed to delete marker');
          } finally {
            setIsLoading(false);
          }
        }}
        marker={markerToDelete}
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
        </>
      )}
      
      <FinalLocationDialog
        isOpen={isFinalLocationDialogOpen}
        onClose={() => {
          console.log('Closing final location dialog');
          setIsFinalLocationDialogOpen(false);
          setTempLocation(null);
        }}
        onSubmit={handleFinalLocationSubmit}
        location={tempLocation || undefined}
      />

      <PerpetratorInformationDialog
        isOpen={isPerpetratorDialogOpen}
        onClose={() => {
          console.log('Closing perpetrator information dialog');
          setIsPerpetratorDialogOpen(false);
        }}
        onSave={handlePerpetratorInfoSave}
        initialData={perpetratorInfo}
      />

      <NewIncidentDialog
        isOpen={isNewIncidentDialogOpen}
        onClose={() => {
          console.log('Closing new incident dialog');
          setIsNewIncidentDialogOpen(false);
        }}
        onConfirm={handleNewIncidentConfirm}
      />
    </>
  );
}
