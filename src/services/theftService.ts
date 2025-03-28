import { supabase } from '../lib/supabase';
import { InitialTheftReport, TimelineMarker, TheftIncident } from '../types/theft';

interface FinalLocationDetails {
    incident_id: string;
    timestamp: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

interface StopLocationDetails {
    incident_id: string;
    timestamp: string;
    duration: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

export const createFinalLocationEntry = async (details: FinalLocationDetails): Promise<TimelineMarker> => {
    try {
        // Get the current max entry_order for this incident
        const { data: currentEntries, error: orderError } = await supabase
            .from('phone_theft_timeline_entries')
            .select('entry_order')
            .eq('incident_id', details.incident_id)
            .order('entry_order', { ascending: false })
            .limit(1);

        if (orderError) throw orderError;

        const nextOrder = currentEntries && currentEntries.length > 0 
            ? currentEntries[0].entry_order + 1 
            : 1;

        // Create the new timeline entry
        const { data: timeline, error: timelineError } = await supabase
            .from('phone_theft_timeline_entries')
            .insert({
                incident_id: details.incident_id,
                latitude: details.location.latitude,
                longitude: details.location.longitude,
                timestamp: details.timestamp,
                type: 'FINAL',
                entry_order: nextOrder
            })
            .select()
            .single();

        if (timelineError) {
            console.error('Error creating final location entry:', timelineError);
            throw timelineError;
        }

        return {
            id: timeline.id,
            longitude: timeline.longitude,
            latitude: timeline.latitude,
            type: timeline.type,
            timestamp: timeline.timestamp,
            entry_order: timeline.entry_order
        };
    } catch (error) {
        console.error('Error creating final location entry:', error);
        throw error;
    }
};

export const createTheftReport = async (report: InitialTheftReport): Promise<{
    marker: TimelineMarker;
    incidentId: string;
}> => {
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
                victim_details: report.victimDetails,
                incident_title: 'Untitled Incident'
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

        // Return both the marker and the incident ID
        return {
            marker: {
                id: timeline.id,  // Use the timeline entry's ID
                longitude: report.location.longitude,
                latitude: report.location.latitude,
                type: 'THEFT',
                timestamp: report.timeOfTheft,
                entry_order: 1
            },
            incidentId: incident.id  // Return the incident ID separately
        };
    } catch (error) {
        console.error('Error creating theft report:', error);
        throw error;
    }
};

export const createStopLocationEntry = async (details: StopLocationDetails): Promise<TimelineMarker> => {
    try {
        // Get the current max entry_order for this incident
        const { data: currentEntries, error: orderError } = await supabase
            .from('phone_theft_timeline_entries')
            .select('entry_order')
            .eq('incident_id', details.incident_id)
            .order('entry_order', { ascending: false })
            .limit(1);

        if (orderError) throw orderError;

        const nextOrder = currentEntries && currentEntries.length > 0 
            ? currentEntries[0].entry_order + 1 
            : 1;

        // Create the new timeline entry
        const { data: timeline, error: timelineError } = await supabase
            .from('phone_theft_timeline_entries')
            .insert({
                incident_id: details.incident_id,
                latitude: details.location.latitude,
                longitude: details.location.longitude,
                timestamp: details.timestamp,
                duration_at_location: details.duration,
                type: 'HOLDING',
                entry_order: nextOrder
            })
            .select()
            .single();

        if (timelineError) {
            console.error('Error creating stop location entry:', timelineError);
            throw timelineError;
        }

        return {
            id: timeline.id,
            longitude: timeline.longitude,
            latitude: timeline.latitude,
            type: timeline.type,
            timestamp: timeline.timestamp,
            duration_at_location: timeline.duration_at_location,
            entry_order: timeline.entry_order
        };
    } catch (error) {
        console.error('Error creating stop location entry:', error);
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
        console.log('Loading full timeline for incident:', incident_id);
        
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

        if (error) {
            console.error('Error loading timeline:', error);
            throw error;
        }

        console.log('Timeline data from database:', data);

        const mappedData = data.map(entry => ({
            id: entry.id,
            latitude: entry.latitude,
            longitude: entry.longitude,
            type: entry.type,
            duration_at_location: entry.duration_at_location,
            timestamp: entry.timestamp,
            entry_order: entry.entry_order
        }));

        console.log('Mapped timeline data:', mappedData);
        return mappedData;
    } catch (error) {
        console.error('Error loading timeline:', error);
        throw error;
    }
};

export const deleteFinalLocation = async (entryId: string): Promise<void> => {
    try {
        console.log('deleteFinalLocation called with entryId:', entryId);
        
        // First, verify the entry exists and check its type
        const { data: existingEntry, error: checkError } = await supabase
            .from('phone_theft_timeline_entries')
            .select('*')
            .eq('id', entryId)
            .single();

        console.log('Existing entry check:', { existingEntry, checkError });

        if (checkError) {
            console.error('Error checking entry:', checkError);
            throw checkError;
        }

        if (!existingEntry) {
            console.error('Entry not found:', entryId);
            throw new Error('Entry not found');
        }

        if (existingEntry.type !== 'FINAL') {
            console.error('Entry is not a FINAL type:', existingEntry.type);
            throw new Error('Entry is not a FINAL type');
        }

        // If we get here, we know the entry exists and is a FINAL type
        const { error } = await supabase
            .from('phone_theft_timeline_entries')
            .delete()
            .eq('id', entryId);

        console.log('Supabase delete response:', { error });

        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        console.log('Successfully deleted final location');
    } catch (error) {
        console.error('Error deleting final location:', error);
        throw error;
    }
};

export const deleteTimelineEntry = async (entryId: string): Promise<void> => {
    try {
        console.log('deleteTimelineEntry called with entryId:', entryId);
        
        // First, get the entry to be deleted
        const { data: existingEntry, error: checkError } = await supabase
            .from('phone_theft_timeline_entries')
            .select('*')
            .eq('id', entryId)
            .single();

        if (checkError) throw checkError;
        if (!existingEntry) throw new Error('Entry not found');

        // Special validation for THEFT type - cannot delete initial theft location
        if (existingEntry.type === 'THEFT') {
            throw new Error('Cannot delete initial theft location');
        }

        // Delete the target entry
        const { error: deleteError } = await supabase
            .from('phone_theft_timeline_entries')
            .delete()
            .eq('id', entryId);

        if (deleteError) throw deleteError;

        // Get all remaining entries for this incident
        const { data: remainingEntries, error: entriesError } = await supabase
            .from('phone_theft_timeline_entries')
            .select('*')
            .eq('incident_id', existingEntry.incident_id)
            .order('entry_order', { ascending: true });

        if (entriesError) throw entriesError;

        // Instead of updating existing entries, we'll delete them all and reinsert with correct order
        if (remainingEntries.length > 0) {
            // Delete all remaining entries
            const { error: deleteAllError } = await supabase
                .from('phone_theft_timeline_entries')
                .delete()
                .in('id', remainingEntries.map(e => e.id));

            if (deleteAllError) throw deleteAllError;

            // Reinsert all entries with correct order
            const reorderedEntries = remainingEntries.map((entry, index) => ({
                incident_id: entry.incident_id,
                latitude: entry.latitude,
                longitude: entry.longitude,
                timestamp: entry.timestamp,
                type: entry.type,
                duration_at_location: entry.duration_at_location,
                entry_order: index + 1
            }));

            const { error: insertError } = await supabase
                .from('phone_theft_timeline_entries')
                .insert(reorderedEntries);

            if (insertError) throw insertError;
        }

        console.log('Successfully deleted timeline entry and reordered remaining entries');
    } catch (error) {
        console.error('Error in deleteTimelineEntry:', error);
        throw error;
    }
};

export const savePerpetratorInformation = async (
    incidentId: string,
    info: {
        vehicleInformation: string;
        clothingInformation: string;
        groupInformation: string;
        otherInformation: string;
    }
): Promise<void> => {
    try {
        console.log('Saving perpetrator information for incident:', incidentId);
        
        // Check if a record already exists for this incident
        const { data: existingInfo, error: fetchError } = await supabase
            .from('perpetrator_information')
            .select('id')
            .eq('incident_id', incidentId)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingInfo) {
            // Update existing record
            console.log('Updating existing perpetrator information record');
            const { error: updateError } = await supabase
                .from('perpetrator_information')
                .update({
                    vehicle_information: info.vehicleInformation,
                    clothing_information: info.clothingInformation,
                    group_information: info.groupInformation,
                    other_information: info.otherInformation
                })
                .eq('id', existingInfo.id);

            if (updateError) throw updateError;
        } else {
            // Insert new record
            console.log('Creating new perpetrator information record');
            const { error: insertError } = await supabase
                .from('perpetrator_information')
                .insert({
                    incident_id: incidentId,
                    vehicle_information: info.vehicleInformation,
                    clothing_information: info.clothingInformation,
                    group_information: info.groupInformation,
                    other_information: info.otherInformation
                });

            if (insertError) throw insertError;
        }
        
        console.log('Successfully saved perpetrator information');
    } catch (error) {
        console.error('Error saving perpetrator information:', error);
        throw error;
    }
};

