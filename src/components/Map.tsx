import Map, { NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LocationSearch from './LocationSearch';

function MapComponent() {
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
      style={{ width: '100%', height: 'calc(100vh - 64px)' }}
    >
      <LocationSearch />
      <NavigationControl />
    </Map>
  );
}

export default MapComponent;
