// components/MapToolbar.tsx
import { useState, useEffect } from 'react';
import { IconMap } from '@tabler/icons-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonFallingBurst, faRoute, faWarehouse, faSquarePlus, faUserNinja, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Tooltip } from '@mantine/core';

interface ToolbarButtonProps {
  icon: typeof IconMap | IconDefinition;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function ToolbarButton({ icon: Icon, label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <Tooltip label={disabled ? `Cannot ${label.toLowerCase()} - already exists` : label} position="left">
      <button
        onClick={disabled ? undefined : onClick}
        className={`p-4 rounded-lg mb-4 transition-colors ${
          active ?
            'bg-blue-500 text-white' :
            disabled ?
              'bg-gray-200 text-gray-400 cursor-not-allowed' :
              'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        {typeof Icon === 'object' ? (
          <FontAwesomeIcon icon={Icon} size="2x" />
        ) : (
          <Icon size={32} stroke={1.5} />
        )}
      </button>
    </Tooltip>
  );
}

const toolbarItems = [
  { icon: faPersonFallingBurst, label: 'Add Theft Location' },
  { icon: faRoute, label: 'Add the route your phone took' },
  { icon: faWarehouse, label: 'Add a location where your phone stopped' },
  { icon: faPhoneSlash, label: 'Add the location where your phone stopped tracking' },
  { icon: faUserNinja, label: 'Add some information about who attacked you' },
  { icon: faSquarePlus, label: 'Start a different incident timeline' },
];

interface MapToolbarProps {
  onAddLocation: (index: number) => void;
  isAddingLocation: boolean;
  hasActiveIncident?: boolean;
  onStartPathDrawing: () => void;
  onAddFinalLocation?: () => void;
  hasTheftLocation?: boolean;
  hasFinalLocation?: boolean;
}

function MapToolbar({ 
  onAddLocation, 
  isAddingLocation, 
  hasActiveIncident, 
  onStartPathDrawing, 
  onAddFinalLocation,
  hasTheftLocation,
  hasFinalLocation 
}: MapToolbarProps) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (!isAddingLocation) {
      setActive(null);
    }
  }, [isAddingLocation]);

  const handleClick = (index: number) => {
    // If clicking the same button that's active, deactivate it
    if (index === active) {
      setActive(null);
      // Call appropriate handler with false to deactivate
      if (index === 0 && !hasActiveIncident) {
        onAddLocation(-1); // Deactivation signal
      } else if (index === 1 && hasActiveIncident) {
        onStartPathDrawing(); // Already handles toggle
      } else if (index === 2 && hasActiveIncident) {
        onAddLocation(-1); // Deactivation signal
      } else if (index === 3 && hasActiveIncident && onAddFinalLocation) {
        onAddFinalLocation(); // Toggle off
      }
      return;
    }
    
    // Deactivate any currently active tool before activating new one
    if (active !== null) {
      if (active === 0 && !hasActiveIncident) {
        onAddLocation(-1);
      } else if (active === 1 && hasActiveIncident) {
        onStartPathDrawing();
      } else if (active === 2 && hasActiveIncident) {
        onAddLocation(-1);
      } else if (active === 3 && hasActiveIncident && onAddFinalLocation) {
        onAddFinalLocation();
      }
    }
    
    // Activate new tool
    if (index === 0 && !hasActiveIncident) {
      onAddLocation(index);
    } else if (index === 1 && hasActiveIncident) {
      onStartPathDrawing();
    } else if (index === 2 && hasActiveIncident) {
      onAddLocation(index);
    } else if (index === 3 && hasActiveIncident && onAddFinalLocation) {
      onAddFinalLocation();
    }
    setActive(index);
  };

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col bg-white rounded-xl shadow-lg p-4">
      {toolbarItems.map((item, index) => (
        <ToolbarButton
          key={item.label}
          {...item}
          active={index === active}
          disabled={
            (index === 0 && hasTheftLocation) || // Theft Location button
            (index === 3 && hasFinalLocation)    // Final Location button
          }
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}

export default MapToolbar;