export const loadPerpetratorInformation = async (
    incidentId: string
): Promise<{
    vehicleInformation: string;
    clothingInformation: string;
    groupInformation: string;
    otherInformation: string;
} | null> => {
    try {
        console.log('Loading perpetrator information for incident:', incidentId);
        
        const { data, error } = await supabase
            .from('perpetrator_information')
            .select('*')
            .eq('incident_id', incidentId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            console.log('No perpetrator information found for incident:', incidentId);
            return null;
        }

        console.log('Found perpetrator information:', data);
        
        return {
            vehicleInformation: data.vehicle_information || '',
            clothingInformation: data.clothing_information || '',
            groupInformation: data.group_information || '',
            otherInformation: data.other_information || ''
        };
    } catch (error) {
        console.error('Error loading perpetrator information:', error);
        throw error;
    }
};

export const deleteInitialTheftLocation = async (incidentId: string): Promise<void> => {
    try {
        console.log('Deleting initial theft location and all associated data for incident:', incidentId);
        
        // Delete perpetrator information first
        const { error: perpetratorError } = await supabase
            .from('perpetrator_information')
            .delete()
            .eq('incident_id', incidentId);

        if (perpetratorError) {
            console.error('Error deleting perpetrator information:', perpetratorError);
            // Continue with deletion even if perpetrator info deletion fails
            // This is to ensure we don't leave orphaned records
        }
        
        // Delete timeline entries
        const { error: timelineError } = await supabase
            .from('phone_theft_timeline_entries')
            .delete()
            .eq('incident_id', incidentId);

        if (timelineError) throw timelineError;

        // Finally delete the incident
        const { error: incidentError } = await supabase
            .from('phone_theft_incidents')
            .delete()
            .eq('id', incidentId);

        if (incidentError) throw incidentError;

        console.log('Successfully deleted initial theft location and all associated data');
    } catch (error) {
        console.error('Error deleting initial theft location:', error);
        throw error;
    }
};

