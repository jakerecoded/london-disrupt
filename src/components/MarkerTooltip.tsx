import { TimelineMarker } from '../types/theft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface MarkerTooltipProps {
  marker: TimelineMarker;
  onDelete?: () => void;
}

function MarkerTooltip({ marker, onDelete }: MarkerTooltipProps) {
  return (
    <div className="px-2 py-1 text-xs w-48">
      <div className="font-bold mb-1">
        {marker.type === 'THEFT' && 'Initial theft location'}
        {marker.type === 'HOLDING' && 'Stop location'}
        {marker.type === 'FINAL' && 'Final location'}
        {marker.type === 'MOVEMENT' && 'Movement point'}
      </div>
      <div>Latitude: {marker.latitude.toFixed(2)}</div>
      <div>Longitude: {marker.longitude.toFixed(2)}</div>
      {marker.duration_at_location && (
        <div>Duration: {marker.duration_at_location}</div>
      )}
      {onDelete && (
        <button 
          className="mt-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
}

export default MarkerTooltip;
