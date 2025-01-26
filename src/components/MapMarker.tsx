import { useState, useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-map-gl';
import { TimelineMarker, TimelineEntryType } from '../types/theft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faPersonFallingBurst, faWarehouse, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import MarkerTooltip from './MarkerTooltip';

interface MapMarkerProps {
  marker: TimelineMarker;
  scale?: number;
  onClick?: () => void;
  onDelete?: () => void;
}

function MapMarker({ marker, scale = 1.05, onClick, onDelete }: MapMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle visibility changes with a slight delay to allow for transitions
  useEffect(() => {
    if (showPopup) {
      // Set visible class immediately after popup is mounted
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [showPopup]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    showTimeoutRef.current = setTimeout(() => {
      setShowPopup(true);
      if (onClick) onClick();
    }, 300); // 0.3s delay before showing
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 500); // 0.5s delay before hiding
  };

  const getMarkerStyle = (type: TimelineEntryType) => {
    switch (type) {
      case 'THEFT':
        return {
          icon: faPersonFallingBurst,
          bgColor: 'bg-red-700',
        };
      case 'MOVEMENT':
        return {
          icon: faCircle,
          bgColor: 'bg-blue-500',
        };
      case 'HOLDING':
        return {
          icon: faWarehouse,
          bgColor: 'bg-yellow-500',
        };
      case 'FINAL':
        return {
          icon: faPhoneSlash,
          bgColor: 'bg-green-700',
        };
      case 'PATH':
        return {
          icon: faCircle,
          bgColor: 'bg-blue-300',
        };
    }
  };

  const style = getMarkerStyle(marker.type);

  if (marker.type === 'PATH') {
    return (
      <Marker
        longitude={marker.longitude}
        latitude={marker.latitude}
        scale={0.5}
      >
        <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-sm" />
      </Marker>
    );
  }

  return (
    <>
      <Marker
        longitude={marker.longitude}
        latitude={marker.latitude}
        scale={scale}
      >
        <div 
          className={`w-9 h-9 ${style.bgColor} rounded-full cursor-pointer`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <FontAwesomeIcon 
            icon={style.icon} 
            className="text-white text-base absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </Marker>
      {showPopup && (
        <Popup
          longitude={marker.longitude}
          latitude={marker.latitude}
          closeButton={false}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
          offset={25}
          className={`mapboxgl-popup ${isVisible ? 'visible' : ''}`}
        >
          <MarkerTooltip marker={marker} onDelete={onDelete} />
        </Popup>
      )}
    </>
  );
}

export default MapMarker;
