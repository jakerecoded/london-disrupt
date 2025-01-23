import { useMap } from 'react-map-gl';
import { SearchBox } from '@mapbox/search-js-react';

function LocationSearch() {
  const { current: map } = useMap();

  return (
    // Added positioning classes here
    <div className="absolute top-4 right-4 w-72">
      {/* @ts-expect-error - SearchBox component typing needs to be resolved */}
      <SearchBox
        accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        value=""
        onRetrieve={(res) => {
          if (res.features?.[0]?.geometry?.coordinates) {
            const [lng, lat] = res.features[0].geometry.coordinates;
            map?.flyTo({
              center: [lng, lat],
              zoom: 14,
              duration: 2000
            });
          }
        }}
        options={{
          language: 'en',
          proximity: 'ip',
          types: 'place,address,poi'
        }}
      />
    </div>
  );
}

export default LocationSearch;