export const deleteHoldingLocation = async (entryId: string): Promise<void> => {
    try {
        console.log('deleteHoldingLocation called with entryId:', entryId);
        
        // First, verify the entry exists and check its type
        const { data: existingEntry, error: checkError } = await supabase
            .from('phone_theft_timeline_entries')
            .select('*')
            .eq('id', entryId)
            .single();

        console.log('Existing entry check:', { existingEntry, checkError });

        if (checkError) {
            console.error('Error checking entry:', checkError);
            throw checkError;
        }

        if (!existingEntry) {
            console.error('Entry not found:', entryId);
            throw new Error('Entry not found');
        }

        if (existingEntry.type !== 'HOLDING') {
            console.error('Entry is not a HOLDING type:', existingEntry.type);
            throw new Error('Entry is not a HOLDING type');
        }

        // If we get here, we know the entry exists and is a HOLDING type
        const { error } = await supabase
            .from('phone_theft_timeline_entries')
            .delete()
            .eq('id', entryId);

        console.log('Supabase delete response:', { error });

        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        // Since we verified the entry exists and is of type HOLDING,
        // if we get here without an error, the delete was successful
        console.log('Successfully deleted holding location');
    } catch (error) {
        console.error('Error deleting holding location:', error);
        throw error;
    }
};

export const getIncidentTitle = async (incidentId: string): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('phone_theft_incidents')
            .select('incident_title')
            .eq('id', incidentId)
            .single();

        if (error) throw error;
        return data.incident_title || 'Untitled Incident';
    } catch (error) {
        console.error('Error fetching incident title:', error);
        return 'Untitled Incident';
    }
};

export const updateIncidentTitle = async (incidentId: string, title: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('phone_theft_incidents')
            .update({ incident_title: title })
            .eq('id', incidentId);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating incident title:', error);
        throw error;
    }
};

export const createNewIncident = async (): Promise<string> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('No authenticated user');
        }

        // Create the incident record with default values
        // Note: incident_title will be set by Supabase trigger
        const { data: incident, error: incidentError } = await supabase
            .from('phone_theft_incidents')
            .insert({
                user_id: user.id,
                reported_to_police: false,
                time_of_theft: new Date().toISOString(),
                phone_details: '',
                victim_details: ''
                // incident_title is handled by Supabase
            })
            .select()
            .single();

        if (incidentError) {
            console.error('Error creating new incident:', incidentError);
            throw incidentError;
        }

        return incident.id;
    } catch (error) {
        console.error('Error creating new incident:', error);
        throw error;
    }
};

export const loadUserIncidents = async (): Promise<TheftIncident[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('No authenticated user');
        }

        const { data, error } = await supabase
            .from('phone_theft_incidents')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading user incidents:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error loading user incidents:', error);
        throw error;
    }
};

export const loadTheftHeatMapData = async (): Promise<{
    longitude: number;
    latitude: number;
    timestamp: string;
}[]> => {
    try {
        // Fetch theft points from Supabase
        const { data, error } = await supabase
            .from('aggregated_theft_routes')
            .select('longitude, latitude, timestamp')
            .eq('type', 'THEFT');
            
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error loading theft heat map data:', error);
        throw error;
    }
};

export const loadStorageSitesData = async (): Promise<{
    longitude: number;
    latitude: number;
    timestamp: string;
}[]> => {
    try {
        // Fetch holding points from Supabase
        const { data, error } = await supabase
            .from('aggregated_theft_routes')
            .select('longitude, latitude, timestamp')
            .eq('type', 'HOLDING');
            
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error loading storage sites data:', error);
        throw error;
    }
};
