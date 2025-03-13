// components/AnalyticsToolbar.tsx
import { useState } from 'react';
import styles from './AnalyticsToolbar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faFireFlameCurved, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Tooltip } from '@mantine/core';

interface ToolbarButtonProps {
  icon: IconDefinition;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, label, active, onClick }: ToolbarButtonProps) {
  return (
    <Tooltip label={label} position="left">
      <button
        onClick={onClick}
        className={`${styles.actionButton} ${
          active ? styles['actionButton--active'] : ''
        }`}
      >
        <span className={styles.actionIcon}>
          <FontAwesomeIcon icon={icon} size="2x" />
        </span>
      </button>
    </Tooltip>
  );
}

const toolbarItems = [
  { icon: faRoute, label: 'Show all stolen phone routes' },
  { icon: faFireFlameCurved, label: 'Show a heat map of theft incident locations' },
  { icon: faWarehouse, label: 'Show pinpoint locations of reported storage sites' },
];

interface AnalyticsToolbarProps {
  onViewChange?: (viewIndex: number) => void;
}

function AnalyticsToolbar({ onViewChange }: AnalyticsToolbarProps) {
  // Default to the first button (routes view)
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (index: number) => {
    // Only update if selecting a different view
    if (index !== activeIndex) {
      setActiveIndex(index);
      
      // Call the callback if provided
      if (onViewChange) {
        onViewChange(index);
      }
    }
  };

  return (
    <div className={styles.toolbarContainer}>
      {toolbarItems.map((item, index) => (
        <ToolbarButton
          key={item.label}
          {...item}
          active={index === activeIndex}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}

export default AnalyticsToolbar;
