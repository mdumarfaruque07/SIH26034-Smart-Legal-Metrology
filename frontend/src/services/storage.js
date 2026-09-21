/**
 * Local Storage abstraction for client-side inspection history caching and active session state.
 * Inspections are stored per-officer to ensure data isolation.
 */

const OFFICER_KEY = 'sih26034_officer_session';

// Generate officer-specific storage keys for data isolation
function _inspectionsKey(officerId) {
  return `sih26034_inspections_${officerId || 'anonymous'}`;
}

function _currentInspectionKey(officerId) {
  return `sih26034_current_inspection_${officerId || 'anonymous'}`;
}

// Get the currently logged-in officer ID for scoping data
function _getActiveOfficerId() {
  try {
    const raw = localStorage.getItem(OFFICER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.officer_id || null;
    }
  } catch (_) {}
  return null;
}

export function getStoredInspections() {
  try {
    const officerId = _getActiveOfficerId();
    const key = _inspectionsKey(officerId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return [];
  }
}

export function saveInspectionToLocal(inspection) {
  try {
    const officerId = _getActiveOfficerId();
    const key = _inspectionsKey(officerId);
    const currentKey = _currentInspectionKey(officerId);

    const current = getStoredInspections();
    // Remove if already exists and prepend
    const filtered = current.filter(item => item.inspection_id !== inspection.inspection_id);
    filtered.unshift(inspection);
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 50))); // Keep last 50
    localStorage.setItem(currentKey, JSON.stringify(inspection));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
}

export function getCurrentInspection() {
  try {
    const officerId = _getActiveOfficerId();
    const key = _currentInspectionKey(officerId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentInspection(inspection) {
  try {
    const officerId = _getActiveOfficerId();
    const key = _currentInspectionKey(officerId);
    localStorage.setItem(key, JSON.stringify(inspection));
  } catch (e) {}
}

export function getOfficerSession() {
  try {
    const raw = localStorage.getItem(OFFICER_KEY);
    if (!raw) return null; // No session = not logged in
    const parsed = JSON.parse(raw);
    // Validate the session has required fields
    if (parsed && parsed.officer_id) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function setOfficerSession(sessionData) {
  try {
    localStorage.setItem(OFFICER_KEY, JSON.stringify(sessionData));
  } catch (e) {}
}

export function clearOfficerSession() {
  try {
    localStorage.removeItem(OFFICER_KEY);
  } catch (e) {}
}
