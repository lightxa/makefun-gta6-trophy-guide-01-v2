// Vice Atlas views: planner, checklist, roadmap, missables and the guide pane.
import { toggleEarned } from './store.js';

const STAGES = [
  { n: 1, title: 'First night — open the story', text: 'Play Gone Fishing, then Chapters 1 and 2. Clear every named mission trophy as it appears and save before each chapter finale.' },
  { n: 2, title: 'Story sweep — Chapters 3 and 4', text: 'Finish Chapters 3 and 4, the named missions inside them, and the side strands for Andy, Kenton, Billy, Randy and Tyrone. Finish the 8 stranger strands here too.' },
  { n: 3, title: 'The long grinds — activities and collectibles', text: 'Stunts, Shooting Range gold, drone races, races, meditation spots, card sets, WAiNK spots, vehicles and the 52 areas of Leonida. Let the counters build together.' },
  { n: 4, title: 'Money and the platinum', text: 'Launder Marked Bills, spend in shops, buy the 8 garages, register vehicles, then reach 100% completion. The platinum pops last.' },
];

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function displayName(t, earned, spoilersOn) {
  const isStory = t.kind === 'story';
  if (spoilersOn && isStory && !earned.has(t.id)) return 'Hidden story trophy';
  return t.name;
}

export function displayDescription(t, earned, spoilersOn) {
  const isStory = t.kind === 'story';
  if (spoilersOn && isStory && !earned.has(t.id)) return 'Hidden until earned — spoiler setting is on.';
  return t.description;
}

export function renderGuidePane(t, earned, spoilersOn) {
  const pane = document.getElementById('guidePane');
  const name = displayName(t, earned, spoilersOn);
  const desc = displayDescription(t, earned, spoilersOn);
  const target = document.createElement('p');
  if (t.target) target.textContent = 'PSN target: ' + t.target.toLocaleString() + ' ' + (t.targetUnit || '');
  const miss = document.createElement('p');
  miss.className = 'when';
  miss.textContent = t.missable
    ? 'Missable? Yes — tied to a one-time story moment in the official description. Save before it; no replay route is confirmed yet.'
    : 'Missable? No — this can be earned after the story, from the official description.';
  pane.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = name;
  const grade = document.createElement('span');
  grade.className = 'grade grade-' + t.grade;
  grade.textContent = gradeLabel(t.grade);
  h.appendChild(grade);
  const d = document.createElement('p');
  d.textContent = desc;
  const meta = document.createElement('p');
  meta.className = 'muted';
  meta.textContent = 'Chapter: ' + t.chapter + ' · Kind: ' + t.kind + ' · Roadmap stage ' + t.stage;
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  const src = document.createElement('p');
  src.className = 'sources';
  src.textContent = 'Sources: ' + t.sources.join('; ') + '.';
  const note = document.createElement('p');
  note.className = 'muted';
  note.textContent = 'Guide advice is from the official description only, not yet verified in game.';
  pane.append(h, d, meta);
  if (t.target) pane.append(target);
  pane.append(guide, miss, src, note);
}

export function trophyRow(t, earned, spoilersOn, onToggle, onOpen) {
  const li = document.createElement('li');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
  box.addEventListener('change', () => onToggle(t.id));
  const body = document.createElement('div');
  const head = document.createElement('div');
  head.className = 'row-head';
  const name = document.createElement('span');
  name.className = 'tname';
  name.textContent = displayName(t, earned, spoilersOn);
  const grade = document.createElement('span');
  grade.className = 'grade grade-' + t.grade;
  grade.textContent = gradeLabel(t.grade);
  head.append(name, grade);
  if (t.missable) { const f = document.createElement('span'); f.className = 'flag'; f.textContent = 'Missable'; head.append(f); }
  const desc = document.createElement('p');
  desc.className = 'tdesc';
  desc.textContent = displayDescription(t, earned, spoilersOn);
  const meta = document.createElement('p');
  meta.className = 'tmeta';
  const kindPart = t.kind.toLowerCase() === t.chapter.toLowerCase() ? '' : ' · ' + t.kind;
  meta.textContent = t.chapter + kindPart + ' · stage ' + t.stage + (t.target ? ' · PSN target: ' + t.target.toLocaleString() + ' ' + (t.targetUnit || '') : '');
  const guide = document.createElement('p');
  guide.className = 'tguide';
  guide.textContent = t.guide;
  const src = document.createElement('p');
  src.className = 'tsources';
  src.textContent = 'Sources: ' + t.sources.join('; ') + '.';
  const open = document.createElement('button');
  open.type = 'button';
  open.textContent = 'Open guide';
  open.addEventListener('click', () => onOpen(t));
  body.append(head, desc, meta, guide, src, open);
  li.append(box, body);
  return li;
}

export function renderPlanner(trophies, earned, spoilersOn, onOpen) {
  const list = document.getElementById('nextFive');
  list.innerHTML = '';
  const remaining = trophies.filter((t) => !earned.has(t.id)).sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  const next = remaining.slice(0, 5);
  next.forEach((t, i) => {
    const li = document.createElement('li');
    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = String(i + 1);
    const body = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = displayName(t, earned, spoilersOn);
    const grade = document.createElement('span');
    grade.className = 'grade grade-' + t.grade;
    grade.textContent = gradeLabel(t.grade);
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = t.chapter + (t.missable ? ' · Missable — save first' : ' · Can be earned later');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Open guide';
    btn.addEventListener('click', () => onOpen(t));
    body.append(name, document.createTextNode(' '), grade, p, btn);
    li.append(rank, body);
    list.append(li);
  });
  if (next.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Every trophy is earned. The platinum is yours, Leonida Legend.';
    list.append(li);
  }
  const stats = document.getElementById('plannerStats');
  const missLeft = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  const storyLeft = trophies.filter((t) => t.kind === 'story' && !earned.has(t.id)).length;
  stats.innerHTML = '';
  [[earned.size + ' / 55 earned'], [missLeft + ' missables still open'], [storyLeft + ' story trophies left']].forEach(([text]) => {
    const s = document.createElement('span');
    s.textContent = text;
    stats.append(s);
  });
}

export function renderRoadmap(trophies, earned) {
  const list = document.getElementById('roadmapList');
  list.innerHTML = '';
  STAGES.forEach((stage) => {
    const items = trophies.filter((t) => t.stage === stage.n);
    const done = items.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = 'Stage ' + stage.n + ' — ' + stage.title;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = done + ' of ' + items.length + ' trophies in this stage earned';
    const p = document.createElement('p');
    p.textContent = stage.text;
    const ul = document.createElement('ul');
    items.forEach((t) => {
      const item = document.createElement('li');
      item.textContent = (earned.has(t.id) ? '✓ ' : '○ ') + t.name + ' (' + gradeLabel(t.grade) + ')' + (t.target ? ' — ' + t.target.toLocaleString() + ' ' + (t.targetUnit || '') : '');
      ul.append(item);
    });
    li.append(h, count, p, ul);
    list.append(li);
  });
}

export function renderMissables(trophies, earned, spoilersOn, onToggle, onOpen) {
  const list = document.getElementById('missableList');
  list.innerHTML = '';
  const miss = trophies.filter((t) => t.missable);
  document.getElementById('missableCount').textContent = miss.filter((t) => !earned.has(t.id)).length + ' of ' + miss.length + ' missables still open.';
  miss.forEach((t) => list.append(trophyRow(t, earned, spoilersOn, onToggle, onOpen)));
}
