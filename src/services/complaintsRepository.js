// Complaints Repository
// Handles persistent shared civic grievance storage with Supabase database integration,
// Realtime cross-browser synchronization, and fail-safe local fallback.

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  loadStoredComplaints,
  saveComplaintsToStorage,
  resetDemoData,
} from '../utils/storage';
import { INITIAL_COMPLAINTS } from '../data/mockData';

/**
 * Transforms a Supabase row (snake_case) to our application model (camelCase).
 */
export function mapRowToComplaint(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    categoryLabel: row.category_label || row.category,
    location: row.location,
    ward: row.ward || 'Dharampeth Zone (Zone 2), Nagpur',
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    isVerifiedLocation: Boolean(row.is_verified_location),
    schematicX: row.schematic_x != null ? Number(row.schematic_x) : 440,
    schematicY: row.schematic_y != null ? Number(row.schematic_y) : 250,
    dateReported: row.date_reported || row.created_at,
    status: row.status || 'open',
    priority: row.priority || 'medium',
    assignedDept: row.assigned_dept || 'NMC Public Works Department',
    description: row.description || '',
    upvotes: Number(row.upvotes || 0),
    isNearby: Boolean(row.is_nearby),
    distanceMeters: row.distance_meters || 120,
    matchConfidence: row.match_confidence || 85,
    hasPhoto: Boolean(row.has_photo || row.photo_url),
    photoUrl: row.photo_url || null,
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    reporterId: row.reporter_id || null,
    reporterName: row.reporter_name || row.created_by || 'Resident Contributor',
    reporterEmail: row.reporter_email || null,
    isDemo: Boolean(row.is_demo),
  };
}

/**
 * Transforms an application model (camelCase) to a Supabase row (snake_case).
 */
export function mapComplaintToRow(c, authorName) {
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    category_label: c.categoryLabel,
    location: c.location,
    ward: c.ward,
    latitude: c.latitude != null ? Number(c.latitude) : null,
    longitude: c.longitude != null ? Number(c.longitude) : null,
    is_verified_location: Boolean(c.isVerifiedLocation),
    schematic_x: c.schematicX || 440,
    schematic_y: c.schematicY || 250,
    date_reported: c.dateReported,
    status: c.status,
    priority: c.priority,
    assigned_dept: c.assignedDept,
    description: c.description,
    upvotes: c.upvotes || 0,
    is_nearby: Boolean(c.isNearby),
    has_photo: Boolean(c.hasPhoto),
    photo_url: c.photoUrl,
    timeline: c.timeline || [],
    reporter_id: c.reporterId || 'demo_user',
    reporter_name: c.reporterName || authorName || 'Ankit Chamke (Demo)',
    reporter_email: c.reporterEmail || null,
    is_demo: Boolean(c.isDemo),
    created_by: authorName || 'Ankit Chamke (Demo)',
  };
}

/**
 * Loads complaints from Supabase or falls back to localStorage.
 */
export async function getComplaints() {
  const localData = loadStoredComplaints();

  if (!isSupabaseConfigured() || !supabase) {
    return {
      complaints: localData,
      source: 'localStorage',
      isSupabaseActive: false,
    };
  }

  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('date_reported', { ascending: false });

    if (error) {
      console.warn('Supabase query note (using local cache):', error.message);
      return {
        complaints: localData,
        source: 'localStorage_fallback',
        isSupabaseActive: false,
        error: error.message,
      };
    }

    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapRowToComplaint);
      // Synchronize local cache with remote records
      saveComplaintsToStorage(mapped);
      return {
        complaints: mapped,
        source: 'supabase',
        isSupabaseActive: true,
      };
    }

    // Remote table exists but is empty
    return {
      complaints: localData,
      source: 'supabase_empty',
      isSupabaseActive: true,
    };
  } catch (err) {
    console.warn('Supabase network error, operating on local cache:', err);
    return {
      complaints: localData,
      source: 'localStorage_fallback',
      isSupabaseActive: false,
      error: err.message,
    };
  }
}

/**
 * Saves a new complaint.
 * Genuinely verifies write to Supabase if configured.
 * Throws an error on failure so the caller preserves form inputs!
 */
export async function addComplaint(newComplaint, authorName = 'Ankit Chamke') {
  const isConfigured = isSupabaseConfigured() && Boolean(supabase);

  // If Supabase is configured, attempt real remote write first
  if (isConfigured) {
    const row = mapComplaintToRow(newComplaint, authorName);
    const { error } = await supabase.from('complaints').insert([row]);

    if (error) {
      // Honest failure: do NOT fake success! Throw error to preserve user's form inputs.
      throw new Error(`Database save error: ${error.message}`);
    }
  }

  // Persist locally as cache
  const current = loadStoredComplaints();
  const updated = [newComplaint, ...current.filter((c) => c.id !== newComplaint.id)];
  saveComplaintsToStorage(updated);

  return updated;
}

/**
 * Updates a complaint's status with timeline logging.
 */
export async function updateComplaintStatus(complaintId, newStatus, timelineEntry) {
  // Update locally first
  const current = loadStoredComplaints();
  const updated = current.map((item) => {
    if (item.id === complaintId) {
      const currentTimeline = item.timeline || [];
      return {
        ...item,
        status: newStatus,
        timeline: timelineEntry ? [timelineEntry, ...currentTimeline] : currentTimeline,
      };
    }
    return item;
  });
  saveComplaintsToStorage(updated);

  // Sync to Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const target = updated.find((c) => c.id === complaintId);
      if (target) {
        await supabase
          .from('complaints')
          .update({
            status: newStatus,
            timeline: target.timeline,
          })
          .eq('id', complaintId);
      }
    } catch (err) {
      console.warn('Supabase status update failed (cached locally):', err);
    }
  }

  return updated;
}

/**
 * Updates complaint upvote count in storage and Supabase.
 */
export async function incrementComplaintUpvotes(complaintId, newCount) {
  const current = loadStoredComplaints();
  const updated = current.map((item) => {
    if (item.id === complaintId) {
      return { ...item, upvotes: newCount };
    }
    return item;
  });
  saveComplaintsToStorage(updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('complaints')
        .update({ upvotes: newCount })
        .eq('id', complaintId);
    } catch (err) {
      console.warn('Supabase upvote update failed (cached locally):', err);
    }
  }

  return updated;
}

/**
 * Subscribes to Supabase Realtime changes across all connected browser sessions.
 */
export function subscribeToComplaints(onPayloadChange) {
  if (!isSupabaseConfigured() || !supabase) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('civicfix-complaints-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        (payload) => {
          onPayloadChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Could not establish Supabase realtime channel:', err);
    return () => {};
  }
}

/**
 * Resets local data and returns initial seed complaints.
 */
export function resetComplaints() {
  resetDemoData();
  return INITIAL_COMPLAINTS;
}
