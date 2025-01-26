// types/theft.ts

export type TimelineEntryType = 'THEFT' | 'MOVEMENT' | 'HOLDING' | 'FINAL' | 'PATH';

// This represents the initial theft report form data
export interface InitialTheftReport {
  timeOfTheft: string;
  phoneDetails: string;
  victimDetails: string;
  reportedToPolice: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
}

// This matches the phone_theft_incidents table
export interface TheftIncident {
  id?: string;
  user_id?: string;
  reported_to_police: boolean;
  time_of_theft: string;
  created_at?: string;
  updated_at?: string;
  phone_details: string;
  victim_details: string;
}

// This matches the phone_theft_timeline_entries table
export interface TimelineEntry {
  id?: string;
  incident_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  duration_at_location?: string; // for INTERVAL
  type: TimelineEntryType;
  entry_order: number;
}

// This is for displaying markers on the map
export interface TimelineMarker {
  id: string;
  longitude: number;
  latitude: number;
  type: TimelineEntryType;
  duration_at_location?: string;
  timestamp: string;
  entry_order: number;
}

// This is for path drawing
export interface PathPoint {
  latitude: number;
  longitude: number;
  entry_order: number;
}

// Declare global window interface to handle PathDrawer methods
declare global {
  interface Window {
    pathDrawerMethods?: {
      addPathPoint: (lat: number, lng: number) => void;
      handleStartMarkerSelect: (marker: TimelineMarker) => void;
      isSelectingStart: () => boolean;
    };
  }
}