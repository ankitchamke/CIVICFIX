// CivicFix Local Storage & Data Persistence Layer
// Demonstrates persistent civic complaint management using localStorage

import { INITIAL_COMPLAINTS } from '../data/mockData.js';

const COMPLAINTS_STORAGE_KEY = 'civicfix_complaints_v3_nagpur';
const UPVOTED_STORAGE_KEY = 'civicfix_upvoted_ids_v2_nagpur';

/**
 * Loads complaints from localStorage.
 * If data is absent, malformed, or contains legacy non-Nagpur data, seeds INITIAL_COMPLAINTS.
 */
export function loadStoredComplaints() {
  try {
    const raw = localStorage.getItem(COMPLAINTS_STORAGE_KEY);
    if (!raw) {
      // First run: Seed demo data
      saveComplaintsToStorage(INITIAL_COMPLAINTS);
      return INITIAL_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure data is Nagpur data and not legacy Phase 1/2 foreign data
      const isNagpurData = parsed.some((c) => (c.location || '').includes('Nagpur') || c.schematicX !== undefined);
      if (isNagpurData) {
        return parsed;
      }
    }
    // Legacy or invalid: fallback to Nagpur seed
    saveComplaintsToStorage(INITIAL_COMPLAINTS);
    return INITIAL_COMPLAINTS;
  } catch (error) {
    console.warn('Failed to parse localStorage complaints; resetting to initial Nagpur demo data:', error);
    saveComplaintsToStorage(INITIAL_COMPLAINTS);
    return INITIAL_COMPLAINTS;
  }
}

/**
 * Persists complaints array to localStorage safely.
 */
export function saveComplaintsToStorage(complaints) {
  try {
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(complaints));
    return true;
  } catch (error) {
    console.error('Storage quota exceeded or storage error:', error);
    return false;
  }
}

/**
 * Resets local storage back to clean demo data.
 */
export function resetDemoData() {
  try {
    localStorage.removeItem(COMPLAINTS_STORAGE_KEY);
    localStorage.removeItem(UPVOTED_STORAGE_KEY);
    saveComplaintsToStorage(INITIAL_COMPLAINTS);
    return INITIAL_COMPLAINTS;
  } catch (error) {
    console.error('Error resetting demo data:', error);
    return INITIAL_COMPLAINTS;
  }
}

/**
 * Loads the set of complaint IDs that the current user/session has upvoted.
 */
export function loadUpvotedIds() {
  try {
    const raw = localStorage.getItem(UPVOTED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Records an upvote for a complaint ID in localStorage to prevent duplicate upvotes.
 */
export function recordUpvoteId(id) {
  try {
    const existing = loadUpvotedIds();
    if (!existing.includes(id)) {
      const updated = [...existing, id];
      localStorage.setItem(UPVOTED_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return existing;
  } catch {
    return [];
  }
}

/**
 * Compresses an image file client-side using Canvas to ensure it stays within ~30-50KB,
 * preventing localStorage quota exhaustion.
 */
export function compressImage(file, maxWidth = 600, maxHeight = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target.result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
