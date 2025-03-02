// components/MapToolbar.tsx
import { useState, useEffect } from 'react';
import styles from './MapToolbar.module.css';
import { IconMap } from '@tabler/icons-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonFallingBurst, faRoute, faWarehouse, faSquarePlus, faUserNinja, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Tooltip } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';

interface ToolbarButtonProps {
  icon: typeof IconMap | IconDefinition;
  label: string;
  active?: boolean;
  disabled?: boolean;
  isLoggedOut?: boolean;
  onClick?: () => void;
}

function ToolbarButton({ icon: Icon, label, active, disabled, isLoggedOut, onClick }: ToolbarButtonProps) {
  let tooltipLabel = label;
  if (isLoggedOut) {
    tooltipLabel = `Cannot ${label.toLowerCase()} - sign in to continue`;
  } else if (disabled) {
    tooltipLabel = `Cannot ${label.toLowerCase()} - already exists`;
  }

  return (
    <Tooltip label={tooltipLabel} position="left">
      <button
        onClick={isLoggedOut ? undefined : disabled ? undefined : onClick}
        className={`${styles.actionButton} ${
          active ? styles['actionButton--active'] :
          (disabled || isLoggedOut) ? styles['actionButton--disabled'] : ''
        }`}
      >
        <span className={styles.actionIcon}>
          {typeof Icon === 'object' ? (
            <FontAwesomeIcon icon={Icon} size="2x" />
          ) : (
            <Icon size={32} stroke={1.5} />
          )}
        </span>
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
  isAddingStopLocation?: boolean;
  isAddingFinalLocation?: boolean;
  isDrawingPath?: boolean;
  hasActiveIncident?: boolean;
  onStartPathDrawing: () => void;
  onAddFinalLocation?: () => void;
  onAddPerpetratorInfo?: () => void;
  onStartNewIncident?: () => void;
  isAddingPerpetratorInfo?: boolean;
  isNewIncidentDialogOpen?: boolean;
  hasTheftLocation?: boolean;
  hasFinalLocation?: boolean;
  hasPerpetratorInfo?: boolean;
}

function MapToolbar({
  onAddLocation, 
  isAddingLocation,
  isAddingStopLocation = false,
  isAddingFinalLocation = false,
  isDrawingPath = false,
  hasActiveIncident, 
  onStartPathDrawing, 
  onAddFinalLocation,
  onAddPerpetratorInfo,
  onStartNewIncident,
  isAddingPerpetratorInfo = false,
  isNewIncidentDialogOpen = false,
  hasTheftLocation,
  hasFinalLocation,
  hasPerpetratorInfo = false
}: MapToolbarProps) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    // Reset active state when all action modes are inactive
    if (!isAddingLocation && !isAddingStopLocation && !isAddingFinalLocation && !isDrawingPath && !isAddingPerpetratorInfo && !isNewIncidentDialogOpen) {
      setActive(null);
    } else if (isNewIncidentDialogOpen) {
      // Set active state to the "Start a different incident timeline" button when dialog is open
      setActive(5);
    }
  }, [isAddingLocation, isAddingStopLocation, isAddingFinalLocation, isDrawingPath, isAddingPerpetratorInfo, isNewIncidentDialogOpen]);

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
      } else if (index === 5 && onStartNewIncident) {
        // If the new incident dialog is already open, this will close it
        onStartNewIncident();
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
    } else if (index === 4 && hasActiveIncident && onAddPerpetratorInfo) {
      onAddPerpetratorInfo();
    } else if (index === 5 && onStartNewIncident) {
      onStartNewIncident();
    }
    setActive(index);
  };

  const { user } = useAuth();
  const isLoggedOut = !user;

  return (
    <div className={styles.toolbarContainer}>
      {toolbarItems.map((item, index) => (
        <ToolbarButton
          key={item.label}
          {...item}
          active={
            index === active || 
            (index === 4 && hasPerpetratorInfo) || // Show perpetrator info button as active if info exists
            (index === 5 && isNewIncidentDialogOpen) // Show new incident button as active when dialog is open
          }
          isLoggedOut={isLoggedOut}
          disabled={
            (index === 0 && hasTheftLocation) || // Theft Location button
            (index === 3 && hasFinalLocation) || // Final Location button
            (hasFinalLocation && (index === 1 || index === 2)) // Route and Stop Location buttons
          }
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}

export default MapToolbar;
