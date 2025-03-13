import { useState, useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-map-gl';
import { TimelineMarker, TimelineEntryType } from '../types/theft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faPersonFallingBurst, faWarehouse, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import MarkerTooltip from './MarkerTooltip';
import PathTooltip from './PathTooltip';
// CSS module is imported in MarkerTooltip and PathTooltip components

interface MapMarkerProps {
  marker: TimelineMarker;
  scale?: number;
  onClick?: () => void;
  onDelete?: () => void;
  isLastPathPoint?: boolean;
  isDrawingPath?: boolean;
}

function MapMarker({ marker, scale = 1.05, onClick, onDelete, isLastPathPoint = false, isDrawingPath = false }: MapMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [popupInDOM, setPopupInDOM] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const removePopupTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle visibility changes with a slight delay to allow for transitions
  useEffect(() => {
    if (showPopup) {
      // Add popup to DOM first
      setPopupInDOM(true);
      // Set visible class immediately after popup is mounted
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      // Start fade out by removing visible class
      setIsVisible(false);
      
      // Wait for the transition to complete before removing from DOM
      if (removePopupTimeoutRef.current) {
        clearTimeout(removePopupTimeoutRef.current);
      }
      
      removePopupTimeoutRef.current = setTimeout(() => {
        setPopupInDOM(false);
      }, 200); // Match the transition duration in CSS (0.2s)
    }
  }, [showPopup]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (removePopupTimeoutRef.current) clearTimeout(removePopupTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    showTimeoutRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 300); // 0.3s delay before showing
  };

  const handleClick = () => {
    console.log('Marker clicked:', marker);
    if (onClick) {
      console.log('Calling onClick handler for marker');
      onClick();
    }
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    // Only hide if tooltip is not being hovered
    if (!isTooltipHovered) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowPopup(false);
      }, 500); // 0.5s delay before hiding
    }
  };

  const handleTooltipMouseEnter = () => {
    setIsTooltipHovered(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    setIsTooltipHovered(false);
    hideTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 500);
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
      <>
        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          scale={0.5}
        >
          <div 
            className={`w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-sm cursor-pointer ${
              isLastPathPoint && isDrawingPath ? 'animate-pulse ring-4 ring-blue-500 ring-opacity-75' : ''
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          />
        </Marker>
        {popupInDOM && (
          <Popup
            longitude={marker.longitude}
            latitude={marker.latitude}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setShowPopup(false)}
            offset={25}
            className={`mapboxgl-popup ${isVisible ? 'visible' : ''}`}
          >
            <div 
              onMouseEnter={handleTooltipMouseEnter}
              onMouseLeave={handleTooltipMouseLeave}
            >
              <PathTooltip onDelete={onDelete} />
            </div>
          </Popup>
        )}
      </>
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
          onClick={handleClick}
        >
          <FontAwesomeIcon 
            icon={style.icon} 
            className="text-white text-base absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </Marker>
      {popupInDOM && (
        <Popup
          longitude={marker.longitude}
          latitude={marker.latitude}
          closeButton={false}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
          offset={25}
          className={`mapboxgl-popup ${isVisible ? 'visible' : ''}`}
        >
          <div 
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <MarkerTooltip marker={marker} onDelete={onDelete} />
          </div>
        </Popup>
      )}
    </>
  );
}

export default MapMarker;
