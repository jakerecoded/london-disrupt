import { TimelineMarker } from '../types/theft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Text, Button } from '@mantine/core';
import styles from './MarkerTooltip.module.css';

interface MarkerTooltipProps {
  marker: TimelineMarker;
  onDelete?: () => void;
}

function MarkerTooltip({ marker, onDelete }: MarkerTooltipProps) {
  return (
    <div className={styles.tooltipContainer}>
      <Text fw={700} size="xs" mb={4}>
        {marker.type === 'THEFT' && 'Initial theft location'}
        {marker.type === 'HOLDING' && 'Stop location'}
        {marker.type === 'FINAL' && 'Final location'}
        {marker.type === 'MOVEMENT' && 'Movement point'}
      </Text>
      <Text size="xs">Latitude: {marker.latitude.toFixed(2)}</Text>
      <Text size="xs">Longitude: {marker.longitude.toFixed(2)}</Text>
      {marker.duration_at_location && (
        <Text size="xs">Duration: {marker.duration_at_location}</Text>
      )}
      {onDelete && (
        <Button 
          color="red" 
          size="xs" 
          mt={8}
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      )}
    </div>
  );
}

export default MarkerTooltip;
