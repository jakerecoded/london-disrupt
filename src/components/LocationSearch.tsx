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
        theme={{
          cssText: `
            [class*="mbx"][class*="--Input"] {
              border: 1px solid #e5e7eb !important;
              transition: all 0.2s !important;
            }
            [class*="mbx"][class*="--Input"]:focus {
              border-color: #93c5fd !important;
              box-shadow: 0 0 0 2px rgba(147, 197, 253, 0.3) !important;
              outline: none !important;
            }
          `
        }}
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
