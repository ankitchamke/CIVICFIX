// Complaints Repository
// Handles persistent civic grievance storage with Supabase database integration
// and automatic fallback to browser localStorage.

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
    schematic_x: c.schematicX,
    schematic_y: c.schematicY,
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
    created_by: authorName || 'Ankit Chamke (Demo)',
  };
}

/**
 * Loads complaints from Supabase or falls back to localStorage.
 */
export async function getComplaints() {
  // Always load cached data first for instant render
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

    // Remote table exists but is empty: return seed data
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
 * Saves a new complaint to state, localStorage, and Supabase.
 */
export async function addComplaint(newComplaint, authorName = 'Ankit Chamke') {
  // 1. Immediately persist locally
  const current = loadStoredComplaints();
  const updated = [newComplaint, ...current.filter((c) => c.id !== newComplaint.id)];
  saveComplaintsToStorage(updated);

  // 2. Synchronize to Supabase if available
  if (isSupabaseConfigured() && supabase) {
    try {
      const row = mapComplaintToRow(newComplaint, authorName);
      const { error } = await supabase.from('complaints').insert([row]);
      if (error) {
        console.warn('Supabase insert note (persisted locally):', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert error (persisted locally):', err);
    }
  }

  return updated;
}

/**
 * Updates a complaint's status with timeline logging.
 */
export async function updateComplaintStatus(complaintId, newStatus, timelineEntry) {
  // 1. Update locally
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

  // 2. Sync to Supabase
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
  // 1. Update locally
  const current = loadStoredComplaints();
  const updated = current.map((item) => {
    if (item.id === complaintId) {
      return { ...item, upvotes: newCount };
    }
    return item;
  });
  saveComplaintsToStorage(updated);

  // 2. Sync to Supabase
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
 * Resets local data and returns initial seed complaints.
 */
export function resetComplaints() {
  resetDemoData();
  return INITIAL_COMPLAINTS;
}
