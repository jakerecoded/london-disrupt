import { useState, useEffect } from 'react';
import {
  IconMap,
  IconLayersIntersect,
  IconMapPin,
  IconSettings,
  IconInfoCircle,
  IconShare,
} from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';

interface ToolbarButtonProps {
  icon: typeof IconMap;
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
          active 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Icon size={32} stroke={1.5} />
      </button>
    </Tooltip>
  );
}

const toolbarItems = [
  { icon: IconMapPin, label: 'Add Theft Location' },
  { icon: IconLayersIntersect, label: 'Layers' },
  { icon: IconInfoCircle, label: 'Information' },
  { icon: IconShare, label: 'Share' },
  { icon: IconSettings, label: 'Settings' },
];

interface MapToolbarProps {
    onAddLocation: () => void;
    isAddingLocation: boolean;
    hasActiveIncident?: boolean;
  }

function MapToolbar({ onAddLocation, isAddingLocation, hasActiveIncident }: MapToolbarProps) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (!isAddingLocation) {
      setActive(null);
    }
  }, [isAddingLocation]);

  const handleClick = (index: number) => {
    if (index === 0 && !hasActiveIncident) {
        onAddLocation();
    }
    setActive(index);
  }

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