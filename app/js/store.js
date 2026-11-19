// Vice Atlas progress store: localStorage, export and import, no network.
const STORE_KEY = 'vice-atlas-progress-v2';
const NOTES_KEY = 'vice-atlas-notes-v2';
const SPOILER_KEY = 'vice-atlas-spoilers-v2';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function toggleEarned(earned, id) {
  const next = new Set(earned);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveEarned(next);
  return next;
}

export function exportProgress(earned, notes) {
  const payload = { app: 'vice-atlas', version: 2, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b), notes: notes || '' };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-atlas-progress.json';
  link.click();
  URL.revokeObjectURL(url);
  return payload.earned.length;
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('No earned list found in that file.');
  return { earned: new Set(ids.filter((n) => Number.isInteger(n))), notes: typeof parsed.notes === 'string' ? parsed.notes : '' };
}

export function loadNotes() {
  return localStorage.getItem(NOTES_KEY) || '';
}

export function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, notes);
}

export function loadSpoilers() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoilers(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}
