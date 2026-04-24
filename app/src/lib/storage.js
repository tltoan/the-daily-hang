// Settings live in localStorage (device-local preferences).
// Stats and play records now live in Supabase (see playApi.js).

export const SETTINGS_KEY = 'hangman-settings-v1';
export const MAX_WRONG = 6;

export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { return {}; }
}

export function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

export function emptyStats() {
  return { played: 0, won: 0, streak: 0, maxStreak: 0, distribution: Array(7).fill(0) };
}
