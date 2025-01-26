// types/theft.ts

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
  type: 'THEFT' | 'MOVEMENT' | 'HOLDING' | 'FINAL' | 'PATH';
  entry_order: number;
}

// This is for displaying markers on the map
export interface TimelineMarker {
  id: string;
  longitude: number;
  latitude: number;
  type: 'THEFT' | 'MOVEMENT' | 'HOLDING' | 'FINAL';
  duration_at_location?: string; // Optional as THEFT type won't have this
  timestamp: string;
}

