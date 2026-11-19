// Vice Atlas boot: loads the trophy data, wires the tabs, filters and save tools.
import { loadEarned, saveEarned, toggleEarned, exportProgress, parseImportedProgress, loadNotes, saveNotes, loadSpoilers, saveSpoilers } from './store.js';
import { renderGuidePane, renderPlanner, renderRoadmap, renderMissables, trophyRow } from './views.js';

const TABS = ['tonight', 'list', 'roadmap', 'missables', 'settings'];
let trophies = [];
let earned = loadEarned();
let spoilersOn = loadSpoilers();
let selected = null;

function showTab(name) {
  const tab = TABS.includes(name) ? name : 'tonight';
  document.querySelectorAll('.tab').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + tab));
}

function updateProgress() {
  document.getElementById('earnedCount').textContent = String(earned.size);
  document.getElementById('progressFill').style.width = (earned.size / 55 * 100) + '%';
  document.getElementById('progressNote').textContent = 'Platinum: Vice Got a Price! — ' + earned.size + ' of 55 earned, ' + (55 - earned.size) + ' to go';
}

function openGuide(t) {
  selected = t;
  renderGuidePane(t, earned, spoilersOn);
  showTab('tonight');
  document.getElementById('guidePane').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function filteredList() {
  const q = document.getElementById('searchBox').value.trim().toLowerCase();
  const kind = document.getElementById('kindFilter').value;
  const grade = document.getElementById('gradeFilter').value;
  const hideEarned = document.getElementById('hideEarned').checked;
  return trophies.filter((t) => {
    if (hideEarned && earned.has(t.id)) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderAll() {
  updateProgress();
  renderPlanner(trophies, earned, spoilersOn, openGuide);
  renderRoadmap(trophies, earned);
  renderMissables(trophies, earned, spoilersOn, onToggle, openGuide);
  const list = document.getElementById('trophyList');
  list.innerHTML = '';
  const shown = filteredList();
  document.getElementById('listCount').textContent = shown.length + ' of 55 trophies shown' + (document.getElementById('kindFilter').value === 'online' ? ' — the official list has no online trophies.' : '');
  shown.forEach((t) => list.append(trophyRow(t, earned, spoilersOn, onToggle, openGuide)));
  if (selected) renderGuidePane(selected, earned, spoilersOn);
}

function onToggle(id) {
  earned = toggleEarned(earned, id);
  renderAll();
}

async function boot() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies;
  document.getElementById('spoilerToggle').checked = spoilersOn;
  document.getElementById('notesBox').value = loadNotes();
  document.querySelectorAll('.tab').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); showTab(a.dataset.tab); history.replaceState(null, '', '#' + a.dataset.tab); }));
  window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
  ['searchBox', 'kindFilter', 'gradeFilter', 'hideEarned'].forEach((id) => document.getElementById(id).addEventListener('input', renderAll));
  document.getElementById('spoilerToggle').addEventListener('change', (e) => { spoilersOn = e.target.checked; saveSpoilers(spoilersOn); renderAll(); });
  document.getElementById('exportBtn').addEventListener('click', () => { exportProgress(earned, document.getElementById('notesBox').value); });
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const status = document.getElementById('importStatus');
    try {
      const result = parseImportedProgress(await file.text());
      earned = result.earned;
      saveEarned(earned);
      if (result.notes) { document.getElementById('notesBox').value = result.notes; saveNotes(result.notes); }
      status.textContent = 'Imported ' + earned.size + ' earned trophies from ' + file.name + '.';
      renderAll();
    } catch (err) {
      status.textContent = 'Import failed: ' + err.message;
    }
  });
  document.getElementById('resetBtn').addEventListener('click', () => { if (confirm('Reset all progress?')) { earned = new Set(); saveEarned(earned); renderAll(); } });
  document.getElementById('notesBox').addEventListener('input', (e) => saveNotes(e.target.value));
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    const map = { 1: 'tonight', 2: 'list', 3: 'roadmap', 4: 'missables' };
    if (map[e.key]) { showTab(map[e.key]); history.replaceState(null, '', '#' + map[e.key]); }
    if (e.key === '/') { e.preventDefault(); showTab('list'); document.getElementById('searchBox').focus(); }
    if (e.key === 's') { spoilersOn = !spoilersOn; document.getElementById('spoilerToggle').checked = spoilersOn; saveSpoilers(spoilersOn); renderAll(); }
  });
  showTab(location.hash.slice(1) || 'tonight');
  renderAll();
  const first = trophies.find((t) => t.id === 2);
  if (first) renderGuidePane(first, earned, spoilersOn);
}

boot();
