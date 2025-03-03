import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@mantine/core';
import styles from './MarkerTooltip.module.css';

interface PathTooltipProps {
  onDelete?: () => void;
}

function PathTooltip({ onDelete }: PathTooltipProps) {
  return (
    <div className={styles.tooltipContainer}>
      {onDelete && (
        <Button 
          color="red" 
          size="xs"
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

export default PathTooltip;
