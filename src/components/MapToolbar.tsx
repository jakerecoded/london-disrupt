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
  onClick?: () => void;
}

function ToolbarButton({ icon: Icon, label, active, onClick }: ToolbarButtonProps) {
  return (
    <Tooltip label={label} position="left">
      <button
        onClick={onClick}
        className={`p-4 rounded-lg mb-4 transition-colors ${
          active ?
            'bg-blue-500 text-white' :
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
}

function MapToolbar({ onAddLocation, isAddingLocation, hasActiveIncident, onStartPathDrawing, onAddFinalLocation }: MapToolbarProps) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (!isAddingLocation) {
      setActive(null);
    }
  }, [isAddingLocation]);

  const handleClick = (index: number) => {
    if (index === 0 && !hasActiveIncident) {
      // Handle theft location button
      onAddLocation(index);
    } else if (index === 1 && hasActiveIncident) {
      // Handle route button
      onStartPathDrawing();
    } else if (index === 2 && hasActiveIncident) {
      // Handle stop location button
      onAddLocation(index);
    } else if (index === 3 && hasActiveIncident && onAddFinalLocation) {
      // Handle final location button
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
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}

export default MapToolbar;
