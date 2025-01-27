import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface PathTooltipProps {
  onDelete?: () => void;
}

function PathTooltip({ onDelete }: PathTooltipProps) {
  return (
    <div className="p-2">
      <button 
        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
        onClick={(e) => {
          e.stopPropagation();
          if (onDelete) onDelete();
        }}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
}

export default PathTooltip;
