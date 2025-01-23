import { useState, useCallback } from 'react';
import Map, { NavigationControl, Marker } from 'react-map-gl';
import { v4 as uuidv4 } from 'uuid'; // We'll need to install this
import MapToolbar from './MapToolbar';
import LocationSearch from './LocationSearch';

interface TheftLocation {
  id: string;
  longitude: number;
  latitude: number;
}

function MapComponent() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [theftLocations, setTheftLocations] = useState<TheftLocation[]>([]);

  const handleMapClick = useCallback((event: mapboxgl.MapMouseEvent) => {
    console.log('Map clicked!');
    console.log('isAddingLocation:', isAddingLocation);
    console.log('Click coordinates:', event.lngLat);

    if (!isAddingLocation) return;

    const newLocation = {
      id: uuidv4(),
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    };

    console.log('Adding new location:', newLocation);

    setTheftLocations((prevLocations: TheftLocation[]) => {
      console.log('Updated theft locations:', [...prevLocations, newLocation]);
      return [...prevLocations, newLocation];
    });

    setIsAddingLocation(false); // Exit adding mode after placing pin
  }, [isAddingLocation]);

  const handleToolbarClick = () => {
    console.log('Toolbar button clicked, setting isAddingLocation to true');
    setIsAddingLocation(true);
  };

  return (
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
        <MapToolbar onAddLocation={handleToolbarClick} />
        <NavigationControl position="bottom-right" />
      
        {theftLocations.map(location => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            color="#FF0000" // Add bright red color
            scale={1.5} // Make it a bit larger
          />
        ))}
    </Map>
  );
}

export default MapComponent;