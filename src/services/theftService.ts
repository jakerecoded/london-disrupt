import { supabase } from '../lib/supabase';
import { InitialTheftReport, TimelineMarker } from '../types/theft';

export const createTheftReport = async (report: InitialTheftReport): Promise<TimelineMarker> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('No authenticated user');
        }

        // First, create the incident record
        const { data: incident, error: incidentError } = await supabase
            .from('phone_theft_incidents')
            .insert({
                user_id: user.id,
                reported_to_police: report.reportedToPolice,
                time_of_theft: report.timeOfTheft,
                phone_details: report.phoneDetails,
                victim_details: report.victimDetails
            })
            .select()
            .single();

        if (incidentError) {
            console.error('Error creating incident:', incidentError);
            throw incidentError;
        }

        // Then create the initial timeline entry
        const { data: timeline, error: timelineError } = await supabase
            .from('phone_theft_timeline_entries')
            .insert({
                incident_id: incident.id,
                latitude: report.location.latitude,
                longitude: report.location.longitude,
                timestamp: report.timeOfTheft,
                type: 'THEFT',
                entry_order: 1
            })
            .select()
            .single();

        if (timelineError) {
            console.error('Error creating timeline entry:', timelineError);
            throw timelineError;
        }

        return {
            id: timeline.id,  // Use the timeline entry's ID
            longitude: report.location.longitude,
            latitude: report.location.latitude,
            type: 'THEFT',
            timestamp: report.timeOfTheft,
            entry_order: 1
        };
    } catch (error) {
        console.error('Error creating theft report:', error);
        throw error;
    }
};

export const loadInitialTheftMarker = async (incident_id: string): Promise<TimelineMarker> => {
    try {
        const { data, error } = await supabase
            .from('phone_theft_timeline_entries')
            .select(`
                id,
                incident_id,
                latitude,
                longitude,
                type,
                timestamp,
                entry_order
            `)  // Added entry_order to select
            .eq('incident_id', incident_id)
            .eq('type', 'THEFT')
            .single();

        if (error) throw error;

        return {
            id: data.incident_id,
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            timestamp: data.timestamp,
            entry_order: data.entry_order  // Added this line
        };
    } catch (error) {
        console.error('Error loading initial theft marker:', error);
        throw error;
    }
};

export const loadFullTimeline = async (incident_id: string): Promise<TimelineMarker[]> => {
    try {
        const { data, error } = await supabase
            .from('phone_theft_timeline_entries')
            .select(`
                id,
                incident_id,
                latitude,
                longitude,
                type,
                duration_at_location,
                timestamp,
                entry_order
            `)
            .eq('incident_id', incident_id)
            .order('entry_order', { ascending: true });

        if (error) throw error;

        return data.map(entry => ({
            id: entry.id,  // Use the entry's actual ID instead of incident_id
            latitude: entry.latitude,
            longitude: entry.longitude,
            type: entry.type,
            duration_at_location: entry.duration_at_location,
            timestamp: entry.timestamp,
            entry_order: entry.entry_order
        }));
    } catch (error) {
        console.error('Error loading timeline:', error);
        throw error;
    }
};